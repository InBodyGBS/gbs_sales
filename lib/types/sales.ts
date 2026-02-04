export type Entity = 'HQ' | 'USA' | 'BWA' | 'Vietnam' | 'Healthcare' | 'Korot' | 'All';

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface SalesData {
  id: string;
  entity: Entity;
  sale_date: string;
  year: number;
  quarter: Quarter;
  category: string | null;
  product: string;
  region: string | null;
  currency: string;
  sales_amount: number;
  quantity: number;
  upload_batch_id: string | null;
  created_at: string;
}

export interface UploadHistory {
  id: string;
  batch_id: string;
  entity: Entity;
  file_name: string;
  file_path: string | null;
  rows_uploaded: number | null;
  status: string;
  error_message: string | null;
  uploaded_at: string;
}

export interface QuarterlySummary {
  quarter: Quarter;
  sales_amount: number;
  quantity: number;
}

export interface SalesSummary {
  total_sales: number;
  total_quantity: number;
  average_transaction: number;
  active_products: number;
  quarterly: QuarterlySummary[];
}

export interface CategoryData {
  category: string;
  sales_amount: number;
  quantity: number;
}

export interface ProductData {
  product: string;
  sales_amount: number;
  quantity: number;
}

export interface RegionData {
  region: string;
  sales_amount: number;
  quantity: number;
}

export interface CurrencyData {
  currency: string;
  sales_amount: number;
}

export interface TrendData {
  quarter: string;
  sales_amount: number;
  quantity: number;
}

export interface SalesBreakdown {
  categoryData: CategoryData[];
  productData: ProductData[];
  regionData: RegionData[];
  currencyData: CurrencyData[];
  trendData: TrendData[];
}

export interface ExcelRow {
  // Original Excel columns (case-insensitive matching)
  'Sales Type'?: string;
  'Invoice'?: string;
  'Voucher'?: string;
  'Invoice date'?: string | number;
  'Pool'?: string;
  'Supply method'?: string;
  'Sub Method - 1'?: string;
  'Sub Method - 2'?: string;
  'Sub Method - 3'?: string;
  'Application'?: string;
  'Industry'?: string;
  'Sub Industry - 1'?: string;
  'Sub Industry - 2'?: string;
  'General group'?: string;
  'Sales order'?: string;
  'Account number'?: string;
  'Name'?: string;
  'Name2'?: string;
  'Customer invoice account'?: string;
  'Invoice account'?: string;
  'Group'?: string;
  'Currency'?: string;
  'Invoice Amount'?: number | string;
  'Invoice Amount_MST'?: number | string;
  'Sales tax amount'?: number | string;
  'The sales tax amount, in the accounting currency'?: number | string;
  'Total for invoice'?: number | string;
  'Total_MST'?: number | string;
  'Open balance'?: number | string;
  'Due date'?: string | number;
  'Sales tax group'?: string;
  'Payment type'?: string;
  'Terms of payment'?: string;
  'Payment schedule'?: string;
  'Method of payment'?: string;
  'Posting profile'?: string;
  'Delivery terms'?: string;
  'H_DIM_WK'?: string;
  'H_WK_NAME'?: string;
  'H_DIM_CC'?: string;
  'H DIM NAME'?: string;
  'Line number'?: number | string;
  'Street'?: string;
  'City'?: string;
  'State'?: string;
  'ZIP/postal code'?: string;
  'Final ZipCode'?: string;
  'Region'?: string;
  'Product type'?: string;
  'Item group'?: string;
  'Category'?: string;
  'Model'?: string;
  'Item number'?: string;
  'Product name'?: string;
  'Text'?: string;
  'Warehouse'?: string;
  'Name3'?: string;
  'Quantity'?: number | string;
  'Inventory unit'?: string;
  'Price unit'?: number | string;
  'Net amount'?: number | string;
  'Line Amount_MST'?: number | string;
  'Sales tax group2'?: string;
  'TaxItemGroup'?: string;
  'Mode of delivery'?: string;
  'Dlv Detail'?: string;
  'Online order'?: string;
  'Sales channel'?: string;
  'Promotion'?: string;
  '2nd Sales'?: string;
  'Personnel number'?: string;
  'WORKERNAME'?: string;
  'L DIM NAME'?: string;
  'L_DIM_WK'?: string;
  'L_WK_NAME'?: string;
  'L_DIM_CC'?: string;
  'Main account'?: string;
  'Account name'?: string;
  'Rebate'?: number | string;
  'Description'?: string;
  'Country'?: string;
  'CREATEDDATE'?: string | number;
  'CREATEDBY'?: string;
  'Exception'?: string;
  'With collection agency'?: string;
  'Credit rating'?: string;
  
  // Legacy support (for backward compatibility)
  Date?: string | number;
  Product?: string;
  'Sales Amount'?: number | string;
  
  [key: string]: any;
}
