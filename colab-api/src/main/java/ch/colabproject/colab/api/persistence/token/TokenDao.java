/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.token;

import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.api.model.token.VerifyLocalAccountToken;
import ch.colabproject.colab.api.model.user.LocalAccount;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;

/**
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class TokenDao {

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a token by id
     *
     * @param id id of the token§
     *
     * @return the token if found or null
     */
    public Token getToken(Long id) {
        return em.find(Token.class, id);
    }

    /**
     * Find any VerifyLocalAccountToken linked to the given account.
     *
     * @param account owner of the token
     *
     * @return the token if found. Null otherwise
     */
    public VerifyLocalAccountToken findVerifyTokenByAccount(LocalAccount account) {
        try {
            return em.createNamedQuery("VerifyLocalAccountToken.findByAccountId",
                VerifyLocalAccountToken.class)
                .setParameter("id", account.getId())
                .getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Persist the token
     *
     * @param token token to persist
     */
    public void persistToken(Token token) {
        em.persist(token);
        // flush to make sure token got an id
        em.flush();
    }

    /**
     * Delete the given token
     *
     * @param token token to remove
     */
    public void deleteToken(Token token) {
        em.remove(token);
    }
}
