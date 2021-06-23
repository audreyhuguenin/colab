/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { WsChannelUpdate, entityIs } from 'colab-rest-client';
import { dispatch } from '../store/store';
import * as AdminActions from '../store/admin';
import * as ErrorActions from '../store/error';
import { initSocketId } from '../API/api';
import logger from '../logger';
import { checkUnreachable } from '../helper';
import { processMessage } from './wsThunkActions';

const onChannelUpdate = (message: WsChannelUpdate) => {
  dispatch(AdminActions.channelUpdate(message));
};

//export function send(channel: string, payload: {}) {
//  connection.send(JSON.stringify({
//    channel,
//    payload
//  }));
//}

function createConnection(onCloseCb: () => void) {
  logger.info('Init Websocket Connection');
  const protocol = window.location.protocol.startsWith('https') ? 'wss' : 'ws';
  const connection = new WebSocket(`${protocol}:///${window.location.host}/ws`);
  logger.info('Init Ws Done');

  connection.onclose = () => {
    // reset by peer => reconnect please
    logger.info('WS reset by peer');
    onCloseCb();
  };

  connection.onmessage = messageEvent => {
    const message = JSON.parse(messageEvent.data);
    if (entityIs(message, 'WsMessage')) {
      if (entityIs(message, 'WsSessionIdentifier')) {
        dispatch(initSocketId(message));
      } else if (entityIs(message, 'WsUpdateMessage')) {
        dispatch(processMessage(message));
      } else if (entityIs(message, 'WsChannelUpdate')) {
        onChannelUpdate(message);
      } else {
        //If next line is erroneous, it means a type of WsMessage is not handled
        checkUnreachable(message);
      }
    } else {
      dispatch(
        ErrorActions.addError({
          status: 'OPEN',
          error: `Unhandled message type: ${message['@class']}`,
        }),
      );
    }
  };
}

/**
 * Init websocket connection
 */
export function init(): void {
  // re-init connection to server if the current connection closed
  // it occurs when server is restarting
  const reinit = () => {
    dispatch(initSocketId(null));
    setTimeout(() => {
      createConnection(reinit);
    }, 500);
  };

  return createConnection(reinit);
}
