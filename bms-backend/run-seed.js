const fs = require('fs');
const path = require('path');
require('dotenv').config();
const pool = require('./config/database');

async function seed() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql')).toString();
        await pool.query(sql);
        console.log('Seed executed successfully');
    } catch (err) {
        console.log('Error executing seed:', err);
    } finally {
        pool.end();
    }
}
seed();
