/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import Flex from '../../../common/layout/Flex';
import { space_sm } from '../../../styling/style';

// UI could be done : have a nice default :-)
const tagStyle = css({
  marginRight: space_sm,
  fontSize: '0.8em',
});

interface CardTypeTagsDisplayProps {
  tags: string[];
  className?: string;
}

export function TagsDisplay({ tags, className }: CardTypeTagsDisplayProps): JSX.Element {
  return (
    <Flex grow={1} align="flex-end" wrap="wrap">
      {tags.map(tag => {
        return (
          <div key={tag} className={cx(tagStyle, className)}>
            {tag}
          </div>
        );
      })}
    </Flex>
  );
}
