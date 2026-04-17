-- Categories
CREATE TABLE tbl_business_categories (
    id BIGSERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- subcategories
CREATE TABLE tbl_business_subcategories (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    subcategory_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES tbl_business_categories(id) ON DELETE CASCADE
);

-- Country codes table  
CREATE TABLE tbl_country_codes (
    id BIGSERIAL PRIMARY KEY,
    country_code VARCHAR(6) NOT NULL,
    country_name VARCHAR(64) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    currency_full_name VARCHAR(128),
    flag_icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table relation 
CREATE TABLE tbl_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(32),
    email VARCHAR(255),
    phone VARCHAR(20),
    country_code_id BIGINT,
    social_id VARCHAR(255),
    password TEXT,
    account_type VARCHAR(20) CHECK (account_type IN ('individual', 'business')),
    signup_type VARCHAR(1) CHECK (signup_type IN ('s', 'g', 'f', 'a')) DEFAULT 's',
    profile_image TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    forgot_otp_verified BOOLEAN DEFAULT FALSE,
    step INTEGER DEFAULT 1,
    avg_rating NUMERIC(3,2),
    total_ratings INTEGER DEFAULT 0,
    business_subcategory_id BIGINT,
    dob DATE,
    instagram_url VARCHAR(255),
    tiktok_url VARCHAR(255),
    whatsapp_url VARCHAR(255),
    map_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_subcategory_id) REFERENCES tbl_business_subcategories(id) ON DELETE SET NULL
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
    -- UNIQUE(user_id, action)
);

-- Device information (corrected enum)
CREATE TABLE tbl_device_info (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    device_type VARCHAR(1) CHECK (device_type IN ('A', 'I', 'W')) NOT NULL,
    device_name VARCHAR(64),
    os_version VARCHAR(8),
    app_version VARCHAR(8),
    ip VARCHAR(45),
    user_token TEXT,
    device_token TEXT,
    timezone VARCHAR(32),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
);

CREATE TABLE tbl_membership_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    iap_key VARCHAR(20) UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL, -- validity of the plan in days
    offer_limit INTEGER, -- total number of offers allowed to posted in plan
    offer_quantity_limit INTEGER, -- max quantity per offer
    limit_per_user INTEGER, -- max redemption per user for single offer

    redemption_limit INTEGER, -- renamed from 'redeemption_limit' (corrected typo)
    visibility_days INTEGER NOT NULL, -- max offer duration per post

    can_update_currency BOOLEAN DEFAULT FALSE, -- currency update allowed?
    edit_access VARCHAR(20) DEFAULT 'limited', -- 'limited' or 'full'
    allowed_offer_types TEXT[], -- allowed offer types (nullable = all types allowed)

    has_free_listing_rplus BOOLEAN DEFAULT FALSE,
    has_verified_badge BOOLEAN DEFAULT FALSE,
    has_price_control BOOLEAN DEFAULT TRUE,
    has_free_delivery_management BOOLEAN DEFAULT TRUE,
    has_priority_support BOOLEAN DEFAULT FALSE,
    has_exclusive_promo_access BOOLEAN DEFAULT FALSE,
    has_early_access_to_exclusive_offers BOOLEAN DEFAULT FALSE,
    is_auto_renewal BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    features_text JSONB DEFAULT '{}', -- JSON object storing custom text for each feature to display on membership cards
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_payments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    description TEXT,
    payment_type VARCHAR(20) CHECK (payment_type IN ('membership', 'listing', 'other')) DEFAULT 'other',
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
);

-- User memberships
CREATE TABLE tbl_user_memberships (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    payment_id BIGINT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    offers_used INTEGER DEFAULT 0, -- posted offer count
    redemption_used INTEGER DEFAULT 0, -- redemption count
    carry_forward_offers INTEGER DEFAULT 0, -- carry-forward bonus offers from previous same-tier membership
    carry_forward_redemptions INTEGER DEFAULT 0, -- carry-forward bonus redemptions from previous same-tier membership
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,   
    FOREIGN KEY (plan_id) REFERENCES tbl_membership_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES tbl_payments(id) ON DELETE SET NULL
);

