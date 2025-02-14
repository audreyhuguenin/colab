/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { MaterialIconsType } from '../../styling/IconType';
import { space_md, space_sm, space_xs, text_semibold, text_xs } from '../../styling/style';
import Flex from './Flex';
import Icon from './Icon';

const openStyle = css({
  maxHeight: '40000px',
  transition: 'max-height 500ms ease-in-out',
  overflow: 'hidden',
});

const closeStyle = css({
  maxHeight: '0px',
  transition: 'max-height 500ms ease-in-out',
  overflow: 'hidden',
});

const defaultLabelStyle = cx(
  text_xs,
  text_semibold,
  css({
    padding: space_xs + ' ' + space_md,
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--divider-main)',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    cursor: 'pointer',
    '&:hover': {
      color: 'var(--text-primary)',
      backgroundColor: 'var(--gray-100)',
    },
  }),
);

export interface CollapsibleProps {
  icon?: MaterialIconsType;
  label: string | React.ReactNode;
  open?: boolean;
  tooltip?: string;
  children: React.ReactNode;
  labelClassName?: string;
  contentClassName?: string;
}

export default function Collapsible({
  icon,
  label,
  open,
  tooltip,
  children,
  labelClassName,
  contentClassName,
}: CollapsibleProps): JSX.Element {
  const i18n = useTranslations();

  const [showContent, setShowContent] = React.useState<boolean>(open || false);

  return (
    <>
      <Flex
        align="center"
        onClick={() => setShowContent(showContent => !showContent)}
        className={cx(defaultLabelStyle, labelClassName)}
      >
        {icon && <Icon icon={icon} title={tooltip} />}
        {label}
        <Icon
          icon={showContent ? 'expand_less' : 'expand_more'}
          title={
            tooltip
              ? showContent
                ? i18n.common.close + ' ' + tooltip
                : i18n.common.open + ' ' + tooltip
              : showContent
              ? i18n.common.close
              : i18n.common.open
          }
          className={css({ marginLeft: space_sm })}
        />
      </Flex>
      <Flex className={cx(showContent ? openStyle : closeStyle, contentClassName)}>{children}</Flex>
    </>
  );
}
