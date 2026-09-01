begin;
create extension if not exists pgtap with schema extensions;
select plan(50);
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('33000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','manager4@test.invalid','',now(),'{}','{}',now(),now()),
('33000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','inventory4@test.invalid','',now(),'{}','{}',now(),now()),
('33000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','sales4@test.invalid','',now(),'{}','{}',now(),now()),
('33000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','inactive4@test.invalid','',now(),'{}','{}',now(),now());
update public.profiles set role_id=case id when '33000000-0000-4000-8000-000000000001' then '10000000-0000-4000-8000-000000000003'::uuid when '33000000-0000-4000-8000-000000000002' then '10000000-0000-4000-8000-000000000005'::uuid when '33000000-0000-4000-8000-000000000003' then '10000000-0000-4000-8000-000000000004'::uuid else '10000000-0000-4000-8000-000000000003'::uuid end,is_active=id<>'33000000-0000-4000-8000-000000000004' where id::text like '33000000%';
insert into public.branches(id,code,name,address,phone) values('42000000-0000-4000-8000-000000000001','PUR-A','Purchasing A','Test','000'),('42000000-0000-4000-8000-000000000002','PUR-B','Purchasing B','Test','000');
insert into public.user_branches(user_id,branch_id) select u,b from (values('33000000-0000-4000-8000-000000000001'::uuid),('33000000-0000-4000-8000-000000000002'::uuid),('33000000-0000-4000-8000-000000000003'::uuid),('33000000-0000-4000-8000-000000000004'::uuid))x(u) cross join (values('42000000-0000-4000-8000-000000000001'::uuid))y(b);
insert into public.categories(id,name,slug) values('51200000-0000-4000-8000-000000000001','Purchasing Test','purchasing-test');
insert into public.units_of_measure(id,code,name,symbol,allows_decimal) values('53200000-0000-4000-8000-000000000001','P4PC','P4 Pieces','pc',false),('53200000-0000-4000-8000-000000000002','P4M','P4 Metres','m',true);
insert into public.products(id,name,category_id,unit_of_measure_id) values('56200000-0000-4000-8000-000000000001','Purchase Product','51200000-0000-4000-8000-000000000001','53200000-0000-4000-8000-000000000001'),('56200000-0000-4000-8000-000000000002','Purchase Decimal','51200000-0000-4000-8000-000000000001','53200000-0000-4000-8000-000000000002');
insert into public.product_variants(id,product_id,name,sku,is_default) values('57200000-0000-4000-8000-000000000001','56200000-0000-4000-8000-000000000001','Standard','PUR-INT',true),('57200000-0000-4000-8000-000000000002','56200000-0000-4000-8000-000000000002','Standard','PUR-DEC',true);
update public.products set status='ACTIVE' where id in('56200000-0000-4000-8000-000000000001','56200000-0000-4000-8000-000000000002');

