/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.team;

import static ch.colabproject.colab.api.model.team.TeamMember.TEAM_SEQUENCE_NAME;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.common.Tracking;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.acl.Assignment;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.EmptyChannelBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ProjectContentChannelBuilder;
import java.util.ArrayList;
import java.util.List;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * A role within the development team. A role is used to group several member sharing same skills or
 * objective within the project.
 *
 * @author maxence
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "project_id"), }
)
public class TeamRole implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * TeamRole ID.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = TEAM_SEQUENCE_NAME)
    private Long id;

    /**
     * creation + modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * Name of the role. Can not be null or blank
     */
    @Size(max = 255)
    @NotBlank
    private String name;

    /**
     * The project
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JsonbTransient
    private Project project;

    /**
     * The project ID (serialization sugar)
     */
    @Transient
    private Long projectId;

    /**
     * List of members who are part of this role
     */
    @ManyToMany(mappedBy = "roles")
    @JsonbTransient
    private List<TeamMember> members = new ArrayList<>();

    /**
     * List of assignments relative to this role
     */
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<Assignment> assignments = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the project ID
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * Set id
     *
     * @param id id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Get the tracking data
     *
     * @return tracking data
     */
    @Override
    public Tracking getTrackingData() {
        return trackingData;
    }

    /**
     * Set tracking data
     *
     * @param trackingData new tracking data
     */
    @Override
    public void setTrackingData(Tracking trackingData) {
        this.trackingData = trackingData;
    }

    /**
     * Get role name
     *
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * Set the name
     *
     * @param name new role name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the project
     */
    public Project getProject() {
        return project;
    }

    /**
     * @param project the project
     */
    public void setProject(Project project) {
        this.project = project;
    }

    /**
     * get the project id. To be sent to client
     *
     * @return id of the project or null
     */
    public Long getProjectId() {
        if (this.project != null) {
            return this.project.getId();
        } else {
            return projectId;
        }
    }

    /**
     * set the project id. For serialization only
     *
     * @param id the id of the project
     */
    public void setProjectId(Long id) {
        this.projectId = id;
    }

    /**
     * Get members
     *
     * @return members
     */
    public List<TeamMember> getMembers() {
        return members;
    }

    /**
     * Set the list of members
     *
     * @param members list of members
     */
    public void setMembers(List<TeamMember> members) {
        this.members = members;
    }

    /**
     * Get the list of assignments
     *
     * @return assignments list
     */
    public List<Assignment> getAssignments() {
        return assignments;
    }

    /**
     * Set the list of assignments
     *
     * @param assignments new list of assignments
     */
    public void setAssignments(List<Assignment> assignments) {
        this.assignments = assignments;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof TeamRole) {
            TeamRole o = (TeamRole) other;
            this.setName(o.getName());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public ChannelsBuilder getChannelsBuilder() {
        if (this.getProject() != null) {
            return new ProjectContentChannelBuilder(project);
        } else {
            return new EmptyChannelBuilder();
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        if (this.project != null) {
            return new Conditions.IsCurrentUserMemberOfProject(this.project);
        } else {
            // should not exist
            return Conditions.alwaysTrue;
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getUpdateCondition() {
        if (this.project != null) {
            return new Conditions.IsCurrentUserInternalToProject(this.project);
        } else {
            // should not exist
            return Conditions.alwaysTrue;
        }
    }

    @Override
    public int hashCode() {
        return EntityHelper.hashCode(this);
    }

    @Override
    @SuppressWarnings("EqualsWhichDoesntCheckParameterClass")
    public boolean equals(Object obj) {
        return EntityHelper.equals(this, obj);
    }

    @Override
    public String toString() {
        return "Role{" + "id=" + id + ", name=" + name + ", projectId=" + projectId + '}';
    }

}
