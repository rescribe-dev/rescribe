import React from 'react';
import { ValueType } from 'react-select';
import { isSSR } from 'utils/checkSSR';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'state';
import { Dispatch } from 'redux';
import './index.scss';
import Select from 'react-select';
import { capitalizeOnlyFirstLetter } from 'utils/misc';
import { Container, Row, Col } from 'reactstrap';
import { setTheme } from 'state/settings/actions';
import { Theme } from 'utils/theme';
import { FiSun, FiMoon } from 'react-icons/fi';

interface SelectObject {
  value: Theme;
  label: JSX.Element;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ThemeSelectorArgs {}

const ThemeSelector = (_args: ThemeSelectorArgs): JSX.Element => {
  const getLabel = (theme: Theme): JSX.Element => {
    let icon: JSX.Element;
    let name: string;
    switch (theme) {
      case Theme.light:
        icon = <FiSun />;
        name = 'light';
        break;
      case Theme.dark:
        icon = <FiMoon />;
        name = 'dark';
        break;
      default:
        icon = <></>;
        name = '';
        break;
    }
    return (
      <Container>
        <Row>
          <Col xs="auto">{icon}</Col>
          <Col xs="auto">{capitalizeOnlyFirstLetter(name)}</Col>
        </Row>
      </Container>
    );
  };
  const options: SelectObject[] = Object.values(Theme).map((theme) => {
    return {
      value: theme,
      label: getLabel(theme),
    };
  });
  const currentTheme: SelectObject | undefined = isSSR
    ? undefined
    : useSelector<RootState, SelectObject>((state) => {
        const theme = state.settingsReducer.theme;
        return {
          value: theme,
          label: getLabel(theme),
        };
      });

  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatch = useDispatch();
  }
  return (
    <>
      <Select
        id="theme"
        name="theme"
        style={{
          minWidth: '100%',
        }}
        isMulti={false}
        options={options}
        cacheOptions={true}
        value={currentTheme}
        onChange={(selectedOption: ValueType<SelectObject>) => {
          if (!selectedOption) {
            return;
          }
          const selected = selectedOption as SelectObject;
          dispatch(setTheme(selected.value));
        }}
      />
    </>
  );
};

export default ThemeSelector;
