import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ar from './locales/ar.json';

const i18n = createI18n({
    legacy: false, // Use Composition API
    locale: localStorage.getItem('locale') || 'en', // Get saved locale or default to 'en'
    fallbackLocale: 'en',
    messages: {
        en,
        ar
    }
});

export default i18n;
