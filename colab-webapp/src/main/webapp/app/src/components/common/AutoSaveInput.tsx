/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { debounce } from 'lodash';
import { faPen, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { iconButton } from '../styling/style';

type State = {
  status: 'EDIT' | 'DISPLAY';
  currentValue: string;
};

export default ({
  value,
  onChange,
}: {
  value: string;
  onChange: (newValue: string) => void;
}): JSX.Element => {
  const [state, setState] = React.useState<State>({
    status: 'DISPLAY',
    currentValue: value || '',
  });

  React.useEffect(() => {
    setState(s => ({ ...s, currentValue: value }));
  }, [value]);

  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const debouncedOnChange = React.useMemo(
    () =>
      debounce((value: string) => {
        onChangeRef.current(value);
      }, 1000),
    [],
  );

  const onInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedOnChange(e.target.value);
    setState({ ...state, currentValue: e.target.value });
  };
  if (state.status === 'EDIT') {
    return (
      <div>
        <input value={state.currentValue} onChange={onInternalChange} />

        <FontAwesomeIcon
          className={iconButton}
          icon={faCheck}
          onClick={() => {
            setState({
              ...state,
              status: 'DISPLAY',
            });
          }}
        />
      </div>
    );
  } else {
    return (
      <div>
        {state.currentValue}

        <FontAwesomeIcon
          className={iconButton}
          icon={faPen}
          onClick={() => {
            setState({
              ...state,
              status: 'EDIT',
            });
          }}
        />
      </div>
    );
  }
};
