-- Full schema with all original columns from Excel file
-- Entity column is added as a new column (not in original data)

-- Sales Data Table with all original columns
CREATE TABLE sales_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Added column: Entity (selected by user during upload)
    entity VARCHAR(50) NOT NULL,
    
    -- Auto-generated columns from Invoice date
    year INTEGER,
    quarter VARCHAR(2),
    
    -- Original columns from Excel (allowing NULL for flexibility)
    sales_type VARCHAR(100),
    invoice VARCHAR(100),
    voucher VARCHAR(100),
    invoice_date DATE,
    pool VARCHAR(100),
    supply_method VARCHAR(100),
    sub_method_1 VARCHAR(100),
    sub_method_2 VARCHAR(100),
    sub_method_3 VARCHAR(100),
    application VARCHAR(100),
    industry VARCHAR(100),
    sub_industry_1 VARCHAR(100),
    sub_industry_2 VARCHAR(100),
    general_group VARCHAR(100),
    sales_order VARCHAR(100),
    account_number VARCHAR(100),
    name VARCHAR(200),
    name2 VARCHAR(200),
    customer_invoice_account VARCHAR(100),
    invoice_account VARCHAR(100),
    "group" VARCHAR(100),
    currency VARCHAR(10),
    invoice_amount DECIMAL(15, 2),
    invoice_amount_mst DECIMAL(15, 2),
    sales_tax_amount DECIMAL(15, 2),
    sales_tax_amount_accounting DECIMAL(15, 2),
    total_for_invoice DECIMAL(15, 2),
    total_mst DECIMAL(15, 2),
    open_balance DECIMAL(15, 2),
    due_date DATE,
    sales_tax_group VARCHAR(100),
    payment_type VARCHAR(100),
    terms_of_payment VARCHAR(100),
    payment_schedule VARCHAR(100),
    method_of_payment VARCHAR(100),
    posting_profile VARCHAR(100),
    delivery_terms VARCHAR(100),
    h_dim_wk VARCHAR(100),
    h_wk_name VARCHAR(200),
    h_dim_cc VARCHAR(100),
    h_dim_name VARCHAR(200),
    line_number INTEGER,
    street VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_postal_code VARCHAR(50),
    final_zipcode VARCHAR(50),
    region VARCHAR(100),
    product_type VARCHAR(100),
    item_group VARCHAR(100),
    category VARCHAR(100),
    model VARCHAR(100),
    item_number VARCHAR(100),
    product_name VARCHAR(200),
    text TEXT,
    warehouse VARCHAR(100),
    name3 VARCHAR(200),
    quantity DECIMAL(15, 2),
    inventory_unit VARCHAR(50),
    price_unit DECIMAL(15, 2),
    net_amount DECIMAL(15, 2),
    line_amount_mst DECIMAL(15, 2),
    sales_tax_group2 VARCHAR(100),
    tax_item_group VARCHAR(100),
    mode_of_delivery VARCHAR(100),
    dlv_detail VARCHAR(200),
    online_order VARCHAR(100),
    sales_channel VARCHAR(100),
    promotion VARCHAR(100),
    second_sales VARCHAR(100),
    personnel_number VARCHAR(100),
    worker_name VARCHAR(200),
    l_dim_name VARCHAR(200),
    l_dim_wk VARCHAR(100),
    l_wk_name VARCHAR(200),
    l_dim_cc VARCHAR(100),
    main_account VARCHAR(100),
    account_name VARCHAR(200),
    rebate DECIMAL(15, 2),
    description TEXT,
    country VARCHAR(100),
    created_date TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100),
    exception VARCHAR(200),
    with_collection_agency VARCHAR(100),
    credit_rating VARCHAR(100),
    
    -- Metadata columns
    upload_batch_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_entity CHECK (entity IN ('HQ', 'USA', 'BWA', 'Vietnam', 'Healthcare', 'Korot')),
    CONSTRAINT valid_quarter CHECK (quarter IS NULL OR quarter IN ('Q1', 'Q2', 'Q3', 'Q4'))
);

-- Upload History Table
CREATE TABLE upload_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL UNIQUE,
    entity VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    rows_uploaded INTEGER,
    status VARCHAR(20),
    error_message TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sales_entity ON sales_data(entity);
CREATE INDEX idx_sales_year ON sales_data(year);
CREATE INDEX idx_sales_quarter ON sales_data(quarter);
CREATE INDEX idx_sales_invoice_date ON sales_data(invoice_date);
CREATE INDEX idx_sales_category ON sales_data(category);
CREATE INDEX idx_sales_product_name ON sales_data(product_name);
CREATE INDEX idx_sales_region ON sales_data(region);
CREATE INDEX idx_sales_currency ON sales_data(currency);
