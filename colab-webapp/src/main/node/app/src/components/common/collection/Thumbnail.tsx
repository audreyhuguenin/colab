/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { space_lg } from '../../styling/style';
import Clickable from '../layout/Clickable';

interface ThumbnailProps {
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  children: React.ReactNode;
  disableOnEnter?: boolean;
}

const thumbStyle = css({
  cursor: 'pointer',
  padding: space_lg,
});

export default function Thumbnail({
  onClick,
  onDoubleClick,
  className,
  children,
  disableOnEnter,
}: ThumbnailProps): JSX.Element {
  return (
    <Clickable
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      enterKeyBehaviour={disableOnEnter ? 'NONE' : 'DBL_CLICK'}
      className={cx(thumbStyle, className)}
    >
      {children}
    </Clickable>
  );
}
