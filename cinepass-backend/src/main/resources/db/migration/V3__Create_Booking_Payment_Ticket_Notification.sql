CREATE TABLE seats (
    id BIGSERIAL PRIMARY KEY,
    seat_number VARCHAR(10) NOT NULL,
    row_label VARCHAR(5) NOT NULL,
    column_number INT NOT NULL,
    seat_type VARCHAR(20) NOT NULL,
    seat_status VARCHAR(20) NOT NULL,
    show_id BIGINT NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    version BIGINT NOT NULL DEFAULT 0,
    UNIQUE (show_id, row_label, column_number),
    UNIQUE (show_id, seat_number)
);

CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_id VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    show_id BIGINT NOT NULL REFERENCES shows(id),
    total_amount DOUBLE PRECISION NOT NULL,
    booking_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE booking_seats (
    booking_id BIGINT NOT NULL REFERENCES bookings(id),
    seat_id BIGINT NOT NULL REFERENCES seats(id),
    PRIMARY KEY (booking_id, seat_id)
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    booking_id BIGINT NOT NULL REFERENCES bookings(id),
    amount DOUBLE PRECISION NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_number VARCHAR(255) UNIQUE NOT NULL,
    booking_id BIGINT NOT NULL REFERENCES bookings(id),
    qr_code_path VARCHAR(500),
    pdf_path VARCHAR(500),
    ticket_status VARCHAR(50) NOT NULL,
    generated_at TIMESTAMP
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE daily_analytics (
    id BIGSERIAL PRIMARY KEY,
    analytics_date DATE UNIQUE NOT NULL,
    total_users INTEGER NOT NULL,
    total_bookings INTEGER NOT NULL,
    total_revenue DOUBLE PRECISION NOT NULL,
    occupancy_rate DOUBLE PRECISION NOT NULL,
    cancelled_bookings INTEGER NOT NULL
);
