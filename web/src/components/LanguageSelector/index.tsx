import React from 'react';
import { ValueType } from 'react-select';
import { isSSR } from 'utils/checkSSR';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'state';
import { Dispatch } from 'redux';
import localeEmoji from 'locale-emoji';
import './index.scss';
import Select from 'react-select';
import { languages, Language } from 'countries-list';
import { propertyOf } from 'utils/misc';
import { Container, Row, Col } from 'reactstrap';
import { setLanguage } from 'state/settings/actions';
import { languageOptions } from 'utils/languages';
import { navigate } from '@reach/router';
import {
  getCurrentLanguageFromURL,
  getLanguageRedirectURL,
} from 'utils/languageUtils';

interface SelectObject {
  value: string;
  code: string;
  label: JSX.Element;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LanguageSelectorArgs {}

const LanguageSelector = (_args: LanguageSelectorArgs): JSX.Element => {
  const getLabel = (language: Language, code: string): JSX.Element => {
    return (
      <Container>
        <Row>
          <Col xs="auto">{localeEmoji(code)}</Col>
          <Col xs="auto">{language.name}</Col>
        </Row>
      </Container>
    );
  };
  const options: SelectObject[] = languageOptions.map((code) => {
    const languageData = languages[propertyOf<typeof languages>(code)];
    return {
      value: languageData.name,
      code,
      label: getLabel(languageData, code),
    };
  });
  const currentLanguage: SelectObject | undefined = isSSR
    ? undefined
    : useSelector<RootState, SelectObject>((state) => {
        const code = state.settingsReducer.language;
        const languageData = languages[propertyOf<typeof languages>(code)];
        return {
          value: languageData.name,
          code,
          label: getLabel(languageData, code),
        };
      });

  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatch = useDispatch();
  }
  return (
    <>
      <Select
        id="language"
        name="language"
        style={{
          minWidth: '100%',
        }}
        isMulti={false}
        options={options}
        cacheOptions={true}
        value={currentLanguage}
        onChange={(selectedOption: ValueType<SelectObject>) => {
          if (!selectedOption) {
            return;
          }
          const selected = selectedOption as SelectObject;
          dispatch(setLanguage(selected.code));
          const currentLanguage = getCurrentLanguageFromURL();
          if (currentLanguage !== selected.code) {
            const newPath = getLanguageRedirectURL(selected.code);
            if (newPath.length > 0) {
              navigate(newPath);
            }
          }
        }}
      />
    </>
  );
};

export default LanguageSelector;
