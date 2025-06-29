-- Check Purchases Table Schema
-- Run this first to verify the structure of your purchases table

-- ===================================================
-- SCHEMA VERIFICATION
-- ===================================================

-- Check what columns exist in the purchases table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'purchases'
ORDER BY ordinal_position;

-- Sample data from purchases table
SELECT 'SAMPLE PURCHASES DATA' as info;
SELECT * FROM public.purchases LIMIT 3;

-- Count existing purchases
SELECT 
    'PURCHASES COUNT' as info,
    COUNT(*) as total_purchases
FROM public.purchases;

-- Check if transactions table exists
SELECT 
    'TRANSACTIONS TABLE CHECK' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'transactions'
        ) 
        THEN 'EXISTS: Transactions table is ready'
        ELSE 'MISSING: Run transactions-setup.sql first'
    END as status;

-- Simple test migration (just 1 record)
DO $$
DECLARE
    test_purchase_id UUID;
    purchase_exists BOOLEAN;
BEGIN
    -- Get first purchase ID
    SELECT id INTO test_purchase_id 
    FROM public.purchases 
    LIMIT 1;
    
    IF test_purchase_id IS NOT NULL THEN
        -- Check if this purchase already has a transaction
        SELECT EXISTS(
            SELECT 1 FROM public.transactions 
            WHERE purchase_id = test_purchase_id
        ) INTO purchase_exists;
        
        IF NOT purchase_exists THEN
            RAISE NOTICE 'Testing migration with purchase ID: %', test_purchase_id;
            
            -- Try to insert one test transaction
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
                notes
            )
            SELECT 
                p.id,
                p.resident_id,
                p.product_id,
                'purchase',
                p.amount_paid,
                'cash',
                p.sticker_number,
                'completed',
                p.purchase_date,
                'Test migration record'
            FROM public.purchases p
            WHERE p.id = test_purchase_id;
            
            RAISE NOTICE 'SUCCESS: Test transaction created successfully!';
            RAISE NOTICE 'You can now run the full migration script.';
            
            -- Clean up test record
            DELETE FROM public.transactions 
            WHERE purchase_id = test_purchase_id 
            AND notes = 'Test migration record';
            
            RAISE NOTICE 'Test record cleaned up.';
        ELSE
            RAISE NOTICE 'This purchase already has a transaction record.';
        END IF;
    ELSE
        RAISE NOTICE 'No purchases found in the database.';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR during test: %', SQLERRM;
    RAISE NOTICE 'Please check your database schema and try again.';
END $$;