-- Offer categories
CREATE TABLE tbl_offer_categories (
    id BIGSERIAL PRIMARY KEY,
    offer_category_name VARCHAR(128) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- offer subcategories
CREATE TABLE tbl_offer_subcategories (
    id BIGSERIAL PRIMARY KEY,
    offer_category_id BIGINT NOT NULL,
    offer_subcategory_name VARCHAR(128) NOT NULL,
    offer_subcategory_description varchar(255),
    home_icon TEXT,
    post_icon TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_category_id) REFERENCES tbl_offer_categories(id) ON DELETE CASCADE
);

-- Offers
CREATE TABLE tbl_offers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    offer_subcategory_id BIGINT,
    business_subcategory_id BIGINT,
    image TEXT,
    title VARCHAR(100) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    terms_of_use TEXT,
    discount_percentage DECIMAL(5, 2),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price > 0),
    old_price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'QAR',
    duration INTEGER NOT NULL,
    quantity_available INTEGER NOT NULL,
    quantity_per_user INTEGER DEFAULT 1,
    pin_code VARCHAR(10) NOT NULL,
    is_redeemable_in_store BOOLEAN DEFAULT TRUE,
    is_delivery_available BOOLEAN DEFAULT FALSE,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    estimated_delivery_time VARCHAR(50),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_days VARCHAR(7) DEFAULT '1111111', -- 7 digits representing Sun-Sat
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    managed_by BIGINT,
    managed_at TIMESTAMP WITH TIME ZONE,
    offer_address_id BIGINT,
    available_branches TEXT,
    FOREIGN KEY (offer_address_id) REFERENCES tbl_delivery_addresses(id) ON DELETE SET NULL,
    is_listed_in_rplus BOOLEAN DEFAULT FALSE,
    is_rplus_offer BOOLEAN DEFAULT FALSE, -- this is only for offers that are posted by R+ store it self.
    user_acknowledgment BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    total_redemptions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_inactive_by_admin BOOLEAN DEFAULT FALSE,
    is_deleted_by_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_subcategory_id) REFERENCES tbl_business_subcategories(id) ON DELETE SET NULL,
    FOREIGN KEY (offer_subcategory_id) REFERENCES tbl_offer_subcategories(id) ON DELETE SET NULL,
    FOREIGN KEY (managed_by) REFERENCES tbl_sub_admins(id) ON DELETE SET NULL;
);

-- Offer valid times (storing as TIME in UTC format)
CREATE TABLE tbl_offer_valid_times (
    id BIGSERIAL PRIMARY KEY,
    offer_id BIGINT NOT NULL,
    valid_time_start TIME NOT NULL,
    valid_time_end TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES tbl_offers(id) ON DELETE CASCADE
);

-- Delivery addresses
CREATE TABLE tbl_delivery_addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    address TEXT,
    street VARCHAR(16),
    postal_code VARCHAR(16),
    zone VARCHAR(16),
    latitude VARCHAR(16),
    longitude VARCHAR(16),
    country_code VARCHAR(6),
    flag_icon_url VARCHAR(255),
    phone_number VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
);

-- Redemptions
CREATE TABLE tbl_redemptions (
    id BIGSERIAL PRIMARY KEY,
    offer_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    redemption_method VARCHAR(20) CHECK (redemption_method IN ('pin_code', 'delivery')) NOT NULL,
    pin_code VARCHAR(10),
    -- confirmation_number VARCHAR(20) UNIQUE,
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES tbl_offers(id) ON DELETE CASCADE
);

