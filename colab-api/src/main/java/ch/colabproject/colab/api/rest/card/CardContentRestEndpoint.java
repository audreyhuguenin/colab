/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.card;

import ch.colabproject.colab.api.controller.card.CardContentManager;
import ch.colabproject.colab.api.controller.document.RelatedPosition;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.jpa.card.CardContentDao;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.util.List;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST card content controller
 *
 * @author sandra
 */
@Path("cardContents")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class CardContentRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardContentRestEndpoint.class);

    /**
     * The card content persistence manager
     */
    @Inject
    private CardContentDao cardContentDao;

    /**
     * Card content specific logic management
     */
    @Inject
    private CardContentManager cardContentManager;

    /**
     * Get card content identified by the given id
     *
     * @param id id of the card content to fetch
     *
     * @return the card content or null
     */
    @GET
    @Path("{id: [0-9]+}")
    public CardContent getCardContent(@PathParam("id") Long id) {
        logger.debug("Get card #{}", id);
        return cardContentDao.findCardContent(id);
    }

    /**
     * Create and persist a new card content
     *
     * @param cardId id of the new card content's parent
     *
     * @return the persisted new card content
     */
    @POST
    @Path("create/{cardId: [0-9]+}")
    public CardContent createNewCardContent(@PathParam("cardId") Long cardId) {
        logger.debug("create a new card content for the card #{}", cardId);
        return cardContentManager.createNewCardContent(cardId);
    }

    /**
     * Create and persist a new card content
     *
     * @param cardId   id of the new card content's parent
     * @param document the deliverable of the new card content
     *
     * @return the persisted new card content
     */
    @POST
    @Path("createWithDeliverable/{cardId: [0-9]+}")
    public CardContent createNewCardContentWithDeliverable(@PathParam("cardId") Long cardId,
        Document document) {
        logger.debug("create a new card content for the card #{} and document {}", cardId,
            document);

        CardContent cardContent = cardContentManager.createNewCardContent(cardId);

        cardContentManager.addDeliverable(cardContent.getId(), document);

        return cardContent;
    }

    /**
     * Save changes to database. Only fields which are editable by users will be impacted.
     *
     * @param cardContent card content to update
     *
     * @throws ColabMergeException if the merge is not possible
     */
    @PUT
    public void updateCardContent(CardContent cardContent) throws ColabMergeException {
        logger.debug("update card content {}", cardContent);
        cardContentDao.updateCardContent(cardContent);
    }

    /**
     * Permanently delete a card content
     *
     * @param id id of the card content to delete
     */
    @DELETE
    @Path("{id: [0-9]+}")
    public void deleteCardContent(@PathParam("id") Long id) {
        logger.debug("Delete card #{}", id);
        cardContentManager.deleteCardContent(id);
    }

    /**
     * Add the deliverable at the beginning of the card content.
     *
     * @param cardContentId the id of the card content
     * @param document      the document to use as deliverable. It must be a new document
     *
     * @return the document newly created
     */
    @POST
    @Path("{id: [0-9]+}/addDeliverableAtBeginning")
    public Document addDeliverableAtBeginning(@PathParam("id") Long cardContentId,
        Document document) {
        logger.debug("add the deliverable {} at the beginning of the card content #{}", document,
            cardContentId);
        return cardContentManager.addDeliverable(cardContentId, document,
            RelatedPosition.AT_BEGINNING, null);
    }

    /**
     * Add the deliverable at the end of the card content.
     *
     * @param cardContentId the id of the card content
     * @param document      the document to use as deliverable. It must be a new document
     *
     * @return the document newly created
     */
    @POST
    @Path("{id: [0-9]+}/addDeliverableAtEnd")
    public Document addDeliverableAtEnd(@PathParam("id") Long cardContentId, Document document) {
        logger.debug("add the deliverable {} at the end of the card content #{}", document,
            cardContentId);
        return cardContentManager.addDeliverable(cardContentId, document,
            RelatedPosition.AT_END, null);
    }

    /**
     * Add the deliverable to the card content just before the given document.
     *
     * @param cardContentId  the id of the card content
     * @param neighbourDocId the id of the document which will be just after the new document
     * @param document       the document to use as deliverable. It must be a new document
     *
     * @return the document newly created
     */
    @POST
    @Path("{id: [0-9]+}/addDeliverableBefore/{neighbourDocId: [0-9]+}")
    public Document addDeliverableBefore(@PathParam("id") Long cardContentId,
        @PathParam("neighbourDocId") Long neighbourDocId, Document document) {
        logger.debug("add the deliverable {} before #{} in the card content #{}", document,
            neighbourDocId, cardContentId);
        return cardContentManager.addDeliverable(cardContentId, document, RelatedPosition.BEFORE,
            neighbourDocId);
    }

    /**
     * Add the deliverable to the card content just after the given document.
     *
     * @param cardContentId  the id of the card content
     * @param neighbourDocId the id of the document which will be just before the new document
     * @param document       the document to use as deliverable. It must be a new document
     *
     * @return the document newly created
     */
    @POST
    @Path("{id: [0-9]+}/addDeliverableAfter/{neighbourDocId: [0-9]+}")
    public Document addDeliverableAfter(@PathParam("id") Long cardContentId,
        @PathParam("neighbourDocId") Long neighbourDocId, Document document) {
        logger.debug("add the deliverable {} after #{} in the card content #{}", document,
            neighbourDocId, cardContentId);
        return cardContentManager.addDeliverable(cardContentId, document, RelatedPosition.AFTER,
            neighbourDocId);
    }

    /**
     * Remove the deliverable of the card content.
     *
     * @param cardContentId the id of the card content
     * @param documentId    the id of the document to remove from the card content
     */
    @POST
    @Path("{id: [0-9]+}/removeDeliverable")
    public void removeDeliverable(@PathParam("id") Long cardContentId, Long documentId) {
        logger.debug("remove the deliverable #{} from the card content #{}", documentId,
            cardContentId);

        cardContentManager.removeDeliverable(cardContentId, documentId);
    }

    /**
     * Get all sticky note links where the card content is the source
     *
     * @param cardContentId the id of the card content
     *
     * @return list of links
     */
    @GET
    @Path("{id: [0-9]+}/StickyNoteLinks")
    public List<StickyNoteLink> getStickyNoteLinksAsSrc(@PathParam("id") Long cardContentId) {
        logger.debug("Get sticky note links where card #{} is the source", cardContentId);
        return cardContentManager.getStickyNoteLinkAsSrcCardContent(cardContentId);
    }

    /**
     * Get all sub cards
     *
     * @param parentId parent of the searched cards
     *
     * @return list of cards
     */
    @GET
    @Path("{id: [0-9]+}/Subcards")
    public List<Card> getSubCards(@PathParam("id") Long parentId) {
        logger.debug("Get parent #{} sub cards", parentId);
        return cardContentManager.getSubCards(parentId);
    }

    /**
     * Get the deliverables of the card content
     *
     * @param cardContentId the id of the card content
     *
     * @return the deliverables linked to the card content
     */
    @GET
    @Path("{id: [0-9]+}/Deliverables")
    public List<Document> getDeliverablesOfCardContent(@PathParam("id") Long cardContentId) {
        logger.debug("Get deliverables of card content #{}", cardContentId);
        return cardContentManager.getDeliverablesOfCardContent(cardContentId);
    }

}
