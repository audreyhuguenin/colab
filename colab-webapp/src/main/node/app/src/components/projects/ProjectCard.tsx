import { css, cx } from '@emotion/css';
import { Project } from 'colab-rest-client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useCurrentUser } from '../../selectors/userSelector';
import { useAppDispatch } from '../../store/hooks';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import {
  ellipsisStyle,
  lightIconButtonStyle,
  lightTextStyle,
  multiLineEllipsisStyle,
  p_md,
  p_sm,
  space_sm,
  text_sm,
} from '../styling/style';
import { defaultProjectIllustration } from './ProjectCommon';

const modelChipStyle = cx(
  p_sm,
  css({
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: '0 0 0 50%',
    backgroundColor: 'var(--text-primary)',
  }),
);

interface ProjectDisplayProps {
  project: Project;
  className?: string;
}

// Display one project and allow to edit it
export default function ProjectDisplay({ project, className }: ProjectDisplayProps) {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const navigate = useNavigate();

  const { currentUser } = useCurrentUser();

  return (
    <Flex
      onMouseDown={e => {
        // ultimate hack to open a project in the very same tab: use middle mouse button
        if (e.button === 1) {
          navigate(`/editor/${project.id}`);
        }
      }}
      direction="column"
      align="stretch"
      className={cx(className)}
    >
      <Flex
        className={css({
          height: '70px',
          position: 'relative',
        })}
      >
        {project.type === 'MODEL' && (
          <Flex
            align="center"
            justify="center"
            className={modelChipStyle}
            title={i18n.modules.project.info.isAModel}
          >
            {project.globalProject ? (
              <Icon icon={'language'} color="white" />
            ) : (
              <Icon icon={'star'} color="white" />
            )}
          </Flex>
        )}
        <IllustrationDisplay illustration={project.illustration || defaultProjectIllustration} />
      </Flex>
      <Flex
        direction="column"
        align="stretch"
        gap={space_sm}
        className={cx(p_md, css({ height: '80px', textAlign: 'left' }))}
      >
        <Flex justify="space-between" align="center" className={cx()}>
          <h3 className={ellipsisStyle} title={project.name ? project.name : 'Project name'}>
            {project.name}
          </h3>
          <DropDownMenu
            icon={'more_vert'}
            valueComp={{ value: '', label: '' }}
            buttonClassName={cx(css({ marginLeft: '40px' }), lightIconButtonStyle)}
            entries={[
              {
                value: 'open',
                label: (
                  <>
                    <Icon icon={'edit'} /> {i18n.common.open}
                  </>
                ),
                action: () => window.open(`#/editor/${project.id}`, '_blank'),
              },
              {
                value: 'settings',
                label: (
                  <>
                    <Icon icon={'settings'} /> {i18n.common.settings}
                  </>
                ),
                action: () => navigate(`projectsettings/${project.id}`),
              },
              {
                value: 'duplicate',
                label: (
                  <>
                    <Icon icon={'content_copy'} /> {i18n.common.duplicate}
                  </>
                ),
                action: () => {
                  const newName = i18n.modules.project.projectCopy(project.name || '');
                  dispatch(API.duplicateProject({ project, newName }));
                },
              },
              ...(project.type !== 'MODEL'
                ? [
                    {
                      value: 'extractModel',
                      label: (
                        <>
                          <Icon icon={'star'} /> {i18n.modules.project.actions.saveAsModel}
                        </>
                      ),
                      action: () => navigate(`extractModel/${project.id}`),
                    },
                  ]
                : []),
              ...(currentUser?.admin && project.type !== 'MODEL'
                ? [
                    {
                      value: 'convertToModel',
                      label: (
                        <>
                          <Icon icon={'star'} /> {i18n.modules.project.actions.convertToModel}
                        </>
                      ),
                      action: () => {
                        dispatch(API.updateProject({ ...project, type: 'MODEL' })).then(() => {
                          navigate('/models');
                        });
                      },
                    },
                  ]
                : []),
              ...(currentUser?.admin && project.type === 'MODEL'
                ? [
                    {
                      value: 'convertToProject',
                      label: (
                        <>
                          <Icon icon={'flip_camera_android'} />
                          {i18n.modules.project.actions.convertToProject}
                        </>
                      ),
                      action: () => {
                        dispatch(API.updateProject({ ...project, type: 'PROJECT' })).then(() => {
                          navigate('/');
                        });
                      },
                    },
                  ]
                : []),
              {
                value: 'delete',
                label: (
                  <>
                    <Icon icon={'delete'} color={'var(--error-main)'} /> {i18n.common.delete}
                  </>
                ),
                action: () => navigate(`deleteproject/${project.id}`),
              },
            ]}
          />
        </Flex>
        <p
          title={project.description || ''}
          className={cx(multiLineEllipsisStyle, text_sm, lightTextStyle)}
        >
          {project.description}
        </p>
      </Flex>
    </Flex>
  );
}
