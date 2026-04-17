-- BookMyShow Seed Data
-- Run AFTER schema.sql: psql -U postgres -d bms -f seed.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- Theaters (2 per city for Mumbai, Delhi, Bangalore)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO tbl_theaters (city_id, name, address, latitude, longitude, amenities) VALUES
    (
        (SELECT id FROM tbl_cities WHERE name = 'Mumbai' LIMIT 1),
        'PVR Juhu',
        'Juhu Tara Road, Juhu, Mumbai - 400049',
        '19.0895', '72.8263',
        '["Parking", "Food Court", "Wheelchair Access", "M-Ticket"]'
    ),
    (
        (SELECT id FROM tbl_cities WHERE name = 'Mumbai' LIMIT 1),
        'INOX Nariman Point',
        'Marine Lines, Nariman Point, Mumbai - 400021',
        '18.9256', '72.8242',
        '["Parking", "Food Court", "Dolby Atmos"]'
    ),
    (
        (SELECT id FROM tbl_cities WHERE name = 'Delhi' LIMIT 1),
        'PVR Select City Walk',
        'Select City Walk Mall, Saket, New Delhi - 110017',
        '28.5257', '77.2167',
        '["Parking", "Food Court", "IMAX", "Wheelchair Access"]'
    ),
    (
        (SELECT id FROM tbl_cities WHERE name = 'Delhi' LIMIT 1),
        'Cinepolis DLF Mall',
        'DLF Mall of India, Sector 18, Noida - 201301',
        '28.5706', '77.3218',
        '["Parking", "Food Court", "4DX"]'
    ),
    (
        (SELECT id FROM tbl_cities WHERE name = 'Bangalore' LIMIT 1),
        'PVR Orion Mall',
        'Orion Mall, Brigade Gateway, Rajajinagar, Bangalore - 560055',
        '12.9925', '77.5554',
        '["Parking", "Food Court", "Dolby Atmos", "Wheelchair Access"]'
    ),
    (
        (SELECT id FROM tbl_cities WHERE name = 'Bangalore' LIMIT 1),
        'INOX Forum Mall',
        'Forum Mall, 21 Hosur Road, Koramangala, Bangalore - 560029',
        '12.9352', '77.6146',
        '["Parking", "Food Court", "IMAX"]'
    )
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Screens (2 per theater = 12 total)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO tbl_screens (theater_id, name, screen_type, total_rows, total_cols)
SELECT t.id, s.name, s.screen_type, 10, 12
FROM tbl_theaters t
CROSS JOIN (VALUES
    ('Screen 1', 'Standard'),
    ('Screen 2', 'IMAX')
) AS s(name, screen_type)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Seats (rows A–J, seats 1–12, per screen)
-- A–C  → Economy  @ ₹150
-- D–G  → Premium  @ ₹250
-- H–J  → Recliner @ ₹400
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    scr_id      BIGINT;
    row_labels  TEXT[] := ARRAY['A','B','C','D','E','F','G','H','I','J'];
    r           TEXT;
    seat_type   VARCHAR;
    seat_price  NUMERIC;
    s           INT;
BEGIN
    FOR scr_id IN SELECT id FROM tbl_screens LOOP
        FOREACH r IN ARRAY row_labels LOOP
            IF r IN ('A','B','C') THEN
                seat_type  := 'Economy';  seat_price := 150.00;
            ELSIF r IN ('D','E','F','G') THEN
                seat_type  := 'Premium';  seat_price := 250.00;
            ELSE
                seat_type  := 'Recliner'; seat_price := 400.00;
            END IF;
            FOR s IN 1..12 LOOP
                INSERT INTO tbl_seats (screen_id, row_label, seat_number, seat_type, price)
                VALUES (scr_id, r, s, seat_type, seat_price)
                ON CONFLICT (screen_id, row_label, seat_number) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Showtimes: 5 time slots × 3 dates for every screen
-- Movie: Inception (TMDB ID 27205)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO tbl_showtimes
    (screen_id, theater_id, tmdb_movie_id, movie_title, movie_language,
     show_date, show_time, show_format, price_multiplier)
SELECT
    scr.id,
    scr.theater_id,
    27205,
    'Inception',
    'English',
    (CURRENT_DATE + n.days)::DATE,
    t.show_time::TIME,
    '2D',
    1.00
FROM tbl_screens scr
CROSS JOIN (VALUES (0),(1),(2)) AS n(days)
CROSS JOIN (VALUES
    ('10:00'),
    ('13:00'),
    ('16:00'),
    ('19:00'),
    ('22:00')
) AS t(show_time)
ON CONFLICT (screen_id, show_date, show_time) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Showtime seats: initialize all (showtime × seat) as 'available'
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO tbl_showtime_seats (showtime_id, seat_id, status)
SELECT st.id, se.id, 'available'
FROM tbl_showtimes st
JOIN tbl_seats se ON se.screen_id = st.screen_id
ON CONFLICT (showtime_id, seat_id) DO NOTHING;
