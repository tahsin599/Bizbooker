User table:

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER', 'OWNER', 'ADMIN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    image_name VARCHAR(255),
    image_type VARCHAR(255),
    image_data LONGBLOB
);


business table:

CREATE TABLE business (
    id SERIAL PRIMARY KEY,
    owner_id BIGINT UNSIGNED NOT NULL,
    business_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(20) DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approval_date TIMESTAMP NULL DEFAULT NULL,
	image_name VARCHAR(255),
    image_type VARCHAR(255),
    image_data LONGBLOB,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);


ALTER TABLE business
ADD COLUMN service_category_id BIGINT UNSIGNED,
ADD CONSTRAINT fk_service_category
FOREIGN KEY (service_category_id) REFERENCES service_category(id);


Business_locations table:

CREATE TABLE business_locations (
    id SERIAL PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    address TEXT NOT NULL,
    area VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business(id)
    
    
);

//drop existing foreign key constraint
ALTER TABLE business_locations
DROP FOREIGN KEY business_locations_ibfk_1;

//add new foreign key constraint and give custom constraint names
ALTER TABLE business_locations
ADD CONSTRAINT fk_business_locations_business
FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE;

service_category table:

CREATE TABLE service_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,  -- 'Salon', 'Gym', 'Spa', etc.
    image_name VARCHAR(255),
    image_type VARCHAR(255),
    image_data LONGBLOB
)


service table:

CREATE TABLE service (
  id SERIAL PRIMARY KEY,
  category_id BIGINT UNSIGNED,
  name VARCHAR(100),
  FOREIGN KEY (category_id) REFERENCES service_category(id)
);


business_service_table:

CREATE TABLE business_service (
  business_id BIGINT Unsigned,
  service_id BIGINT unsigned,
  PRIMARY KEY (business_id, service_id),
  FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES service(id)
);

Appointments table:


CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    business_id BIGINT UNSIGNED NOT NULL,
    location_id BIGINT UNSIGNED NOT NULL,
    service_id BIGINT UNSIGNED NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_by ENUM('CUSTOMER', 'BUSINESS', 'ADMIN'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES business_locations(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE
    
);

payments table:


CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    appointment_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    receipt_url VARCHAR(512),
    stripe_payment_intent_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);


rating-reviews table:

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    appointment_id BIGINT UNSIGNED NOT NULL UNIQUE,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    business_reply TEXT,
    reply_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);


coupons table:

CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    discount_type ENUM('PERCENT', 'FIXED') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    max_uses INT,
    current_uses INT DEFAULT 0,
    min_order_value DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);


coupon_redemptions table:


CREATE TABLE coupon_redemptions (
    id SERIAL PRIMARY KEY,
    coupon_id BIGINT UNSIGNED NOT NULL,
    appointment_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 



notifications table:

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



reports table:


CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_id BIGINT UNSIGNED NOT NULL,
    reported_entity_type ENUM('USER', 'BUSINESS', 'SERVICE', 'REVIEW', 'APPOINTMENT') NOT NULL,
    reported_entity_id BIGINT UNSIGNED NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('PENDING', 'IN_REVIEW', 'RESOLVED', 'DISMISSED') DEFAULT 'PENDING',
    resolved_by BIGINT UNSIGNED,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);


ai-assistant tables:

CREATE TABLE ai_conversations (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);


CREATE TABLE ai_messages (
    id SERIAL PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    user_message TEXT NOT NULL,
    ai_reply TEXT, -- NULL until AI responds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
);















