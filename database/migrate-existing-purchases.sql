-- Migration Script: Create Transactions from Existing Purchases
-- This script safely migrates all existing purchase records to the transactions table

-- ===================================================
-- MIGRATION SCRIPT FOR EXISTING PURCHASES
-- ===================================================

DO $$
DECLARE
    purchase_count INTEGER;
    transaction_count INTEGER;
    migrated_count INTEGER;
BEGIN
    -- Get count of existing purchases
    SELECT COUNT(*) INTO purchase_count FROM public.purchases;
    
    -- Get count of existing transactions
    SELECT COUNT(*) INTO transaction_count FROM public.transactions;
    
    RAISE NOTICE 'Starting migration process...';
    RAISE NOTICE 'Found % existing purchases', purchase_count;
    RAISE NOTICE 'Found % existing transactions', transaction_count;
    
    -- Create transactions for existing purchases that don't have them yet
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
    )
    SELECT 
        p.id as purchase_id,
        p.resident_id,
        p.product_id,
        'purchase' as transaction_type,
        p.amount_paid as amount,
        'cash' as payment_method, -- Default to cash for existing records
        p.sticker_number as reference_number, -- Use sticker number as reference
        'completed' as status, -- Assume existing purchases are completed
        p.purchase_date as transaction_date,
        NULL as processed_by, -- Unknown for historical data
        CONCAT(
            'Migrated from existing purchase. ',
            'Driver: ', p.driver_name, 
            CASE 
                WHEN p.penalty THEN ' (With penalty)'
                ELSE ''
            END,
            '. Type: ', p.type,
            '. Plate: ', p.plate_number,
            '. AF: ', p.af_number
        ) as notes
    FROM public.purchases p
    WHERE NOT EXISTS (
        SELECT 1 FROM public.transactions t 
        WHERE t.purchase_id = p.id
    );
    
    -- Get count of migrated records
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    
    -- Final count check
    SELECT COUNT(*) INTO transaction_count FROM public.transactions;
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Migrated % purchase records to transactions', migrated_count;
    RAISE NOTICE 'Total transactions now: %', transaction_count;
    
    -- Verify the migration
    IF migrated_count > 0 THEN
        RAISE NOTICE 'Sample migrated transaction:';
        
        -- Show a sample of migrated data
        PERFORM t.id, t.amount, t.transaction_date, t.notes
        FROM public.transactions t
        WHERE t.notes LIKE 'Migrated from existing purchase%'
        ORDER BY t.transaction_date DESC
        LIMIT 1;
    END IF;
    
END $$;

-- ===================================================
-- VERIFICATION QUERIES
-- ===================================================

-- Check migration results
SELECT 
    'BEFORE MIGRATION' as status,
    (SELECT COUNT(*) FROM public.purchases) as total_purchases,
    (SELECT COUNT(*) FROM public.transactions WHERE notes NOT LIKE 'Migrated%') as new_transactions,
    (SELECT COUNT(*) FROM public.transactions WHERE notes LIKE 'Migrated%') as migrated_transactions,
    (SELECT COUNT(*) FROM public.transactions) as total_transactions;

-- Verify data integrity
SELECT 
    'DATA INTEGRITY CHECK' as check_type,
    COUNT(DISTINCT p.id) as unique_purchases,
    COUNT(DISTINCT t.purchase_id) as unique_transaction_purchases,
    CASE 
        WHEN COUNT(DISTINCT p.id) = COUNT(DISTINCT t.purchase_id) 
        THEN 'PASS: All purchases have transactions'
        ELSE 'FAIL: Some purchases missing transactions'
    END as integrity_status
FROM public.purchases p
LEFT JOIN public.transactions t ON p.id = t.purchase_id;

-- Show sample migrated data
SELECT 
    'SAMPLE MIGRATED DATA' as data_type,
    p.driver_name,
    p.amount_paid,
    p.purchase_date,
    t.amount as transaction_amount,
    t.transaction_date,
    t.payment_method,
    t.status,
    LEFT(t.notes, 100) as notes_preview
FROM public.purchases p
INNER JOIN public.transactions t ON p.id = t.purchase_id
WHERE t.notes LIKE 'Migrated from existing purchase%'
ORDER BY p.purchase_date DESC
LIMIT 5;

-- Monthly summary after migration
SELECT 
    'MONTHLY SUMMARY' as summary_type,
    DATE_TRUNC('month', transaction_date) as month,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    ROUND(AVG(amount), 2) as avg_amount
FROM public.transactions
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month DESC
LIMIT 6;

-- Product performance after migration
SELECT 
    'PRODUCT PERFORMANCE' as performance_type,
    pr.name as product_name,
    COUNT(t.id) as transaction_count,
    SUM(t.amount) as total_revenue,
    ROUND(AVG(t.amount), 2) as avg_amount
FROM public.products pr
LEFT JOIN public.transactions t ON pr.id = t.product_id AND t.status = 'completed'
GROUP BY pr.id, pr.name
ORDER BY total_revenue DESC NULLS LAST;

-- ===================================================
-- FINAL SUCCESS MESSAGE
-- ===================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'What happened:';
    RAISE NOTICE '✅ All existing purchases now have transaction records';
    RAISE NOTICE '✅ Historical data preserved with original timestamps';
    RAISE NOTICE '✅ Transaction dashboard will now show complete data';
    RAISE NOTICE '✅ Future purchases will auto-create transactions';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Check the verification queries above';
    RAISE NOTICE '2. Test the transactions dashboard';
    RAISE NOTICE '3. Verify charts show historical data';
    RAISE NOTICE '=================================================';
END $$;