-- Redemption deliveries 
CREATE TABLE tbl_redemption_deliveries (
    id BIGSERIAL PRIMARY KEY,
    redemption_id BIGINT NOT NULL,
    delivery_address_id BIGINT NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    estimated_delivery_time VARCHAR(50),
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'delivered', 'undelivered', 'cancelled')) DEFAULT 'pending', -- rejected: offer owner rejected the delivery request, undelivered: offer owner marked the delivery as undelivered, cancelled: customer cancelled the delivery request
    message TEXT,
    rejection_reason TEXT,
    accepted_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (redemption_id) REFERENCES tbl_redemptions(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_address_id) REFERENCES tbl_delivery_addresses(id) ON DELETE SET NULL
);



-- Reviews
CREATE TABLE tbl_reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    business_id BIGINT NOT NULL,
    offer_id BIGINT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES tbl_offers(id) ON DELETE SET NULL
);

-- Trigger function to update avg_rating in tbl_users
-- CREATE OR REPLACE FUNCTION update_business_avg_rating()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     UPDATE tbl_users
--     SET avg_rating = (
--         SELECT ROUND(AVG(rating)::numeric, 2)
--         FROM tbl_reviews
--         WHERE business_id = NEW.business_id AND is_deleted = FALSE AND is_active = TRUE
--     )
--     WHERE id = NEW.business_id;
--     RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Trigger on tbl_reviews for INSERT/UPDATE/DELETE
-- CREATE TRIGGER trg_update_avg_rating
-- AFTER INSERT OR UPDATE OR DELETE ON tbl_reviews
-- FOR EACH ROW
-- EXECUTE FUNCTION update_business_avg_rating();

-- User subscriptions (following businesses)
CREATE TABLE tbl_user_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    business_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    -- UNIQUE(user_id, business_id)
);

-- Saved offers
CREATE TABLE tbl_saved_offers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    offer_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES tbl_offers(id) ON DELETE CASCADE,
    -- UNIQUE(user_id, offer_id)
);

-- Notifications
CREATE TABLE tbl_notifications (
    id BIGSERIAL PRIMARY KEY,
    receiver_id BIGINT NOT NULL,
    sender_id BIGINT, -- 0 for system/admin notifications, other wise sender user id
    reference_id BIGINT, -- offer id or subscription id or redemption id or review id
    category VARCHAR(50) NOT NULL,            -- all | offer_redeemed | subscriber | delivery_request | other
    type VARCHAR(50) NOT NULL,  -- info | action | alert
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    message TEXT NOT NULL,
    message_ar TEXT,
    link TEXT, -- only for admin notification 
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (receiver_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
);

-- -- Recently viewed offers
-- CREATE TABLE tbl_recently_viewed (
--     id BIGSERIAL PRIMARY KEY,
--     user_id BIGINT NOT NULL,
--     offer_id BIGINT NOT NULL,
--     is_active BOOLEAN DEFAULT TRUE,
--     is_deleted BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
--     FOREIGN KEY (offer_id) REFERENCES tbl_offers(id) ON DELETE CASCADE,
--     UNIQUE(user_id, offer_id)
-- );

-- User settings
CREATE TABLE tbl_user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    --notification settings
    notification_enabled BOOLEAN DEFAULT TRUE,                -- General Notification (ON)
    sound_enabled BOOLEAN DEFAULT FALSE,                      -- Sound (OFF)
    vibrate_enabled BOOLEAN DEFAULT TRUE,                     -- Vibrate (ON)
    app_updates_enabled BOOLEAN DEFAULT FALSE,                -- App updates (OFF)
    delivery_status_enabled BOOLEAN DEFAULT TRUE,             -- Delivery Status Reminder (ON)
    subscribers_notification_enabled BOOLEAN DEFAULT TRUE,    -- Subscribers (ON)
    redeemed_offers_notification_enabled BOOLEAN DEFAULT FALSE, -- Redeemed Offers (OFF)
    delivery_request_notification_enabled BOOLEAN DEFAULT FALSE, -- Delivery Request (OFF)
    new_service_notification_enabled BOOLEAN DEFAULT FALSE,   -- New Service(OFFER CATEGORY/SUBCATEGORY ADDED) Available (OFF)
    new_tips_notification_enabled BOOLEAN DEFAULT TRUE,       -- New Tips Available (ON)

    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
);

