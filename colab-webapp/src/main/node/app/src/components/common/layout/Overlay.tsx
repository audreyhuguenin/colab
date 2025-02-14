/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import { fullScreenOverlayStyle } from '../../styling/style';

interface OverlayProps {
  children: React.ReactNode;
  backgroundStyle?: string;
  onClickOutside?: () => void;
}

export default function Overlay({
  children,
  backgroundStyle,
  onClickOutside,
}: OverlayProps): JSX.Element {
  const clickIn = React.useCallback((event: React.MouseEvent<HTMLDivElement> | undefined) => {
    if (event != null) {
      event.stopPropagation();
    }
  }, []);

  const clickOut = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onClickOutside) {
        onClickOutside();
      }
    },
    [onClickOutside],
  );

  //  /**
  //   * Pressing escape simulate clickOutside()
  //   */
  //  const keyDownCb = React.useCallback(
  //    (event: React.KeyboardEvent<HTMLElement>) => {
  //      if (clickOutside != null) {
  //        if (event.code === 'Escape') {
  //          clickOutside();
  //        }
  //      }
  //    },
  //    [clickOutside],
  //  );

  return (
    <div
      onClick={clickOut}
      tabIndex={0}
      //      onKeyDown={keyDownCb}
      className={cx(fullScreenOverlayStyle, css({ zIndex: 999 }), backgroundStyle)}
    >
      <div
        onClick={clickIn}
        className={css({
          margin: 'auto',
        })}
      >
        {children}
      </div>
    </div>
  );
}
