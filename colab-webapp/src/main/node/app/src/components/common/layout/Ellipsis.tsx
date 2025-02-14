/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { p_xs, text_xs } from '../../styling/style';
import { FlexProps } from './Flex';
import Icon from './Icon';

interface EllipsisProps<T> {
  items: T[];
  itemComp: (item: T) => React.ReactNode;
  alignEllipsis: FlexProps['align'];
  mode?: 'ELLIPSIS' | 'NUMBER';
  ellipsis?: React.ReactNode;
  containerClassName?: string;
}

const containerStyle = css({
  width: '100%',
  position: 'relative',
});

const itemsStyle = css({
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
});

const defaultEllipsis = <Icon color={'var(--divider-main)'} icon={'more_horiz'} />;

/**
 * items comp: the must all be the same size
 */
export default function Ellipsis<T>({
  items,
  itemComp,
  alignEllipsis = 'center',
  mode = 'ELLIPSIS',
  ellipsis = defaultEllipsis,
  containerClassName,
}: EllipsisProps<T>): JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>();
  const itemsRef = React.useRef<HTMLDivElement>(null);
  const ellipsisRef = React.useRef<HTMLDivElement>(null);

  const resizeObserver = React.useRef<ResizeObserver | undefined>();

  const [num, setNum] = React.useState(items.length);

  const visibleItems = items.slice(0, Math.min(num, items.length));
  const hiddenItems = items.length - visibleItems.length;

  const sync = React.useCallback(() => {
    if (containerRef.current && itemsRef.current && ellipsisRef.current) {
      const bbox = containerRef.current.getBoundingClientRect();
      const itemsBox = itemsRef.current.getBoundingClientRect();
      const ellipsisBox = ellipsisRef.current.getBoundingClientRect();

      if (
        itemsBox.width > bbox.width || // item overflow
        num < items.length // maybe some room to display more item
      ) {
        const itemWidth = (itemsBox.width - ellipsisBox.width) / num;
        if (itemWidth * items.length < bbox.width) {
          setNum(items.length);
        } else {
          const itemsCount = Math.floor((bbox.width - ellipsisBox.width) / itemWidth);
          setNum(itemsCount);
        }
      }
    }
  }, [items.length, num]);

  React.useEffect(() => {
    sync();
  }, [sync]);

  const setContainerRef = React.useCallback(
    (container: HTMLDivElement | null) => {
      if (resizeObserver.current != null) {
        resizeObserver.current.disconnect();
      }
      if (container) {
        const ro = new ResizeObserver(() => {
          sync();
        });

        ro.observe(container);
        resizeObserver.current = ro;
      }

      containerRef.current = container || undefined;
    },
    [sync],
  );

  const showEllipsis = num < items.length;

  return (
    <div className={containerStyle + ' CONTAINER ' + containerClassName} ref={setContainerRef}>
      <div className={itemsStyle + ' ITEMS'} ref={itemsRef}>
        {visibleItems.map(item => itemComp(item))}
        <div
          ref={ellipsisRef}
          className={css({
            visibility: showEllipsis ? 'visible' : 'hidden',
            alignSelf: alignEllipsis,
          })}
        >
          {mode === 'ELLIPSIS' ? (
            <>{ellipsis}</>
          ) : (
            <span className={cx(text_xs, p_xs, css({ color: 'var(--divider-main)' }))}>
              +{hiddenItems}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