-- -- App settings
-- CREATE TABLE tbl_app_settings (
--     id BIGSERIAL PRIMARY KEY,
--     setting_key VARCHAR(100) NOT NULL,
--     setting_value VARCHAR(100) NOT NULL,
--     is_active BOOLEAN DEFAULT TRUE,
--     is_deleted BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- Ads
CREATE TABLE tbl_ads (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    target_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    -- start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    -- end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports (corrected)
CREATE TABLE tbl_reports (
    id BIGSERIAL PRIMARY KEY,
    ticket_number VARCHAR(50),
    reporter_id BIGINT NOT NULL,
    reported_user_id BIGINT,
    reported_offer_id BIGINT,
    report_type VARCHAR(20) CHECK (report_type IN ('user', 'offer', 'problem')),
    reason_id BIGINT NOT NULL,
    additional_details TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
    admin_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    report_image_id BIGINT,
    assigned_admin_id BIGINT, -- random assignment for subadmins
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_offer_id) REFERENCES tbl_offers(id) ON DELETE CASCADE,
    FOREIGN KEY (reason_id) REFERENCES tbl_report_reasons(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_admin_id) REFERENCES tbl_sub_admins(id) ON DELETE SET NULL
);

-- for report problem type
CREATE TABLE tbl_report_messages (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL, -- user or admin ID
    sender_type VARCHAR(20) CHECK (sender_type IN ('user', 'admin')) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES tbl_reports(id) ON DELETE CASCADE
);

CREATE TABLE tbl_report_message_images (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES tbl_report_messages(id) ON DELETE CASCADE
);

-- Report reasons
CREATE TABLE tbl_report_reasons (
    id BIGSERIAL PRIMARY KEY,
    report_type VARCHAR(20) CHECK (report_type IN ('user', 'offer', 'problem')) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -- Report voice notes
-- CREATE TABLE tbl_report_voice_notes (
--     id BIGSERIAL PRIMARY KEY,
--     report_id BIGINT NOT NULL,
--     audio_url TEXT NOT NULL,
--     duration_ve BOOLEAN DEFAULT TRUE,
--     is_deleseconds SMALLINT CHECK (duration_seconds <= 60),
--     uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (report_id) REFERENCES tbl_reports(id) ON DELETE CASCADE
-- );

-- Static pages
CREATE TABLE tbl_static_pages (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    content_ar TEXT,
    link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Categories table
CREATE TABLE tbl_faq_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) UNIQUE NOT NULL,
    label VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FAQ table
CREATE TABLE tbl_faqs (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    question_ar TEXT,
    answer TEXT NOT NULL,
    answer_ar TEXT,
    category_id BIGINT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES tbl_faq_categories(id) ON DELETE CASCADE
);

-- Contact Options table for Contact Us module
CREATE TABLE tbl_contact_options (
    id BIGSERIAL PRIMARY KEY,
    -- Display label e.g., "Customer Services"
    label VARCHAR(150) NOT NULL,
    -- Type of option being opened
    type VARCHAR(50) NOT NULL,
    -- phone, whatsapp, website, facebook, twitter, instagram, telegram, email, location
    -- Description shown under each option
    description TEXT,
    -- The actual link, phone number, email
    value TEXT NOT NULL,
    -- Icon (local key or full URL)
    icon VARCHAR(200),
    -- Enable/disable visibility
    is_active BOOLEAN DEFAULT TRUE,
    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);










-- Create indexes for better performance
CREATE INDEX idx_users_email ON tbl_users(email);
CREATE INDEX idx_users_username ON tbl_users(username);
CREATE INDEX idx_offers_user_id ON tbl_offers(user_id);
CREATE INDEX idx_offers_address ON tbl_offers(offer_address_id);
CREATE INDEX idx_offers_dates ON tbl_offers(start_date, end_date);
CREATE INDEX idx_redemptions_user_offer ON tbl_redemptions(user_id, offer_id);
CREATE INDEX idx_notifications_user_id ON tbl_notifications(user_id);
CREATE INDEX idx_reviews_business_id ON tbl_reviews(business_id);
CREATE INDEX idx_subscriptions_user_business ON tbl_user_subscriptions(user_id, business_id);

-- Bronze (Free)
INSERT INTO tbl_membership_plans (
    name, price, duration_days,
    offer_limit, offer_quantity_limit, limit_per_user,
    redemption_limit, visibility_days,
    can_update_currency, edit_access, allowed_offer_types,
    has_free_listing_rplus, has_verified_badge, has_priority_support,
    has_exclusive_promo_access, has_unlimited_offers
) VALUES (
    'Bronze', 0.00, 365,
    5, 20, 1,
    1000, 14,
    FALSE, 'limited', ARRAY[
        'Buy 1, Get 2', 'Buy 1, Get 3', 'Discount Deals', '24Hrs Deals'
    ],
    FALSE, FALSE, FALSE,
    FALSE, FALSE
);

-- Silver (Paid)
INSERT INTO tbl_membership_plans (
    name, price, duration_days,
    offer_limit, offer_quantity_limit, limit_per_user,
    redemption_limit, visibility_days,
    can_update_currency, edit_access, allowed_offer_types,
    has_free_listing_rplus, has_verified_badge, has_priority_support,
    has_exclusive_promo_access, has_unlimited_offers
) VALUES (
    'Silver', 15.00, 365,
    20, 100, 5,
    NULL, 30,
    FALSE, 'limited', NULL, -- NULL = all types allowed
    FALSE, FALSE, TRUE,
    TRUE, FALSE
);

-- Gold (Paid)
INSERT INTO tbl_membership_plans (
    name, price, duration_days,
    offer_limit, offer_quantity_limit, limit_per_user,
    redemption_limit, visibility_days,
    can_update_currency, edit_access, allowed_offer_types,
    has_free_listing_rplus, has_verified_badge, has_priority_support,
    has_exclusive_promo_access, has_unlimited_offers
) VALUES (
    'Gold', 30.00, 365,
    NULL, NULL, 30,
    NULL, 60,
    TRUE, 'full', NULL,
    TRUE, TRUE, TRUE,
    TRUE, TRUE
);

-- Subcategories for "Buy and Get Offers" (Category ID: 1)
INSERT INTO tbl_offer_subcategories (offer_category_id, offer_subcategory_name)
VALUES
(1, 'Buy 1, Get 1 Free'),
(1, 'Buy 1, Get 2 Free'),
(1, 'Buy 1, Get 3 Free'),
(1, 'Buy 2, Get 1 Free'),
(1, 'Buy 2, Get 2 Free'),
(1, 'Buy 2, Get 3 Free'),
(1, 'Buy 3, Get 1 Free'),
(1, 'Buy 3, Get 2 Free'),
(1, 'Buy 3, Get 3 Free');

-- Subcategories for "Special Offers" (Category ID: 2)
INSERT INTO tbl_offer_subcategories (offer_category_id, offer_subcategory_name)
VALUES
(2, 'Package Deal'),
(2, '24hrs Deal'),
(2, 'Discount Deal');

INSERT INTO tbl_business_categories (category_name) VALUES
('Automotive'),
('Food & Beverages'),
('Property Listings'),
('Travel & Leisure'),
('Beauty & Personal Care'),
('Clothing & Accessories'),
('Health & Wellness'),
('Furniture & Decor'),
('Electronics'),
('Education & Learning'),
('Sports & Outdoors'),
('Pets & Animals'),
('Banking & Insurance'),
('Home Services'),
('Transportation & Mobility'),
('Others');

-- Automotive (1)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(1, 'Car For Sale'),
(1, 'Auto Parts'),
(1, 'Automotive Services'),
(1, 'Heavy Machinery'),
(1, 'Motorcycles'),
(1, 'Electric Cars');

-- Food & Beverages (2)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(2, 'Restaurants'),
(2, 'Coffee Shops'),
(2, 'Bakeries'),
(2, 'Buffet & Brunch Deals'),
(2, 'Catering Services');

-- Property Listings (3)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(3, 'Properties for Rent'),
(3, 'Properties for Sale'),
(3, 'Lands'),
(3, 'Commercial Properties');

-- Travel & Leisure (4)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(4, 'Hotels'),
(4, 'Car Rentals'),
(4, 'Flights'),
(4, 'Tours, Attractions & Cruises'),
(4, 'Entertainment Tickets'),
(4, 'Kids & Family Activities'),
(4, 'Helicopter Tours');

-- Beauty & Personal Care (5)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(5, 'Hair & Beauty Salons'),
(5, 'Skincare & Cosmetics'),
(5, 'Nail & Makeup Services'),
(5, 'Barber Shops'),
(5, 'Spas & Wellness');

-- Clothing & Accessories (6)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(6, 'Men’s Clothing'),
(6, 'Women’s Clothing'),
(6, 'Kids & Baby Clothing'),
(6, 'Footwear'),
(6, 'Bags & Accessories'),
(6, 'Perfumes & Fragrances'),
(6, 'Watches & Jewellery');

-- Health & Wellness (7)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(7, 'Hospitals & Clinics'),
(7, 'Medical Services'),
(7, 'Childcare & Pediatric Care'),
(7, 'Pharmacies & Wellness Products'),
(7, 'Fitness & Wellness Memberships'),
(7, 'Nutrition & Diet Services');

-- Furniture & Decor (8)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(8, 'Living Room Furniture'),
(8, 'Bedroom Furniture'),
(8, 'Dining & Kitchen Furniture'),
(8, 'Office Furniture'),
(8, 'Outdoor Furniture'),
(8, 'Mattress & Bedding');

-- Electronics (9)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(9, 'Smartphones & Tablets'),
(9, 'Laptops & Computers'),
(9, 'Cameras & Photography'),
(9, 'Gaming & Accessories'),
(9, 'Home Appliances'),
(9, 'Audio & TVs');

-- Education & Learning (10)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(10, 'Online Courses'),
(10, 'Tutors & Coaching'),
(10, 'Books & Study Materials'),
(10, 'Schools & Colleges'),
(10, 'Language Learning'),
(10, 'Education E-Learning');

-- Sports & Outdoors (11)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(11, 'Sports Equipment & Apparel'),
(11, 'Outdoor Gear & Adventure'),
(11, 'Fitness Classes & Training'),
(11, 'Sports Nutrition & Supplements'),
(11, 'Sports Events & Ticketing'),
(11, 'Outdoor Adventure Activities');

-- Pets & Animals (12)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(12, 'Pet Food & Treats'),
(12, 'Pet Supplies & Accessories'),
(12, 'Pet Grooming'),
(12, 'Pet Health & Wellness');

-- Banking & Insurance (13)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(13, 'Banking Services'),
(13, 'Exchange Services'),
(13, 'Insurance Plans'),
(13, 'Professional Services');

-- Home Services (14)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(14, 'Home Maintenance'),
(14, 'Laundry & Cleaning'),
(14, 'Moving & Storage'),
(14, 'Construction & Painting'),
(14, 'Gardening Services');

-- Transportation & Mobility (15)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(15, 'Railway & Public Transport'),
(15, 'Taxi & Ride Services'),
(15, 'Bike & Scooter Rentals'),
(15, 'Boat & Ferry Rides'),
(15, 'Parking Services');

-- Others (16)
INSERT INTO tbl_business_subcategories (category_id, subcategory_name) VALUES
(16, 'Local Businesses'),
(16, 'Local Brands'),
(16, 'Community Services'),
(16, 'Charity & Donations'),
(16, 'Visa & Immigration Services'),
(16, 'Custom & Personalized Items'),
(16, 'Graphic Design & Branding');


-- Unified Admin/Sub-Admin table
CREATE TABLE tbl_sub_admins (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'sub_admin')) NOT NULL,
    jwt_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by BIGINT NULL, -- NULL for the first super admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (created_by) REFERENCES tbl_sub_admins(id) ON DELETE SET NULL
);


