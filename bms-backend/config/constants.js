module.exports = {
    APP_NAME: 'BookMyShow',
    GLOBALS: {
        APP_NAME: 'BookMyShow',
        PORT_BASE_URL: process.env.PORT_BASE_URL || 'http://localhost:8856/',
        BASE_URL_WITHOUT_API: process.env.BASE_URL_WITHOUT_API || 'http://localhost:8856/api/v1/',
        API_KEY: process.env.API_KEY || 'bms-api-key-2024',
        KEY: process.env.KEY,
        IV: process.env.IV,
        EMAIL: process.env.EMAIL || 'noreply@bookmyshow.com',
    },
    ENCRYPTION_BYPASS: true,
};
