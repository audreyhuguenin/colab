/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import useTranslations from '../../../i18n/I18nContext';
import { space_lg, space_sm } from '../../styling/style';
import Clickable from './Clickable';
import Flex from './Flex';

const headerStyle = css({
  flexShrink: 0,
});

const defaultTabStyle = css({
  flexGrow: 1,
  textAlign: 'center',
  transition: '.2s',
  padding: space_lg,
  backgroundColor: 'var(--bg-primary)',
  cursor: 'pointer',
  borderRadius: '5px 5px 0 0',
  border: '1px solid var(--divider-main)',
  marginRight: space_sm,
  fontSize: '0.9em',
  zIndex: 1,
  marginBottom: '-2px',
});

const defaultNotSelectedStyle = cx(
  defaultTabStyle,
  css({
    ':hover': {
      backgroundColor: 'var(--bg-secondary)',
    },
  }),
);

const defaultSelectedStyle = cx(
  defaultTabStyle,
  css({
    fontWeight: 'bold',
    borderBottom: '2px solid white',
  }),
);

const defaultBodyStyle = css({
  padding: space_lg,
  borderRadius: '0 5px 5px 5px',
  backgroundColor: 'var(--bg-primary)',
  border: '1px solid var(--divider-main)',
  alignSelf: 'stretch',
});

function defaultTabFactory(
  defaultTab: string | undefined,
  children: TabsProps['children'],
): string | undefined {
  if (defaultTab != null) {
    return defaultTab;
  } else if (children && Array.isArray(children)) {
    return children[0]?.props.name || undefined;
  } else if (children && typeof children === 'object') {
    return children.props.name || undefined;
  } else {
    return undefined;
  }
}

interface TabProps {
  name: string;
  label: string;
  invisible?: boolean;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps): JSX.Element {
  return <>{children}</>;
}

interface TabsProps {
  routed?: boolean;
  defaultTab?: string;
  onSelect?: (name: string) => void;
  children: React.ReactElement<TabProps>[] | React.ReactElement<TabProps>;
  className?: string;
  tabsClassName?: string;
  selectedLabelClassName?: string;
  notselectedLabelClassName?: string;
  bodyClassName?: string;
}

export default function Tabs({
  routed,
  defaultTab,
  onSelect,
  children,
  className,
  tabsClassName,
  selectedLabelClassName,
  notselectedLabelClassName,
  bodyClassName,
}: TabsProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const i18n = useTranslations();

  const mappedChildren = React.useMemo(() => {
    const map: Record<
      string,
      { label: string; child: React.ReactElement<TabProps>; invisible?: boolean }
    > = {};

    React.Children.forEach(children, child => {
      map[child.props.name] = {
        label: child.props.label,
        child: child,
        invisible: child.props.invisible,
      };
    });

    return map;
  }, [children]);

  const [selectedTab, setTab] = React.useState<string>(
    defaultTabFactory(defaultTab, children) || '',
  );

  const onSelectTab = React.useCallback(
    (name: string) => {
      setTab(name);

      if (routed) {
        navigate(name);
      }

      if (onSelect) {
        onSelect(name);
      }
    },
    [navigate, onSelect, routed],
  );

  const child = mappedChildren[selectedTab]?.child;

  React.useEffect(() => {
    if (routed) {
      const path = location.pathname.split('/');

      const tabName = path[path.length - 1] || '';

      if (Object.keys(mappedChildren).includes(tabName)) {
        setTab(tabName);
      }
    }
  }, [location.pathname, mappedChildren, routed]);

  return (
    <Flex
      direction="column"
      grow={1}
      overflow="auto"
      className={cx(css({ alignSelf: 'stretch' }), className)}
    >
      <Flex justify="space-evenly" className={headerStyle}>
        {Object.keys(mappedChildren).map(name => {
          if (!mappedChildren[name]!.invisible) {
            return (
              <Clickable
                key={name}
                className={
                  name === selectedTab
                    ? cx(defaultSelectedStyle, tabsClassName, selectedLabelClassName)
                    : cx(defaultNotSelectedStyle, tabsClassName, notselectedLabelClassName)
                }
                onClick={() => onSelectTab(name)}
              >
                {mappedChildren[name]!.label}
              </Clickable>
            );
          }
        })}
      </Flex>
      <Flex
        direction="column"
        grow={1}
        overflow="auto"
        className={cx(defaultBodyStyle, bodyClassName)}
      >
        {routed ? (
          <Routes>
            <Route path={`/*`} element={child} />
            {mappedChildren &&
              Object.entries(mappedChildren).map(([key, value]) => {
                return <Route key={key} path={`${key}/*`} element={value.child} />;
              })}
          </Routes>
        ) : child != null ? (
          child
        ) : (
          <i>{i18n.common.error.missingContent}</i>
        )}
      </Flex>
    </Flex>
  );
}
