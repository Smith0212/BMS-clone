require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { join } = require('path');
const pool = require('./config/database');
const { GLOBALS } = require('./config/constants');

const app = express();

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'modules/v1/api_documentation'));

app.use(cors({ origin: true, credentials: true }));
app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const v1Routes = require('./modules/v1/app-routing');
app.use('/api/v1', v1Routes);

app.get('/test', (req, res) => res.send('BMS API is running...'));

async function startServer() {
    try {
        const client = await pool.connect();
        console.log('Database connected ✅');

        const getCredentials = require('./utils/getCredentials');
        const credentialsFetched = await getCredentials(pool);
        if (!credentialsFetched) {
            console.error('Failed to load credentials from DB ❌');
            process.exit(1);
        }

        client.release();

        const port = process.env.PORT || 8856;
        app.listen(port, () => {
            console.log(`Server running on port ${port} 🚀`);
            console.log(`Base URL: ${GLOBALS.PORT_BASE_URL}`);
        });
    } catch (err) {
        console.error('Startup error:', err);
        process.exit(1);
    }
}

startServer();
