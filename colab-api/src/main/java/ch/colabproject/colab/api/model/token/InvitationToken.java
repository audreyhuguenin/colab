/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.token.tools.InvitationMessageBuilder;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.Index;
import javax.persistence.NamedQuery;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * A token to validate the email address of a local account
 *
 * @author maxence
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "teammember_id"),
    }
)
@NamedQuery(
    name = "InvitationToken.findByProjectAndRecipient",
    query = "SELECT t from InvitationToken t "
        + "WHERE t.teamMember.project.id = :projectId AND t.recipient =:recipient")
@NamedQuery(
    name = "InvitationToken.findByTeamMember",
    query = "SELECT t from InvitationToken t "
        + "WHERE t.teamMember.id = :teamMemberId")
public class InvitationToken extends Token {

    private static final long serialVersionUID = 1L;

    /**
     * Email subject
     */
    private static final String EMAIL_SUBJECT = "Invitation to collaborate on a co.LAB project";

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The member of the project
     */
    @OneToOne // FetchType.EAGER is fine
    @NotNull
    @JsonbTransient
    private TeamMember teamMember;

    /**
     * Invitation sender
     */
    @Size(max = 255)
    @JsonbTransient
    private String sender;

    /**
     * email address to send the invitation to
     */
    @Size(max = 255)
    @JsonbTransient
    private String recipient;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * Get the teamMemebr for which the invitation is pending.
     *
     * @return team member
     */
    public TeamMember getTeamMember() {
        return teamMember;
    }

    /**
     * set the team member this invitation is for
     *
     * @param teamMember the team member for which this invitation is pending
     */
    public void setTeamMember(TeamMember teamMember) {
        this.teamMember = teamMember;
    }

    /**
     * Get sender name
     *
     * @return name of sender
     */
    public String getSender() {
        return sender;
    }

    /**
     * Set the sender name
     *
     * @param sender name of the sender
     */
    public void setSender(String sender) {
        this.sender = sender;
    }

    /**
     * Email address to send the invitation to
     *
     * @return email address
     */
    public String getRecipient() {
        return recipient;
    }

    /**
     * Set the email address to send this invitation to
     *
     * @param recipient recipient email address
     */
    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    // ---------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------

    @Override
    public String getRedirectTo() {
        if (this.teamMember != null && this.teamMember.getUser() != null) {
            // if link from user to project is not set, do not even try to read the project
            // as it will lead to an access denied exception
            Project project = getProject();
            if (project != null && project.getId() != null) {
                return "/editor/" + project.getId();
            }
        }
        return "";
    }

    /**
     * Register currentUser in teamMember
     */
    @Override
    public void consume(RequestManager requestManager) {
        User user = requestManager.getCurrentUser();
        if (user != null) {
            teamMember.setUser(user);
            teamMember.setDisplayName("");
        } else {
            throw HttpErrorMessage.authenticationRequired();
        }
    }

    // ---------------------------------------------------------------------------------------------
    // to build a message
    // ---------------------------------------------------------------------------------------------

    @JsonbTransient
    @Override
    public String getSubject() {
        return EMAIL_SUBJECT;
    }

    @Override
    public String getEmailBody(String link) {
        return InvitationMessageBuilder.build(this, link);
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    /**
     * If team member is set, return the associated project.
     *
     * @return the project
     */
    @JsonbTransient
    public Project getProject() {
        if (teamMember != null) {
            return teamMember.getProject();
        }
        return null;
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getCreateCondition() {
        return new Conditions.IsCurrentUserMemberOfProject(getProject());
    }

    @Override
    public String toString() {
        return "InvitationToken{" + "id=" + getId() + '}';
    }

}
