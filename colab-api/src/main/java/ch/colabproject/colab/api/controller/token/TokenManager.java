/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.token;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.project.ProjectManager;
import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.controller.team.TeamManager;
import ch.colabproject.colab.api.controller.user.UserManager;
import ch.colabproject.colab.api.model.project.InstanceMaker;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.token.ExpirationPolicy;
import ch.colabproject.colab.api.model.token.InvitationToken;
import ch.colabproject.colab.api.model.token.ModelSharingToken;
import ch.colabproject.colab.api.model.token.ResetLocalAccountPasswordToken;
import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.api.model.token.VerifyLocalAccountToken;
import ch.colabproject.colab.api.model.user.HashMethod;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.token.TokenDao;
import ch.colabproject.colab.api.service.smtp.Message;
import ch.colabproject.colab.api.service.smtp.Sendmail;
import ch.colabproject.colab.api.setup.ColabConfiguration;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Process tokens
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class TokenManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(TokenManager.class);

    /**
     * to create team member
     */
    @Inject
    private TeamManager teamManager;

    /**
     * User and account specific logic
     */
    @Inject
    private UserManager userManager;

    /**
     * To check access rights
     */
    @Inject
    private SecurityManager securityManager;

    /**
     * Token persistence
     */
    @Inject
    private TokenDao tokenDao;

    /**
     * Project specific logic handling
     */
    @Inject
    private ProjectManager projectManager;

    /**
     * request context
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Persist the token
     *
     * @param token token to persist
     *
     * @return the new persisted token
     */
    private Token persistToken(Token token) {
        logger.debug("persist token {}", token);

        // set something to respect notNull constraints
        // otherwise persist will fail
        // These values will be reset when the e-mail is sent.
        if (token.getHashMethod() == null) {
            token.setHashMethod(Helper.getDefaultHashMethod());
        }
        if (token.getHashedToken() == null) {
            token.setHashedToken(new byte[0]);
        }

        return tokenDao.persistToken(token);
    }

    /**
     * Finalize initialization of the token and send it to the recipient.
     * <p>
     * As the plain token is not stored in the database, the token is regenerated in this method.
     *
     * @param token     the token to send
     * @param recipient recipient email address
     *
     * @throws javax.mail.MessagingException if sending the message fails
     */
    public void sendTokenByEmail(Token token, String recipient) throws MessagingException {
        logger.debug("Send token {} to {}", token, recipient);
        String plainToken = Helper.generateHexSalt(64);
        HashMethod hashMethod = Helper.getDefaultHashMethod();
        byte[] hashedToken = hashMethod.hash(plainToken, Token.SALT);

        token.setHashMethod(hashMethod);
        token.setHashedToken(hashedToken);

        String baseUrl = requestManager.getBaseUrl();

        // todo generate URL
        String body = token.getEmailBody(baseUrl + "/#/token/" + token.getId()
            + "/" + plainToken);

        // this log message contains sensitive information (body contains the plain-text token)
        logger.trace("Send token {} to {} with body {}", token, recipient, body);
        Sendmail.send(
            Message.create()
                .from("noreply@" + ColabConfiguration.getSmtpDomain())
                .to(recipient)
                .subject(token.getSubject())
                .htmlBody(body)
                .build()
        );
    }

    /**
     * Consume the token
     *
     * @param id         the id of the token to consume
     * @param plainToken the plain secret token as sent by e-mail
     *
     * @return the consumed token
     *
     * @throws HttpErrorMessage notFound if the token does not exist;<br>
     *                          badRequest if token does not match;<br>
     *                          authenticationRequired if token requires authentication but current
     *                          user is not
     */
    public Token consume(Long id, String plainToken) {
        logger.debug("Consume token #{}", id);

        Token token = tokenDao.findToken(id);

        if (token != null) {
            if (token.isAuthenticationRequired() && !requestManager.isAuthenticated()) {
                logger.debug("Token requires an authenticated user");
                throw HttpErrorMessage.authenticationRequired();
            } else {
                if (token.checkHash(plainToken)) {
                    requestManager.sudo(() -> {
                        boolean isConsumed = token.consume(this);

                        if (isConsumed
                            && token.getExpirationPolicy() == ExpirationPolicy.ONE_SHOT) {
                            tokenDao.deleteToken(token);
                        }
                    });
                    return token;
                } else {
                    logger.debug("Provided plain-token does not match");
                    throw HttpErrorMessage.badRequest();
                }
            }

        } else {
            logger.debug("There is no token #{}", id);
            throw HttpErrorMessage.notFound();
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Verify email address
    ////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Create or update a validation token.
     * <p>
     * If a validate token already exists for the given account, it will be update so there is never
     * more than one validation token per localAccount.
     *
     * @param account token owner
     *
     * @return a brand new token or a refresh
     */
    private VerifyLocalAccountToken getOrCreateVerifyAccountToken(LocalAccount account) {
        logger.debug("getOrCreate VerifyToken for {}", account);
        VerifyLocalAccountToken token = tokenDao.findVerifyTokenByAccount(account);

        if (token == null) {
            logger.debug("no token, create one");
            token = new VerifyLocalAccountToken();
            token.setAuthenticationRequired(false);
            token.setLocalAccount(account);
            persistToken(token);
        }
        // token.setExpirationDate(OffsetDateTime.now().plus(1, ChronoUnit.WEEKS));
        token.setExpirationDate(null);

        return token;
    }

    /**
     * Send a "Please verify your email address" message.
     *
     * @param account      account to verify
     * @param failsOnError if false, silent SMTP error
     *
     * @throws HttpErrorMessage smtpError if there is a SMPT error AND failsOnError is set to true
     *                          messageError if the message contains errors (eg. malformed
     *                          addresses)
     */
    public void requestEmailAddressVerification(LocalAccount account, boolean failsOnError) {
        try {
            VerifyLocalAccountToken token = this.getOrCreateVerifyAccountToken(account);
            sendTokenByEmail(token, account.getEmail());
        } catch (MessagingException ex) {
            logger.error("Fails to send email address verification email", ex);
            if (failsOnError) {
                throw HttpErrorMessage.smtpError();
            }
        }
    }

    /**
     * Consume the local account verification token
     *
     * @param account the account related to the token
     *
     * @return true if the token can be consumed
     */
    public boolean consumeVerifyAccountToken(LocalAccount account) {
        userManager.setLocalAccountAsVerified(account);

        return true;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // RESET PASSWORD
    ////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * get existing reset password token if it exists or create new one otherwise.
     *
     * @param account token owner
     *
     * @return the token to user
     */
    private ResetLocalAccountPasswordToken getOrCreateResetToken(LocalAccount account) {
        logger.debug("getOrCreate Reset for {}", account);
        ResetLocalAccountPasswordToken token = tokenDao.findResetTokenByAccount(account);

        if (token == null) {
            token = new ResetLocalAccountPasswordToken();
            logger.debug("no token, create one");
            token.setAuthenticationRequired(false);
            token.setLocalAccount(account);
            persistToken(token);
        }
        token.setExpirationDate(OffsetDateTime.now().plus(1, ChronoUnit.HOURS));

        return token;
    }

    /**
     * Send a "Click here the reset your password" message.
     *
     * @param account      The account whose password is to be reset
     * @param failsOnError if false, silent SMTP error
     *
     * @throws HttpErrorMessage smtpError if there is a SMPT error AND failsOnError is set to true
     *                          messageError if the message contains errors (eg. malformed
     *                          addresses)
     */
    public void sendResetPasswordToken(LocalAccount account, boolean failsOnError) {
        try {
            logger.debug("Send reset password token to {}", account);
            ResetLocalAccountPasswordToken token = this.getOrCreateResetToken(account);
            sendTokenByEmail(token, account.getEmail());
        } catch (MessagingException ex) {
            logger.error("Failed to send password reset email", ex);
            if (failsOnError) {
                throw HttpErrorMessage.smtpError();
            }
        }
    }

    /**
     * Consume the given reset password login.
     *
     * @param account the account related to the token
     *
     * @return true if the token can be consumed
     */
    public boolean consumeResetPasswordToken(LocalAccount account) {
        requestManager.login(account);

        return true;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Invite a new team member
    ////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Send invitation to join the project team to the recipient.
     *
     * @param project   the project to join
     * @param recipient email address to send invitation to
     *
     * @return the pending teamMember of null if none was sent
     */
    public TeamMember sendMembershipInvitation(Project project, String recipient) {
        User currentUser = securityManager.assertAndGetCurrentUser();

        InvitationToken token = tokenDao.findInvitationByProjectAndRecipient(project, recipient);
        if (token == null) {
            // create a member and link it to the project, but do not link it to any user
            // this link will be set during token consumption
            TeamMember newMember = teamManager.addMember(project, null,
                HierarchicalPosition.INTERNAL);
            token = new InvitationToken();

            token.setTeamMember(newMember);
            // never expire
            token.setExpirationDate(null);
            token.setAuthenticationRequired(Boolean.TRUE);
            token.setRecipient(recipient);

            newMember.setDisplayName(recipient);

            persistToken(token);
        }

        token.setSender(currentUser.getDisplayName());

        try {
            sendTokenByEmail(token, recipient);
        } catch (MessagingException ex) {
            logger.error("Failed to send membership invitation email", ex);
            throw HttpErrorMessage.smtpError();
        }

        return token.getTeamMember();
    }

    /**
     * Delete all invitations linked to the team member
     *
     * @param teamMember the team member for which we delete all invitations
     */
    public void deleteInvitationsByTeamMember(TeamMember teamMember) {
        List<InvitationToken> invitations = tokenDao.findInvitationByTeamMember(teamMember);
        invitations.stream().forEach(token -> tokenDao.deleteToken(token));
    }

    /**
     * Consume the invitation token
     *
     * @param teamMember the team member related to the token
     *
     * @return true if the token can be consumed
     */
    public boolean consumeInvitationToken(TeamMember teamMember) {
        User user = requestManager.getCurrentUser();

        if (user == null) {
            throw HttpErrorMessage.authenticationRequired();
        }

        Project project = teamMember.getProject();

        TeamMember existingTeamMember = teamManager.findMemberByProjectAndUser(project, user);
        if (existingTeamMember != null) {
            throw HttpErrorMessage
                .tokenProcessingFailure(MessageI18nKey.USER_IS_ALREADY_A_TEAM_MEMBER);
        }

        teamMember.setUser(user);
        teamMember.setDisplayName(null);

        return true;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Share a model to someone
    ////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Send a model sharing token to register the project as a model to use
     * <p>
     * If the token does not exist yet, create it and link to it a new pending instance maker.
     *
     * @param model     the id of the model
     * @param recipient the address to send the sharing token to
     *
     * @return the pending instance maker
     */
    public InstanceMaker sendModelSharingToken(Project model, String recipient) {
        User currentUser = securityManager.assertAndGetCurrentUser();

        ModelSharingToken token = tokenDao.findModelSharingByProjectAndRecipient(model, recipient);

        if (token == null) {
            // create an instance maker and link it to the project, but do not link it to any user
            // this link will be set during token consumption
            InstanceMaker newInstanceMaker = projectManager.addAndPersistInstanceMaker(model, null);

            token = new ModelSharingToken();

            token.setInstanceMaker(newInstanceMaker);
            token.setExpirationDate(null);
            token.setAuthenticationRequired(Boolean.TRUE);
            token.setRecipient(recipient);

            newInstanceMaker.setDisplayName(recipient);

            persistToken(token);
        }

        token.setSender(currentUser.getDisplayName());

        try {
            sendTokenByEmail(token, recipient);
        } catch (MessagingException ex) {
            logger.error("Failed to send model sharing email", ex);
            throw HttpErrorMessage.smtpError();
        }

        return token.getInstanceMaker();
    }

//    /**
//     * Delete all model sharing tokens linked to the instance maker
//     *
//     * @param instanceMaker the instance maker for which we delete all invitations
//     */
//    public void deleteModelSharingTokenByInstanceMaker(InstanceMaker instanceMaker) {
//        List<ModelSharingToken> tokens = tokenDao.findModelSharingByInstanceMaker(instanceMaker);
//        tokens.stream().forEach(token -> tokenDao.deleteToken(token));
//    }

    /**
     * Consume the model sharing token
     *
     * @param instanceMaker the instance maker related to the token
     *
     * @return true if the token can be consumed
     */
    public boolean consumeModelSharingToken(InstanceMaker instanceMaker) {
        User user = requestManager.getCurrentUser();

        if (user == null) {
            throw HttpErrorMessage.authenticationRequired();
        }

        Project model = instanceMaker.getProject();

        InstanceMaker existingInstanceMaker = projectManager
            .findInstanceMakerByProjectAndUser(model, user);
        if (existingInstanceMaker != null) {
            throw HttpErrorMessage.tokenProcessingFailure(
                MessageI18nKey.CURRENT_USER_CAN_ALREADY_USE_MODEL);
        }

        instanceMaker.setUser(user);
        instanceMaker.setDisplayName(null);

        return true;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // for each token
    ////////////////////////////////////////////////////////////////////////////////////////////////

//    /**
//     * Delete all invitations linked to the project
//     *
//     * @param project the project for which we delete all tokens
//     */
//    public void deleteTokensByProject(Project project) {
//        List<Token> tokens = tokenDao.findTokensByProject(project);
//        tokens.stream().forEach(token -> tokenDao.deleteToken(token));
//    }

    /**
     * Fetch token with given id from DAO. If it's outdated, it will be destroyed and null will be
     * returned
     *
     * @param id id of the token
     *
     * @return token if it exists and is not outdated, null otherwise
     */
    public Token getNotExpiredToken(Long id) {
        Token token = tokenDao.findToken(id);

        if (token != null && token.isOutdated()) {
            requestManager.sudo(() -> tokenDao.deleteToken(token));
            return null;
        }

        return token;
    }
}
