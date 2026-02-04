-- Safe ALTER TABLE script - only adds missing columns or modifies existing ones
-- This preserves existing data

-- Check and add missing columns to sales_data (if any)
-- Note: This script assumes the table exists. Run check-existing-schema.sql first to see current structure.

-- Example: If a column is missing, you would add it like this:
-- ALTER TABLE sales_data ADD COLUMN IF NOT EXISTS new_column_name VARCHAR(100);

-- For now, this is a template. After running check-existing-schema.sql,
-- compare the results with the expected schema and add ALTER statements as needed.

-- Common fixes:
-- ALTER TABLE sales_data ALTER COLUMN sales_amount TYPE DECIMAL(15, 2);
-- ALTER TABLE sales_data ALTER COLUMN quantity TYPE INTEGER;
