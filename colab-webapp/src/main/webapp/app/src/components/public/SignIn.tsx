/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import { css } from '@emotion/css';

import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import FormContainer from '../common/FormContainer';
import { buttonStyle } from '../styling/style';
import { signInWithLocalAccount } from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { InlineLink } from '../common/Link';
import IconButton from '../common/IconButton';
import { buildLinkWithQueryParam } from '../../helper';
import { useHistory } from 'react-router-dom';

interface Props {
  redirectTo: string | null;
}

export default function SignInForm(props: Props): JSX.Element {
  const dispatch = useAppDispatch();

  const history = useHistory();

  const [credentials, setCredentials] = React.useState({
    identifier: '',
    password: '',
  });

  return (
    <FormContainer>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <label>
          username or email address
          <input
            type="text"
            onChange={e => setCredentials({ ...credentials, identifier: e.target.value })}
          />
        </label>
        <label>
          password
          <input
            type="password"
            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
          />
        </label>
      </div>

      <IconButton
        className={buttonStyle}
        icon={faSignInAlt}
        onClick={() => {
          dispatch(signInWithLocalAccount(credentials)).then(action => {
            // is that a hack or not ???
            if (props.redirectTo && action.meta.requestStatus === 'fulfilled') {
              history.push(props.redirectTo);
            }
          });
        }}
      >
        Sign in
      </IconButton>
      <span> </span>
      <InlineLink to={buildLinkWithQueryParam('/SignUp', { redirectTo: props.redirectTo })}>
        create an account
      </InlineLink>
      <span> </span>
      <InlineLink to={buildLinkWithQueryParam('/ForgotPassword', { redirectTo: props.redirectTo })}>
        forgot your passowrd?
      </InlineLink>
    </FormContainer>
  );
}
