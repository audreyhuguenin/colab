/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.ejb.WebsocketFacade;
import ch.colabproject.colab.api.ws.channel.WebsocketEffectiveChannel;
import ch.colabproject.colab.api.ws.message.WsSessionIdentifier;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 * API to manage subscription to {@link WebsocketEffectiveChannel}.
 * <p>
 * <u>Note about un/subcriptions protocol:</u> The link between HttpSessionId (cookie) and websocket
 * session id must be known. As the client has no access to its cookie (httpOnly cookie, for
 * security concerns), the subscription is made through the REST methods defined here. Thus, both
 * htto session id and websocket session id are known at the same time.
 *
 * @author maxence
 */
@Path("websockets")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class WebsocketController {

    /**
     * Websocket business logic
     */
    @Inject
    private WebsocketFacade wsFacade;

    /**
     * Subscribe to the currentUser channel
     *
     * @param sessionId websocket session id
     *
     */
    @PUT
    @Path("SubscribeToUserChannel")
    public void subscribeToUserChannel(WsSessionIdentifier sessionId) {
        wsFacade.subscribeToUserChannel(sessionId);
    }

    /**
     * Unsubscribe from the currentUser channel
     *
     * @param sessionId websocket session id
     *
     */
    @PUT
    @Path("UnsubscribeFromUserChannel")
    public void unsubscribeFromUserChannel(WsSessionIdentifier sessionId) {
        wsFacade.unsubscribeFromUserChannel(sessionId);
    }

    /**
     * Subscribe to a ProjectContent channel.
     *
     * @param projectId id of the project
     * @param sessionId websocket session id
     */
    @PUT
    @Path("SubscribeToProjectChannel/{projectId: [0-9]*}")
    public void subscribeToProjectChannel(
        @PathParam("projectId") Long projectId,
        WsSessionIdentifier sessionId
    ) {
        wsFacade.subscribeToProjectChannel(sessionId, projectId);
    }

    /**
     * Unsubscribe from a ProjectContent channel.
     *
     * @param projectId id of the project
     * @param sessionId websocket session id
     */
    @PUT
    @Path("UnSubscribeFromProjectChannel/{projectId: [0-9]*}")
    public void unsubscribeFromProjectChannel(
        @PathParam("projectId") Long projectId,
        WsSessionIdentifier sessionId
    ) {
        wsFacade.unsubscribeFromProjectChannel(sessionId, projectId);
    }
}
