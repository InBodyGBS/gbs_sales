-- Check if sales_data table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sales_data'
ORDER BY ordinal_position;

-- Check if upload_history table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'upload_history'
ORDER BY ordinal_position;
