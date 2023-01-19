/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { CopyParam, entityIs, Project, TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../API/api';
import {
  customColabStateEquals,
  shallowEqual,
  useAppDispatch,
  useAppSelector,
} from '../store/hooks';
import { StateStatus } from '../store/slice/projectSlice';
import { AvailabilityStatus } from '../store/store';

export interface ProjectAndStatus {
  project: Project | null;
  status: AvailabilityStatus;
}

export const useProject = (id: number | undefined): ProjectAndStatus => {
  return useAppSelector(state => {
    if (id == null) {
      return {
        project: null,
        status: 'ERROR',
      };
    }
    const project = state.projects.projects[id];
    if (entityIs(project, 'Project')) {
      // project is known
      return {
        project: project,
        status: 'READY',
      };
    } else {
      return {
        project: null,
        status: project || 'NOT_INITIALIZED',
      };
    }
  }, shallowEqual);
};

export function useAndLoadProject(id: number | undefined): ProjectAndStatus {
  const dispatch = useAppDispatch();

  const { project, status } = useProject(id);

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && id != null) {
      dispatch(API.getProject(id));
    }
  }, [dispatch, id, status]);

  return { project, status };
}

export const useProjectBeingEdited = (): {
  project: Project | null;
  status: 'NOT_EDITING' | 'LOADING' | 'READY';
} => {
  return useAppSelector(state => {
    if (state.projects.editing != null) {
      const project = state.projects.projects[state.projects.editing];
      return {
        project: entityIs(project, 'Project') ? project : null,
        status: state.projects.editingStatus,
      };
    } else {
      return {
        project: null,
        status: state.projects.editingStatus,
      };
    }
  }, shallowEqual);
};

const useProjectTeam = (
  projectId: number | undefined | null,
): {
  members: TeamMember[];
  roles: TeamRole[];
  status: StateStatus;
} => {
  return useAppSelector(state => {
    const r: { members: TeamMember[]; roles: TeamRole[]; status: StateStatus } = {
      members: [],
      roles: [],
      status: 'NOT_INITIALIZED',
    };
    if (projectId != null) {
      const team = state.projects.teams[projectId];
      if (team) {
        r.status = team.status;
        r.members = Object.values(team.members);
        r.roles = Object.values(team.roles);
      }
    }

    return r;
  }, customColabStateEquals);
};

export const useAndLoadProjectTeam = (
  projectId: number | undefined | null,
): {
  members: TeamMember[];
  roles: TeamRole[];
  status: StateStatus;
} => {
  const dispatch = useAppDispatch();
  const team = useProjectTeam(projectId);

  React.useEffect(() => {
    if (team.status == 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getProjectTeam(projectId));
    }
  }, [dispatch, team.status, projectId]);

  return team;
};

export function useMyMember(
  projectId: number | undefined | null,
  userId: number | undefined | null,
): TeamMember | undefined {
  const team = useAndLoadProjectTeam(projectId);
  if (projectId != null && userId != null) {
    return Object.values(team.members || {}).find(m => m.userId === userId);
  }
  return undefined;
}

interface ProjectsAndStatus {
  projects: Project[];
  status: AvailabilityStatus;
}

function useModelProjects(): ProjectsAndStatus {
  const projects = useAppSelector(state => {
    return Object.values(
      state.projects.mine
        .flatMap(id => {
          const proj = state.projects.projects[id];
          return entityIs(proj, 'Project') ? [proj] : [];
        })
        .filter(proj => proj.type === 'MODEL'),
    );
  }, shallowEqual);

  return { projects, status: 'READY' };
}

export function useAndLoadModelProjects(): ProjectsAndStatus {
  const dispatch = useAppDispatch();

  const { projects, status } = useModelProjects();

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED') {
      dispatch(API.getUserProjects());
    }
  }, [dispatch, status]);

  return { projects, status };
}

