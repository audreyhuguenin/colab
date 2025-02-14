/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadProjectCardTypes } from '../../selectors/cardTypeSelector';
import { useCurrentProjectId } from '../../selectors/projectSelector';
import { useAppDispatch } from '../../store/hooks';
import CustomElementsList from '../common/collection/CustomElementsList';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Button, { AsyncButtonWithLoader } from '../common/element/Button';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import Modal from '../common/layout/Modal';
import { space_lg, space_sm } from '../styling/style';
import CardTypeThumbnail from './cardtypes/CardTypeThumbnail';

export const cardTypeThumbnailStyle = css({
  padding: space_lg,
  //width: `calc(50% - 8px - 4*${space_S} - ${space_M})`,
  minHeight: '85px',
  maxHeight: '85px',
  margin: space_sm,
});

export interface CardCreatorProps {
  parentCardContent: CardContent;
  display?: string;
  customLabel?: string;
  className?: string;
}

export default function CardCreator({
  parentCardContent,
  display,
  className,
  customLabel,
}: CardCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const { cardTypes, status } = useAndLoadProjectCardTypes();
  const currentProjectId = useCurrentProjectId();

  const [showCardTypeSelector, setShowCardTypeSelector] = React.useState(false);

  const [selectedType, setSelectedType] = React.useState<number | null>(null);
  // const mainButtonRef = React.useRef<HTMLDivElement>(null);

  const createCard = React.useCallback(async () => {
    return dispatch(
      API.createSubCardWithTextDataBlock({
        parent: parentCardContent,
        cardTypeId: selectedType,
      }),
    );
  }, [dispatch, parentCardContent, selectedType]);

  const createAndClose = React.useCallback(
    async (close: () => void) => {
      return createCard().then(() => {
        close();
      });
    },
    [createCard],
  );

  const onClickCb = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      if (e.altKey) {
        setShowCardTypeSelector(true);
      } else {
        createCard();
      }
      e.stopPropagation();
    },
    [createCard],
  );

  const resetData = React.useCallback(() => {
    setSelectedType(null);
  }, []);

  if (showCardTypeSelector) {
    return (
      <Modal
        title={i18n.modules.card.createNew(parentCardContent.title)}
        className={cx(css({ height: '580px', width: '800px' }))}
        modalBodyClassName={css({ paddingTop: space_sm })}
        onClose={() => {
          resetData();
          setShowCardTypeSelector(false);
        }}
        footer={close => (
          <Flex
            justify="space-between"
            align="center"
            grow={1}
            className={css({ padding: space_lg, alignSelf: 'stretch' })}
          >
            <Button
              onClick={() => {
                if (currentProjectId) {
                  navigate(`/editor/${currentProjectId}/docs/cardTypes`);
                }
              }}
              variant="outline"
              className={cx(css({ justifySelf: 'flex-start' }))}
            >
              {i18n.modules.cardType.route.manageTypes}
            </Button>
            <Flex>
              <Button onClick={close} variant="outline">
                {i18n.common.cancel}
              </Button>

              <AsyncButtonWithLoader onClick={() => createAndClose(close)}>
                {i18n.modules.card.createCard}
              </AsyncButtonWithLoader>
            </Flex>
          </Flex>
        )}
        showCloseButton
      >
        {close => {
          if (status !== 'READY') {
            return <AvailabilityStatusIndicator status={status} />;
          } else {
            return (
              <div className={css({ width: '100%', textAlign: 'left' })}>
                <Flex grow={1} className={css({ paddingTop: space_sm })}>
                  <h2>{i18n.modules.card.action.chooseACardType}</h2>
                </Flex>
                <CustomElementsList
                  items={cardTypes}
                  thumbnailContent={item => {
                    return <CardTypeThumbnail cardType={item} usage="currentProject" />;
                  }}
                  customThumbnailStyle={cx(cardTypeThumbnailStyle)}
                  customOnClick={item => setSelectedType(item?.id ? item.id : null)}
                  customOnDblClick={() => {
                    createCard().then(() => close());
                  }}
                  addEmptyItem
                  selectionnable
                />
              </div>
            );
          }
        }}
      </Modal>
    );
  }

  return display === 'dropdown' ? (
    <Flex align="center" grow={1} onClick={onClickCb}>
      <Icon icon={'add'} className={css({ marginRight: space_sm })} />
      {customLabel ? customLabel : i18n.modules.card.createCard}
    </Flex>
  ) : (
    <IconButton
      variant="ghost"
      icon={'add'}
      className={className}
      title={customLabel ? customLabel : i18n.modules.card.createCard}
      onClick={onClickCb}
    />
  );
}
