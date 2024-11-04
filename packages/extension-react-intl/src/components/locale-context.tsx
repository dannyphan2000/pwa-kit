import React, {createContext, useContext, useState} from 'react'

// Add type for supported locales
export type Locale = 'en' | 'fr';

type LocaleContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType | null>(null);

export const LocaleProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    console.log('LocaleProvider is called')
    const [locale, setLocaleOriginal] = useState<Locale>('fr');
    const setLocale = (locale: Locale) => {
        console.log('setLocale is called with', locale)
        setLocaleOriginal(locale)
    }

    return (
        <LocaleContext.Provider value={{locale, setLocale}}>
            {children}
        </LocaleContext.Provider>
    );
};

export const useLocale = () => {
    const context = useContext(LocaleContext);

    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
}; 