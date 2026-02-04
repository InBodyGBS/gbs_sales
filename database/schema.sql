-- Sales Data Table
CREATE TABLE sales_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity VARCHAR(50) NOT NULL,
    sale_date DATE NOT NULL,
    year INTEGER NOT NULL,
    quarter VARCHAR(2) NOT NULL,
    category VARCHAR(100),
    product VARCHAR(200) NOT NULL,
    region VARCHAR(100),
    currency VARCHAR(10) NOT NULL,
    sales_amount DECIMAL(15, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    upload_batch_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_entity CHECK (entity IN ('HQ', 'USA', 'BWA', 'Vietnam', 'Healthcare', 'Korot')),
    CONSTRAINT valid_quarter CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    CONSTRAINT positive_amount CHECK (sales_amount >= 0),
    CONSTRAINT positive_quantity CHECK (quantity >= 0)
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
CREATE INDEX idx_sales_date ON sales_data(sale_date);
CREATE INDEX idx_sales_category ON sales_data(category);
CREATE INDEX idx_sales_product ON sales_data(product);
