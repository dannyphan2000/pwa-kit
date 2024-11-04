// TODO: how to pass these translations JSON files from the project to this extension?
// Loadable?
import en from '../../template-typescript-minimal/i18n/core/en.json'
import fr from '../../template-typescript-minimal/i18n/core/fr.json'
import storeLocatorEn from '../../template-typescript-minimal/i18n/extension-store-locator/en.json'
import storeLocatorFr from '../../template-typescript-minimal/i18n/extension-store-locator/fr.json'

const TRANSLATIONS = {
    en: {
        ...en,
        ...storeLocatorEn
    },
    fr: {
        ...fr,
        ...storeLocatorFr
    }
}

export default TRANSLATIONS