/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice } from '@reduxjs/toolkit';
import { TeamRole } from 'colab-rest-client';
import * as API from '../../API/api';
import { mapById } from '../../helper';
import { processMessage } from '../../ws/wsThunkActions';
import { AvailabilityStatus, FetchingStatus } from '../store';

/** what we have in the store */
export interface TeamRoleState {
  /** all the roles we got so far, by id */
  roles: Record<number, FetchingStatus | TeamRole>;

  /** did we load all the roles of the current project */
  statusForCurrentProject: AvailabilityStatus;
}

const initialState: TeamRoleState = {
  roles: {},

  statusForCurrentProject: 'NOT_INITIALIZED',
};

const teamRoleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.roles.updated.forEach(role => {
          if (role.id != null) {
            state.roles[role.id] = role;
          }
        });

        action.payload.roles.deleted.forEach(entry => {
          if (entry.id != null) {
            delete state.roles[entry.id];
          }
        });
      })

      .addCase(API.getTeamRolesForProject.pending, state => {
        state.statusForCurrentProject = 'LOADING';
      })
      .addCase(API.getTeamRolesForProject.fulfilled, (state, action) => {
        if (action.payload) {
          state.roles = { ...state.roles, ...mapById(action.payload) };
          state.statusForCurrentProject = 'READY';
        } else {
          state.statusForCurrentProject = 'ERROR';
        }
      })
      .addCase(API.getTeamRolesForProject.rejected, state => {
        state.statusForCurrentProject = 'ERROR';
      })

      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default teamRoleSlice.reducer;
