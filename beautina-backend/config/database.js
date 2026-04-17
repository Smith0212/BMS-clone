const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true',
    max: 5,                       // max connections in pool
    idleTimeoutMillis: 30000,     // close idle connections after 30s
    connectionTimeoutMillis: 5000, // fail fast if no connection available in 5s
});

module.exports = pool;