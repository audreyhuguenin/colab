/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { AbstractResource, entityIs, Resource, ResourceRef } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useDocument } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import { BlockEditorWrapper } from '../blocks/BlockEditorWrapper';
import CheckBox from '../common/CheckBox';
import OnBlurInput from '../common/OnBlurInput';
import DocumentMiniDisplay from '../documents/DocumentMiniDisplay';
import { defaultColumnContainerStyle, defaultRowContainerStyle } from '../styling/style';
import { ResourceAndRef } from './ResourceCommonType';

function DisplayOwner({ resourceOrRef }: { resourceOrRef: AbstractResource }): JSX.Element {
  return (
    <>
      {resourceOrRef.abstractCardTypeId && (
        <span>abstract card type #{resourceOrRef.abstractCardTypeId}</span>
      )}
      {resourceOrRef.cardId && <span>card #{resourceOrRef.cardId}</span>}
      {resourceOrRef.cardContentId && <span>card content #{resourceOrRef.cardContentId}</span>}
    </>
  );
}

function TargetResourceMiniDisplay({ resource }: { resource: Resource }): JSX.Element {
  const dispatch = useAppDispatch();

  return (
    <div className={defaultColumnContainerStyle}>
      <span>*** target resource #{resource.id} ***</span>
      <DisplayOwner resourceOrRef={resource} />
      <OnBlurInput
        label="Category : "
        placeholder=""
        size="SMALL"
        value={resource.category || ''}
        onChange={newValue => dispatch(API.updateResource({ ...resource, category: newValue }))}
      />
      <CheckBox
        label="Published"
        value={resource.published}
        onChange={() =>
          dispatch(
            API.updateResource({
              ...resource,
              published: !resource.published,
            }),
          )
        }
      />
      <CheckBox
        label="Deprecated"
        value={resource.deprecated}
        onChange={() =>
          dispatch(
            API.updateResource({
              ...resource,
              deprecated: !resource.deprecated,
            }),
          )
        }
      />
      <CheckBox
        label="Requesting for glory"
        value={resource.requestingForGlory}
        onChange={() =>
          dispatch(
            API.updateResource({
              ...resource,
              requestingForGlory: !resource.requestingForGlory,
            }),
          )
        }
      />
    </div>
  );
}

function ResourceRefMiniDisplay({ resourceRef }: { resourceRef: ResourceRef }): JSX.Element {
  const dispatch = useAppDispatch();

  return (
    <div className={defaultColumnContainerStyle}>
      <span>*** reference #{resourceRef.id} ***</span>
      <DisplayOwner resourceOrRef={resourceRef} />
      <OnBlurInput
        label="Category : "
        placeholder=""
        size="SMALL"
        value={resourceRef.category || ''}
        onChange={newValue =>
          dispatch(API.updateResourceRef({ ...resourceRef, category: newValue }))
        }
      />
      <CheckBox
        label="Refused"
        value={resourceRef.refused}
        onChange={() =>
          dispatch(
            API.updateResourceRef({
              ...resourceRef,
              refused: !resourceRef.refused,
            }),
          )
        }
      />
    </div>
  );
}

export type ResourceMiniDisplayProps = ResourceAndRef;

export default function ResourceMiniDisplay({
  targetResource,
  isDirectResource,
  cardTypeResourceRef,
  cardResourceRef,
  cardContentResourceRef,
}: ResourceMiniDisplayProps): JSX.Element {
  const dispatch = useAppDispatch();

  const docId = targetResource.documentId;
  const document = useDocument(docId);

  // TODO see how the category is resolved
  let effectiveCategory = targetResource.category;
  if (cardContentResourceRef?.category != null) {
    effectiveCategory = cardContentResourceRef.category;
  } else if (cardResourceRef?.category != null) {
    effectiveCategory = cardResourceRef.category;
  } else if (cardTypeResourceRef?.category != null) {
    effectiveCategory = cardTypeResourceRef.category;
  }

  React.useEffect(() => {
    if (docId != null && document == null) {
      dispatch(API.getDocument(docId));
    }
  }, [docId, document, dispatch]);

  return (
    <div className={defaultRowContainerStyle}>
      <div className={defaultColumnContainerStyle}>
        {isDirectResource ? (
          <span className={css({ color: 'blue' })}>direct resource</span>
        ) : (
          'transitive resource'
        )}
        <span>Title : {targetResource.title}</span>
        {targetResource.teaserId && <BlockEditorWrapper blockId={targetResource.teaserId} />}
        <span> Category : {effectiveCategory}</span>
        {entityIs(document, 'Document') && (
          <>
            <span>*** Document #{document.id} ***</span>
            <DocumentMiniDisplay document={document} />
          </>
        )}
      </div>
      <TargetResourceMiniDisplay resource={targetResource} />
      {cardTypeResourceRef && <ResourceRefMiniDisplay resourceRef={cardTypeResourceRef} />}
      {cardResourceRef && <ResourceRefMiniDisplay resourceRef={cardResourceRef} />}
      {cardContentResourceRef && <ResourceRefMiniDisplay resourceRef={cardContentResourceRef} />}
    </div>
  );
}

export function ResourceSettings({
  targetResource,
  isDirectResource,
  cardTypeResourceRef,
  cardResourceRef,
  cardContentResourceRef,
}: ResourceAndRef): JSX.Element {
  const dispatch = useAppDispatch();

  // TODO see how the category is resolved
  const effectiveCategory =
    (cardResourceRef || cardContentResourceRef || cardTypeResourceRef)?.category ||
    targetResource.category;

  return (
    <div className={defaultRowContainerStyle}>
      <div className={defaultColumnContainerStyle}>
        {isDirectResource ? (
          <>
            <div className={css({ color: 'blue' })}>direct resource</div>
            <OnBlurInput
              label="Title : "
              placeholder=""
              size="SMALL"
              value={targetResource.title || ''}
              onChange={newValue =>
                dispatch(API.updateResource({ ...targetResource, title: newValue }))
              }
            />
          </>
        ) : (
          <>
            <div>'transitive resource'</div>
            <div>Title : {targetResource.title}</div>
          </>
        )}
        {targetResource.teaserId && (
          <BlockEditorWrapper blockId={targetResource.teaserId} allowEdition={isDirectResource} />
        )}
        <span> Category : {effectiveCategory}</span>
      </div>
      {isDirectResource ? (
        <TargetResourceMiniDisplay resource={targetResource} />
      ) : cardTypeResourceRef ? (
        <ResourceRefMiniDisplay resourceRef={cardTypeResourceRef} />
      ) : cardResourceRef ? (
        <ResourceRefMiniDisplay resourceRef={cardResourceRef} />
      ) : cardContentResourceRef ? (
        <ResourceRefMiniDisplay resourceRef={cardContentResourceRef} />
      ) : null}
    </div>
  );
}
