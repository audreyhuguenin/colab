/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import InlineLoading from '../common/InlineLoading';
import LiveEditor, { EditState } from '../live/LiveEditor';
import { useBlock } from '../live/LiveTextEditor';

export interface BlockEditorProps {
  blockId: number;
  allowEdition?: boolean;
  editingStatus?: EditState;
  showTree?: boolean;
  markDownEditor?: boolean;
  className?: string;
  setEditingState?: React.Dispatch<React.SetStateAction<EditState>>;
}

export function BlockEditorWrapper({
  blockId,
  allowEdition,
  editingStatus,
  showTree,
  markDownEditor,
  className,
  setEditingState,
}: BlockEditorProps): JSX.Element {
  const block = useBlock(blockId);
  if (block == null) {
    return <InlineLoading />;
  } else {
    if (entityIs(block, 'TextDataBlock')) {
      switch (block.mimeType) {
        case 'text/markdown':
          return (
            <LiveEditor
              allowEdition={allowEdition}
              atClass={block['@class']}
              atId={blockId}
              value={block.textData || ''}
              revision={block.revision}
              editingStatus={editingStatus || 'VIEW'}
              showTree={showTree}
              markDownEditor={markDownEditor}
              className={className}
              setEditingState={setEditingState}
            />
          );
        default:
          return <span>unkwnon MIME type: {block.mimeType}</span>;
      }
    } else {
      return (
        <div>
          <i>Unknown document</i>
        </div>
      );
    }
  }
}
