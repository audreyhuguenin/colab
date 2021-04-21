/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest;

import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.token.InvitationToken;
import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.ws.message.WsUpdateMessage;
import ch.colabproject.colab.client.ColabClient;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.tests.mailhog.model.Message;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.TestHelper;
import ch.colabproject.colab.tests.tests.TestUser;
import ch.colabproject.colab.tests.ws.WebsocketClient;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;
import java.util.regex.Matcher;
import javax.websocket.DeploymentException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author maxence
 */
public class ProjectControllerTest extends AbstractArquillianTest {

    @Test
    public void testCreateProject() {
        TestUser user = this.signup("goulashsensei", "goulash@test.local", "SoSecure");
        this.signIn(user);

        User currentUser = client.userController.getCurrentUser();

        Project project = new Project();

        Long projectId = client.projectController.createProject(project);
        Project persistedProject = client.projectController.getProject(projectId);

        Assertions.assertNotNull(persistedProject);
        Assertions.assertNotNull(persistedProject.getId());

        Assertions.assertEquals(persistedProject.getId(), projectId);

        Assertions.assertNotNull(persistedProject.getRootCard());
        Assertions.assertNotNull(persistedProject.getRootCard().getId());

        List<TeamMember> members = client.projectController.getMembers(projectId);
        Assertions.assertEquals(1, members.size());

        TeamMember me = members.get(0);
        Assertions.assertEquals(currentUser.getId(), me.getUserId());
        Assertions.assertEquals(projectId, me.getProjectId());
    }

    @Test
    public void testUpdateProject() {
        Project project = new Project();

        Long projectId = client.projectController.createProject(project);
        project = client.projectController.getProject(projectId);
        project.setName("The Hitchhiker's Guide to the Serious-Game");
        project.setDescription("So Long, and Thanks for All the Games");

        client.projectController.updateProject(project);

        Project project2 = client.projectController.getProject(projectId);
        Assertions.assertEquals(project.getName(), project2.getName());
        Assertions.assertEquals(project.getDescription(), project2.getDescription());
    }

    @Test
    public void testGetAllProjects() {
        Project project = new Project();
        project.setName("The Hitchhiker's Guide to the Serious-Game");
        client.projectController.createProject(project);

        project = new Project();
        project.setName("Don't Panic");
        client.projectController.createProject(project);

        List<Project> projects = client.projectController.getAllProjects();
        Assertions.assertEquals(2, projects.size());
    }

    @Test
    public void testDeleteProject() {
        Project project = new Project();
        Long projectId = client.projectController.createProject(project);
        Project persistedProject = client.projectController.getProject(projectId);

        Assertions.assertNotNull(persistedProject);

        client.projectController.deleteProject(projectId);
        persistedProject = client.projectController.getProject(projectId);

        Assertions.assertNull(persistedProject);
    }

