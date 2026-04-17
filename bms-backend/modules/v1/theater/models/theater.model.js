const pool         = require('../../../../config/database');
const responseCode = require('../../../../config/responseCode');

const theater_model = {

    async getCities(req) {
        try {
            const { rows } = await pool.query(
                `SELECT id, name, state, country FROM tbl_cities
                 WHERE is_active = TRUE AND is_deleted = FALSE
                 ORDER BY name ASC`
            );
            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'cities_found' }, data: rows };
        } catch (err) {
            console.error('GetCities Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async getTheaters(req) {
        try {
            const city_id = req.query.city_id;
            if (!city_id) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'no_theaters_found' }, data: [] };
            }

            const { rows } = await pool.query(`
                SELECT t.id, t.name, t.address, t.latitude, t.longitude, t.amenities,
                       c.name AS city_name, c.state
                FROM tbl_theaters t
                JOIN tbl_cities c ON c.id = t.city_id
                WHERE t.city_id = $1 AND t.is_active = TRUE AND t.is_deleted = FALSE
                ORDER BY t.name ASC
            `, [city_id]);

            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'no_theaters_found' }, data: [] };
            }
            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'theaters_found' }, data: rows };
        } catch (err) {
            console.error('GetTheaters Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async getTheaterDetail(req) {
        try {
            const theater_id = req.query.theater_id;
            if (!theater_id) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'theater_not_found' }, data: {} };
            }

            const { rows: theaterRows } = await pool.query(`
                SELECT t.id, t.name, t.address, t.latitude, t.longitude, t.amenities,
                       c.id AS city_id, c.name AS city_name, c.state
                FROM tbl_theaters t
                JOIN tbl_cities c ON c.id = t.city_id
                WHERE t.id = $1 AND t.is_active = TRUE AND t.is_deleted = FALSE
            `, [theater_id]);

            if (theaterRows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'theater_not_found' }, data: {} };
            }

            const { rows: screenRows } = await pool.query(`
                SELECT id, name, screen_type, total_rows, total_cols
                FROM tbl_screens
                WHERE theater_id = $1 AND is_active = TRUE AND is_deleted = FALSE
                ORDER BY name ASC
            `, [theater_id]);

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'theaters_found' },
                data: { ...theaterRows[0], screens: screenRows },
            };
        } catch (err) {
            console.error('GetTheaterDetail Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },
};

module.exports = theater_model;
