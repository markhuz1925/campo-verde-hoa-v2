-- Transactions Table Setup for Campo Verde HOA v2
-- This script creates the transactions table and related functionality

-- ===================================================
-- 1. CREATE TRANSACTIONS TABLE
-- ===================================================

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL DEFAULT 'purchase', -- 'purchase', 'refund', 'adjustment'
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash', -- 'cash', 'check', 'bank_transfer', 'gcash'
    reference_number VARCHAR(100), -- Receipt number, check number, etc.
    
    -- Transaction Status
    status VARCHAR(20) NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'cancelled', 'refunded'
    
    -- Metadata
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_by UUID, -- Admin/user who processed the transaction
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ===================================================

CREATE INDEX IF NOT EXISTS idx_transactions_purchase_id ON public.transactions(purchase_id);
CREATE INDEX IF NOT EXISTS idx_transactions_resident_id ON public.transactions(resident_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON public.transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type);

-- ===================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ===================================================

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all transactions
CREATE POLICY "Allow authenticated users to view transactions" ON public.transactions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to insert transactions
CREATE POLICY "Allow authenticated users to create transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update transactions
CREATE POLICY "Allow authenticated users to update transactions" ON public.transactions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ===================================================
-- 4. TRIGGER FOR UPDATED_AT
-- ===================================================

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to transactions table
CREATE TRIGGER handle_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ===================================================
-- 5. FUNCTION TO CREATE TRANSACTION FROM PURCHASE
-- ===================================================

CREATE OR REPLACE FUNCTION public.create_transaction_from_purchase(
    p_purchase_id UUID,
    p_payment_method VARCHAR(50) DEFAULT 'cash',
    p_reference_number VARCHAR(100) DEFAULT NULL,
    p_processed_by UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    transaction_id UUID;
    purchase_record RECORD;
BEGIN
    -- Get purchase details
    SELECT * INTO purchase_record
    FROM public.purchases
    WHERE id = p_purchase_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase with ID % not found', p_purchase_id;
    END IF;
    
    -- Create transaction record
    INSERT INTO public.transactions (
        purchase_id,
        resident_id,
        product_id,
        transaction_type,
        amount,
        payment_method,
        reference_number,
        status,
        transaction_date,
        processed_by,
        notes
    ) VALUES (
        p_purchase_id,
        purchase_record.resident_id,
        purchase_record.product_id,
        'purchase',
        purchase_record.amount_paid,
        p_payment_method,
        p_reference_number,
        'completed',
        purchase_record.purchase_date,
        p_processed_by,
        p_notes
    ) RETURNING id INTO transaction_id;
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- 6. TRIGGER TO AUTO-CREATE TRANSACTIONS
-- ===================================================

-- Function to automatically create transaction when purchase is created
CREATE OR REPLACE FUNCTION public.auto_create_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Create transaction for new purchase
    PERFORM public.create_transaction_from_purchase(
        NEW.id,
        'cash', -- Default payment method
        NULL,   -- No reference number
        NULL,   -- No specific processor
        'Auto-generated from purchase'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on purchases table
CREATE TRIGGER auto_create_transaction_trigger
    AFTER INSERT ON public.purchases
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_create_transaction();

-- ===================================================
-- 7. VIEWS FOR ANALYTICS
-- ===================================================

-- View: Transaction summary with all related data
CREATE OR REPLACE VIEW public.transactions_detailed AS
SELECT 
    t.*,
    r.name as resident_name,
    r.phase,
    r.block,
    r.lot,
    pr.name as product_name,
    pr.color as product_color,
    p.driver_name,
    p.plate_number,
    p.sticker_number,
    p.af_number,
    p.type as purchase_type
FROM public.transactions t
LEFT JOIN public.residents r ON t.resident_id = r.id
LEFT JOIN public.products pr ON t.product_id = pr.id
LEFT JOIN public.purchases p ON t.purchase_id = p.id;

-- View: Monthly transaction summary
CREATE OR REPLACE VIEW public.monthly_transaction_summary AS
SELECT 
    DATE_TRUNC('month', transaction_date) as month,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount,
    COUNT(DISTINCT resident_id) as unique_residents,
    COUNT(DISTINCT product_id) as unique_products
FROM public.transactions
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;

-- View: Product performance summary
CREATE OR REPLACE VIEW public.product_transaction_summary AS
SELECT 
    pr.id as product_id,
    pr.name as product_name,
    pr.color as product_color,
    COUNT(t.id) as transaction_count,
    SUM(t.amount) as total_revenue,
    AVG(t.amount) as average_amount,
    MAX(t.transaction_date) as last_transaction_date
FROM public.products pr
LEFT JOIN public.transactions t ON pr.id = t.product_id AND t.status = 'completed'
GROUP BY pr.id, pr.name, pr.color
ORDER BY total_revenue DESC NULLS LAST;

-- ===================================================
-- 8. SAMPLE DATA (Optional - for testing)
-- ===================================================

-- Note: Uncomment this section if you want to create sample transactions
-- for existing purchases (this will only work if you have existing data)

/*
-- Create transactions for existing purchases
INSERT INTO public.transactions (
    purchase_id,
    resident_id,
    product_id,
    transaction_type,
    amount,
    payment_method,
    status,
    transaction_date,
    notes
)
SELECT 
    p.id,
    p.resident_id,
    p.product_id,
    'purchase',
    p.amount_paid,
    'cash',
    'completed',
    p.purchase_date,
    'Migrated from existing purchase data'
FROM public.purchases p
WHERE NOT EXISTS (
    SELECT 1 FROM public.transactions t 
    WHERE t.purchase_id = p.id
);
*/

-- ===================================================
-- 9. GRANT PERMISSIONS
-- ===================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.transactions TO authenticated;
GRANT SELECT ON public.transactions_detailed TO authenticated;
GRANT SELECT ON public.monthly_transaction_summary TO authenticated;
GRANT SELECT ON public.product_transaction_summary TO authenticated;

-- ===================================================
-- SCRIPT COMPLETION
-- ===================================================

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Transactions table setup completed successfully!';
    RAISE NOTICE 'Tables created: transactions';
    RAISE NOTICE 'Views created: transactions_detailed, monthly_transaction_summary, product_transaction_summary';
    RAISE NOTICE 'Triggers created: auto_create_transaction_trigger';
    RAISE NOTICE 'Functions created: create_transaction_from_purchase, auto_create_transaction';
    RAISE NOTICE 'Ready for use!';
END $$;
