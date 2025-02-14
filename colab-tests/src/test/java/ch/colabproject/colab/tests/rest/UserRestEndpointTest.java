/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest;

import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.HttpSession;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import ch.colabproject.colab.api.ws.channel.model.UserChannel;
import ch.colabproject.colab.api.ws.message.WsChannelUpdate;
import ch.colabproject.colab.api.ws.message.WsUpdateMessage;
import ch.colabproject.colab.client.ColabClient;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage.MessageCode;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.TestHelper;
import ch.colabproject.colab.tests.tests.TestUser;
import ch.colabproject.colab.tests.ws.WebsocketClient;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import javax.inject.Inject;
import javax.websocket.DeploymentException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * @author maxence
 */
public class UserRestEndpointTest extends AbstractArquillianTest {

    /**
     * Internal userManagement logic. Required to inspect properties not exposed through REST API.
     */
    @Inject
    private UserDao userDao;

    /**
     * Create a user, login, update user and account, and logout
     */
    @Test
    public void testCreateUser() {
        TestUser myUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword");

        this.signIn(myUser);

        User user = client.userRestEndpoint.getCurrentUser();
        Assertions.assertNotNull(user);

        String cn = "Goulash Sensei";
        String fn = "Georges";
        String ln = "Croivet-Batton";
        String aff = "Palais des Verres-Sales";

        user.setCommonname(cn);
        user.setFirstname(fn);
        user.setLastname(ln);
        user.setAffiliation(aff);

        client.userRestEndpoint.updateUser(user);

        user = client.userRestEndpoint.getCurrentUser();
        Assertions.assertEquals(cn, user.getCommonname());
        Assertions.assertEquals(fn, user.getFirstname());
        Assertions.assertEquals(ln, user.getLastname());
        Assertions.assertEquals(aff, user.getAffiliation());

        this.signOut();
        Assertions.assertNull(client.userRestEndpoint.getCurrentUser());
    }

    /**
     * make sure client can not update internal user field
     */
    @Test
    public void testUpdateUserInternalFields() {
        TestUser myUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword"
        );

        this.signIn(myUser);

        User user = client.userRestEndpoint.getCurrentUser();
        Assertions.assertNotNull(user);

        String cn = "Goulash Sensei";
        String fn = "Georges";
        String ln = "Croivet-Batton";

        // authorized
        user.setCommonname(cn);
        user.setFirstname(fn);
        user.setLastname(ln);

        // not authorized
        user.setAdmin(true);

        client.userRestEndpoint.updateUser(user);

        user = client.userRestEndpoint.getCurrentUser();
        Assertions.assertEquals(cn, user.getCommonname());
        Assertions.assertEquals(fn, user.getFirstname());
        Assertions.assertEquals(ln, user.getLastname());

        Assertions.assertFalse(user.isAdmin());

