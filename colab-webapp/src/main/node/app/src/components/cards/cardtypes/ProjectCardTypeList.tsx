/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import useTranslations from '../../../i18n/I18nContext';
import {
  useAndLoadAvailableCardTypes,
  useAndLoadProjectCardTypes,
} from '../../../selectors/cardTypeSelector';
import CustomElementsList from '../../common/collection/CustomElementsList';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Collapsible from '../../common/layout/Collapsible';
import Flex from '../../common/layout/Flex';
import { cardTypeThumbnailStyle } from '../CardCreator';
import CardTypeCreator from './CardTypeCreator';
import CardTypeEditor from './CardTypeEditor';
import CardTypeThumbnail from './CardTypeThumbnail';

const customThumbStyle = css({
  backgroundColor: 'var(--bg-primary)',
});

/**
 * Allow to handle card types of a project :
 *
 * - see what exists, filtered by tag
 * - edit a card type
 * - create a new card type
 * - reference existing published in other projects
 * - reference existing published outside projects
 * - remove referenced card type from project
 * - delete card type owned by project
 *
 * @returns Component to deal with the project's card types
 */
export default function ProjectCardTypeList(): JSX.Element {
  const navigate = useNavigate();
  const i18n = useTranslations();

  const [lastCreated, setLastCreated] = React.useState<number | null>(null);

  const { cardTypes: projectCardTypes, status: projectCTStatus } = useAndLoadProjectCardTypes();
  const { cardTypes: availableCardTypes, status: availableCTStatus } =
    useAndLoadAvailableCardTypes();

  React.useEffect(() => {
    if (lastCreated) {
      projectCardTypes.forEach(cardType => {
        if (cardType.id === lastCreated) {
          navigate(`./edit/${cardType.id}`);
          setLastCreated(null);
        }
      });
    }
  }, [lastCreated, projectCardTypes, navigate, setLastCreated]);

  return (
    <Routes>
      <Route path="/edit/:id/*" element={<CardTypeEditor usage="currentProject" />} />
      {/* TODO : stabilize the routes ! Now : easy path to make it work*/}
      <Route path="/cardtypes/edit/:id/*" element={<CardTypeEditor usage="currentProject" />} />
      <Route
        path="*"
        element={
          <Flex
            direction="column"
            grow={1}
            align="stretch"
            className={css({ alignSelf: 'stretch' })}
          >
            <Flex justify="flex-end">
              <CardTypeCreator usage="currentProject" onCreated={setLastCreated} />
            </Flex>
            {projectCTStatus !== 'READY' ? (
              <AvailabilityStatusIndicator status={projectCTStatus} />
            ) : projectCardTypes.length > 0 ? (
              <CustomElementsList
                items={projectCardTypes}
                thumbnailContent={item => {
                  return <CardTypeThumbnail cardType={item} usage="currentProject" editable />;
                }}
                customOnDblClick={item => {
                  if (item) {
                    navigate(`./edit/${item.ownId}`);
                  }
                }}
                customThumbnailStyle={cx(cardTypeThumbnailStyle, customThumbStyle)}
                selectionnable={false}
              />
            ) : (
              <div>
                <p>
                  {i18n.modules.cardType.info.createFirstProjectType}
                  <br />
                  <br />
                  {i18n.modules.cardType.info.createEmptyType}
                  <br />
                  {i18n.modules.cardType.info.orAddSharedType}
                </p>
              </div>
            )}
            <Collapsible
              label={i18n.modules.cardType.sharedAvailableTypes}
              contentClassName={css({ flexDirection: 'column', alignItems: 'stretch' })}
            >
              {availableCTStatus !== 'READY' ? (
                <AvailabilityStatusIndicator status={availableCTStatus} />
              ) : availableCardTypes.length > 0 ? (
                <CustomElementsList
                  items={availableCardTypes}
                  thumbnailContent={item => {
                    return <CardTypeThumbnail cardType={item} usage="available" editable />;
                  }}
                  customThumbnailStyle={cx(cardTypeThumbnailStyle, customThumbStyle)}
                  selectionnable={false}
                />
              ) : (
                <div>
                  <p>{i18n.modules.cardType.info.noExternalType}</p>
                </div>
              )}
            </Collapsible>
          </Flex>
        }
      />
    </Routes>
  );
}
