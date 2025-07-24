-- Fix the appointment status column length issue
-- The status column is too small to store enum values like "CONFIRMED", "COMPLETED", "CANCELLED"

USE bizbooker_db;

-- Check current column definition
DESCRIBE appointments;

-- Alter the status column to increase its length
ALTER TABLE appointments MODIFY COLUMN status VARCHAR(20) NOT NULL;

-- Verify the change
DESCRIBE appointments;

-- Optional: Update any existing data that might be truncated
-- (This should not be needed if no data was actually inserted)
SELECT id, status FROM appointments WHERE status IS NOT NULL;
