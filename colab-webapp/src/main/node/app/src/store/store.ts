/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';
import aclReducer from './slice/aclSlice';
import activityFlowLinkReducer from './slice/activityflowlinkSlice';
import adminReducer from './slice/adminSlice';
import authReducer from './slice/authSlice';
import cardReducer from './slice/cardSlice';
import cardTypeReducer from './slice/cardTypeSlice';
import changeReducer from './slice/changeSlice';
import configReducer from './slice/configurationSlice';
import documentReducer from './slice/documentSlice';
import externalDataReducer from './slice/externalDataSlice';
import notifReducer from './slice/notificationSlice';
import presenceReducer from './slice/presenceSlice';
import projectReducer from './slice/projectSlice';
import resourceReducer from './slice/resourceSlice';
import stickyNoteLinkReducer from './slice/stickynotelinkSlice';
import userReducer from './slice/userSlice';
import websocketReducer from './slice/websocketSlice';

const rootReducer = combineReducers({
  acl: aclReducer,
  activityFlowLinks: activityFlowLinkReducer,
  auth: authReducer,
  admin: adminReducer,
  cards: cardReducer,
  cardType: cardTypeReducer,
  config: configReducer,
  change: changeReducer,
  document: documentReducer,
  externalData: externalDataReducer,
  notifications: notifReducer,
  presences: presenceReducer,
  projects: projectReducer,
  resources: resourceReducer,
  stickynotelinks: stickyNoteLinkReducer,
  users: userReducer,
  websockets: websocketReducer,
});

//const storeX = createStore(rootReducer, applyMiddleware(thunk));
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(thunk),
});

export const getStore = (): typeof store => store;

export const dispatch = store.dispatch;

export type ColabState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type LoadingStatus = 'NOT_INITIALIZED' | 'LOADING' | 'READY';

export type AvailabilityStatus = 'NOT_INITIALIZED' | 'LOADING' | 'READY' | 'ERROR';

export type InlineAvailabilityStatus<T> = 'NOT_INITIALIZED' | 'LOADING' | 'ERROR' | T;
