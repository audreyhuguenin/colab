/*
 * The coLAB projectOne
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.card.CardTypeRef;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.rest.card.bean.CardTypeCreationData;
import ch.colabproject.colab.api.ws.message.WsChannelUpdate;
import ch.colabproject.colab.api.ws.message.WsUpdateMessage;
import ch.colabproject.colab.client.ColabClient;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import ch.colabproject.colab.tests.tests.TestHelper;
import ch.colabproject.colab.tests.tests.TestUser;
import ch.colabproject.colab.tests.ws.WebsocketClient;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import javax.websocket.DeploymentException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of card type controller from a client point of view
 *
 * @author sandra
 */
public class CardTypeRestEndpointTest extends AbstractArquillianTest {

    private static final String DEFAULT_MIME_TYPE = "text/markdown";

    @Test
    public void testCreateCardType() {
        Long projectId = ColabFactory.createProject(client, "testCreateCardType").getId();

        String title = "Context " + ((int) (Math.random() * 1000));
        String purpose = "Define the game life context " + ((int) (Math.random() * 1000));
        String aTag = "life hack";
        String otherTag = "Contextualization";
        Set<String> tags = Set.of(aTag, otherTag);

        TextDataBlock purposeBlock = new TextDataBlock();
        purposeBlock.setMimeType(DEFAULT_MIME_TYPE);
        purposeBlock.setTextData(purpose);

        CardTypeCreationData cardTypeToCreate = new CardTypeCreationData();
        cardTypeToCreate.setProjectId(projectId);
        cardTypeToCreate.setTitle(title);
        cardTypeToCreate.setPurpose(purposeBlock);
        cardTypeToCreate.setTags(tags);

        Long cardTypeId = client.cardTypeRestEndpoint.createCardType(cardTypeToCreate);

        CardType cardType = (CardType) client.cardTypeRestEndpoint.getCardType(cardTypeId);

        Assertions.assertNotNull(cardType);
        Assertions.assertNotNull(cardType.getId());
        Assertions.assertEquals(projectId, cardType.getProjectId());
        Assertions.assertEquals(title, cardType.getTitle());
        Assertions.assertNotNull(cardType.getPurposeId());
        Assertions.assertNotNull(cardType.getTags());

        TextDataBlock persistedPurpose = (TextDataBlock) client.documentRestEndpoint
            .getDocument(cardType.getPurposeId());
        Assertions.assertNotNull(persistedPurpose);
        Assertions.assertEquals(DEFAULT_MIME_TYPE, persistedPurpose.getMimeType());
        Assertions.assertEquals(purpose, persistedPurpose.getTextData());
        Assertions.assertNull(persistedPurpose.getOwningCardContentId());
        Assertions.assertNull(persistedPurpose.getOwningResourceId());

        Assertions.assertEquals(cardType.getTags().size(), tags.size());
        Assertions.assertTrue(cardType.getTags().contains(aTag));
        Assertions.assertTrue(cardType.getTags().contains(otherTag));
    }

