/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
//import { CSVLink } from 'react-csv';
import useTranslations from '../../../i18n/I18nContext';
import { useProject } from '../../../selectors/projectSelector';
import { useCurrentUser } from '../../../selectors/userSelector';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Flex from '../../common/layout/Flex';
import Tabs, { Tab } from '../../common/layout/Tabs';
import { space_xl } from '../../styling/style';
import ProjectSettingsAdvanced from './ProjectSettingsAdvanced';
import ProjectSettingsGeneral from './ProjectSettingsGeneral';
import ProjectSettingsModelSharing from './ProjectSettingsSharing';

interface ProjectSettingsTabsProps {
  projectId: number;
}

export function ProjectSettingsTabs({ projectId }: ProjectSettingsTabsProps): JSX.Element {
  const i18n = useTranslations();

  const { currentUser } = useCurrentUser();

  const { project, status } = useProject(projectId);

  if (status !== 'READY' || project == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <Flex
      align="stretch"
      direction="column"
      grow={1}
      className={css({ alignSelf: 'stretch', padding: space_xl })}
    >
      <Tabs routed>
        <Tab name="general" label={i18n.common.general}>
          <ProjectSettingsGeneral projectId={projectId} />
        </Tab>
        <Tab
          name="share"
          label={i18n.modules.project.labels.sharing}
          invisible={project.type !== 'MODEL'}
        >
          <ProjectSettingsModelSharing projectId={projectId} />
        </Tab>
        <Tab name="advanced" label={i18n.common.advanced} invisible={!currentUser?.admin}>
          <ProjectSettingsAdvanced projectId={projectId} />
        </Tab>
      </Tabs>
    </Flex>
  );
}
