INSERT INTO customers (name, email, phone) VALUES
 ('Amos Florence','iamflorence@example.com','08031234211'),
 ('Quadri Ayo','ayomideq@example.com','08033422132')
ON CONFLICT DO NOTHING;

-- Demo accounts (fake numbers)
INSERT INTO accounts (customer_id, account_number, type, status, balance)
SELECT id, '1000000001','savings'::account_type,'active'::account_status,0 FROM customers WHERE email='iamflorence@example.com'
UNION ALL
SELECT id, '1000000002','current'::account_type,'active'::account_status,0 FROM customers WHERE email='ayomideq@example.com';
-- ON CONFLICT DO NOTHING;
