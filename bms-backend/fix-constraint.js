const pool = require('./config/database');
async function fix() {
    try {
        await pool.query('ALTER TABLE tbl_showtimes DROP CONSTRAINT IF EXISTS tbl_showtimes_screen_id_show_date_show_time_key CASCADE;');
        await pool.query('ALTER TABLE tbl_showtimes ADD CONSTRAINT tbl_showtimes_screen_id_show_date_show_time_tmdb_mo_key UNIQUE (screen_id, show_date, show_time, tmdb_movie_id);');
        console.log('Constraint updated successfully.');
    } catch (err) {
        console.error('Error applying constraint update:', err);
    } finally {
        pool.end();
    }
}
fix();
