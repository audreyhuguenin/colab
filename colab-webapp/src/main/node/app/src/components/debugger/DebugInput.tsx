/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import logger from '../../logger';
import Button from '../common/element/Button';
import { BlockInput, InlineInput } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import { space_M, textSmall } from '../styling/style';

export default function DebugInput(): JSX.Element {
  const [mandatory, setMandatory] = React.useState<boolean>(false);
  const [readOnly, setReadOnly] = React.useState<boolean>(false);
  const [showTip, setShowTip] = React.useState<boolean>(false);
  const [showFooter, setShowFooter] = React.useState<boolean>(false);
  const [showWarning, setShowWarning] = React.useState<boolean>(false);
  const [showError, setShowError] = React.useState<boolean>(false);

  const [val11, setVal11] = React.useState<string>();
  const [val12, setVal12] = React.useState<string>();
  const [val13, setVal13] = React.useState<number>();
  const [val21, setVal21] = React.useState<string>();
  const [val22, setVal22] = React.useState<string>();
  const [val23, setVal23] = React.useState<number>();

  return (
    <Flex direction="column">
      <Flex direction="row">
        <Flex direction="column" className={css({ margin: space_M })}>
          <h2>flowing block input</h2>
          <BlockInput
            label="input text"
            value={val11}
            placeholder="i t"
            mandatory={mandatory}
            readOnly={readOnly}
            saveMode="FLOWING"
            onChange={newValue => {
              // eslint-disable-next-line no-alert
              //alert('changed');
              logger.info('changed');
              setVal11(newValue);
            }}
            tip={showTip && 'a wonderful advice'}
            footer={showFooter && 'and if I would like to add something'}
            warning={showWarning && 'ah a warning'}
            error={showError && 'oh an error'}
            // containerClassName={css({ border: '2px solid yellow' })}
            // labelClassName={css({ border: '2px solid orange' })}
            // inputDisplayClassName={css({ border: '2px solid red' })}
            // inputEditClassName={css({ border: '2px solid purple' })}
            // bottomClassName={css({ border: '2px solid blue' })}
            // footerClassName={css({ border: '2px solid green' })}
            // validationClassName={css({ border: '2px solid brown' })}
          />
          <BlockInput
            label="text area"
            value={val12}
            placeholder="t a"
            inputType="textarea"
            mandatory={mandatory}
            readOnly={readOnly}
            autoFocus
            //rows={5}
            saveMode="FLOWING"
            onChange={newValue => {
              // eslint-disable-next-line no-alert
              //alert('changed');
              logger.info('changed');
              setVal12(newValue);
            }}
            tip={showTip && 'a wonderful advice'}
            footer={showFooter && 'and if I would like to add something'}
            warning={showWarning && 'ah a warning'}
            error={showError && 'oh an error'}
          />
          <BlockInput
            label="input number"
            value={val13}
            placeholder="i n"
            type="number"
            mandatory={mandatory}
            readOnly={readOnly}
            min="0"
            max="5"
            saveMode="FLOWING"
            onChange={newValue => {
              // eslint-disable-next-line no-alert
              //alert('changed');
              logger.info('changed');
              setVal13(parseInt(newValue));
            }}
            tip={showTip && 'a wonderful advice'}
            footer={showFooter && 'and if I would like to add something'}
            warning={showWarning && 'ah a warning'}
            error={showError && 'oh an error'}
          />
          <h3>results</h3>
          <Flex>{val11}</Flex>
          <Flex>{val12}</Flex>
          <Flex>{val13}</Flex>
        </Flex>
        <Flex direction="column" className={css({ margin: space_M })}>
          <h2>on confirm block input</h2>
          <BlockInput
            value={val21}
            label="input text confirm"
            placeholder="i t c"
            mandatory={mandatory}
            readOnly={readOnly}
            saveMode="ON_CONFIRM"
            onChange={newValue => {
              // eslint-disable-next-line no-alert
              //alert('changed');
              logger.info('changed');
              setVal21(newValue);
            }}
            tip={showTip && 'a wonderful advice'}
            footer={showFooter && 'and if I would like to add something'}
            warning={showWarning && 'ah a warning'}
            error={showError && 'oh an error'}
          />
          <BlockInput
            value={val22}
            label="text area confirm"
            placeholder="t a c"
            inputType="textarea"
            mandatory={mandatory}
            readOnly={readOnly}
            saveMode="ON_CONFIRM"
            onChange={newValue => {
              // eslint-disable-next-line no-alert
              //alert('changed');
              logger.info('changed');
              setVal22(newValue);
            }}
            tip={showTip && 'a wonderful advice'}
            footer={showFooter && 'and if I would like to add something'}
            warning={showWarning && 'ah a warning'}
            error={showError && 'oh an error'}
          />
          <BlockInput
            label="input number"
            value={val23}
            placeholder="i n c"
            type="number"
            mandatory={mandatory}
            readOnly={readOnly}
            min="0"
            max="5"
            saveMode="ON_CONFIRM"
            onChange={newValue => {
              // eslint-disable-next-line no-alert
              //alert('changed');
              logger.info('changed');
              setVal23(parseInt(newValue));
            }}
            tip={showTip && 'a wonderful advice'}
            footer={showFooter && 'and if I would like to add something'}
            warning={showWarning && 'ah a warning'}
            error={showError && 'oh an error'}
          />
          <h3>results</h3>
          <Flex>{val21}</Flex>
          <Flex>{val22}</Flex>
          <Flex>{val23}</Flex>
        </Flex>
        <Flex direction="column" className={css({ margin: space_M })}>
          <h2>flowing inline input</h2>
          <InlineInput
            label="input text"
            value={val11}
            placeholder="i t"
            mandatory={mandatory}
            readOnly={readOnly}
            saveMode="FLOWING"
            onChange={newValue => {
              // eslint-disable-next-line no-alert
              //alert('changed');
              logger.info('changed');
              setVal11(newValue);
            }}
            tip={showTip && 'a wonderful advice'}
            footer={showFooter && 'and if I would like to add something'}
            warning={showWarning && 'ah a warning'}
            error={showError && 'oh an error'}
          />
          <InlineInput
            label="text area"
            value={val12}
            placeholder="t a"
            inputType="textarea"
            mandatory={mandatory}
            readOnly={readOnly}
            autoFocus
            //rows={5}
            saveMode="FLOWING"
            onChange={newValue => {
              // eslint-disable-next-line no-alert
              //alert('changed');
              logger.info('changed');
              setVal12(newValue);
            }}
            tip={showTip && 'a wonderful advice'}
            footer={showFooter && 'and if I would like to add something'}
            warning={showWarning && 'ah a warning'}
            error={showError && 'oh an error'}
          />
          <InlineInput
            label="input number"
            value={val13}
            placeholder="i n"
            type="number"
            mandatory={mandatory}
            readOnly={readOnly}
            min="0"
            max="5"
            saveMode="FLOWING"
            onChange={newValue => {
              // eslint-disable-next-line no-alert
              //alert('changed');
              logger.info('changed');
              setVal13(parseInt(newValue));
            }}
            tip={showTip && 'a wonderful advice'}
            footer={showFooter && 'and if I would like to add something'}
            warning={showWarning && 'ah a warning'}
            error={showError && 'oh an error'}
          />
          <h3>results</h3>
          <Flex>{val11}</Flex>
          <Flex>{val12}</Flex>
          <Flex>{val13}</Flex>
        </Flex>
        <Flex direction="column" className={css({ margin: space_M })}>
          <h2>on confirm inline input</h2>
          <InlineInput
            value={val21}
            label="input text confirm"
            placeholder="i t c"
            mandatory={mandatory}
            readOnly={readOnly}
            saveMode="ON_CONFIRM"
            onChange={newValue => {
              // eslint-disable-next-line no-alert
              //alert('changed');
              logger.info('changed');
              setVal21(newValue);
            }}
            tip={showTip && 'a wonderful advice'}
            footer={showFooter && 'and if I would like to add something'}
            warning={showWarning && 'ah a warning'}
            error={showError && 'oh an error'}
            // containerClassName={css({ border: '2px solid yellow' })}
            // labelClassName={css({ border: '2px solid orange' })}
            // inputDisplayClassName={css({ border: '2px solid red' })}
            // inputEditClassName={css({ border: '2px solid purple' })}
            // bottomClassName={css({ border: '2px solid blue' })}
            // footerClassName={css({ border: '2px solid green' })}
            // validationClassName={css({ border: '2px solid brown' })}
          />
          <InlineInput
            value={val22}
            label="text area confirm"
            placeholder="t a c"
            inputType="textarea"
            mandatory={mandatory}
            readOnly={readOnly}
            saveMode="ON_CONFIRM"
            onChange={newValue => {
              // eslint-disable-next-line no-alert
              //alert('changed');
              logger.info('changed');
              setVal22(newValue);
            }}
            tip={showTip && 'a wonderful advice'}
            footer={showFooter && 'and if I would like to add something'}
            warning={showWarning && 'ah a warning'}
            error={showError && 'oh an error'}
          />
          <InlineInput
            label="input number"
            value={val23}
            placeholder="i n c"
            type="number"
            mandatory={mandatory}
            readOnly={readOnly}
            min="0"
            max="5"
            saveMode="ON_CONFIRM"
            onChange={newValue => {
              // eslint-disable-next-line no-alert
              //alert('changed');
              logger.info('changed');
              setVal23(parseInt(newValue));
            }}
            tip={showTip && 'a wonderful advice'}
            footer={showFooter && 'and if I would like to add something'}
            warning={showWarning && 'ah a warning'}
            error={showError && 'oh an error'}
          />
          <h3>results</h3>
          <Flex>{val21}</Flex>
          <Flex>{val22}</Flex>
          <Flex>{val23}</Flex>
        </Flex>
        <Flex direction="column" className={css({ padding: space_M })}>
          <Button
            title="mandatory"
            onClick={() => {
              setMandatory(!mandatory);
            }}
            className={cx(textSmall, css({ margin: '5px' }))}
          >
            mandatory = {mandatory ? 'true' : 'false'}
          </Button>
          <Button
            title="readOnly"
            onClick={() => {
              setReadOnly(!readOnly);
            }}
            className={cx(textSmall, css({ margin: '5px' }))}
          >
            readOnly = {readOnly ? 'true' : 'false'}
          </Button>
          <Button
            title="showTip"
            onClick={() => {
              setShowTip(!showTip);
            }}
            className={cx(textSmall, css({ margin: '5px' }))}
          >
            showTip = {showTip ? 'true' : 'false'}
          </Button>
          <Button
            title="showFooter"
            onClick={() => {
              setShowFooter(!showFooter);
            }}
            className={cx(textSmall, css({ margin: '5px' }))}
          >
            showFooter = {showFooter ? 'true' : 'false'}
          </Button>
          <Button
            title="showWarning"
            onClick={() => {
              setShowWarning(!showWarning);
            }}
            className={cx(textSmall, css({ margin: '5px' }))}
          >
            showWarning = {showWarning ? 'true' : 'false'}
          </Button>
          <Button
            title="showError"
            onClick={() => {
              setShowError(!showError);
            }}
            className={cx(textSmall, css({ margin: '5px' }))}
          >
            showError = {showError ? 'true' : 'false'}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
