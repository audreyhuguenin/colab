/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faArrowDown,
  faArrowUp,
  faCheck,
  faEllipsisV,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Document, entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { BlockEditorWrapper } from '../blocks/BlockEditorWrapper';
import Button from '../common/Button';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import DropDownMenu from '../common/DropDownMenu';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import { EditState } from '../live/LiveEditor';
import {
  editableBlockStyle,
  invertedButtonStyle,
  lightIconButtonStyle,
  space_S,
} from '../styling/style';
import { DocumentFileEditor } from './DocumentFileEditor';
import { ExternalLinkEditor } from './ExternalLinkEditor';

const editingStyle = css({
  backgroundColor: 'var(--hoverBgColor)',
  border: '1px solid transparent',
});

const moveBoxStyle = css({
  '&:hover #moveBox': {
    opacity: 1,
    transition: 'opacity .8s ease',
  },
});

export interface DocumentEditorDisplayProps {
  document: Document;
  allowEdition?: boolean;
}

export function DocumentEditorDisplay({
  document,
  allowEdition = true,
}: DocumentEditorDisplayProps): JSX.Element {
  const dispatch = useAppDispatch();
  const isTextDataBlock = entityIs(document, 'TextDataBlock');
  const isDocumentFile = entityIs(document, 'DocumentFile');
  const isExternalLink = entityIs(document, 'ExternalLink');
  const [state, setState] = React.useState<EditState>('VIEW');
  const [showTree, setShowTree] = React.useState(false);

  return (
    <Flex className={moveBoxStyle}>
      <div
        className={cx(
          css({
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexGrow: 1,
          }),
          editableBlockStyle,
          { [editingStyle]: state === 'EDIT' },
        )}
        title="Double click to edit"
        onDoubleClick={() => {
          if (state === 'VIEW') {
            setState('EDIT');
          }
        }}
      >
        {isTextDataBlock ? (
          <BlockEditorWrapper
            blockId={document.id!}
            allowEdition={allowEdition}
            editingStatus={state}
            showTree={showTree}
            className={css({ flexGrow: 1 })}
          />
        ) : isDocumentFile ? (
          <DocumentFileEditor document={document} allowEdition={allowEdition} />
        ) : isExternalLink ? (
          <ExternalLinkEditor document={document} allowEdition={allowEdition} />
        ) : (
          <div>
            <i>Unknown document</i>
          </div>
        )}
        <Flex direction="column" align="flex-end" justify="space-between">
          <DropDownMenu
            icon={faEllipsisV}
            valueComp={{ value: '', label: '' }}
            buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
            entries={[
              {
                value: 'Delete',
                label: (
                  <ConfirmDeleteModal
                    buttonLabel={
                      <>
                        <FontAwesomeIcon icon={faTrash} />
                        Delete
                      </>
                    }
                    message={
                      <p>
                        Are you <strong>sure</strong> you want to delete this data? This will be
                        lost forever.
                      </p>
                    }
                    onConfirm={() => {
                      if (document.id) {
                        if (document.owningCardContentId != null) {
                          dispatch(
                            API.removeDeliverable({
                              cardContentId: document.owningCardContentId,
                              documentId: document.id,
                            }),
                          );
                        } else if (document.owningResourceId != null) {
                          dispatch(
                            API.removeDocumentOfResource({
                              resourceId: document.owningResourceId,
                              documentId: document.id,
                            }),
                          );
                        }
                      }
                    }}
                    confirmButtonLabel={'Delete data'}
                  />
                ),
              },
              ...(isTextDataBlock && state === 'EDIT'
                ? [
                    {
                      value: 'showTree',
                      label: (
                        <>
                          {showTree && (
                            <FontAwesomeIcon icon={faCheck} size="xs" color="var(--lightGray)" />
                          )}{' '}
                          Show tree
                        </>
                      ),
                      action: () => setShowTree(showTree => !showTree),
                    },
                  ]
                : []),
            ]}
            onSelect={val => {
              val.action && val.action();
            }}
          />
          {state === 'EDIT' && (
            <Button
              className={cx(invertedButtonStyle, css({marginBottom: space_S}))}
              onClick={() => {
                setState('VIEW');
              }}
            >
              Ok
            </Button>
          )}
        </Flex>
      </div>
      <Flex direction="column" className={css({ paddingLeft: space_S, opacity: 0 })} id="moveBox">
        <IconButton
          icon={faArrowUp}
          title="Move block up"
          iconSize="xs"
          className={lightIconButtonStyle}
        />
        <IconButton
          icon={faArrowDown}
          title="Move block down"
          iconSize="xs"
          className={lightIconButtonStyle}
        />
      </Flex>
    </Flex>
  );
}