    @Test
    public void testInvite() throws URISyntaxException, DeploymentException, IOException, InterruptedException {
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketHelper.class), Level.TRACE);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketClient.class), Level.TRACE);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketFacade.class), Level.TRACE);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(TransactionManager.class), Level.TRACE);

        ////////////////////////////////////////////////////////////////////////////////////////////
        // this.client sign up as GoulashSensei and subscribes to its channel with wsGoulashClient
        ////////////////////////////////////////////////////////////////////////////////////////////
        TestUser user = this.signup("goulashsensei", "goulash@test.local", "SoSecure");
        String mateAddress = "georges@valgeorges.local";
        this.signIn(user);

        WebsocketClient wsGoulashClient = this.createWsClient();
        client.websocketController.subscribeToUserChannel(wsGoulashClient.getSessionId());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Goulash creates a projects
        ////////////////////////////////////////////////////////////////////////////////////////////
        Project p = new Project();
        p.setName("The Hitchhiker's Guide to the Serious-Game");

        Long projectId = client.projectController.createProject(p);

        // Goulash receives the project, the user (ie himself) and the teamMmeber linking the project to the user
        WsUpdateMessage wsProjectUpdate = TestHelper.waitForMessagesAndAssert(wsGoulashClient, 1, 5, WsUpdateMessage.class).get(0);
        Assertions.assertEquals(3, wsProjectUpdate.getUpdated().size());

        Project project = TestHelper.findFirst(wsProjectUpdate.getUpdated(), Project.class);
        TeamMember member = TestHelper.findFirst(wsProjectUpdate.getUpdated(), TeamMember.class);
        User wsUpdatedUser = TestHelper.findFirst(wsProjectUpdate.getUpdated(), User.class);

        Assertions.assertEquals(projectId, project.getId());
        Assertions.assertEquals(projectId, member.getProjectId());
        Assertions.assertEquals(member.getUserId(), wsUpdatedUser.getId());

        // user is a lonely team member
        List<TeamMember> members = client.projectController.getMembers(project.getId());
        Assertions.assertEquals(1, members.size());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Goulash invites Georges
        ////////////////////////////////////////////////////////////////////////////////////////////
        mailClient.deleteAllMessages();
        client.projectController.inviteSomeone(projectId, mateAddress);

        // Invitation creates a TeamMember and touch the project;
        // The two objects are propagated to goulashsensei
        WsUpdateMessage wsInvitationUpdate = TestHelper.waitForMessagesAndAssert(
            wsGoulashClient, 1, 5, WsUpdateMessage.class).get(0);
        Assertions.assertEquals(2, wsInvitationUpdate.getUpdated().size());
        TestHelper.findFirst(wsInvitationUpdate.getUpdated(), Project.class);
        TestHelper.findFirst(wsInvitationUpdate.getUpdated(), TeamMember.class);

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Fetch e-maild and extract the token
        ////////////////////////////////////////////////////////////////////////////////////////////
        List<Message> messages = getMessageByRecipient(mateAddress);
        Assertions.assertEquals(1, messages.size());
        Message invitation = messages.get(0);

        Matcher matcher = TOKEN_EXTRACTOR.matcher(invitation.getContent().getBody());
        Assertions.assertTrue(matcher.matches());

        Long tokenId = Long.parseLong(matcher.group(1));
        String plainToken = matcher.group(2);
        this.mailClient.deleteMessage(invitation.getId());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // With is own http client 'borschClient', Georges fetch the token
        ////////////////////////////////////////////////////////////////////////////////////////////
        ColabClient borschClient = this.createRestClient();
        Token token = borschClient.tokenController.getToken(tokenId);

        Assertions.assertTrue(token instanceof InvitationToken);

        Assertions.assertTrue(token.isAuthenticationRequired());

        // an try to consume the token being unauthenticated
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.AUTHENTICATION_REQUIRED, () -> {
            // consuming the token without being authenticated is not possible
            borschClient.tokenController.consumeToken(tokenId, plainToken);
        });

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Georges sign up as borschsensei and subscribes to its channel with wsBorschClient
        ////////////////////////////////////////////////////////////////////////////////////////////
        TestUser mateUser = this.signup("borschsensei", mateAddress, "SoSoSoSecure");
        signIn(borschClient, mateUser);
        WebsocketClient wsBorschClient = this.createWsClient();
        borschClient.websocketController.subscribeToUserChannel(wsBorschClient.getSessionId());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Borsch consumes the tokens amd, thus, join the team.
        // Borsch and Goulash both receive the temmMember and borsch's user update.
        ////////////////////////////////////////////////////////////////////////////////////////////
        borschClient.tokenController.consumeToken(tokenId, plainToken);

        WsUpdateMessage goulashTeamUpdate = TestHelper.waitForMessagesAndAssert(
            wsGoulashClient, 1, 5, WsUpdateMessage.class).get(0);
        WsUpdateMessage borschTeamUpdate = TestHelper.waitForMessagesAndAssert(wsBorschClient, 1, 5, WsUpdateMessage.class).get(0);

        Assertions.assertEquals(2, goulashTeamUpdate.getUpdated().size());
        Assertions.assertEquals(2, borschTeamUpdate.getUpdated().size());

        TeamMember gTeamMemeber = TestHelper.findFirst(goulashTeamUpdate.getUpdated(), TeamMember.class);
        TeamMember bTeamMember = TestHelper.findFirst(borschTeamUpdate.getUpdated(), TeamMember.class);

        ////////////////////////////////////////////////////////////////////////////////////////////
        // They both reload the team from REST method
        ////////////////////////////////////////////////////////////////////////////////////////////
        reloadTwoMembersTeam(client, projectId);
        reloadTwoMembersTeam(borschClient, projectId);
    }

    private void reloadTwoMembersTeam(ColabClient client, Long projectId) {
        List<TeamMember> members = client.projectController.getMembers(projectId);
        Assertions.assertEquals(2, members.size());

        //assert currentUser can read user of teammate
        members.forEach((TeamMember member) -> {
            User u = client.userController.getUserById(member.getUserId());
            Assertions.assertNotNull(u);
        });

        // assert currentuser can not read other users
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.userController.getUserById(this.adminUserId);
        });
    }
}
