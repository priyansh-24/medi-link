import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import i18n from '../i18n';

type Language = 'en' | 'hi';

interface State {
  lang: Language;
}

const initialState: State = {
  lang: 'en',
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.lang = action.payload;
      i18n.changeLanguage(action.payload);
    },
    toggleLanguage: (state) => {
      const newLang = state.lang === 'en' ? 'hi' : 'en';
      state.lang = newLang;
      i18n.changeLanguage(newLang);
    },
  },
});

export const { setLanguage, toggleLanguage } = languageSlice.actions;
export default languageSlice.reducer;
