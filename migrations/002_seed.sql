INSERT INTO customers (name, email, phone) VALUES
 ('Jane Doe','jane@example.com','08030000001'),
 ('John Smith','john@example.com','08030000002')
ON CONFLICT DO NOTHING;

-- Demo accounts (fake numbers)
INSERT INTO accounts (customer_id, account_number, type, status, balance)
SELECT id, '1000000001','savings'::account_type,'active'::account_status,0 FROM customers WHERE email='jane@example.com'
UNION ALL
SELECT id, '1000000002','current'::account_type,'active'::account_status,0 FROM customers WHERE email='john@example.com';
-- ON CONFLICT DO NOTHING;
