/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faEdit, faEllipsisV, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AsyncThunk } from '@reduxjs/toolkit';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import { StateStatus } from '../../store/project';
import Button from '../common/Button';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import DropDownMenu from '../common/DropDownMenu';
import InlineInput from '../common/InlineInput';
import InlineLoading from '../common/InlineLoading';
import { cardStyle, fixedButtonStyle, invertedButtonStyle, space_M } from '../styling/style';

/* const cardInfoStyle = css({
  margin: space_S + ' 0',
}); */

const projectListStyle = css({
  margin: 'auto',
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridColumnGap: '40px',
  gridRowGap: '40px',
});
interface Props {
  project: Project;
}

// Display one project and allow to edit it
const ProjectDisplay = ({ project }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <div
      className={cx(
        cardStyle,
        css({
          display: 'flex',
          flexDirection: 'column',
        }),
      )}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: space_M,
        })}
      >
        {/* <AutoSaveInput
          placeholder="Unnamed project"
          value={project.name || ''}
          onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
          className={css({ fontWeight: 'bold' })}
        /> */}
        <InlineInput
          placeholder="Unnamed project"
          value={project.name || ''}
          onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
          className={css({ fontWeight: 'bold' })}
        />
        <DropDownMenu
          icon={faEllipsisV}
          valueComp={{ value: '', label: '' }}
          buttonClassName={css({ marginLeft: '40px' })}
          entries={[
            {
              value: 'Delete project',
              label: (
                <ConfirmDeleteModal
                  buttonLabel={
                    <>
                      <FontAwesomeIcon icon={faTrash} /> Delete project
                    </>
                  }
                  message={
                    <p>
                      Are you <strong>sure</strong> you want to delete the whole project? This will
                      delete all cards inside.
                    </p>
                  }
                  onConfirm={() => dispatch(API.deleteProject(project))}
                  confirmButtonLabel="Delete project"
                />
              ),
            },
          ]}
        />
      </div>
      <div
        className={css({
          padding: space_M,
          paddingRight: '40px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        })}
      >
        <InlineInput
          placeholder="Write a description here."
          value={project.description || ''}
          onChange={newValue => dispatch(API.updateProject({ ...project, description: newValue }))}
          inputType='textarea'
          autosave={false}
        />
        {/* 
        //FUTURE block of infos on the project
        <div
          className={css({
            fontSize: '0.8em',
            opacity: 0.4,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            marginTop: space_M,
          })}
        >
          <p className={cardInfoStyle}>Number of Cards?</p>
          <p className={cardInfoStyle}>Created by: {project.trackingData?.createdBy} </p>
          <p className={cardInfoStyle}>Number of people involved?</p>
          <p className={cardInfoStyle}>Last update: {project.trackingData?.modificationDate}</p>
        </div> */}
      </div>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: space_M,
        })}
      >
        <Button
          title="Edit project"
          icon={faEdit}
          onClick={() => navigate(`/editor/${project.id}`)}
          className={cx(css({ margin: 'auto' }), invertedButtonStyle)}
        >
          Edit project
        </Button>
      </div>
    </div>
  );
};

interface ProjectListProps {
  projects: Project[];
  status: StateStatus;
  // eslint-disable-next-line @typescript-eslint/ban-types
  reload: AsyncThunk<Project[], void, {}>;
}

function ProjectList({ projects, status, reload }: ProjectListProps) {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED') {
      dispatch(reload());
    }
  }, [status, reload, dispatch]);

  if (status === 'NOT_INITIALIZED') {
    return <InlineLoading />;
  } else if (status === 'LOADING') {
    return <InlineLoading />;
  } else {
    return (
      <div className={css({ padding: '4vw' })}>
        <div className={projectListStyle}>
          {projects
            .sort((a, b) => (a.id || 0) - (b.id || 0))
            .map(project => {
              if (project != null) {
                return <ProjectDisplay key={project.id} project={project} />;
              } else {
                return <InlineLoading />;
              }
            })}
        </div>
        <Button
          onClick={() => {
            dispatch(
              API.createProject({
                '@class': 'Project',
                name: '',
              }),
            );
          }}
          icon={faPlus}
          title={'Create new project'}
          className={fixedButtonStyle}
        >
          Create new project
        </Button>
      </div>
    );
  }
}

export const UserProjects = (): JSX.Element => {
  const projects = useAppSelector(
    state =>
      state.projects.mine.flatMap(projectId => {
        const p = state.projects.projects[projectId];
        if (p) {
          return [p];
        } else {
          return [];
        }
      }),
    shallowEqual,
  );

  const status = useAppSelector(state => state.projects.status);

  return <ProjectList projects={projects} status={status} reload={API.getUserProjects} />;
};

export const AllProjects = (): JSX.Element => {
  const projects = useAppSelector(state => Object.values(state.projects.projects), shallowEqual);
  const status = useAppSelector(state => state.projects.allStatus);

  return <ProjectList projects={projects} status={status} reload={API.getAllProjects} />;
};
