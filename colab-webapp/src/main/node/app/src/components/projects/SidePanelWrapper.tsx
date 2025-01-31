/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import * as React from 'react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { useNavigate } from 'react-router-dom';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import { space_md, space_sm } from '../styling/style';

interface ProjectSidePanelWrapperProps {
  children: React.ReactNode;
  title?: string | React.ReactNode;
}

export default function ProjectSidePanelWrapper({
  children,
  title,
}: ProjectSidePanelWrapperProps): JSX.Element {
  const navigate = useNavigate();
  return (
    <>
      <div
        className={css({
          position: 'fixed',
          top: '48px',
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 1,
          pointerEvents: 'none',
        })}
      >
        <ReflexContainer orientation={'vertical'}>
          <ReflexElement
            className={'left-pane ' + css({ display: 'flex' })}
            resizeHeight={false}
            minSize={100}
          ></ReflexElement>
          <ReflexSplitter
            style={{
              backgroundColor: 'var(--divider-main)',
              width: '1px',
              borderLeft: '1px solid transparent',
              pointerEvents: 'auto',
            }}
          />
          <ReflexElement
            className={
              'right-pane ' +
              css({
                display: 'flex',
                backgroundColor: 'var(--bg-secondary)',
                position: 'relative',
                pointerEvents: 'auto',
              })
            }
            resizeHeight={false}
            minSize={150}
          >
            <Flex
              direction="column"
              align="stretch"
              grow={1}
              className={css({ overflow: 'hidden' })}
            >
              <Flex
                justify="space-between"
                align="center"
                className={css({ padding: space_sm + ' ' + space_md })}
              >
                {typeof title === 'string' ? <h3>{title}</h3> : <>{title}</>}
                <IconButton icon="close" title="Close panel" onClick={() => navigate('../.')} />
              </Flex>
              <Flex
                direction="column"
                align="stretch"
                grow={1}
                className={css({ overflow: 'auto' })}
              >
                {children}
              </Flex>
            </Flex>
          </ReflexElement>
        </ReflexContainer>
      </div>
    </>
  );
}
