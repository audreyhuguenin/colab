/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faFile, faStickyNote } from '@fortawesome/free-regular-svg-icons';
import { faCog, faEllipsisV, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useResources } from '../../selectors/resourceSelector';
import { useStickyNoteLinksForDest } from '../../selectors/stickyNoteLinkSelector';
import { useAppDispatch } from '../../store/hooks';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import DropDownMenu from '../common/DropDownMenu';
import Flex from '../common/Flex';
import InlineLoading from '../common/InlineLoading';
import Modal from '../common/Modal';
import { ResourceContextScope } from '../resources/ResourceCommonType';
import { lightIconButtonStyle, space_M, space_S } from '../styling/style';
import CardLayout from './CardLayout';
import CardSettings from './CardSettings';
import ContentSubs from './ContentSubs';

interface Props {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  showSubcards?: boolean;
  depth?: number;
}

export default function CardThumb({
  card,
  depth = 1,
  showSubcards = true,
  variant,
  variants,
}: Props): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hasVariants = variants.length > 1 && variant != null;

  const nbStickyNotes = useStickyNoteLinksForDest(card.id).stickyNotesForDest.length;
  const nbResources = useResources({
    kind: ResourceContextScope.CardOrCardContent,
    cardContentId: variant?.id || undefined,
    cardId: card?.id || undefined,
    accessLevel: 'READ',
  }).resourcesAndRefs.length;

  const closeRouteCb = React.useCallback(
    route => {
      navigate(location.pathname.replace(new RegExp(route + '$'), ''));
    },
    [location.pathname, navigate],
  );

  const cardId = card.id;

  if (cardId == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    return (
      <CardLayout card={card} variant={variant} variants={variants}>
        <>
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              borderBottom: '1px solid lightgray',
              width: '100%',
            })}
          >
            <div
              className={css({
                padding: space_S + ' ' + space_S + ' ' + space_S + ' ' + space_M,
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                })}
              >
                <div>
                  <span className={css({ fontWeight: 'bold' })}>
                    {card.title || i18n.card.untitled}
                  </span>
                  {variants.length > 1 ? (
                    variant?.title ? (
                      <span> - {variant.title}</span>
                    ) : (
                      <i> - {i18n.content.untitled}</i>
                    )
                  ) : null}
                </div>
                {/* handle modal routes*/}
                <Routes>
                  <Route
                    path={`${cardId}/settings`}
                    element={
                      <Modal
                        title="Card Settings"
                        onClose={() => closeRouteCb('settings')}
                        showCloseButton
                      >
                        {closeModal =>
                          variant != null ? (
                            <CardSettings onClose={closeModal} card={card} variant={variant} />
                          ) : (
                            <InlineLoading />
                          )
                        }
                      </Modal>
                    }
                  />
                </Routes>
                <DropDownMenu
                  icon={faEllipsisV}
                  valueComp={{ value: '', label: '' }}
                  buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
                  entries={[
                    {
                      value: 'edit card',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faPen} /> Edit Card
                        </>
                      ),
                      action: () => {
                        const path = `edit/${cardId}/v/${variant?.id}`;
                        if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
                          navigate(`../${path}`);
                        } else {
                          navigate(path);
                        }
                      },
                    },
                    {
                      value: 'settings',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faCog} title="Card settings" /> Card Settings
                        </>
                      ),
                      action: () => {
                        navigate(`${cardId}/settings`);
                      },
                    },
                    {
                      value: 'Delete card',
                      label: (
                        <ConfirmDeleteModal
                          buttonLabel={
                            <>
                              <FontAwesomeIcon icon={faTrash} />
                              {hasVariants ? ' Delete variant' : ' Delete card'}
                            </>
                          }
                          message={
                            hasVariants ? (
                              <p>
                                Are you <strong>sure</strong> you want to delete this whole variant?
                                This will delete all subcards inside.
                              </p>
                            ) : (
                              <p>
                                Are you <strong>sure</strong> you want to delete this whole card?
                                This will delete all subcards inside.
                              </p>
                            )
                          }
                          onConfirm={() => {
                            if (hasVariants) {
                              dispatch(API.deleteCardContent(variant));
                            } else {
                              dispatch(API.deleteCard(card));
                              navigate('../');
                            }
                          }}
                          confirmButtonLabel={hasVariants ? 'Delete variant' : 'Delete card'}
                        />
                      ),
                    },
                  ]}
                  onSelect={val => {
                    val.action != null ? val.action() : navigate(val.value);
                  }}
                />
              </div>
              <Flex
                className={css({
                  color: 'var(--disabledGrey)',
                  gap: space_M,
                  fontSize: '0.85em',
                  paddingRight: space_S,
                })}
              >
                <div>
                  <FontAwesomeIcon icon={faStickyNote} /> {nbStickyNotes}
                </div>
                {/* TODO get nb of resources (not in store)*/}
                <div>
                  <FontAwesomeIcon icon={faFile} /> {nbResources}
                </div>
              </Flex>
            </div>
          </div>
          <Flex
            grow={1}
            align="stretch"
            className={css({
              padding: space_M,
            })}
          >
            {showSubcards ? (
              variant != null ? (
                <ContentSubs depth={depth} cardContent={variant} />
              ) : (
                <i>{i18n.content.none}</i>
              )
            ) : null}
          </Flex>
        </>
      </CardLayout>
    );
  }
}
