/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { User } from 'colab-rest-client';
import * as React from 'react';
import { updateUser } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import Form, { Field } from '../common/element/Form';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const fields: Field<User>[] = [
    {
      key: 'username',
      label: i18n.user.model.username,
      type: 'text',
      isMandatory: false,
      readOnly: true,
    },
    {
      key: 'commonname',
      label: i18n.user.model.commonName,
      type: 'text',
      isMandatory: false,
    },
    {
      key: 'firstname',
      label: i18n.user.model.firstname,
      type: 'text',
      isMandatory: false,
    },
    {
      key: 'lastname',
      label: i18n.user.model.lastname,
      type: 'text',
      isMandatory: false,
    },
    {
      key: 'affiliation',
      label: i18n.user.model.affiliation,
      type: 'text',
      isMandatory: false,
    },
  ];

  if (user) {
    return (
      <div>
        <h3>{i18n.user.userProfile}</h3>
        <div>
          <Form
            fields={fields}
            value={user}
            onSubmit={u => {
              startLoading();

              dispatch(updateUser(u)).then(stopLoading);
            }}
            submitLabel={i18n.common.save}
            isSubmitInProcess={isLoading}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <i>{i18n.user.noUserSelected}</i>
      </div>
    );
  }
}
