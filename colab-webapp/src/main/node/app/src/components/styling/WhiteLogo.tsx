/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import Logo from './Logo';

export interface LogoProps {
  className?: string;
}

export default function WhiteLogo({ className }: LogoProps): JSX.Element {
  return (
    <Logo
      className={cx(
        css({
          '#logo_svg__colabText > path': {
            fill: 'var(--text-primary)',
          },
        }),
        className,
      )}
    />
  );
}
