/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import {
  disabledStyle,
  errorTextStyle,
  space_sm,
  text_sm,
  warningTextStyle,
} from '../../styling/style';
import Flex from '../layout/Flex';
import Tips, { TipsProps } from './Tips';

const toggleAndLabelStyle = css({
  cursor: 'pointer',
});

const containerStyle = css({
  width: '28px',
  height: '16px',
  border: 'solid 1px #d7d7d7',
  borderRadius: '8px',
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
});

const offStyle = css({
  position: 'absolute',
  width: '16px',
  height: '16px',
  padding: '0',
  margin: '0',
  top: '0',
  left: 0,
  border: 'none',
  background: '#666',
  borderRadius: '8px',
  color: 'var(--success-main)',
  boxSizing: 'border-box',
  transition: '.3s',
});

const onStyle = cx(
  offStyle,
  css({
    left: '12px',
    background: 'var(--success-main)',
  }),
);

interface TogglerProps {
  label?: React.ReactNode;
  value?: boolean;
  readOnly?: boolean;
  onChange: (newValue: boolean) => void;
  tip?: TipsProps['children'];
  footer?: React.ReactNode;
  warningMessage?: React.ReactNode;
  errorMessage?: React.ReactNode;
  className?: string;
  bottomClassName?: string;
  stopPropagation?: boolean;
}

export default function Toggler({
  label,
  value,
  readOnly = false,
  onChange,
  tip,
  footer,
  warningMessage,
  errorMessage,
  className,
  bottomClassName,
  stopPropagation = true,
}: TogglerProps): JSX.Element {
  const onClickCb = React.useCallback(
    (e: React.MouseEvent) => {
      onChange(!value);
      if (stopPropagation) {
        e.stopPropagation();
      }
    },
    [value, stopPropagation, onChange],
  );
  return (
    <Flex
      direction="column"
      align="normal"
      className={cx(css({ padding: space_sm + ' 0' }), className, { [disabledStyle]: readOnly })}
    >
      <Flex align="center" justify="flex-start">
        <Flex onClick={readOnly ? undefined : onClickCb} className={toggleAndLabelStyle}>
          <Flex className={cx(containerStyle, className)}>
            <div className={value ? onStyle : offStyle}></div>
          </Flex>
          <div>&nbsp;{label}</div>
        </Flex>
        {tip != null && <Tips interactionType="CLICK">{tip}</Tips>}
      </Flex>
      {footer != null && <div className={text_sm}>{footer}</div>}
      <Flex direction="column" align="center" className={cx(text_sm, bottomClassName)}>
        {warningMessage != null && <div className={warningTextStyle}>{warningMessage}</div>}
        {errorMessage != null && <div className={errorTextStyle}>{errorMessage}</div>}
      </Flex>
    </Flex>
  );
}