function useInstanceableModels(): ProjectsAndStatus {
  return useAppSelector(
    state => {
      const projects = state.projects.instanceableProjects.flatMap(projectId => {
        const p = state.projects.projects[projectId];
        if (entityIs(p, 'Project') && p.type === 'MODEL') {
          return [p];
        } else {
          return [];
        }
      });
      return { projects, status: state.projects.statusForInstanceableModels };
    },

    shallowEqual,
  );
}

export function useAndLoadInstanceableModels(): ProjectsAndStatus {
  const dispatch = useAppDispatch();

  const { projects, status } = useInstanceableModels();

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED') {
      dispatch(API.getInstanceableModels());
    }
  }, [dispatch, status]);

  return { projects, status };
}

export function useAndLoadMyAndInstanceableModels(): ProjectsAndStatus {
  const dispatch = useAppDispatch();

  return useAppSelector(
    state => {
      // First fetch the statuses of everything we want
      // 1. models where the user is an instance maker for
      const statusIM = state.projects.statusForInstanceableModels;

      if (statusIM === 'NOT_INITIALIZED') {
        dispatch(API.getInstanceableModels());
      }

      if (statusIM !== 'READY') {
        return { projects: [], status: statusIM };
      }

      // 2. models where the user is a team member of
      const statusMine = state.projects.statusForCurrentUser;

      if (statusMine === 'NOT_INITIALIZED') {
        dispatch(API.getUserProjects());
      }

      if (statusMine !== 'READY') {
        return { projects: [], status: statusMine };
      }

      // 3. models global = accessible by everyone
      const statusGlobal = state.projects.statusForGlobalModels;

      if (statusGlobal === 'NOT_INITIALIZED') {
        dispatch(API.getAllGlobalProjects());
      }

      if (statusGlobal !== 'READY') {
        return { projects: [], status: statusGlobal };
      }

      // Then if all statuses are READY, get the data

      // 1. models where the user is an instance maker for
      const projectsIM = state.projects.instanceableProjects.flatMap(projectId => {
        const p = state.projects.projects[projectId];
        if (entityIs(p, 'Project') && p.type === 'MODEL') {
          return [p];
        } else {
          return [];
        }
      });

      // 2. models where the user is a team member of
      const projectsMine = Object.values(
        state.projects.mine
          .flatMap(id => {
            const proj = state.projects.projects[id];
            return entityIs(proj, 'Project') ? [proj] : [];
          })
          .filter(proj => proj.type === 'MODEL'),
      );

      // 3. models global = accessible by everyone
      const projectsGlobal = Object.values(state.projects.projects).flatMap(proj => {
        return entityIs(proj, 'Project') && proj.type === 'MODEL' && proj.globalProject === true
          ? [proj]
          : [];
      });

      return {
        projects: [...new Set([...projectsIM, ...projectsMine, ...projectsGlobal])].flatMap(p => {
          return p;
        }),
        status: 'READY',
      };
    },

    shallowEqual,
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// copy param
////////////////////////////////////////////////////////////////////////////////////////////////////

export interface CopyParamAndStatus {
  copyParam: CopyParam | null;
  status: AvailabilityStatus;
}

function useCopyParam(projectId: number): CopyParamAndStatus {
  return useAppSelector(state => {
    const copyParamOrStatus = state.projects.copyParams[projectId];

    if (entityIs(copyParamOrStatus, 'CopyParam')) {
      // copyparam is known
      return {
        copyParam: copyParamOrStatus,
        status: 'READY',
      };
    } else {
      return {
        copyParam: null,
        status: copyParamOrStatus || 'NOT_INITIALIZED',
      };
    }
  }, shallowEqual);
}

export function useAndLoadCopyParam(projectId: number): CopyParamAndStatus {
  const dispatch = useAppDispatch();

  const { copyParam, status } = useCopyParam(projectId);

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getCopyParam(projectId));
    }
  }, [dispatch, projectId, status]);

  return { copyParam, status };
}
