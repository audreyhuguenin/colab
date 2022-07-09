/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faFile, faGamepad, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { ConfirmIconButton } from '../common/ConfirmIconButton';
import Flex from '../common/Flex';
import Form from '../common/Form/Form';
import Input from '../common/Form/Input';
import {
  invertedButtonStyle,
  lightIconButtonStyle,
  space_L,
  space_M,
  space_S,
  textSmall,
} from '../styling/style';
import { ProjectCreationData } from './ProjectCreator';

interface ProjectDataInitializationProps {
  data: ProjectCreationData;
  readOnly?: boolean;
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  addGuest: (emailAddress: string) => void;
  removeGuest: (emailAddress: string) => void;
}

export default function ProjectDataInitialization({
  data,
  readOnly,
  setName,
  setDescription,
  addGuest,
  removeGuest,
}: ProjectDataInitializationProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <Flex className={css({ alignSelf: 'stretch' })}>
      <Flex
        direction="column"
        align="stretch"
        className={css({ width: '50%', minWidth: '50%', marginRight: space_L })}
      >
        <Input
          label="Name"
          value={data.name}
          readonly={readOnly}
          onChange={name => setName(name)}
        />
        <Input
          label="Description"
          inputType="textarea"
          value={data.description}
          readonly={readOnly}
          onChange={description => {
            setDescription(description);
          }}
        />
        <Form
          fields={[
            {
              key: 'email',
              type: 'text',
              label: 'Invite members',
              isMandatory: false,
              readonly: readOnly,
              placeholder: 'email',
              isErroneous: value => value.email.length > 0 && value.email.match('.+@.+') == null,
              errorMessage: i18n.authentication.error.emailAddressNotValid,
            },
          ]}
          value={{ email: '' }}
          onSubmit={fields => {
            if (!readOnly) {
              addGuest(fields.email);
              fields.email = '';
            }
          }}
          submitLabel={i18n.common.add}
          className={css({ flexDirection: 'row', alignItems: 'flex-end' })}
          buttonClassName={cx(css({ alignSelf: 'flex-end', margin: space_S }), invertedButtonStyle)}
        />

        <Flex direction="column">
          {data.guests.map(guest => (
            <Flex align="center" key={guest} className={css({ marginTop: space_S })}>
              <Flex className={textSmall}>{guest}</Flex>
              {!readOnly && (
                <ConfirmIconButton
                  icon={faTrash}
                  title="Remove guest"
                  onConfirm={() => removeGuest(guest)}
                  className={lightIconButtonStyle}
                />
              )}
            </Flex>
          ))}
        </Flex>
      </Flex>
      <Flex direction="column" className={css({ width: '50%' })}>
        <Flex
          align="center"
          justify="center"
          className={css({
            backgroundColor: 'var(--secondaryColor)',
            minWidth: '100%',
            minHeight: '70px',
            marginBottom: space_M,
          })}
        >
          {/* TODO <FontAwesomeIcon icon={isEmptyProject ? faFile : data.projectModel?.icon || faGamepad} /> */}
          <FontAwesomeIcon color="white" icon={!data.projectModel ? faFile : faGamepad} size="3x" />
        </Flex>
        <h2>
          {data.projectModel
            ? data.projectModel.name
              ? data.projectModel.name
              : 'New project'
            : 'Empty project'}
        </h2>
        <Flex className={textSmall}>
          {data.projectModel
            ? data.projectModel.description
              ? data.projectModel.description
              : 'No description'
            : "Use this empty project and you'll be free to create a whole new world"}
        </Flex>
      </Flex>
    </Flex>
  );
}
