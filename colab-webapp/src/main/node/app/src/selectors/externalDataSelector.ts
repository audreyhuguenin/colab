/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { UrlMetadata } from 'colab-rest-client';
import { getUrlMetadata } from '../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../store/hooks';

export const useUrlMetadata = (url: string): UrlMetadata | 'NO_URL' | 'LOADING' => {
  const dispatch = useAppDispatch();
  return useAppSelector(state => {
    if (url) {
      const cached = state.externalData.urlMetadata[url];
      if (cached) {
        return cached;
      } else {
        dispatch(getUrlMetadata(url));
        return 'LOADING';
      }
    } else {
      return 'NO_URL';
    }
  }, shallowEqual);
};
