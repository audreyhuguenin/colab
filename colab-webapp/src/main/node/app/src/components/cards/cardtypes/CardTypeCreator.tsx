/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import { useCardTypeTags } from '../../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import Form, { createSelectField, Field } from '../../common/Form/Form';
import OpenCloseModal from '../../common/OpenCloseModal';
import { buttonStyle, marginAroundStyle, space_M } from '../../styling/style';

export interface Props {
  global?: boolean;
  afterCreation?: (id: number) => void;
}

interface NewType {
  title: string;
  purpose: string;
  tags: string[];
}

export default function ({ afterCreation, global = false }: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const { project } = useProjectBeingEdited();

  const createTypeCb = React.useCallback(
    (typeToCreate: NewType) => {
      dispatch(
        API.createCardType({
          projectId: project && !global ? project.id! : null,
          title: typeToCreate.title,
          tags: typeToCreate.tags,
          purpose: {
            '@class': 'TextDataBlock',
            mimeType: 'text/markdown',
            textData: typeToCreate.purpose,
            revision: '0',
          },
        }),
      ).then(action => {
        if (action.meta.requestStatus === 'fulfilled') {
          if (afterCreation != null) {
            if (entityIs(action.payload, 'CardType')) {
              afterCreation(action.payload.id!);
            }
          }
        }
      });
    },
    [dispatch, afterCreation, global, project],
  );

  const allTags = useCardTypeTags();
  const fields: Field<NewType>[] = [
    {
      key: 'title',
      type: 'text',
      label: 'title',
      placeholder: 'title',
      isMandatory: true,
      errorMessage: 'Must have a title',
      isErroneous: e => e.title === null || e.title === '',
    },
    {
      key: 'purpose',
      type: 'text',
      label: 'purpose',
      placeholder: 'purpose',
      isMandatory: true,
      errorMessage: 'Must have a purpose',
      isErroneous: e => e.purpose === null || e.purpose === '',
    },
    createSelectField({
      key: 'tags',
      type: 'select',
      label: 'category',
      isMulti: true,
      options: allTags.map(c => ({ label: c, value: c })),
      canCreateOption: true,
      placeholder: 'category',
      isMandatory: true,
      errorMessage: 'Must have at least one tag',
      isErroneous: e => e.tags.length === 0 || e.tags === null,
    }),
  ];

  if (project == null && !global) {
    //TODO: global types
    return <i>No project</i>;
  }
  return (
    <OpenCloseModal
      title={'Create new type'}
      collapsedChildren={
        <>
          <FontAwesomeIcon icon={faPlus} /> Create new type
        </>
      }
      className={cx(buttonStyle, css({ marginBottom: space_M }))}
      showCloseButton
    >
      {close => {
        return (
          <div>
            <Form
              fields={fields}
              value={{ title: '', purpose: '', tags: [] }}
              autoSubmit={false}
              onSubmit={function (type) {
                createTypeCb(type);
                close();
              }}
              className={marginAroundStyle([3], space_M)}
              buttonClassName={cx(buttonStyle, marginAroundStyle([1], space_M))}
            />
          </div>
        );
      }}
    </OpenCloseModal>
  );
}
