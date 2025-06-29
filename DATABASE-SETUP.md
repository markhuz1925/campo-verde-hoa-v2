# Database Setup Guide - Transactions Feature

## 🎯 Overview

This guide will help you set up the transactions table and related database components needed for the transactions dashboard to work properly.

## 📋 Prerequisites

- Supabase project set up and running
- Access to Supabase SQL Editor or database management tool
- Existing tables: `residents`, `products`, `purchases`

## 🚀 Step-by-Step Implementation

### **Step 1: Run the SQL Script**

1. **Navigate to Supabase Dashboard**
   - Go to your Supabase project
   - Click on "SQL Editor" in the left sidebar

2. **Execute the Setup Script**
   - Copy the entire content from `database/transactions-setup.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

3. **Verify Success**
   - Look for success messages in the output
   - Should see: "Transactions table setup completed successfully!"

### **Step 2: Verify Database Structure**

After running the script, you should have:

#### **New Table:**
- `transactions` - Main transactions table

#### **New Views:**
- `transactions_detailed` - Transactions with joined data from residents and products
- `monthly_transaction_summary` - Monthly aggregated data
- `product_transaction_summary` - Product performance data

#### **New Functions:**
- `create_transaction_from_purchase()` - Manually create transactions
- `auto_create_transaction()` - Automatic transaction creation trigger

#### **New Trigger:**
- `auto_create_transaction_trigger` - Runs on purchase inserts

### **Step 3: Test the Setup**

1. **Create a Test Purchase**
   ```sql
   -- Example: Insert a test purchase (adjust IDs to match your data)
   INSERT INTO purchases (
     resident_id, 
     product_id, 
     amount_paid, 
     driver_name, 
     sticker_number, 
     plate_number, 
     af_number, 
     penalty, 
     type
   ) VALUES (
     'your-resident-id',
     'your-product-id',
     500.00,
     'Test Driver',
     'TEST001',
     'ABC123',
     'AF001',
     false,
     'New Application'
   );
   ```

2. **Check Transaction Creation**
   ```sql
   -- Verify transaction was auto-created
   SELECT * FROM transactions_detailed ORDER BY created_at DESC LIMIT 5;
   ```

3. **Test Dashboard Data**
   ```sql
   -- Check if dashboard data is available
   SELECT * FROM monthly_transaction_summary;
   SELECT * FROM product_transaction_summary;
   ```

### **Step 4: Migrate Existing Data (Optional)**

If you have existing purchases, create transactions for them:

```sql
-- Uncomment and run this section in the SQL script
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
```

## 🔍 Verification Checklist

- [ ] SQL script executed without errors
- [ ] `transactions` table exists with proper structure
- [ ] Views are created and accessible
- [ ] Trigger works (new purchases create transactions)
- [ ] Permissions are set correctly
- [ ] Test data shows in transactions dashboard

## 🚨 Troubleshooting

### **Common Issues:**

1. **Permission Errors**
   - Ensure you have admin access to the database
   - Check if RLS policies are properly applied

2. **Missing Dependencies**
   - Verify `residents`, `products`, and `purchases` tables exist
   - Check that foreign key references are valid

3. **Trigger Not Working**
   - Test by inserting a purchase manually
   - Check if `auto_create_transaction_trigger` exists

4. **View Access Issues**
   - Ensure views are granted SELECT permissions
   - Check if authenticated role has proper access

### **Verification Queries:**

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('transactions', 'purchases', 'residents', 'products');

-- Check if views exist
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' AND table_name LIKE '%transaction%';

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'auto_create_transaction_trigger';

-- Test permissions
SELECT * FROM transactions_detailed LIMIT 1;
```

## 📊 Dashboard Integration

Once the database setup is complete:

1. **Start the development server**: `npm run dev`
2. **Navigate to Transactions**: Click "Transactions" in the sidebar
3. **Verify data visualization**: Charts should display transaction data
4. **Test responsiveness**: Check mobile and desktop layouts

## 🔄 Next Steps

After successful setup:

1. **Add sample data** for testing charts
2. **Configure payment methods** in your application
3. **Set up automated backups** for transaction data
4. **Consider implementing real-time subscriptions** for live updates

## 💡 Tips

- **Start with test data** to verify everything works
- **Monitor performance** with database indexes
- **Regular backups** of transaction data are recommended
- **Consider data retention policies** for old transactions

## 🆘 Support

If you encounter issues:

1. Check the Supabase logs for detailed error messages
2. Verify your database schema matches the expected structure
3. Test with minimal data first before migrating large datasets
4. Review the SQL script for any syntax issues specific to your PostgreSQL version
