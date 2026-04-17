module.exports = async function getCredentials(pool) {
    try {
        const result = await pool.query('SELECT key_name, value FROM tbl_credentials');
        if (result.rows.length === 0) {
            console.log('tbl_credentials is empty — using .env values only');
            return true;
        }
        result.rows.forEach((row) => {
            process.env[row.key_name] = row.value;
        });
        console.log(`Loaded ${result.rows.length} credential(s) from tbl_credentials`);
        return true;
    } catch (err) {
        // Table likely doesn't exist yet — non-fatal in dev if .env has all values
        console.warn('getCredentials warning:', err.message);
        return true;
    }
};