    @Test
    public void testCreateAndUseGlobalCardType()
        throws DeploymentException, IOException, URISyntaxException, InterruptedException {
        // create some goulash user with its own clients
        TestUser goulash = this.signup(
            "goulash",
            "goulash@test.local",
            "MyPassword");
        ColabClient goulashClient = this.createRestClient();
        this.signIn(goulashClient, goulash);
        WebsocketClient wsGoulashClient = this.createWsClient();
        goulashClient.websocketRestEndpoint
            .subscribeToBroadcastChannel(wsGoulashClient.getSessionId());
        goulashClient.websocketRestEndpoint.subscribeToUserChannel(wsGoulashClient.getSessionId());

        // Sign in as admin and initialize websocket connection
        this.signIn(admin);
        WebsocketClient adminWsClient = this.createWsClient();
        client.websocketRestEndpoint.subscribeToBroadcastChannel(adminWsClient.getSessionId());
        client.websocketRestEndpoint.subscribeToUserChannel(adminWsClient.getSessionId());

        // Wait for ChannelUpdateMessage
        TestHelper.waitForMessagesAndAssert(adminWsClient, 1, 5, WsChannelUpdate.class);

        // -----
        // Global type
        // -----
        adminWsClient.clearMessages();
        wsGoulashClient.clearMessages();
        CardType globalType = ColabFactory.createGlobalCardType(client);

        // admin should have receive the type by websocket
        WsUpdateMessage adminWsType = TestHelper.waitForMessagesAndAssert(
            adminWsClient, 1, 5, WsUpdateMessage.class).get(0);
        Assertions.assertEquals(2, adminWsType.getUpdated().size());
        CardType aWsCardType = TestHelper.findFirst(adminWsType.getUpdated(), CardType.class);

        // Publish the projectOneType
        globalType.setPublished(true);
        client.cardTypeRestEndpoint.updateCardType(globalType);

        // Assert the published type is sent to all users
        WsUpdateMessage goulashGlobalTypeUpdate = TestHelper.waitForMessagesAndAssert(
            wsGoulashClient, 1, 5, WsUpdateMessage.class).get(0);
        Assertions.assertEquals(1, goulashGlobalTypeUpdate.getUpdated().size());
        aWsCardType = TestHelper.findFirst(goulashGlobalTypeUpdate.getUpdated(), CardType.class);
        Assertions.assertEquals(globalType, aWsCardType);
        Assertions.assertTrue(aWsCardType.isPublished());

        // -----
        // Global type is used by projectOne
        // -----
        Project projectOne = ColabFactory.createProject(client, "Project One");
        Set<AbstractCardType> types = client.projectRestEndpoint
            .getCardTypesOfProject(projectOne.getId());
        Assertions.assertEquals(0, types.size());

        Long parentId = ColabFactory.getRootContent(client, projectOne).getId();

        // create a card based on a global type
        ColabFactory.createNewCard(client, parentId, globalType.getId());

        // assert the project now contains a CardTypeRef to the global type
        types = client.projectRestEndpoint.getCardTypesOfProject(projectOne.getId());
        // One concrete type
        List<CardType> concrete = TestHelper.filterAndAssert(types, 1, CardType.class);

        // One type reference
        List<CardTypeRef> refs = TestHelper.filterAndAssert(types, 1, CardTypeRef.class);

        CardType theType = concrete.get(0);
        CardTypeRef projectOneRef = refs.get(0);

        Assertions.assertEquals(projectOne.getId(), projectOneRef.getProjectId());
        Assertions.assertEquals(globalType.getId(), projectOneRef.getTargetId());
        Assertions.assertEquals(globalType, theType);

        // -----
        // ProjectOne type is used by projectTwo
        // -----
        Project projectTwo = ColabFactory.createProject(client, "Project Two");
        parentId = ColabFactory.getRootContent(client, projectTwo).getId();

        // create a card based on projectOne type
        ColabFactory.createNewCard(client, parentId, projectOneRef.getId());

        // assert the project now contains a CardTypeRef to the project one type
        types = client.projectRestEndpoint.getCardTypesOfProject(projectTwo.getId());
        // One concrete type
        concrete = TestHelper.filterAndAssert(types, 1, CardType.class);

        // One type reference
        refs = TestHelper.filterAndAssert(types, 2, CardTypeRef.class);

        theType = concrete.get(0);

        Optional<CardTypeRef> optRef = refs.stream()
            .filter(ref -> projectTwo.getId().equals(ref.getProjectId())).findFirst();
        Assertions.assertTrue(optRef.isPresent());
        CardTypeRef projectTwoRef = optRef.get();

        Assertions.assertEquals(projectTwo.getId(), projectTwoRef.getProjectId());
        Assertions.assertEquals(projectOneRef.getId(), projectTwoRef.getTargetId());
        Assertions.assertEquals(globalType, theType);

        List<AbstractCardType> chain = client.cardTypeRestEndpoint.getExpandedCardType(projectTwoRef.getId());
        Assertions.assertNotNull(chain);
        Assertions.assertEquals(3, chain.size());
        Assertions.assertTrue(chain.contains(projectTwoRef));
        Assertions.assertTrue(chain.contains(projectTwoRef));
        Assertions.assertTrue(chain.contains(globalType));

    }

