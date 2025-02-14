/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import * as React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { activeIconButtonStyle, ghostIconButtonStyle, iconButtonStyle } from '../../styling/style';

interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: NavLinkProps['className'];
  end?: boolean;
}

function defaultClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? activeIconButtonStyle : cx(iconButtonStyle, ghostIconButtonStyle);
}

export const MainMenuLink = ({ to, children, end, className }: LinkProps): JSX.Element => {
  return (
    <NavLink end={end} className={className || defaultClassName} to={to}>
      {children}
    </NavLink>
  );
};

export const InlineLink = ({ to, children, className }: LinkProps): JSX.Element => {
  return (
    <NavLink to={to} className={className}>
      {children}
    </NavLink>
  );
};
