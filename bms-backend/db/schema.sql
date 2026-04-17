-- BookMyShow PostgreSQL Schema
-- Run: psql -U postgres -d bms -f schema.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- Credentials store (loaded into process.env on startup)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_credentials (
    id         BIGSERIAL PRIMARY KEY,
    key_name   VARCHAR(255) NOT NULL UNIQUE,
    value      TEXT         NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Users (customers only — no role, no social login)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_users (
    id            BIGSERIAL PRIMARY KEY,
    first_name    VARCHAR(255),
    last_name     VARCHAR(255),
    email         VARCHAR(255) UNIQUE,
    phone         VARCHAR(20),
    password      TEXT,
    profile_image TEXT,
    city          VARCHAR(255),
    is_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- OTP store
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_otp (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES tbl_users(id) ON DELETE CASCADE,
    otp        VARCHAR(6)   NOT NULL,
    action     VARCHAR(20)  DEFAULT 'signup',
    expires_at TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE(user_id, action)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Session tokens (one per user)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_device_info (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      REFERENCES tbl_users(id) ON DELETE CASCADE,
    user_token TEXT,
    ip         VARCHAR(45),
    is_active  BOOLEAN     DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Cities
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_cities (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    state      VARCHAR(255),
    country    VARCHAR(100) DEFAULT 'India',
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

INSERT INTO tbl_cities (name, state) VALUES
    ('Mumbai',    'Maharashtra'),
    ('Delhi',     'Delhi'),
    ('Bangalore', 'Karnataka'),
    ('Chennai',   'Tamil Nadu'),
    ('Hyderabad', 'Telangana'),
    ('Kolkata',   'West Bengal'),
    ('Pune',      'Maharashtra'),
    ('Ahmedabad', 'Gujarat'),
    ('Jaipur',    'Rajasthan'),
    ('Surat',     'Gujarat')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Theaters
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_theaters (
    id         BIGSERIAL PRIMARY KEY,
    city_id    BIGINT       REFERENCES tbl_cities(id),
    name       VARCHAR(255) NOT NULL,
    address    TEXT,
    latitude   VARCHAR(20),
    longitude  VARCHAR(20),
    amenities  JSONB        DEFAULT '[]',
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Screens (within a theater)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_screens (
    id          BIGSERIAL PRIMARY KEY,
    theater_id  BIGINT       NOT NULL REFERENCES tbl_theaters(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    screen_type VARCHAR(50)  DEFAULT 'Standard',
    total_rows  INTEGER      NOT NULL DEFAULT 10,
    total_cols  INTEGER      NOT NULL DEFAULT 12,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Seats (static layout per screen)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_seats (
    id          BIGSERIAL PRIMARY KEY,
    screen_id   BIGINT          NOT NULL REFERENCES tbl_screens(id) ON DELETE CASCADE,
    row_label   VARCHAR(5)      NOT NULL,
    seat_number INTEGER         NOT NULL,
    seat_type   VARCHAR(30)     DEFAULT 'Economy',
    price       NUMERIC(10,2)   NOT NULL DEFAULT 150.00,
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    is_deleted  BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    UNIQUE(screen_id, row_label, seat_number)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Showtimes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_showtimes (
    id               BIGSERIAL PRIMARY KEY,
    screen_id        BIGINT          NOT NULL REFERENCES tbl_screens(id) ON DELETE CASCADE,
    theater_id       BIGINT          NOT NULL REFERENCES tbl_theaters(id),
    tmdb_movie_id    INTEGER         NOT NULL,
    movie_title      VARCHAR(255),
    movie_language   VARCHAR(50)     DEFAULT 'English',
    show_date        DATE            NOT NULL,
    show_time        TIME            NOT NULL,
    show_format      VARCHAR(30)     DEFAULT '2D',
    price_multiplier NUMERIC(4,2)    DEFAULT 1.00,
    is_active        BOOLEAN         NOT NULL DEFAULT TRUE,
    is_deleted       BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT now(),
    UNIQUE(screen_id, show_date, show_time, tmdb_movie_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Per-show seat availability snapshot
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_showtime_seats (
    id              BIGSERIAL PRIMARY KEY,
    showtime_id     BIGINT      NOT NULL REFERENCES tbl_showtimes(id) ON DELETE CASCADE,
    seat_id         BIGINT      NOT NULL REFERENCES tbl_seats(id),
    status          VARCHAR(20) DEFAULT 'available'
                        CHECK (status IN ('available','reserved','booked','blocked')),
    reserved_at     TIMESTAMPTZ,
    reserved_until  TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(showtime_id, seat_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Bookings
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_bookings (
    id                  BIGSERIAL PRIMARY KEY,
    booking_ref         VARCHAR(20)     NOT NULL UNIQUE,
    user_id             BIGINT          NOT NULL REFERENCES tbl_users(id),
    showtime_id         BIGINT          NOT NULL REFERENCES tbl_showtimes(id),
    theater_id          BIGINT          NOT NULL REFERENCES tbl_theaters(id),
    tmdb_movie_id       INTEGER         NOT NULL,
    movie_title         VARCHAR(255),
    show_date           DATE            NOT NULL,
    show_time           TIME            NOT NULL,
    total_seats         INTEGER         NOT NULL,
    subtotal            NUMERIC(10,2)   NOT NULL,
    convenience_fee     NUMERIC(10,2)   DEFAULT 0,
    taxes               NUMERIC(10,2)   DEFAULT 0,
    total_amount        NUMERIC(10,2)   NOT NULL,
    status              VARCHAR(30)     DEFAULT 'pending'
                            CHECK (status IN ('pending','confirmed','cancelled','refunded')),
    cancellation_reason TEXT,
    cancelled_at        TIMESTAMPTZ,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    is_deleted          BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Seats associated with a booking
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_booking_seats (
    id           BIGSERIAL PRIMARY KEY,
    booking_id   BIGINT        NOT NULL REFERENCES tbl_bookings(id) ON DELETE CASCADE,
    seat_id      BIGINT        NOT NULL REFERENCES tbl_seats(id),
    showtime_id  BIGINT        NOT NULL REFERENCES tbl_showtimes(id),
    row_label    VARCHAR(5)    NOT NULL,
    seat_number  INTEGER       NOT NULL,
    seat_type    VARCHAR(30),
    price        NUMERIC(10,2) NOT NULL,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Payments (dummy gateway)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_payments (
    id                  BIGSERIAL PRIMARY KEY,
    booking_id          BIGINT        REFERENCES tbl_bookings(id),
    user_id             BIGINT        NOT NULL REFERENCES tbl_users(id),
    payment_method      VARCHAR(50)   DEFAULT 'card',
    payment_status      VARCHAR(30)   DEFAULT 'pending'
                            CHECK (payment_status IN ('pending','success','failed','refunded')),
    gateway_order_id    VARCHAR(100),
    gateway_payment_id  VARCHAR(100),
    amount              NUMERIC(10,2) NOT NULL,
    currency            VARCHAR(5)    DEFAULT 'INR',
    payment_meta        JSONB         DEFAULT '{}',
    paid_at             TIMESTAMPTZ,
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    is_deleted          BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Notifications
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbl_notifications (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES tbl_users(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    body         TEXT,
    type         VARCHAR(50)  DEFAULT 'general',
    reference_id BIGINT,
    is_read      BOOLEAN      DEFAULT FALSE,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
