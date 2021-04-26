/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { faTimes, faCheck, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import IconButton from './IconButton';

export function Destroyer({ onDelete }: { onDelete: () => void }): JSX.Element {
  const [waitDeleteConfirm, setConfirm] = React.useState(false);

  return (
    <div>
      {waitDeleteConfirm ? (
        <div>
          <IconButton title="destroy" icon={faTrashAlt} />:
          <IconButton title="cancel" icon={faTimes} onClick={() => setConfirm(false)} />
          <IconButton title="confirm destroy" icon={faCheck} onClick={() => onDelete()} />
        </div>
      ) : (
        <div>
          <IconButton title="destroy" icon={faTrashAlt} onClick={() => setConfirm(true)} />
        </div>
      )}
    </div>
  );
}
