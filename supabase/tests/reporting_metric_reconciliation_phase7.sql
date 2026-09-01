begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- A deterministic two-branch business ledger. Inventory and transfer state is
-- created through the production workflows; commercial documents use their
-- authoritative posted-row architecture so every reporting term is explicit.
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('37100000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','reconcile-owner@test.invalid','',now(),'{}','{}',now(),now());
update public.profiles set role_id='10000000-0000-4000-8000-000000000002',is_active=true where id='37100000-0000-4000-8000-000000000001';
insert into public.branches(id,code,name,address,phone) values
('47100000-0000-4000-8000-000000000001','REC-A','Reconciliation Branch A','Test','000'),
('47100000-0000-4000-8000-000000000002','REC-B','Reconciliation Branch B','Test','000');
insert into public.categories(id,name,slug) values('61100000-0000-4000-8000-000000000001','Reconciliation Products','reconciliation-products');
insert into public.units_of_measure(id,code,name,symbol) values('62100000-0000-4000-8000-000000000001','RECPCS','Reconciliation Pieces','pc');
insert into public.products(id,name,category_id,unit_of_measure_id,status) values('64100000-0000-4000-8000-000000000001','Reconciliation Product','61100000-0000-4000-8000-000000000001','62100000-0000-4000-8000-000000000001','DRAFT');
insert into public.product_variants(id,product_id,name,sku,is_default) values
('65100000-0000-4000-8000-000000000001','64100000-0000-4000-8000-000000000001','Low','REC-LOW',true),
('65100000-0000-4000-8000-000000000002','64100000-0000-4000-8000-000000000001','Out','REC-OUT',false),
('65100000-0000-4000-8000-000000000003','64100000-0000-4000-8000-000000000001','Received','REC-RECEIVED',false),
('65100000-0000-4000-8000-000000000004','64100000-0000-4000-8000-000000000001','Transit','REC-TRANSIT',false);
update public.products set status='ACTIVE' where id='64100000-0000-4000-8000-000000000001';

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"37100000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select is(public.post_opening_stock_batch('47100000-0000-4000-8000-000000000001','[{"variant_id":"65100000-0000-4000-8000-000000000001","quantity":5,"minimum_stock_level":10},{"variant_id":"65100000-0000-4000-8000-000000000002","quantity":0,"minimum_stock_level":5},{"variant_id":"65100000-0000-4000-8000-000000000003","quantity":20,"minimum_stock_level":0},{"variant_id":"65100000-0000-4000-8000-000000000004","quantity":10,"minimum_stock_level":0}]'::jsonb,'Phase 7 reconciliation'),4,'Opening-stock workflow creates the exact inventory fixture');

create temporary table reconciliation_transfers(kind text primary key,id uuid);
insert into reconciliation_transfers values
('received',public.create_transfer('47100000-0000-4000-8000-000000000001','47100000-0000-4000-8000-000000000002','received control',true,'[{"variant_id":"65100000-0000-4000-8000-000000000003","quantity":4}]'::jsonb)),
('transit',public.create_transfer('47100000-0000-4000-8000-000000000001','47100000-0000-4000-8000-000000000002','in-transit metric',true,'[{"variant_id":"65100000-0000-4000-8000-000000000004","quantity":7}]'::jsonb)),
('cancelled',public.create_transfer('47100000-0000-4000-8000-000000000001','47100000-0000-4000-8000-000000000002','cancelled control',true,'[{"variant_id":"65100000-0000-4000-8000-000000000003","quantity":3}]'::jsonb));
select public.approve_transfer(id) from reconciliation_transfers;
select public.dispatch_transfer(id,case kind when 'received' then '77100000-0000-4000-8000-000000000001'::uuid when 'transit' then '77100000-0000-4000-8000-000000000002'::uuid end) from reconciliation_transfers where kind in('received','transit');
select public.receive_transfer(id,'77100000-0000-4000-8000-000000000003') from reconciliation_transfers where kind='received';
select public.cancel_transfer(id,'Excluded reconciliation control') from reconciliation_transfers where kind='cancelled';

