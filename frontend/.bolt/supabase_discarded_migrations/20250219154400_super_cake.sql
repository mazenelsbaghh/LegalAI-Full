/*
  # Add Sample Data for Legal Management System

  1. Sample Data
    - Clients (individuals and companies)
    - Cases (with different statuses)
    - Appointments (court sessions, meetings, deadlines)
    - Documents (drafts and finals)
    - Invoices (paid, unpaid, overdue)
    - Invoice items

  2. Notes
    - All data is linked to the test lawyer account
    - Uses realistic Arabic names and content
    - Maintains referential integrity
*/

DO $$ 
DECLARE
  lawyer_id UUID;
  client_id1 UUID;
  client_id2 UUID;
  client_id3 UUID;
  client_id4 UUID;
  case_id1 UUID;
  case_id2 UUID;
  case_id3 UUID;
  case_id4 UUID;
BEGIN
  -- Get the lawyer's ID
  SELECT id INTO STRICT lawyer_id FROM profiles WHERE email = 'lawyer@example.com' LIMIT 1;

  -- Insert clients and store their IDs
  INSERT INTO clients (name, email, phone, address, type, lawyer_id)
  VALUES 
    ('أحمد محمد علي', 'ahmed@example.com', '+20 123 456 789', 'القاهرة، مصر', 'individual', lawyer_id)
  RETURNING id INTO client_id1;

  INSERT INTO clients (name, email, phone, address, type, lawyer_id)
  VALUES 
    ('شركة الأمل التجارية', 'info@alamal.com', '+20 111 222 333', 'الإسكندرية، مصر', 'company', lawyer_id)
  RETURNING id INTO client_id2;

  INSERT INTO clients (name, email, phone, address, type, lawyer_id)
  VALUES 
    ('محمد أحمد حسن', 'mohamed@example.com', '+20 999 888 777', 'الجيزة، مصر', 'individual', lawyer_id)
  RETURNING id INTO client_id3;

  INSERT INTO clients (name, email, phone, address, type, lawyer_id)
  VALUES 
    ('شركة النور للمقاولات', 'info@alnour.com', '+20 444 555 666', 'القاهرة، مصر', 'company', lawyer_id)
  RETURNING id INTO client_id4;

  -- Insert cases and store their IDs
  INSERT INTO cases (title, type, court, status, client_id, lawyer_id)
  VALUES
    ('قضية تعويض مدني', 'مدني', 'محكمة القاهرة الابتدائية', 'open', client_id1, lawyer_id)
  RETURNING id INTO case_id1;

  INSERT INTO cases (title, type, court, status, client_id, lawyer_id)
  VALUES
    ('نزاع عقود تجارية', 'تجاري', 'محكمة الإسكندرية الاقتصادية', 'in_progress', client_id2, lawyer_id)
  RETURNING id INTO case_id2;

  INSERT INTO cases (title, type, court, status, client_id, lawyer_id)
  VALUES
    ('قضية عقارية', 'عقاري', 'محكمة الجيزة الابتدائية', 'open', client_id3, lawyer_id)
  RETURNING id INTO case_id3;

  INSERT INTO cases (title, type, court, status, client_id, lawyer_id)
  VALUES
    ('نزاع عمل', 'عمالي', 'محكمة العمل', 'closed', client_id4, lawyer_id)
  RETURNING id INTO case_id4;

  -- Insert appointments
  INSERT INTO appointments (title, type, date, location, notes, case_id, client_id, lawyer_id)
  VALUES
    ('جلسة محكمة - قضية تعويض مدني', 'court', NOW() + INTERVAL '5 days', 'محكمة القاهرة الابتدائية', 'تقديم مذكرة الدفاع', case_id1, client_id1, lawyer_id),
    ('اجتماع مع العميل', 'meeting', NOW() + INTERVAL '2 days', 'مكتب المحاماة', 'مناقشة تفاصيل القضية', case_id2, client_id2, lawyer_id),
    ('موعد نهائي لتقديم المستندات', 'deadline', NOW() + INTERVAL '7 days', 'محكمة الإسكندرية الاقتصادية', 'تقديم المستندات المطلوبة', case_id2, client_id2, lawyer_id);

  -- Insert documents
  INSERT INTO documents (title, type, content, status, case_id, client_id, lawyer_id)
  VALUES
    ('مذكرة دفاع - قضية تعويض مدني', 'defense', 'محتوى مذكرة الدفاع...', 'draft', case_id1, client_id1, lawyer_id),
    ('عقد تجاري - شركة الأمل', 'contract', 'محتوى العقد التجاري...', 'final', case_id2, client_id2, lawyer_id),
    ('صحيفة دعوى - قضية عقارية', 'claim', 'محتوى صحيفة الدعوى...', 'final', case_id3, client_id3, lawyer_id);

  -- Insert invoices and their items
  WITH new_invoice1 AS (
    INSERT INTO invoices (amount, status, due_date, client_id, lawyer_id)
    VALUES (5000, 'unpaid', NOW() + INTERVAL '30 days', client_id1, lawyer_id)
    RETURNING id
  )
  INSERT INTO invoice_items (description, amount, invoice_id)
  SELECT 'استشارة قانونية', 2500, id FROM new_invoice1
  UNION ALL
  SELECT 'إعداد مستندات', 2500, id FROM new_invoice1;

  WITH new_invoice2 AS (
    INSERT INTO invoices (amount, status, due_date, client_id, lawyer_id)
    VALUES (8000, 'paid', NOW() + INTERVAL '15 days', client_id2, lawyer_id)
    RETURNING id
  )
  INSERT INTO invoice_items (description, amount, invoice_id)
  SELECT 'استشارة قانونية', 4000, id FROM new_invoice2
  UNION ALL
  SELECT 'إعداد مستندات', 4000, id FROM new_invoice2;

  WITH new_invoice3 AS (
    INSERT INTO invoices (amount, status, due_date, client_id, lawyer_id)
    VALUES (3000, 'overdue', NOW() - INTERVAL '5 days', client_id3, lawyer_id)
    RETURNING id
  )
  INSERT INTO invoice_items (description, amount, invoice_id)
  SELECT 'استشارة قانونية', 1500, id FROM new_invoice3
  UNION ALL
  SELECT 'إعداد مستندات', 1500, id FROM new_invoice3;

END $$;