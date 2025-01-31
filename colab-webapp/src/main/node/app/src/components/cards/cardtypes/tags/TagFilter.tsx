/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../../i18n/I18nContext';
import Checkbox from '../../../common/element/Checkbox';
import Flex from '../../../common/layout/Flex';
import { lightLinkStyle, removeOutlineStyle, space_sm } from '../../../styling/style';

const tagStyle = cx(
  css({
    padding: '0 ' + space_sm,
    color: 'var(--secondary-main)',
    margin: space_sm,
    border: '1px solid var(--secondary-main)',
    userSelect: 'none',
    fontSize: '0.9em',
  }),
);

const checkedTagStyle = css({
  backgroundColor: 'var(--secondary-main)',
  color: 'var(--primary-contrast)',
  '&:hover': {
    color: 'var(--primary-contrast)',
  },
});

interface TagsFilterProps {
  tagsState: Record<string, boolean>; // tags with checked or not
  onChange: (tag: string, value: boolean) => void;
  className?: string;
  tagItemClassName?: string;
}

export default function TagsFilter({
  tagsState,
  onChange,
  className,
  tagItemClassName,
}: TagsFilterProps): JSX.Element {
  const [selectAllState, setSelectAllState] = React.useState<boolean>(false);
  const i18n = useTranslations();

  const toggleAllTags = React.useCallback(() => {
    setSelectAllState(!selectAllState);

    Object.keys(tagsState).map(tag => {
      if (tagsState[tag] != selectAllState) {
        onChange(tag, selectAllState);
      }
    });
  }, [tagsState, onChange, selectAllState]);

  // TODO auto adapt selectAll if state of all is same (?)

  return (
    <>
      {tagsState && Object.keys(tagsState).length > 0 && (
        <Flex className={className} direction="column" align="stretch">
          <Flex justify="space-between" align="center">
            <Flex wrap="wrap">
              {Object.keys(tagsState).map(tag => {
                return (
                  <div
                    className={cx(
                      tagStyle,
                      {
                        [checkedTagStyle]: tagsState[tag],
                      },
                      tagItemClassName,
                    )}
                    key={tag}
                  >
                    <Checkbox
                      label={tag}
                      value={tagsState[tag]}
                      onChange={value => onChange(tag, value)}
                      className={cx(removeOutlineStyle, {
                        [checkedTagStyle]: tagsState[tag],
                      })}
                    />
                  </div>
                );
              })}
            </Flex>
            <Checkbox
              label={i18n.common.selectAll}
              value={!selectAllState}
              onChange={toggleAllTags}
              className={cx(lightLinkStyle, css({ '&:hover': { textDecoration: 'none' } }))}
            />
          </Flex>
        </Flex>
      )}
    </>
  );
}
