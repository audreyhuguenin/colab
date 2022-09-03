/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import * as React from 'react';
import { Suspense } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter, Route, Routes, useParams } from 'react-router-dom';
import { I18nCtx, Language } from '../i18n/I18nContext';
import { useLocalStorage } from '../preferences';
import { getStore } from '../store/store';
import { init } from '../ws/websocket';
import { TipsConfig, TipsCtx } from './common/element/Tips';
import Loading from './common/layout/Loading';
import ErrorBoundary from './common/toplevel/ErrorBoundary';
import Notifier from './common/toplevel/Notifier';
import MainApp from './MainApp';
import { lightTheme, normalThemeMode } from './styling/style';
import Token from './token/Token';

import "inter-ui/inter.css"

/**
 * To read parameters from hash
 */
function TokenWrapper() {
  const { id, token } = useParams<'id' | 'token'>();

  return <Token tokenId={id} token={token} />;
}

function App(): JSX.Element {
  const [lang, setLang] = useLocalStorage<Language>('colab-language', 'EN');
  const [tipsConfig, setTipsConfig] = useLocalStorage<TipsConfig>('colab-tips-config', {
    TODO: false,
    NEWS: true,
    TIPS: true,
    WIP: false,
    DEBUG: false,
  });

  const setTodoCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        TODO: v,
      })),
    [setTipsConfig],
  );

  const setTipsCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        TIPS: v,
      })),
    [setTipsConfig],
  );

  const setNewsCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        NEWS: v,
      })),
    [setTipsConfig],
  );

  const setWipCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        WIP: v,
      })),
    [setTipsConfig],
  );

  const setDebugCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        DEBUG: v,
      })),
    [setTipsConfig],
  );

  /**
   * prevent application quit on file drop
   */
  const cancelDroppingFiles = React.useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.items.length > 0) {
      e.preventDefault();
    }
  }, []);

  return (
    <div
      className={cx(lightTheme, normalThemeMode)}
      onDrop={cancelDroppingFiles}
      onDragOver={cancelDroppingFiles}
    >
      <React.StrictMode>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Provider store={getStore()}>
              <I18nCtx.Provider value={{ lang: lang, setLang: setLang }}>
                <TipsCtx.Provider
                  value={{
                    TODO: {
                      value: tipsConfig.TODO,
                      set: setTodoCb,
                    },
                    TIPS: {
                      value: tipsConfig.TIPS,
                      set: setTipsCb,
                    },
                    NEWS: {
                      value: tipsConfig.NEWS,
                      set: setNewsCb,
                    },
                    WIP: {
                      value: tipsConfig.WIP,
                      set: setWipCb,
                    },
                    DEBUG: {
                      value: tipsConfig.DEBUG,
                      set: setDebugCb,
                    },
                  }}
                >
                  <Notifier />
                  <HashRouter>
                    <Routes>
                      <Route path="/token/:id/:token" element={<TokenWrapper />} />
                      <Route path="/token/*" element={<TokenWrapper />} />
                      <Route path="*" element={<MainApp />} />
                    </Routes>
                  </HashRouter>
                </TipsCtx.Provider>
              </I18nCtx.Provider>
            </Provider>
          </Suspense>
        </ErrorBoundary>
      </React.StrictMode>
    </div>
  );
}

function mount() {
  return render(<App />, document.getElementById('root'));
}

init();
mount();
