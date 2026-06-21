-- Create Theatres Table
CREATE TABLE theatres (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    amenities TEXT,
    rating DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Screens Table
CREATE TABLE screens (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    theatre_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_theatre FOREIGN KEY (theatre_id) REFERENCES theatres(id) ON DELETE CASCADE
);

-- Create Shows Table
CREATE TABLE shows (
    id BIGSERIAL PRIMARY KEY,
    tmdb_movie_id INT NOT NULL,
    screen_id BIGINT NOT NULL,
    show_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    base_price DOUBLE PRECISION NOT NULL,
    language VARCHAR(50) NOT NULL,
    format VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_screen FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
);

-- Insert Mock Data: Theatres
INSERT INTO theatres (name, city, address, latitude, longitude, amenities, rating) VALUES
('PVR Select City Walk', 'Delhi', 'Select Citywalk Mall, Saket District Centre', 28.5284, 77.2183, 'Food Court, Dolby Atmos, Recliner', 4.8),
('INOX Mall of India', 'Noida', 'DLF Mall of India, Sector 18', 28.5670, 77.3208, 'IMAX, Insignia, Food Court', 4.6),
('Cinepolis Noida', 'Noida', 'Grand Venice Mall', 28.4716, 77.5340, 'VIP, Dolby 7.1', 4.3);

-- Insert Mock Data: Screens
INSERT INTO screens (name, type, capacity, theatre_id) VALUES
('Screen 1', 'IMAX', 250, 1),
('Screen 2', 'THREE_D', 150, 1),
('Screen 3', 'TWO_D', 180, 1),
('Screen 1', 'IMAX', 300, 2),
('Screen 2', 'THREE_D', 120, 2),
('Screen 3', 'TWO_D', 200, 2),
('Screen 1', 'DOLBY_ATMOS', 150, 3),
('Screen 2', 'THREE_D', 100, 3),
('Screen 3', 'TWO_D', 120, 3);

-- Insert Mock Data: Shows
-- For TMDB Movie 533535 (Deadpool & Wolverine) and 653346 (Kingdom of the Planet of the Apes)
-- Using dates relative to current month manually, or let's use CURRENT_DATE and CURRENT_DATE + 1
INSERT INTO shows (tmdb_movie_id, screen_id, show_date, start_time, end_time, base_price, language, format) VALUES
(533535, 1, CURRENT_DATE, '10:00:00', '12:30:00', 450.00, 'English', 'IMAX'),
(533535, 1, CURRENT_DATE, '13:00:00', '15:30:00', 550.00, 'English', 'IMAX'),
(533535, 1, CURRENT_DATE, '18:00:00', '20:30:00', 650.00, 'English', 'IMAX'),
(653346, 2, CURRENT_DATE, '11:00:00', '13:30:00', 350.00, 'Hindi', '3D'),
(653346, 2, CURRENT_DATE, '14:30:00', '17:00:00', 350.00, 'Hindi', '3D'),
(533535, 4, CURRENT_DATE, '10:30:00', '13:00:00', 500.00, 'English', 'IMAX'),
(533535, 4, CURRENT_DATE, '14:00:00', '16:30:00', 600.00, 'English', 'IMAX'),
(653346, 7, CURRENT_DATE + INTERVAL '1 day', '12:00:00', '14:30:00', 400.00, 'English', 'DOLBY ATMOS');
