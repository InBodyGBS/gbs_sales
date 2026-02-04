-- Fix line_number column type to support decimal values
-- Run this in Supabase SQL Editor if you already have the table created

ALTER TABLE sales_data 
ALTER COLUMN line_number TYPE DECIMAL(10, 2);