    @Test
    public void testCreateAndReuseCardType()
        throws DeploymentException, IOException, URISyntaxException, InterruptedException {
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketHelper.class), Level.TRACE);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketClient.class), Level.TRACE);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketManager.class), Level.TRACE);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(TransactionManager.class), Level.TRACE);

        // create some goulash user with its own clients
        TestUser goulash = this.signup(
            "goulashsensei",
            "goulash@test.local",
            "MyPassword");
        // Sign in as goulash and initialize websocket connection
        this.signIn(goulash);
        WebsocketClient wsClient = this.createWsClient();
        client.websocketRestEndpoint.subscribeToBroadcastChannel(wsClient.getSessionId());
        client.websocketRestEndpoint.subscribeToUserChannel(wsClient.getSessionId());

        TestUser pizzaiolo = this.signup(
            "pizzaiolo",
            "pizza@test.local",
            "qu3stap1zzaèlamI9lior3d3l0OndO");
        // Sign in as goulash and initialize websocket connection
        ColabClient pizzaHttpClient = this.createRestClient();
        this.signIn(pizzaHttpClient, pizzaiolo);
        WebsocketClient pizzaWsClient = this.createWsClient();
        pizzaHttpClient.websocketRestEndpoint
            .subscribeToBroadcastChannel(pizzaWsClient.getSessionId());
        pizzaHttpClient.websocketRestEndpoint.subscribeToUserChannel(pizzaWsClient.getSessionId());

        // -----
        // Goulash creates a project
        // -----
        Project projectOne = ColabFactory.createProject(client, "Project One");
        Assertions.assertEquals(0,
            client.projectRestEndpoint.getCardTypesOfProject(projectOne.getId()).size());
        client.websocketRestEndpoint.subscribeToProjectChannel(projectOne.getId(),
            wsClient.getSessionId());

        // wait for propagation : the project and the user presence on the presence list
        List<WsUpdateMessage> messages = TestHelper.waitForMessagesAndAssert(wsClient, 2, 5, WsUpdateMessage.class);

        // -----
        // Create type in project one
        // -----
        CardType projectOneType = ColabFactory.createCardType(client, projectOne.getId());

        // user should have receive two message. One contains the project and has been sent through
        // the user own channel. Second message contains the type and has been sent through the
        // project channel
        List<WsUpdateMessage> wsUpdate = TestHelper.waitForMessagesAndAssert(wsClient, 2, 5,
            WsUpdateMessage.class);
        // combine messages
        Set<WithWebsocketChannels> updated = new HashSet<>();
        updated.addAll(wsUpdate.get(0).getUpdated());
        updated.addAll(wsUpdate.get(1).getUpdated());

        // Assertions.assertEquals(1, wsUpdate.getUpdated().size());
        CardType wsProjectOneType = TestHelper.findFirst(updated, CardType.class);
        Assertions.assertEquals(projectOneType, wsProjectOneType);

        // create a card based on the type
        Long projectOneRootContentId = ColabFactory.getRootContent(client, projectOne).getId();
        ColabFactory.createNewCard(client, projectOneRootContentId, projectOneType.getId());

        // consume websocket message
        TestHelper.waitForMessagesAndAssert(wsClient, 1, 5, WsUpdateMessage.class).get(0);

        // As the type is not published, Goulash does not read it from the published list
        Assertions.assertTrue(client.cardTypeRestEndpoint.getPublishedCardTypesOfReachableProjects().isEmpty());

        // but can read it from the project list
        Assertions.assertEquals(1,
            client.projectRestEndpoint.getCardTypesOfProject(projectOne.getId()).size());

        // Goulash creates projectTwo
        Project projectTwo = ColabFactory.createProject(client, "Project Two");

        // consume websocket message (new project)
        TestHelper.waitForMessagesAndAssert(wsClient, 1, 5, WsUpdateMessage.class).get(0);

        // Goulash invites pizzaiolo
        ColabFactory.inviteAndJoin(client, projectTwo, "pizza@pizza.local", pizzaHttpClient,
            mailClient);

        // consume 2 websocket messages (new invitation; new team member)
        TestHelper.waitForMessagesAndAssert(wsClient, 2, 5, WsUpdateMessage.class).get(0);
        this.client.websocketRestEndpoint.subscribeToProjectChannel(projectTwo.getId(),
            wsClient.getSessionId());

        // pizza consume 2 websocket messages (new team member & user presence)
        TestHelper.waitForMessagesAndAssert(pizzaWsClient, 1, 5, WsUpdateMessage.class).get(0);

        pizzaHttpClient.websocketRestEndpoint.subscribeToProjectChannel(projectTwo.getId(),
            pizzaWsClient.getSessionId());

        // publish the projectOneType
        projectOneType.setPublished(true);
        client.cardTypeRestEndpoint.updateCardType(projectOneType);

        // it is visible for goulash
        Assertions.assertEquals(1l, client.cardTypeRestEndpoint.getPublishedCardTypesOfReachableProjects().size());
        // consume websocket messages (two through project channel, other through user channel)
        TestHelper.waitForMessagesAndAssert(wsClient, 4, 5, WsUpdateMessage.class).get(0);

        // but not for pizzaiolo
        Assertions.assertEquals(0,
            pizzaHttpClient.cardTypeRestEndpoint.getPublishedCardTypesOfReachableProjects().size());

        // goulash create a card in projectTwo based on the projectOne type
        Long projectTwoRootContentId = ColabFactory.getRootContent(client, projectTwo).getId();
        ColabFactory.createNewCard(client, projectTwoRootContentId, projectOneType.getId());
        // consume websocket messages (overview update; project 1 update; project 2 update)
        TestHelper.waitForMessagesAndAssert(wsClient, 2, 5, WsUpdateMessage.class).get(0);
        // consume websocket messages (overview update; project 2 update)
        TestHelper.waitForMessagesAndAssert(pizzaWsClient, 3, 5, WsUpdateMessage.class).get(0);

        // goulash and pizzaiolo can now access the type through the reference from projectTwo
        Set<AbstractCardType> goulashTypes = client.projectRestEndpoint
            .getCardTypesOfProject(projectTwo.getId());
        Set<AbstractCardType> pizzaTypes = pizzaHttpClient.projectRestEndpoint
            .getCardTypesOfProject(projectTwo.getId());

        TestHelper.assertEquals(goulashTypes, pizzaTypes);

        // Update the projectOneType
        projectOneType.setTitle("My Favourite Recipes");
        client.cardTypeRestEndpoint.updateCardType(projectOneType);

        // both goulash and pizzaiolo should receive the update through websocket
        // goulash consume throw websocket messages: (overview update; project 1 update; project 2
        // update)
        WsUpdateMessage goulashMessage = TestHelper
            .waitForMessagesAndAssert(wsClient, 3, 5, WsUpdateMessage.class).get(0);
        // (as type in project is not published, it's not propagated to Pizza, this only one message
        // is sent)
        WsUpdateMessage pizzaMessage = TestHelper
            .waitForMessagesAndAssert(pizzaWsClient, 1, 5, WsUpdateMessage.class).get(0);

        List<CardType> pizzaList = TestHelper.filterAndAssert(pizzaMessage.getUpdated(), 1,
            CardType.class);
        CardType pizzaType = pizzaList.get(0);

        List<CardType> goulashList = TestHelper.filterAndAssert(goulashMessage.getUpdated(), 1,
            CardType.class);
        CardType goulashType = goulashList.get(0);

        Assertions.assertEquals(pizzaType, goulashType);
        Assertions.assertEquals(projectOneType.getTitle(), goulashType.getTitle());
        Assertions.assertEquals(projectOneType.getTitle(), pizzaType.getTitle());
    }

    @Test
    public void testUpdateCardType() {
        Long projectId = ColabFactory.createProject(client, "testUpdateCardType").getId();

        CardTypeCreationData cardTypeToCreate = new CardTypeCreationData();
        cardTypeToCreate.setProjectId(projectId);
        cardTypeToCreate.setTags(new HashSet<>());

        Long cardTypeId = client.cardTypeRestEndpoint.createCardType(cardTypeToCreate);

        CardType cardType = (CardType) client.cardTypeRestEndpoint.getCardType(cardTypeId);
        Assertions.assertNull(cardType.getTitle());
        Assertions.assertNotNull(cardType.getPurposeId());
        TextDataBlock persistedPurpose = (TextDataBlock) client.documentRestEndpoint
            .getDocument(cardType.getPurposeId());
        Assertions.assertNotNull(persistedPurpose);
        Assertions.assertEquals(DEFAULT_MIME_TYPE, persistedPurpose.getMimeType());
        Assertions.assertNull(persistedPurpose.getTextData());
        Assertions.assertNull(persistedPurpose.getOwningCardContentId());
        Assertions.assertNull(persistedPurpose.getOwningResourceId());

        Assertions.assertNotNull(cardType.getTags());
        Assertions.assertTrue(cardType.getTags().isEmpty());

        String aTag = "life hack";
        String otherTag = "Contextualization";
        Set<String> tags = Set.of(aTag, otherTag);

        // String uniqueId = String.valueOf(new Date().getTime() + ((long)(Math.random()
        // * 1000)));
        String title = "Dissemination " + ((int) (Math.random() * 1000));

        // cardType.setUniqueId(uniqueId);
        cardType.setTitle(title);
        cardType.setTags(tags);
        client.cardTypeRestEndpoint.updateCardType(cardType);

        CardType persistedCardType = (CardType) client.cardTypeRestEndpoint
            .getCardType(cardType.getId());
        // Assertions.assertEquals(uniqueId, persistedCardType2.getUniqueId());
        Assertions.assertEquals(title, persistedCardType.getTitle());

        Assertions.assertNotNull(cardType.getTags());
        Assertions.assertEquals(cardType.getTags().size(), tags.size());
        Assertions.assertTrue(cardType.getTags().contains(aTag));
        Assertions.assertTrue(cardType.getTags().contains(otherTag));
    }

    @Test
    public void testDeleteCardType() {
        Long projectId = ColabFactory.createProject(client, "testDeleteCardType").getId();

        CardType cardType = ColabFactory.createCardType(client, projectId);
        Long cardTypeId = cardType.getId();

        CardType persistedCardType = (CardType) client.cardTypeRestEndpoint.getCardType(cardTypeId);
        Assertions.assertNotNull(persistedCardType);

        Assertions.assertNotNull(persistedCardType.getPurposeId());
        Long purposeId = persistedCardType.getPurposeId();
        TextDataBlock persistedPurposeBlock = (TextDataBlock) client.documentRestEndpoint
            .getDocument(purposeId);
        Assertions.assertNotNull(persistedPurposeBlock);

        client.cardTypeRestEndpoint.deleteCardType(cardTypeId);

        persistedCardType = (CardType) client.cardTypeRestEndpoint.getCardType(cardTypeId);
        Assertions.assertNull(persistedCardType);

        persistedPurposeBlock = (TextDataBlock) client.documentRestEndpoint.getDocument(purposeId);
        Assertions.assertNull(persistedPurposeBlock);
    }

    // TODO real test for getExpandedCardType
    // TODO replace all getCardType by getExpandedCardType
    // TODO sandra work in progress test useCardTypeInProject + removeCardTypeFromProject

    @Test
    public void testProjectAccess() {
        String projectName = "Easy learn german " + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client, projectName);
        Long projectId = project.getId();

        CardType cardType = ColabFactory.createCardType(client, projectId);
        Long cardTypeId = cardType.getId();

        Assertions.assertEquals(projectId, cardType.getProjectId());

        Set<AbstractCardType> cardTypesOfProject = client.projectRestEndpoint
            .getCardTypesOfProject(projectId);
        Assertions.assertNotNull(cardTypesOfProject);
        Assertions.assertEquals(1, cardTypesOfProject.size());
        Assertions.assertEquals(cardTypeId, cardTypesOfProject.iterator().next().getId());

        client.cardTypeRestEndpoint.deleteCardType(cardTypeId);

        cardTypesOfProject = client.projectRestEndpoint.getCardTypesOfProject(projectId);
        Assertions.assertNotNull(cardTypesOfProject);
        Assertions.assertEquals(0, cardTypesOfProject.size());
    }

}
