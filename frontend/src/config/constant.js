const is_api_live = false
const Constant = {

    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,

    API_BASE_URL: is_api_live ? process.env.REACT_APP_API_URL_LIVE : process.env.REACT_APP_API_URL,

    APP_LOGO : `/dist/images/logos/logo2.png`,
    APP_LOGO_ICON : `/dist/images/logos/favicon.ico`,
    PUBLIC_URL : process.env.PUBLIC_URL,

    // ---------------------------Code manage---------------------------------------

    SUCCESS: '1',
    INVALID_OR_FAIL: '0',
    NO_DATA_FOUND: '2',
    DELETE_ACCOUNT: '3',
    USER_SESSION_EXPIRE: '-1',

    // --------------------------Local storage credentials-----------------------------------------

    AUTH_KEY: 'user',
    LANGUAGE_KEY: 'language',
    THEME_KEY: 'theme'

}
export default Constant

export const ModelName = {
    SMALL_MODEL: 'SMALL_MODEL',
    SETTING_EDIT_MODEL: 'SETTING_EDIT_MODEL',
    SUBSCRIPTION_EDIT_MODEL: 'SUBSCRIPTION_EDIT_MODEL',
};

export const SEARCH_DELAY = 500;
export const API_DELAY = 500;
export const PER_PAGE_DATA = 10;
export const COUNT_PER_PAGE = 10;

export const Codes = {
    SUCCESS: 1,
    INTERNAL_ERROR: 0,
    VALIDATION_ERROR: 0,
    UNAUTHORIZED: -1,
    INACTIVE: 3,
    NOT_FOUND: 2,
    ERROR: 0
}