set local role authenticated;select set_config('request.jwt.claims','{"sub":"33000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select ok(public.has_permission('purchases.create'),'Branch Manager can create purchases');
select lives_ok($$select public.create_supplier('Phase Four Supplier','Materials Ltd','Ama','0200000000','buy@test.invalid','Accra','Test supplier')$$,'Supplier creation works');
select is((select count(*) from public.suppliers where supplier_code like 'SUP-%' and is_active),1::bigint,'Supplier code is generated and supplier is active');
select lives_ok($$select public.create_purchase((select id from public.suppliers limit 1),'42000000-0000-4000-8000-000000000001',current_date,null,'INV-100','Primary',50,20,'[{"variant_id":"57200000-0000-4000-8000-000000000001","quantity":100,"unit_cost":10,"discount_amount":0}]')$$,'Draft purchase creates');
select is((select total_amount from public.purchases where supplier_invoice_number='INV-100'),970.00::numeric,'Trusted purchase total is precise');
select is((select count(*) from public.branch_inventory where branch_id='42000000-0000-4000-8000-000000000001'),0::bigint,'Draft does not change inventory');
select is((select count(*) from public.stock_movements where movement_type='PURCHASE_RECEIPT'),0::bigint,'Draft creates no movement');
select is((select amount_paid::text||'/'||balance_due::text||'/'||payment_status::text from public.purchases where supplier_invoice_number='INV-100'),'0.00/970.00/UNPAID','Unpaid state derives correctly');
select lives_ok($$select public.order_purchase((select id from public.purchases where supplier_invoice_number='INV-100'))$$,'Purchase orders');
select is((select count(*) from public.branch_inventory where branch_id='42000000-0000-4000-8000-000000000001'),0::bigint,'Ordering does not change inventory');
select lives_ok($$select public.receive_purchase((select id from public.purchases where supplier_invoice_number='INV-100'),'80000000-0000-4000-8000-000000000001','DEL-1','Partial',jsonb_build_array(jsonb_build_object('purchase_item_id',(select id from public.purchase_items where purchase_id=(select id from public.purchases where supplier_invoice_number='INV-100')),'quantity',60)))$$,'Partial receipt posts');
select is((select status::text from public.purchases where supplier_invoice_number='INV-100'),'PARTIALLY_RECEIVED','Purchase becomes partially received');
select is((select received_quantity from public.purchase_items where purchase_id=(select id from public.purchases where supplier_invoice_number='INV-100')),60.000::numeric,'Received quantity is 60');
select is((select quantity_on_hand from public.branch_inventory where branch_id='42000000-0000-4000-8000-000000000001' and variant_id='57200000-0000-4000-8000-000000000001'),60.000::numeric,'Partial receipt increases inventory only by 60');
select is((select quantity_delta from public.stock_movements where movement_type='PURCHASE_RECEIPT'),60.000::numeric,'Receipt ledger delta is positive 60');
select lives_ok($$select public.receive_purchase((select id from public.purchases where supplier_invoice_number='INV-100'),'80000000-0000-4000-8000-000000000001','DEL-1','Retry','[]')$$,'Duplicate receipt operation safely returns existing receipt');
select is((select quantity_on_hand from public.branch_inventory where variant_id='57200000-0000-4000-8000-000000000001'),60.000::numeric,'Duplicate receipt does not duplicate stock');
select lives_ok($$select public.receive_purchase((select id from public.purchases where supplier_invoice_number='INV-100'),'80000000-0000-4000-8000-000000000002','DEL-2','Final',jsonb_build_array(jsonb_build_object('purchase_item_id',(select id from public.purchase_items where purchase_id=(select id from public.purchases where supplier_invoice_number='INV-100')),'quantity',40)))$$,'Second receipt posts');
select is((select status::text from public.purchases where supplier_invoice_number='INV-100'),'RECEIVED','Purchase becomes received');
select is((select quantity_on_hand from public.branch_inventory where variant_id='57200000-0000-4000-8000-000000000001'),100.000::numeric,'Second receipt completes inventory to 100');
select is((select count(*) from public.goods_receipts where purchase_id=(select id from public.purchases where supplier_invoice_number='INV-100')),2::bigint,'Two distinct GRNs exist');

select lives_ok($$select public.create_purchase((select id from public.suppliers limit 1),'42000000-0000-4000-8000-000000000001',current_date,null,'INV-200','Over receipt',0,0,'[{"variant_id":"57200000-0000-4000-8000-000000000001","quantity":100,"unit_cost":10,"discount_amount":0}]')$$,'Second draft creates');
select lives_ok($$select public.order_purchase((select id from public.purchases where supplier_invoice_number='INV-200'))$$,'Second purchase orders');
select lives_ok($$select public.receive_purchase((select id from public.purchases where supplier_invoice_number='INV-200'),'80000000-0000-4000-8000-000000000003',null,null,jsonb_build_array(jsonb_build_object('purchase_item_id',(select id from public.purchase_items where purchase_id=(select id from public.purchases where supplier_invoice_number='INV-200')),'quantity',90)))$$,'Receipt of 90 posts');
select throws_ok($$select public.receive_purchase((select id from public.purchases where supplier_invoice_number='INV-200'),'80000000-0000-4000-8000-000000000004',null,null,jsonb_build_array(jsonb_build_object('purchase_item_id',(select id from public.purchase_items where purchase_id=(select id from public.purchases where supplier_invoice_number='INV-200')),'quantity',20)))$$,'P0001','You cannot receive more than the remaining ordered quantity','Over-receipt is rejected');
select is((select quantity_on_hand from public.branch_inventory where variant_id='57200000-0000-4000-8000-000000000001'),190.000::numeric,'Rejected over-receipt leaves stock unchanged');
select lives_ok($$select public.record_supplier_payment((select supplier_id from public.purchases where supplier_invoice_number='INV-100'),(select id from public.purchases where supplier_invoice_number='INV-100'),'42000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000001',400,'BANK_TRANSFER','BANK-1',current_date,'Partial payment')$$,'Partial supplier payment records');
select is((select amount_paid::text||'/'||balance_due::text||'/'||payment_status::text from public.purchases where supplier_invoice_number='INV-100'),'400.00/570.00/PARTIALLY_PAID','Partial payment reconciles purchase');
select lives_ok($$select public.record_supplier_payment((select supplier_id from public.purchases where supplier_invoice_number='INV-100'),(select id from public.purchases where supplier_invoice_number='INV-100'),'42000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000001',400,'BANK_TRANSFER','BANK-1',current_date,'Retry')$$,'Duplicate payment safely returns existing payment');
select is((select amount_paid from public.purchases where supplier_invoice_number='INV-100'),400.00::numeric,'Duplicate payment does not change paid amount');
select throws_ok($$select public.record_supplier_payment((select supplier_id from public.purchases where supplier_invoice_number='INV-100'),(select id from public.purchases where supplier_invoice_number='INV-100'),'42000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000002',571,'CASH',null,current_date,null)$$,'P0001','The payment amount exceeds the outstanding balance','Overpayment is rejected');
select lives_ok($$select public.record_supplier_payment((select supplier_id from public.purchases where supplier_invoice_number='INV-100'),(select id from public.purchases where supplier_invoice_number='INV-100'),'42000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000003',570,'CASH','FINAL',current_date,null)$$,'Final payment records');
select is((select amount_paid::text||'/'||balance_due::text||'/'||payment_status::text from public.purchases where supplier_invoice_number='INV-100'),'970.00/0.00/PAID','Full payment reconciles purchase');
select is((select outstanding_balance from public.supplier_balances where supplier_id=(select id from public.suppliers limit 1)),1000.00::numeric,'Supplier balance derives from open purchase balances');

select lives_ok($$select public.create_purchase((select id from public.suppliers limit 1),'42000000-0000-4000-8000-000000000001',current_date,null,'INV-300','Cancel',0,0,'[{"variant_id":"57200000-0000-4000-8000-000000000002","quantity":2.5,"unit_cost":20,"discount_amount":0}]')$$,'Decimal purchase draft creates');
select lives_ok($$select public.order_purchase((select id from public.purchases where supplier_invoice_number='INV-300'))$$,'Cancellable purchase orders');
select lives_ok($$select public.cancel_purchase((select id from public.purchases where supplier_invoice_number='INV-300'))$$,'Unreceived ordered purchase cancels');
select is((select status::text from public.purchases where supplier_invoice_number='INV-300'),'CANCELLED','Cancelled status is preserved');
select throws_ok($$select public.cancel_purchase((select id from public.purchases where supplier_invoice_number='INV-100'))$$,'P0001','A purchase with received goods cannot be cancelled','Received purchase cannot cancel');
select throws_ok($$update public.branch_inventory set quantity_on_hand=999$$,'42501',null,'Direct stock update remains denied');
select throws_ok($$insert into public.stock_movements(branch_id,variant_id,movement_type,quantity_delta,balance_before,balance_after,reference_type,performed_by) values('42000000-0000-4000-8000-000000000001','57200000-0000-4000-8000-000000000001','PURCHASE_RECEIPT',1,190,191,'GOODS_RECEIPT','33000000-0000-4000-8000-000000000001')$$,'42501',null,'Direct purchase movement insert is denied');

select set_config('request.jwt.claims','{"sub":"33000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select throws_ok($$select public.create_purchase((select id from public.suppliers limit 1),'42000000-0000-4000-8000-000000000001',current_date,null,null,null,0,0,'[{"variant_id":"57200000-0000-4000-8000-000000000001","quantity":1,"unit_cost":1}]')$$,'P0001','You do not have permission to create a purchase for this branch','Sales cannot create purchase');
select throws_ok($$select public.record_supplier_payment((select id from public.suppliers limit 1),(select id from public.purchases where supplier_invoice_number='INV-200'),'42000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000004',1,'CASH',null,current_date,null)$$,'P0001','You do not have permission to record this payment','Sales cannot record supplier payment');
select is((select count(*) from public.purchases where branch_id='42000000-0000-4000-8000-000000000002'),0::bigint,'Cross-branch purchase read returns no rows');
select set_config('request.jwt.claims','{"sub":"33000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select throws_ok($$select public.receive_purchase((select id from public.purchases where supplier_invoice_number='INV-200'),'80000000-0000-4000-8000-000000000005',null,null,'[]')$$,'P0001','At least one receipt item is required','Inventory role reaches authorized receiving workflow');
select throws_ok($$select public.receive_purchase((select id from public.purchases where supplier_invoice_number='INV-200'),'80000000-0000-4000-8000-000000000006',null,null,'[]')$$,'P0001','At least one receipt item is required','Receipt validation is database authoritative');
select set_config('request.jwt.claims','{"sub":"33000000-0000-4000-8000-000000000004","role":"authenticated"}',true);
select is((select count(*) from public.purchases),0::bigint,'Inactive user cannot read purchases');
set local role anon;select set_config('request.jwt.claims','{"role":"anon"}',true);
select is((select count(*) from public.suppliers),0::bigint,'Anonymous cannot read suppliers');
set local role authenticated;select set_config('request.jwt.claims','{"sub":"33000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select is((select count(*) from public.inventory_integrity_issues()),0::bigint,'Purchase receipts preserve ledger/current reconciliation');
set local role postgres;
select ok((select count(*)>=8 from public.audit_logs where action in('supplier.created','purchase.created','purchase.ordered','purchase.goods_received','supplier_payment.recorded','purchase.cancelled')),'Purchasing business actions are audited');
select * from finish();rollback;
