module.exports = {

    'APP_NAME': `RedeemPlus`,
    
    // API Documentation Configuration
    'GLOBALS': {
        'APP_NAME': 'RedeemPlus',
        'LOGO': 'https://via.placeholder.com/120x60/4CAF50/FFFFFF?text=RedeemPlus',
        'PORT_BASE_URL': process.env.PORT_BASE_URL || 'http://localhost:8856/',
        'BASE_URL_WITHOUT_API': process.env.BASE_URL_WITHOUT_API || 'http://localhost:8856/',
        'API_KEY': process.env.API_KEY || 'your-api-key-here',
        'KEY': process.env.KEY || 'your-encryption-key-here',
        'IV': process.env.IV || 'your-iv-here',
        'S3_BUCKET_ROOT': process.env.S3_BUCKET_ROOT || 'https://hlik-deep-bhaumik.s3.ap-south-1.amazonaws.com/redeem_plus/',
        'USER_IMAGE': process.env.USER_IMAGE || 'user-profiles/',
        'EMAIL': process.env.EMAIL || 'support@redeemplus.app'
    },

    //////////////////////////////////////////////////////////////////////
    //                           development                            //
    //////////////////////////////////////////////////////////////////////

    'ENCRYPTION_BYPASS': false,
};
