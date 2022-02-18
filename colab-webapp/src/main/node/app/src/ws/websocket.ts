/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs, WsChannelUpdate, WsSessionIdentifier, WsUpdateMessage } from 'colab-rest-client';
import { getApplicationPath, initSocketId } from '../API/api';
import { checkUnreachable } from '../helper';
import { getLogger } from '../logger';
import * as AdminActions from '../store/admin';
import { addNotification } from '../store/notification';
import { dispatch } from '../store/store';
import { processMessage } from './wsThunkActions';

const logger = getLogger('WebSockets');
logger.setLevel(3);

//export function send(channel: string, payload: {}) {
//  connection.send(JSON.stringify({
//    channel,
//    payload
//  }));
//}

const path = getApplicationPath();

interface MappedMessages {
  WsChannelUpdate: WsChannelUpdate[];
  WsSessionIdentifier: WsSessionIdentifier[];
  WsUpdateMessage: WsUpdateMessage[];
}

function createConnection(onCloseCb: () => void) {
  logger.info('Init Websocket Connection');
  const protocol = window.location.protocol.startsWith('https') ? 'wss' : 'ws';
  const wsPath = `${path}/ws`;
  const connection = new WebSocket(`${protocol}:///${window.location.host}${wsPath}`);
  logger.info('Init Ws Done');

  connection.onclose = () => {
    // reset by peer => reconnect please
    logger.info('WS reset by peer');
    onCloseCb();
  };

  connection.onmessage = messageEvent => {
    const parsed = JSON.parse(messageEvent.data);

    const messages = Array.isArray(parsed) ? parsed : [parsed];

    const sorted = messages.reduce<MappedMessages>(
      (acc, message) => {
        if (entityIs(message, 'WsMessage')) {
          if (entityIs(message, 'WsSessionIdentifier')) {
            acc.WsSessionIdentifier.push(message);
          } else if (entityIs(message, 'WsUpdateMessage')) {
            acc.WsUpdateMessage.push(message);
          } else if (entityIs(message, 'WsChannelUpdate')) {
            acc.WsChannelUpdate.push(message);
          } else {
            //If next line is erroneous, it means a type of WsMessage is not handled
            checkUnreachable(message);
          }
        } else {
          dispatch(
            addNotification({
              status: 'OPEN',
              type: 'ERROR',
              message: `Unhandled message type: ${message['@class']}`,
            }),
          );
        }

        return acc;
      },
      {
        WsChannelUpdate: [],
        WsSessionIdentifier: [],
        WsUpdateMessage: [],
      },
    );

    if (sorted.WsChannelUpdate.length > 0) {
      dispatch(AdminActions.channelUpdate(sorted.WsChannelUpdate));
    }

    if (sorted.WsUpdateMessage.length > 0) {
      dispatch(processMessage(sorted.WsUpdateMessage));
    }

    if (sorted.WsSessionIdentifier.length > 0) {
      if (sorted.WsSessionIdentifier.length === 1) {
        dispatch(initSocketId(sorted.WsSessionIdentifier[0]!));
      } else {
        dispatch(
          addNotification({
            status: 'OPEN',
            type: 'ERROR',
            message: 'Multiple Session Identifier',
          }),
        );
      }
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
