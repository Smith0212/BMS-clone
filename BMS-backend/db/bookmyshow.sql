
CREATE TABLE IF NOT EXISTS tbl_credentials(
  id BIGSERIAL PRIMARY KEY,
  key_name character varying(255) NOT NULL,
  value text NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tbl_credentials_key_name_key UNIQUE (key_name)
)


-- =========================
-- Auth / Users
-- =========================

CREATE TABLE IF NOT EXISTS tbl_users (
  id BIGSERIAL PRIMARY KEY,
  user_role VARCHAR(20) CHECK (user_role IN ('customer', 'provider')),
  profile_image TEXT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),

  signup_type VARCHAR(1) CHECK (signup_type IN ('s', 'g', 'f', 'a')) DEFAULT 's',
  social_id TEXT,


  email VARCHAR(255),
  country_code VARCHAR(6),
  phone VARCHAR(20),
  password TEXT,

  dob DATE,
  city VARCHAR(255),
  state VARCHAR(255),
  country VARCHAR(255),

  is_verified BOOLEAN DEFAULT FALSE,
  forgot_otp_verified BOOLEAN DEFAULT FALSE,
  step INTEGER DEFAULT 1,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OTP table (missing from original schema)
CREATE TABLE tbl_otp (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    action VARCHAR(20) DEFAULT 'signup',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    UNIQUE(user_id, action)
);

-- Device information (corrected enum)
CREATE TABLE tbl_device_info (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    device_type VARCHAR(2) CHECK (device_type IN ('A', 'I', 'W')) NOT NULL,
    device_name VARCHAR(64),
    os_version VARCHAR(8),
    app_version VARCHAR(8),
    ip VARCHAR(45),
    user_token TEXT,
    fcm_token TEXT,
    timezone VARCHAR(32),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
);


-- user addresses
CREATE TABLE tbl_addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    address TEXT,
    latitude VARCHAR(16),
    longitude VARCHAR(16),
    type VARCHAR(30),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
);
