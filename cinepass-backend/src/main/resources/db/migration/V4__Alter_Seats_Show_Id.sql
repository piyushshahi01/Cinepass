ALTER TABLE seats DROP CONSTRAINT seats_screen_id_fkey;
ALTER TABLE seats DROP CONSTRAINT seats_screen_id_row_label_column_number_key;
ALTER TABLE seats DROP CONSTRAINT seats_screen_id_seat_number_key;
ALTER TABLE seats RENAME COLUMN screen_id TO show_id;
ALTER TABLE seats ADD CONSTRAINT seats_show_id_fkey FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE;
ALTER TABLE seats ADD CONSTRAINT seats_show_id_row_label_column_number_key UNIQUE (show_id, row_label, column_number);
ALTER TABLE seats ADD CONSTRAINT seats_show_id_seat_number_key UNIQUE (show_id, seat_number);