-- Sub Admin Rights table for module permissions
CREATE TABLE tbl_sub_admin_rights (
    id BIGSERIAL PRIMARY KEY,
    sub_admin_id BIGINT NOT NULL,
    module_id BIGINT NOT NULL, -- e.g., 'users', 'offers', 'reports', 'categories'
    can_view BOOLEAN DEFAULT FALSE,
    can_add BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sub_admin_id) REFERENCES tbl_sub_admins(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES tbl_admin_modules(id) ON DELETE CASCADE,
    UNIQUE(sub_admin_id, module_id)
);

-- Available modules for permissions
CREATE TABLE tbl_admin_modules (
    id BIGSERIAL PRIMARY KEY,
    module_name VARCHAR(50) UNIQUE NOT NULL,
    module_display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin modules
INSERT INTO tbl_admin_modules (module_name, module_display_name, description) VALUES
('users', 'User Management', 'Manage individual and business users'),
('offers', 'Offer Management', 'Manage offers and promotions'),
('reports', 'Report Management', 'Handle user reports and complaints'),
('categories', 'Category Management', 'Manage business and offer categories'),
('memberships', 'Membership Plans', 'Manage membership plans and pricing'),
('notifications', 'Notifications', 'Send notifications to users'),
('analytics', 'Analytics', 'View system analytics and reports'),
('settings', 'System Settings', 'Configure system settings'),
('static_pages', 'Static Pages', 'Manage static content pages'),
('country_codes', 'Country Codes', 'Manage country codes and currencies'),
('sub_admins', 'Sub Admin Management', 'Manage sub-admins and their permissions');

-- Insert the main admin (you can change the credentials)
INSERT INTO tbl_sub_admins (name, email, password, role, created_by) VALUES
('Main Admin', 'admin@redeemplus.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 'admin', NULL);


-- Insert default static pages
INSERT INTO tbl_static_pages (title, content) VALUES
('Terms and Conditions', '<h1>Terms and Conditions</h1><p>Content will be provided by client...</p>'),
('Privacy Policy', '<h1>Privacy Policy</h1><p>Content will be provided by client...</p>'),
('Help & Support', '<h1>Help & Support</h1><p>Content will be provided by client...</p>'),
('About Us', '<h1>About Us</h1><p>Content will be provided by client...</p>');

-- Insert default report reasons
INSERT INTO tbl_report_reasons (report_type, reason) VALUES
('user', 'Inappropriate behavior'),
('user', 'Spam or fake account'),
('user', 'Harassment'),
('user', 'Other'),
('offer', 'Misleading information'),
('offer', 'Inappropriate content'),
('offer', 'Expired or invalid offer'),
('offer', 'Other'),
('problem', 'Technical issue'),
('problem', 'Payment problem'),
('problem', 'Account access issue'),
('problem', 'Other');

-- Push Notification Campaigns
CREATE TABLE tbl_push_notification_campaigns (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    target_type VARCHAR(20) NOT NULL, -- 'all', 'users', 'businesses', 'specific'
    target_criteria JSONB, -- For specific targeting criteria
    created_by BIGINT, -- Admin ID who created the campaign
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'failed'
    total_recipients INTEGER DEFAULT 0,
    successful_sends INTEGER DEFAULT 0,
    failed_sends INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES tbl_sub_admins(id) ON DELETE SET NULL
);

-- Push Notification Recipients
CREATE TABLE tbl_push_notification_recipients (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    device_id BIGINT,
    fcm_token TEXT NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'sent', 'failed', 'delivered'
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES tbl_push_notification_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES tbl_device_info(id) ON DELETE SET NULL
);