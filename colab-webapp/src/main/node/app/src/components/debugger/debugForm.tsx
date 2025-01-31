/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import Button from '../common/element/Button';
import Form from '../common/element/Form';
import Flex from '../common/layout/Flex';
import { space_lg, text_sm } from '../styling/style';

export default function DebugForm(): JSX.Element {
  const [mandatory, setMandatory] = React.useState<boolean>(false);
  const [readOnly, setReadOnly] = React.useState<boolean>(false);
  const [allInvalid, setAllInvalid] = React.useState<boolean>(false);
  const [showStrengthBar, setShowStrengthBar] = React.useState<boolean>(true);
  const [multiSelect, setMultiSelect] = React.useState<boolean>(true);
  const [canCreate, setCanCreate] = React.useState<boolean>(true);

  return (
    <Flex direction="row">
      <Form
        fields={[
          {
            key: 'name',
            label: 'name',
            placeholder: 'georges',
            type: 'text',
            isMandatory: mandatory,
            readOnly: readOnly,
            tip: 'a wonderful advice about the name',
            footer: 'and if I would like to add something about the name',
            isErroneous: _value => allInvalid,
            errorMessage: value => value.name + ' not top',
          },
          {
            key: 'explanation',
            label: 'explanation',
            placeholder: 'explain what you need',
            type: 'textarea',
            isMandatory: mandatory,
            readOnly: readOnly,
            tip: 'a wonderful advice about the explanation',
            footer: 'and if I would like to add something about the explanation',
            isErroneous: _value => allInvalid,
            errorMessage: value => value.explanation + ' not top',
          },
          {
            key: 'password',
            label: 'password',
            placeholder: 'something impossible to guess',
            type: 'password',
            isMandatory: mandatory,
            readOnly: readOnly,
            tip: 'a wonderful advice about the password',
            footer: 'and if I would like to add something about the password',
            isErroneous: _value => allInvalid,
            errorMessage: value =>
              value.password + ' with score of ' + value.passwordScore.score + ' not top',
            showStrengthBar: showStrengthBar,
            strengthProp: 'passwordScore',
          },
          {
            key: 'toggle',
            label: 'a toggle',
            type: 'boolean',
            showAs: 'toggle',
            isMandatory: mandatory,
            readOnly: readOnly,
            tip: 'a wonderful advice about the toggle',
            footer: 'and if I would like to add something about the toggle',
            isErroneous: _value => allInvalid,
            errorMessage: value => value.toggle + ' not top',
          },
          {
            key: 'checkbox',
            label: 'a checkbox',
            type: 'boolean',
            showAs: 'checkbox',
            isMandatory: mandatory,
            readOnly: readOnly,
            tip: 'a wonderful advice about the checkbox',
            footer: 'and if I would like to add something about the checkbox',
            isErroneous: _value => allInvalid,
            errorMessage: value => value.checkbox + ' not top',
          },
          {
            key: 'choice',
            label: 'a choice',
            type: 'select',
            isMandatory: mandatory,
            readOnly: readOnly,
            isMulti: multiSelect,
            canCreateOption: canCreate,
            options: [
              {
                label: 'a) answer',
                value: 'A',
              },
              {
                label: 'b) answer',
                value: 'B',
              },
              {
                label: 'c) answer',
                value: 'C',
              },
            ],
            tip: 'a wonderful advice about choice',
            footer: 'and if I would like to add something about choice',
            isErroneous: _value => allInvalid,
            errorMessage: value => value.choice + ' not top',
          },
          {
            key: 'rate',
            label: 'a rate',
            type: 'selectnumber',
            isMandatory: mandatory,
            readOnly: readOnly,
            options: [
              { label: 'weak', value: 1 },
              { label: 'okay', value: 2 },
              { label: 'top', value: 3 },
            ],
            tip: 'a wonderful advice about rate',
            footer: 'and if I would like to add something about rate',
            isErroneous: _value => allInvalid,
            errorMessage: value => value.rate + ' not top',
          },
        ]}
        value={{
          name: '',
          explanation: '',
          password: '',
          passwordScore: {
            score: 0,
            feedback: { warning: '', suggestions: [''] },
          },
          toggle: false,
          checkbox: false,
          choice: '',
          rate: '',
        }}
        onSubmit={_fields => {
          // eslint-disable-next-line no-alert
          alert('yo');
        }}
        submitLabel="Go"
        childrenClassName={css({ backgroundColor: 'var(--divider-main)' })}
      >
        <span>something to add after submit button</span>
      </Form>
      <Flex direction="column" className={css({ padding: space_lg })}>
        <h4>each field</h4>
        <Button
          title="mandatory"
          onClick={() => {
            setMandatory(!mandatory);
          }}
          className={cx(text_sm, css({ margin: '5px' }))}
        >
          mandatory = {mandatory ? 'true' : 'false'}
        </Button>
        <Button
          title="readOnly"
          onClick={() => {
            setReadOnly(!readOnly);
          }}
          className={cx(text_sm, css({ margin: '5px' }))}
        >
          readOnly = {readOnly ? 'true' : 'false'}
        </Button>
        <Button
          title="allInvalid"
          onClick={() => {
            setAllInvalid(!allInvalid);
          }}
          className={cx(text_sm, css({ margin: '5px' }))}
        >
          allInvalid = {allInvalid ? 'true' : 'false'}
        </Button>
        <h4>Password</h4>
        <Button
          title="showStrengthBar"
          onClick={() => {
            setShowStrengthBar(!showStrengthBar);
          }}
          className={cx(text_sm, css({ margin: '5px' }))}
        >
          showStrengthBar = {showStrengthBar ? 'true' : 'false'}
        </Button>
        <h4>Select</h4>
        <Button
          title="multiSelect"
          onClick={() => {
            setMultiSelect(!multiSelect);
          }}
          className={cx(text_sm, css({ margin: '5px' }))}
        >
          multiSelect = {multiSelect ? 'true' : 'false'}
        </Button>
        <Button
          title="canCreate"
          onClick={() => {
            setCanCreate(!canCreate);
          }}
          className={cx(text_sm, css({ margin: '5px' }))}
        >
          canCreate = {canCreate ? 'true' : 'false'}
        </Button>
      </Flex>
    </Flex>
  );
}