reset role;
insert into public.customers(id,customer_code,customer_type,name,created_by) values
('91100000-0000-4000-8000-000000000001','REC-CUS-A','INDIVIDUAL','Reconciliation Customer A','37100000-0000-4000-8000-000000000001'),
('91100000-0000-4000-8000-000000000002','REC-CUS-B','INDIVIDUAL','Reconciliation Customer B','37100000-0000-4000-8000-000000000001');
insert into public.sales(id,sale_number,receipt_number,branch_id,customer_id,status,payment_status,sale_date,payment_due_date,subtotal,total_amount,amount_paid,balance_due,created_by,completed_by,completed_at) values
('81100000-0000-4000-8000-000000000001','REC-SAL-A1','REC-RCP-A1','47100000-0000-4000-8000-000000000001','91100000-0000-4000-8000-000000000001','COMPLETED','PARTIALLY_PAID','2026-08-15 12:00+00','2026-08-20',1000,1000,600,400,'37100000-0000-4000-8000-000000000001','37100000-0000-4000-8000-000000000001','2026-08-15 12:00+00'),
('81100000-0000-4000-8000-000000000002','REC-SAL-A2','REC-RCP-A2','47100000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001','COMPLETED','PAID','2026-08-16 12:00+00',null,500,500,500,0,'37100000-0000-4000-8000-000000000001','37100000-0000-4000-8000-000000000001','2026-08-16 12:00+00'),
('81100000-0000-4000-8000-000000000003','REC-SAL-B1','REC-RCP-B1','47100000-0000-4000-8000-000000000002','91100000-0000-4000-8000-000000000002','COMPLETED','PARTIALLY_PAID','2026-08-17 12:00+00','2026-07-17',2000,2000,1000,1000,'37100000-0000-4000-8000-000000000001','37100000-0000-4000-8000-000000000001','2026-08-17 12:00+00'),
('81100000-0000-4000-8000-000000000004','REC-SAL-CANCEL','REC-RCP-CANCEL','47100000-0000-4000-8000-000000000001','91100000-0000-4000-8000-000000000001','CANCELLED','UNPAID','2026-08-18 12:00+00',null,900,900,0,900,'37100000-0000-4000-8000-000000000001',null,null),
('81100000-0000-4000-8000-000000000005','REC-SAL-OUTSIDE','REC-RCP-OUTSIDE','47100000-0000-4000-8000-000000000001','91100000-0000-4000-8000-000000000001','COMPLETED','PAID','2026-07-31 12:00+00',null,300,300,300,0,'37100000-0000-4000-8000-000000000001','37100000-0000-4000-8000-000000000001','2026-07-31 12:00+00');
insert into public.sale_items(sale_id,variant_id,quantity,suggested_unit_price,unit_price,line_total,product_name_snapshot,variant_name_snapshot,sku_snapshot,unit_snapshot) values
('81100000-0000-4000-8000-000000000001','65100000-0000-4000-8000-000000000001',1,1000,1000,1000,'Reconciliation Product','Low','REC-LOW','pc'),
('81100000-0000-4000-8000-000000000002','65100000-0000-4000-8000-000000000002',1,500,500,500,'Reconciliation Product','Out','REC-OUT','pc'),
('81100000-0000-4000-8000-000000000003','65100000-0000-4000-8000-000000000003',1,2000,2000,2000,'Reconciliation Product','Received','REC-RECEIVED','pc'),
('81100000-0000-4000-8000-000000000004','65100000-0000-4000-8000-000000000001',1,900,900,900,'Reconciliation Product','Low','REC-LOW','pc'),
('81100000-0000-4000-8000-000000000005','65100000-0000-4000-8000-000000000001',1,300,300,300,'Reconciliation Product','Low','REC-LOW','pc');
insert into public.customer_payments(id,payment_number,customer_id,sale_id,branch_id,operation_key,amount,payment_method,payment_date,recorded_by) values
('82100000-0000-4000-8000-000000000001','REC-CPY-A-400','91100000-0000-4000-8000-000000000001','81100000-0000-4000-8000-000000000001','47100000-0000-4000-8000-000000000001','83100000-0000-4000-8000-000000000001',400,'CASH','2026-08-15 12:00+00','37100000-0000-4000-8000-000000000001'),
('82100000-0000-4000-8000-000000000002','REC-CPY-A-REV','91100000-0000-4000-8000-000000000001','81100000-0000-4000-8000-000000000001','47100000-0000-4000-8000-000000000001','83100000-0000-4000-8000-000000000002',200,'CARD_POS','2026-08-15 12:00+00','37100000-0000-4000-8000-000000000001'),
('82100000-0000-4000-8000-000000000003','REC-CPY-A-500','90000000-0000-4000-8000-000000000001','81100000-0000-4000-8000-000000000002','47100000-0000-4000-8000-000000000001','83100000-0000-4000-8000-000000000003',500,'MOBILE_MONEY','2026-08-16 12:00+00','37100000-0000-4000-8000-000000000001'),
('82100000-0000-4000-8000-000000000004','REC-CPY-B-1000','91100000-0000-4000-8000-000000000002','81100000-0000-4000-8000-000000000003','47100000-0000-4000-8000-000000000002','83100000-0000-4000-8000-000000000004',1000,'BANK_TRANSFER','2026-08-17 12:00+00','37100000-0000-4000-8000-000000000001');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"37100000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok($$select public.reverse_customer_payment('82100000-0000-4000-8000-000000000002','Deterministic reversed-payment control')$$,'Production reversal workflow creates the reversed-payment exclusion');
reset role;
insert into public.suppliers(id,supplier_code,name,created_by) values('92100000-0000-4000-8000-000000000001','REC-SUP','Reconciliation Supplier','37100000-0000-4000-8000-000000000001');
insert into public.purchases(id,purchase_number,supplier_id,branch_id,purchase_date,status,payment_status,subtotal,total_amount,amount_paid,balance_due,created_by) values
('84100000-0000-4000-8000-000000000001','REC-PUR-A','92100000-0000-4000-8000-000000000001','47100000-0000-4000-8000-000000000001','2026-08-10','ORDERED','PARTIALLY_PAID',1200,1200,500,700,'37100000-0000-4000-8000-000000000001'),
('84100000-0000-4000-8000-000000000002','REC-PUR-CANCEL','92100000-0000-4000-8000-000000000001','47100000-0000-4000-8000-000000000001','2026-08-11','CANCELLED','UNPAID',800,800,0,800,'37100000-0000-4000-8000-000000000001'),
('84100000-0000-4000-8000-000000000003','REC-PUR-B','92100000-0000-4000-8000-000000000001','47100000-0000-4000-8000-000000000002','2026-08-12','ORDERED','PARTIALLY_PAID',2000,2000,750,1250,'37100000-0000-4000-8000-000000000001');
insert into public.supplier_payments(payment_number,supplier_id,purchase_id,branch_id,operation_key,amount,payment_method,payment_date,recorded_by) values
('REC-SPY-A','92100000-0000-4000-8000-000000000001','84100000-0000-4000-8000-000000000001','47100000-0000-4000-8000-000000000001','85100000-0000-4000-8000-000000000001',500,'CASH','2026-08-10','37100000-0000-4000-8000-000000000001'),
('REC-SPY-B','92100000-0000-4000-8000-000000000001','84100000-0000-4000-8000-000000000003','47100000-0000-4000-8000-000000000002','85100000-0000-4000-8000-000000000002',750,'BANK_TRANSFER','2026-08-12','37100000-0000-4000-8000-000000000001');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"37100000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select is((public.dashboard_summary('2026-08-01','2026-08-31',null)#>>'{kpis,sales_revenue}')::numeric,3500::numeric,'Company revenue reconciles to completed in-range sales');
select is((public.dashboard_summary('2026-08-01','2026-08-31',null)#>>'{kpis,sales_count}')::integer,3,'Company sales count excludes cancelled and outside-range sales');
select is((public.dashboard_summary('2026-08-01','2026-08-31',null)#>>'{kpis,collections}')::numeric,1900::numeric,'Company collections exclude the reversed payment');
select is((public.dashboard_summary('2026-08-01','2026-08-31',null)#>>'{kpis,receivables}')::numeric,1600::numeric,'Company receivables reconcile to non-walk-in balances');
select is((public.dashboard_summary('2026-08-01','2026-08-31',null)#>>'{kpis,purchase_value}')::numeric,3200::numeric,'Company purchase value excludes cancelled purchase');
select is((public.dashboard_summary('2026-08-01','2026-08-31',null)#>>'{kpis,supplier_payments}')::numeric,1250::numeric,'Company supplier payments reconcile');
select is((public.dashboard_summary('2026-08-01','2026-08-31',null)#>>'{kpis,supplier_balance}')::numeric,1950::numeric,'Company supplier balance reconciles to open non-cancelled purchases');
select is((public.dashboard_summary('2026-08-01','2026-08-31',null)#>>'{kpis,low_stock}')::integer,1,'Company low-stock count reconciles');
select is((public.dashboard_summary('2026-08-01','2026-08-31',null)#>>'{kpis,out_of_stock}')::integer,1,'Company out-of-stock count reconciles');
select is((public.dashboard_summary('2026-08-01','2026-08-31',null)#>>'{kpis,in_transit}')::numeric,7::numeric,'Only dispatched, unreceived quantity is in transit');

select is((public.dashboard_summary('2026-08-01','2026-08-31','47100000-0000-4000-8000-000000000001')#>>'{kpis,sales_revenue}')::numeric,1500::numeric,'Branch A revenue reconciles');
select is((public.dashboard_summary('2026-08-01','2026-08-31','47100000-0000-4000-8000-000000000001')#>>'{kpis,sales_count}')::integer,2,'Branch A sales count reconciles');
select is((public.dashboard_summary('2026-08-01','2026-08-31','47100000-0000-4000-8000-000000000001')#>>'{kpis,collections}')::numeric,900::numeric,'Branch A collections reconcile');
select is((public.dashboard_summary('2026-08-01','2026-08-31','47100000-0000-4000-8000-000000000001')#>>'{kpis,receivables}')::numeric,600::numeric,'Branch A receivables reconcile');
select is((public.dashboard_summary('2026-08-01','2026-08-31','47100000-0000-4000-8000-000000000001')#>>'{kpis,purchase_value}')::numeric,1200::numeric,'Branch A purchase value reconciles');
select is((public.dashboard_summary('2026-08-01','2026-08-31','47100000-0000-4000-8000-000000000001')#>>'{kpis,supplier_payments}')::numeric,500::numeric,'Branch A supplier payments reconcile');
select is((public.dashboard_summary('2026-08-01','2026-08-31','47100000-0000-4000-8000-000000000001')#>>'{kpis,supplier_balance}')::numeric,700::numeric,'Branch A supplier balance reconciles');
select is((public.dashboard_summary('2026-08-01','2026-08-31','47100000-0000-4000-8000-000000000001')#>>'{kpis,low_stock}')::integer,1,'Branch A low-stock count reconciles');
select is((public.dashboard_summary('2026-08-01','2026-08-31','47100000-0000-4000-8000-000000000001')#>>'{kpis,out_of_stock}')::integer,1,'Branch A out-of-stock count reconciles');
select is((public.dashboard_summary('2026-08-01','2026-08-31','47100000-0000-4000-8000-000000000001')#>>'{kpis,in_transit}')::numeric,7::numeric,'Branch A in-transit quantity reconciles');
select results_eq($$select bucket,amount,sale_count from public.reporting_receivable_aging('2026-08-31',null) order by bucket$$,$$values ('DAYS_1_30'::text,600::numeric,1::bigint),('DAYS_31_60'::text,1000::numeric,1::bigint)$$,'Receivable aging buckets reconcile exactly');
select is((select count(*) from public.reporting_sales('2026-08-01','2026-08-31',null,100,0)),3::bigint,'Sales report row count matches dashboard sales count');
select is((select sum(total_amount) from public.reporting_sales('2026-08-01','2026-08-31',null,100,0)),3500::numeric,'Sales report revenue matches dashboard revenue');
select is((select count(*) from public.customer_payments where status='REVERSED' and id='82100000-0000-4000-8000-000000000002'),1::bigint,'Fixture proves the production reversed-payment state exists');
select is((select count(*) from public.stock_transfers where status='RECEIVED' and id=(select id from reconciliation_transfers where kind='received')),1::bigint,'Fixture proves received transfer is excluded from in-transit');
select * from finish();
rollback;
