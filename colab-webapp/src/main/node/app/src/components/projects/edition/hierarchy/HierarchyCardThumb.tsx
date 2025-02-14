/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import React from 'react';
import { shallowEqual } from 'react-redux';
import * as API from '../../../../API/api';
import useTranslations from '../../../../i18n/I18nContext';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { ProgressBar } from '../../../cards/CardLayout';
import InlineLoading from '../../../common/element/InlineLoading';
import Flex from '../../../common/layout/Flex';
import { cardStyle, lightTextStyle, space_lg, space_sm, text_sm } from '../../../styling/style';
import { HierarchyCTX } from './Hierarchy';

const showAddVariantStyle = css({
  ':hover': {
    '& .variant-creator': {
      visibility: 'visible',
    },
  },
});

const grabGroupStyle = css({
  cursor: 'grab',
});

const clickGroupStyle = css({
  cursor: 'pointer',
});

interface CardContentThumbProps {
  id: string;
  name: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  //card: Card;
  cardContent?: CardContent;
}

function CardContentThumb({
  id,
  name,
  className,
  onClick,
  onMouseDown,
  cardContent,
}: CardContentThumbProps): JSX.Element {
  const { assignDiv } = React.useContext(HierarchyCTX);
  return (
    <Flex direction="column" grow={1} align="stretch">
      <div
        ref={r => {
          assignDiv(r, `CardContent-${id}`);
        }}
        className={cx(
          text_sm,
          lightTextStyle,
          css({
            cursor: onClick != null ? 'pointer' : 'default',
            flexGrow: 1,
            border: '1px solid var(--divider-main)',
            textAlign: 'center',
          }),
          className,
          id ? `CardContent-${id}` : undefined,
        )}
        onClick={onClick}
        onMouseDown={onMouseDown}
      >
        {name}
      </div>
      <ProgressBar variant={cardContent} />
    </Flex>
  );
}

interface CardGroupProps {
  card: Card;
}

export default function CardGroup({ card }: CardGroupProps) {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const root = useAppSelector(state => {
    const rootState = state.cards.cards[card.id!];
    if (rootState) {
      return rootState;
    }
    return undefined;
  }); //refEqual is fine

  React.useEffect(() => {
    if (root != null && root.card && root.card.id && root.contents === undefined) {
      dispatch(API.getCardContents(root.card.id));
    }
  }, [root, dispatch]);
  /**
   * Select card contents.
   * @return list of contents if they are known, undefined if they're unknown, null if loading is pending
   */
  const contents = useAppSelector(state => {
    if (root != null && root.card != null && root.card.id != null) {
      const card = state.cards.cards[root.card.id];
      if (card != null) {
        if (card.contents != null) {
          return Object.values(card.contents).map(contentId => {
            return state.cards.contents[contentId];
          });
        } else {
          return card.contents;
        }
      }
    }
  }, shallowEqual);

  const { assignDiv, showCreatorButton, cardDecorator, onCardClick, onContentClick, dnd } =
    React.useContext(HierarchyCTX);
  return (
    <div
      className={cx(cardStyle, {
        CardGroup: true,
        [`CardType-${card.cardTypeId}`]: card.cardTypeId != null,
        [showAddVariantStyle]: showCreatorButton,
        [grabGroupStyle]: dnd,
        [clickGroupStyle]: onCardClick != null,
      })}
      key={`CardGroupc${card.id!}`}
    >
      <div
        onClick={
          onCardClick
            ? e => {
                e.preventDefault();
                onCardClick(card);
              }
            : undefined
        }
        className={css({
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          borderTop: card.color && card.color != '#ffffff' ? '5px solid ' + card.color : 'none',
          width: '100%',
        })}
      >
        <div
          className={css({
            padding: space_lg,
          })}
        >
          {cardDecorator ? (
            cardDecorator(card)
          ) : (
            <span className={css({ fontWeight: 'bold' })}>
              {card.title || <i>{i18n.modules.card.untitled}</i>}
            </span>
          )}
        </div>
      </div>
      {contents != null ? (
        <Flex
          direction="row"
          align="stretch"
          theRef={ref => {
            assignDiv(ref, `CardGroup-${card.id}`);
          }}
        >
          {contents.map((v, i) =>
            v?.content != null ? (
              <CardContentThumb
                id={String(v.content.id)}
                key={v.content.id}
                name={v.content.title || ''}
                //card={card}
                cardContent={v.content}
                className={css({ padding: contents.length === 1 ? undefined : space_sm })}
                onClick={
                  onContentClick
                    ? e => {
                        e.stopPropagation();
                        onContentClick(card, v.content!);
                      }
                    : undefined
                }
              />
            ) : (
              <InlineLoading key={`loader-${i}`} />
            ),
          )}

          {/* {showCreatorButton && (
                <CardContentThumb
                  id={`new-for-${card.id}`}
                  name="(+)"
                  className={`variant-creator ${css({
                    visibility: 'hidden',
                    //              position: 'absolute',
                    //              left: '100%',
                  })}`}
                  onMouseDown={e => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    dispatch(API.createCardContentVariantWithBlockDoc(card.id!));
                  }}
                />
              )} */}
        </Flex>
      ) : (
        <InlineLoading />
      )}
    </div>
  );
}