        this.signOut();
        Assertions.assertNull(client.userRestEndpoint.getCurrentUser());
    }

    /**
     * Assert authenticate with wrong password fails
     */
    @Test
    public void testAuthenticationFailure() {
        this.signOut();
        TestUser myUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword"
        );

        myUser.setPassword("WrongPassword");

        TestHelper.assertThrows(HttpErrorMessage.MessageCode.AUTHENTICATION_FAILED, () -> {
            this.signIn(myUser);
        });

        User user = client.userRestEndpoint.getCurrentUser();

        Assertions.assertNull(user);
    }

    @Test
    public void testUnsuitableEmail() {
        String username = "lea";
        String password = "SoSecuredPassword";

        // empty
        TestHelper.assertThrows(MessageCode.SIGNUP_FAILURE, () -> {
            this.signup(username, "", password);
        });

        // accent
        TestHelper.assertThrows(MessageCode.SIGNUP_FAILURE, () -> {
            this.signup(username, "léa@test.local", password);
        });

        // weird character
        TestHelper.assertThrows(MessageCode.SIGNUP_FAILURE, () -> {
            this.signup(username, "le;a@test.local", password);
        });

        // upper case
        TestHelper.assertThrows(MessageCode.SIGNUP_FAILURE, () -> {
            this.signup(username, "Lea@test.local", password);
        });

        this.signup(username, "lea@test.local", password);

        this.signOut();
    }

    /**
     * Assert that a username with not an accepted character is rejected
     */
    @Test
    public void testUnsuitableUsername() {
        String email = "anyuser@test.local";
        String password = "SoSecuredPassword";

        // empty
        TestHelper.assertThrows(MessageCode.DATA_ERROR, () -> {
            this.signup("", email, password);
        });

        // accent
        TestHelper.assertThrows(MessageCode.DATA_ERROR, () -> {
            this.signup("Marie-Gaëlle.Marchand_test", email, password);
        });

        // weird character
        TestHelper.assertThrows(MessageCode.DATA_ERROR, () -> {
            this.signup("Marie-Gaelle.Marchand_test$", email, password);
        });

        this.signup("Marie-Gaelle.Marchand_test", email, password);

        this.signOut();
    }

    /**
     * Assert one admin can give admin rights to some other user
     */
    @Test
    public void testGrantAdminRight() {
        TestUser myUser = this.signup(
            "Goulash_Sensei",
            "goulashsensei@test.local",
            "SoSecuredPassword"
        );

        this.signIn(myUser);
        User sensei = client.userRestEndpoint.getCurrentUser();
        Assertions.assertFalse(sensei.isAdmin());

        this.signOut();
        this.signIn(this.admin);

        User adminUser = client.userRestEndpoint.getCurrentUser();
        Assertions.assertTrue(adminUser.isAdmin());

        client.userRestEndpoint.grantAdminRight(sensei.getId());

        this.signOut();
        this.signIn(myUser);
        sensei = client.userRestEndpoint.getCurrentUser();
        Assertions.assertTrue(sensei.isAdmin());
    }

    /**
     * Assert a non-admin can not give admin rights to some other user
     */
    @Test
    public void testUnauthorizedGrantAdminRight() {
        TestUser myUser = this
            .signup("GoulashSensei", "goulashsensei@test.local", "SoSecuredPassword");

        this.signIn(myUser);
        User sensei = client.userRestEndpoint.getCurrentUser();
        Assertions.assertFalse(sensei.isAdmin());
        Long senseiId = sensei.getId();

        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.userRestEndpoint.grantAdminRight(senseiId);
        });

        sensei = client.userRestEndpoint.getCurrentUser();
        Assertions.assertFalse(sensei.isAdmin());
    }

    /**
     * Test switch to new client hash method
     */
    @Test
    public void testRotateClientHashMethod() {
        TestUser myUser = this
            .signup("GoulashSensei", "goulashsensei@test.local", "SoSecuredPassword");

        AuthMethod initialAuthMethod = client.userRestEndpoint.getAuthMethod(myUser.getEmail());

        this.signIn(myUser);
        LocalAccount senseiAccount = (LocalAccount) client.userRestEndpoint.getCurrentAccount();

        this.signOut();
        this.signIn(this.admin);

        client.userRestEndpoint.switchClientHashMethod(senseiAccount.getId());

        AuthMethod pendingAuthMethod = client.userRestEndpoint.getAuthMethod(myUser.getEmail());

        // Mandatory method is still the same
        Assertions.assertEquals(initialAuthMethod.getSalt(), pendingAuthMethod.getSalt());
        Assertions.assertEquals(initialAuthMethod.getMandatoryMethod(), pendingAuthMethod
            .getMandatoryMethod());

        // Optional method is read to be used
        Assertions.assertNotNull(pendingAuthMethod.getNewSalt());
        Assertions.assertNotNull(pendingAuthMethod.getOptionalMethod());

        this.signOut();
        // sign in will trigger method rotation
        this.signIn(myUser);

        AuthMethod newAuthMethod = client.userRestEndpoint.getAuthMethod(myUser.getEmail());

        // Mandatory method is the new one
        Assertions.assertEquals(pendingAuthMethod.getNewSalt(), newAuthMethod.getSalt());
        Assertions.assertEquals(pendingAuthMethod.getOptionalMethod(), newAuthMethod
            .getMandatoryMethod());
        // there is no optional method any longer
        Assertions.assertNull(newAuthMethod.getNewSalt());
        Assertions.assertNull(newAuthMethod.getOptionalMethod());

        this.signOut();
        User user = client.userRestEndpoint.getCurrentUser();
        Assertions.assertNull(user);
        // sign in one more time to authenticate with new method
        this.signIn(myUser);
        user = client.userRestEndpoint.getCurrentUser();
        Assertions.assertNotNull(user);
    }

    /**
     * Test switch to new server hash method
     */
    @Test
    public void testRotateServerHashMethod() {
        TestUser myUser = this.signup("GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword");

        this.signIn(myUser);
        LocalAccount senseiAccount = (LocalAccount) client.userRestEndpoint.getCurrentAccount();

        User internalUser = userDao.findUserByUsername(myUser.getUsername());
        LocalAccount internalAccount = (LocalAccount) internalUser.getAccounts().get(0);
        byte[] dbSalt = internalAccount.getDbSalt();

        this.signOut();
        this.signIn(this.admin);

        client.userRestEndpoint.switchServerHashMethod(senseiAccount.getId());

        // assert next db method is staged
        internalUser = userDao.findUserByUsername(myUser.getUsername());
        internalAccount = (LocalAccount) internalUser.getAccounts().get(0);
        Assertions.assertNotNull(internalAccount.getNextDbHashMethod());

        // sign in again will trigger method rotation
        this.signOut();
        this.signIn(myUser);

        internalUser = userDao.findUserByUsername(myUser.getUsername());
        internalAccount = (LocalAccount) internalUser.getAccounts().get(0);
        Assertions.assertNull(internalAccount.getNextDbHashMethod());
        Assertions.assertFalse(Arrays.equals(dbSalt, internalAccount.getDbSalt()));

        // sign in one more time to authenticate with new method
        this.signOut();
        User user = client.userRestEndpoint.getCurrentUser();
        Assertions.assertNull(user);
        this.signIn(myUser);
        user = client.userRestEndpoint.getCurrentUser();
        Assertions.assertNotNull(user);
    }

    /**
     * Test verify account process.
     */
    @SuppressWarnings("boxing")
    @Test
    public void testVerify() {
        TestUser myUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword");

        this.signIn(myUser);
        LocalAccount account = (LocalAccount) this.client.userRestEndpoint.getCurrentAccount();
        Assertions.assertFalse(account.isVerified());

        this.verifyAccounts();

        account = (LocalAccount) this.client.userRestEndpoint.getCurrentAccount();
        Assertions.assertTrue(account.isVerified());
    }

    @Test
    public void testUpdateSelfPassword() {
        TestUser myUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword");

        this.signIn(myUser);
        LocalAccount account = (LocalAccount) this.client.userRestEndpoint.getCurrentAccount();
        Assertions.assertEquals(account.getEmail(), myUser.getEmail());

        String newPassword = "N3kronom;c0n";
        AuthInfo authInfo = getAuthInfo(myUser.getEmail(), newPassword);

        this.client.userRestEndpoint.updateLocalAccountPassword(authInfo);
        this.signOut();

        TestHelper.assertThrows(HttpErrorMessage.MessageCode.AUTHENTICATION_FAILED, () -> {
            this.signIn(myUser);
        });

        myUser.setPassword(newPassword);
        this.signIn(myUser);
        account = (LocalAccount) this.client.userRestEndpoint.getCurrentAccount();
        Assertions.assertEquals(account.getEmail(), myUser.getEmail());
    }

    @Test
    public void testUpdateOtherPassword() {
        TestUser myUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword");

        TestUser otherUser = this.signup(
            "BorschSensei",
            "borschsensei@test.local",
            "SoSecuredPassword");

        this.signIn(myUser);
        LocalAccount account = (LocalAccount) this.client.userRestEndpoint.getCurrentAccount();
        Assertions.assertEquals(account.getEmail(), myUser.getEmail());

        String newPassword = "N3kronom;c0n";
        AuthInfo authInfo = getAuthInfo(otherUser.getEmail(), newPassword);

        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            this.client.userRestEndpoint.updateLocalAccountPassword(authInfo);
        });
    }

    @Test
    public void testAdminUpdateOtherPassword() {
        TestUser otherUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword");

        this.signIn(otherUser);
        LocalAccount account = (LocalAccount) this.client.userRestEndpoint.getCurrentAccount();
        Assertions.assertEquals(account.getEmail(), otherUser.getEmail());

        this.signOut();
        this.signIn(admin);

        String newPassword = "N3kronom;c0n";
        AuthInfo authInfo = getAuthInfo(otherUser.getEmail(), newPassword);
        otherUser.setPassword(newPassword);
        this.client.userRestEndpoint.updateLocalAccountPassword(authInfo);

        this.signOut();

        this.signIn(otherUser);
        account = (LocalAccount) this.client.userRestEndpoint.getCurrentAccount();
        Assertions.assertEquals(account.getEmail(), otherUser.getEmail());
    }

    @Test
    public void testWebsocket()
        throws URISyntaxException, DeploymentException, IOException, InterruptedException {
        this.signIn(admin);

//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketHelper.class), Level.DEBUG);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketClient.class), Level.DEBUG);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketManager.class), Level.DEBUG);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(TransactionManager.class), Level.DEBUG);
        WebsocketClient wsClient = this.createWsClient();
        // subscribe to currentUser channel
        client.websocketRestEndpoint.subscribeToUserChannel(wsClient.getSessionId());

        WsChannelUpdate channelUpdate = TestHelper
            .waitForMessagesAndAssert(wsClient, 1, 10, WsChannelUpdate.class).get(0);
        Assertions.assertTrue(channelUpdate.getChannel() instanceof UserChannel);
        UserChannel userChannel = (UserChannel) channelUpdate.getChannel();
        Assertions.assertEquals(this.adminUserId, userChannel.getUserId());
        Assertions.assertEquals(1, channelUpdate.getDiff());

        User me = client.userRestEndpoint.getCurrentUser();

        final String NEW_NAME = "Georges";
        me.setCommonname(NEW_NAME);

        wsClient.clearMessages();
        client.userRestEndpoint.updateUser(me);

        WsUpdateMessage updateMessage = TestHelper
            .waitForMessagesAndAssert(wsClient, 1, 10, WsUpdateMessage.class).get(0);
        // nothing has been deleted
        Assertions.assertEquals(0, updateMessage.getDeleted().size());
        // one entity has been updated
        Assertions.assertEquals(1, updateMessage.getUpdated().size());

        WithWebsocketChannels entity = updateMessage.getUpdated().iterator().next();

        Assertions.assertTrue(entity instanceof User);
        Assertions.assertEquals(NEW_NAME, ((User) entity).getCommonname());
    }

    @Test
    public void testGetActiveSessions() {
        TestUser otherUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword");

        this.signIn(otherUser);
        LocalAccount account = (LocalAccount) this.client.userRestEndpoint.getCurrentAccount();
        Assertions.assertEquals(account.getEmail(), otherUser.getEmail());

        List<HttpSession> oneSession = this.client.userRestEndpoint.getActiveSessions();
        // first session
        Assertions.assertEquals(1, oneSession.size());
        Long firstSessionId = oneSession.get(0).getId();

        // connect with some other client to create a distinct session
        ColabClient otherClient = this.createRestClient();
        this.signIn(otherClient, otherUser);

        // first client sees the two session
        List<HttpSession> twoSessions = this.client.userRestEndpoint.getActiveSessions();
        Assertions.assertEquals(2, twoSessions.size());

        // fetch id of the second one
        Optional<HttpSession> findSecond = twoSessions.stream()
            .filter(s -> !s.getId().equals(firstSessionId)).findFirst();
        Assertions.assertTrue(findSecond.isPresent());
        Long secondSessionId = findSecond.get().getId();

        // second client sees two session too
        Assertions.assertEquals(2,
            otherClient.userRestEndpoint.getActiveSessions()
                .size());

        TestHelper.assertThrows(HttpErrorMessage.MessageCode.BAD_REQUEST, () -> {
            // force logout your very session is not possible
            this.client.userRestEndpoint.forceLogout(firstSessionId);
        });

        // client 1 force client2 to logOut (since it's the same user, it's fine)
        this.client.userRestEndpoint.forceLogout(secondSessionId);

        TestHelper.assertThrows(HttpErrorMessage.MessageCode.AUTHENTICATION_REQUIRED, () -> {
            // second client can not fetch list of session any longer
            otherClient.userRestEndpoint.getActiveSessions();
        });

        // first client: only one session left
        Assertions.assertEquals(1,
            this.client.userRestEndpoint.getActiveSessions()
                .size());

        // new user sign in
        TestUser hacker = this.signup(
            "hacker",
            "hacker@test.local",
            "Hacker4lw4ysUse5tron6Pa55wo¶d");

        this.signIn(otherClient, hacker);

        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            // force logout a session you do not own is not possible
            otherClient.userRestEndpoint.forceLogout(firstSessionId);
        });

        // but admin can
        otherClient.userRestEndpoint.signOut();
        this.signIn(otherClient, admin);
        otherClient.userRestEndpoint.forceLogout(firstSessionId);

        // initial client has been kicked out
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.AUTHENTICATION_REQUIRED, () -> {
            this.client.userRestEndpoint.getActiveSessions();
        });
    }
}
