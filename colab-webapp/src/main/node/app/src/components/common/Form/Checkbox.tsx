/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import * as React from 'react';
import { errorStyle, warningStyle } from '../../styling/style';
import Flex from '../Flex';
import IconButton from '../IconButton';

export interface Props {
  label?: React.ReactNode;
  warning?: string;
  error?: string;
  title?: string;
  disabled?: boolean;
  value?: boolean;
  onChange: (newValue: boolean) => void;
  className?: string;
  containerClassName?: string;
}

const disabledStyle = css({
  color: 'var(--disabledFgColor)',
});
const enabledStyle = css({ cursor: 'pointer' });

export default function Checkbox({
  label,
  warning,
  error,
  title,
  disabled = false,
  value,
  onChange,
  containerClassName,
  className,
}: Props): JSX.Element {
  return (
    <Flex className={containerClassName} direction="column">
      <Flex justify="space-between">
        {warning ? <div className={warningStyle}>{warning}</div> : null}
        {error ? <div className={errorStyle}>{error}</div> : null}
      </Flex>
      <Flex
        className={disabled ? disabledStyle : enabledStyle}
        justify="flex-start"
        onClick={disabled ? undefined : () => onChange(!value)}
      >
        <IconButton title={title} icon={value ? faCheckSquare : faSquare} className={className}>
          {label}
        </IconButton>
      </Flex>
    </Flex>
  );
}
