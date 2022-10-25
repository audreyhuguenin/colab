/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css} from '@emotion/css';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { dispatch } from '../../store/store';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import { LabeledInput, LabeledTextArea } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import { space_L } from '../styling/style';
import { ProjectIllustrationMaker } from './ProjectIllustrationMaker';

interface ProjectSettingsProps {
  project: Project;
}

// Display one project and allow to edit it
export function ProjectSettings({ project }: ProjectSettingsProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <Flex align="stretch" direction="column" grow={1} className={css({ alignSelf: 'stretch' })}>
      <Tabs defaultTab="general">
        <Tab name="general" label={i18n.common.general}>
          <Flex className={css({ alignSelf: 'stretch' })}>
            <Flex
              direction="column"
              align="stretch"
              className={css({ width: '45%', minWidth: '45%', marginRight: space_L })}
            >
              <LabeledInput
                label={i18n.common.name}
                placeholder={i18n.modules.project.actions.newProject}
                value={project.name || ''}
                onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
              />
              <LabeledTextArea
                label={i18n.common.description}
                placeholder={i18n.common.info.writeDescription}
                value={project.description || ''}
                onChange={newValue =>
                  dispatch(API.updateProject({ ...project, description: newValue }))
                }
              />
            </Flex>
            <Flex
              direction="column"
              align="stretch"
              justify="flex-end"
              className={css({ width: '55%' })}
            >
              <IllustrationDisplay illustration={project.illustration} />
              <ProjectIllustrationMaker
                illustration={project.illustration}
                setIllustration={i =>
                  dispatch(
                    API.updateProject({
                      ...project,
                      illustration: i,
                    }),
                  )
                }
              />
            </Flex>
          </Flex>
        </Tab>
      </Tabs>
    </Flex>
  );
}
