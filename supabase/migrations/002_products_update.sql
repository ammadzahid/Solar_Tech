-- ─────────────────────────────────────────────────────────
-- Migration 002: Update product structure
-- Add brand as separate layer, models with proper pricing
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────

-- Add wattage and pricing_type columns to product_models
alter table product_models
  add column if not exists wattage       numeric(10,2),      -- for panels: 400W, 580W etc
  add column if not exists capacity_kw   numeric(10,2),      -- for inverters: 5kW, 10kW etc
  add column if not exists capacity_kwh  numeric(10,2),      -- for batteries: 5.12kWh etc
  add column if not exists pricing_type  text not null default 'per_unit'
    check (pricing_type in ('per_watt', 'per_kw', 'per_unit', 'per_meter', 'flat')),
  add column if not exists min_price     numeric(12,2),      -- wholesale/buying price
  add column if not exists warranty_years int default 5;

-- Update existing panels to per_watt pricing
update product_models pm
set pricing_type = 'per_watt',
    wattage = 580,
    warranty_years = 12
from product_categories pc
where pm.category_id = pc.id and pc.name = 'solar_panel';

-- Update inverters to flat pricing (per unit, specific kW size)
update product_models pm
set pricing_type = 'flat',
    unit_label = 'per unit'
from product_categories pc
where pm.category_id = pc.id and pc.name = 'inverter';

-- Update batteries to flat
update product_models pm
set pricing_type = 'flat',
    capacity_kwh = 5.12,
    warranty_years = 10
from product_categories pc
where pm.category_id = pc.id and pc.name = 'battery';

-- Update cables to per_meter
update product_models pm
set pricing_type = 'per_meter'
from product_categories pc
where pm.category_id = pc.id and pc.name = 'cable';

-- ─── Add more realistic models ────────────────────────────

-- More Panel models (different wattages)
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, wattage, warranty_years, sort_order)
select id, 'JA Solar', 'JAM72S30 400W', '{"wattage":400,"type":"Mono PERC","efficiency":"20.4%"}', 22, 'per watt', 'per_watt', 400, 12, 10
from product_categories where name='solar_panel'
on conflict (brand, model_name) do nothing;

insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, wattage, warranty_years, sort_order)
select id, 'Longi Solar', 'Hi-MO5 450W', '{"wattage":450,"type":"Mono HPBC","efficiency":"21.4%"}', 26, 'per watt', 'per_watt', 450, 12, 20
from product_categories where name='solar_panel'
on conflict (brand, model_name) do nothing;

insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, wattage, warranty_years, sort_order)
select id, 'Longi Solar', 'Hi-MO6 Pro 610W', '{"wattage":610,"type":"Mono HPBC","efficiency":"22.5%"}', 33, 'per watt', 'per_watt', 610, 12, 21
from product_categories where name='solar_panel'
on conflict (brand, model_name) do nothing;

-- Growatt inverter models (flat price per unit, specific size)
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, capacity_kw, warranty_years, sort_order)
select id, 'Growatt', 'MID 5KTL3-X', '{"kw":5,"type":"On-Grid","phase":"3-phase","mppt":2}', 85000, 'per unit', 'flat', 5, 5, 10
from product_categories where name='inverter'
on conflict (brand, model_name) do nothing;

insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, capacity_kw, warranty_years, sort_order)
select id, 'Growatt', 'MID 10KTL3-X', '{"kw":10,"type":"On-Grid","phase":"3-phase","mppt":2}', 160000, 'per unit', 'flat', 10, 5, 11
from product_categories where name='inverter'
on conflict (brand, model_name) do nothing;

insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, capacity_kw, warranty_years, sort_order)
select id, 'Growatt', 'SPH 5000TL BL-UP', '{"kw":5,"type":"Hybrid","phase":"single","mppt":2,"battery":"yes"}', 120000, 'per unit', 'flat', 5, 5, 12
from product_categories where name='inverter'
on conflict (brand, model_name) do nothing;

insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, capacity_kw, warranty_years, sort_order)
select id, 'Huawei', 'SUN2000-10KTL-M1', '{"kw":10,"type":"On-Grid","phase":"3-phase","mppt":2,"app":"FusionSolar"}', 280000, 'per unit', 'flat', 10, 5, 20
from product_categories where name='inverter'
on conflict (brand, model_name) do nothing;

insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, capacity_kw, warranty_years, sort_order)
select id, 'Huawei', 'SUN2000-5KTL-L1', '{"kw":5,"type":"Hybrid","phase":"single","mppt":2,"app":"FusionSolar"}', 150000, 'per unit', 'flat', 5, 5, 21
from product_categories where name='inverter'
on conflict (brand, model_name) do nothing;

insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, capacity_kw, warranty_years, sort_order)
select id, 'Sungrow', 'SG10RT', '{"kw":10,"type":"On-Grid","phase":"3-phase","mppt":2}', 220000, 'per unit', 'flat', 10, 5, 30
from product_categories where name='inverter'
on conflict (brand, model_name) do nothing;

insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, capacity_kw, warranty_years, sort_order)
select id, 'Sungrow', 'SH5.0RT', '{"kw":5,"type":"Hybrid","phase":"single","mppt":2}', 145000, 'per unit', 'flat', 5, 5, 31
from product_categories where name='inverter'
on conflict (brand, model_name) do nothing;

-- Battery models
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, capacity_kwh, warranty_years, sort_order)
select id, 'Pylontech', 'US2000C 2.4kWh', '{"kwh":2.4,"chemistry":"LFP","voltage":"48V","cycles":6000}', 95000, 'per unit', 'flat', 2.4, 10, 10
from product_categories where name='battery'
on conflict (brand, model_name) do nothing;

insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, capacity_kwh, warranty_years, sort_order)
select id, 'Pylontech', 'US3000C 3.5kWh', '{"kwh":3.5,"chemistry":"LFP","voltage":"48V","cycles":6000}', 135000, 'per unit', 'flat', 3.5, 10, 11
from product_categories where name='battery'
on conflict (brand, model_name) do nothing;

insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, capacity_kwh, warranty_years, sort_order)
select id, 'BYD', 'Battery-Box Premium HVS 5.1', '{"kwh":5.1,"chemistry":"LFP","voltage":"48V","cycles":8000}', 220000, 'per unit', 'flat', 5.1, 12, 20
from product_categories where name='battery'
on conflict (brand, model_name) do nothing;

-- More cable types
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, sort_order)
select id, 'Kuka', 'Solar DC 10mm²', '{"voltage_dc":1500,"size_mm":10,"color":"Red/Black","standard":"TUV"}', 120, 'per meter', 'per_meter', 3
from product_categories where name='cable'
on conflict (brand, model_name) do nothing;

insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, sort_order)
select id, 'Local', 'AC Cable 6mm²', '{"type":"AC","size_mm":6,"standard":"PVC"}', 45, 'per meter', 'per_meter', 4
from product_categories where name='cable'
on conflict (brand, model_name) do nothing;

-- MC4 connectors
insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, sort_order)
select id, 'Staubli', 'MC4 Connector Pair', '{"type":"MC4","rating":"30A","ip":"IP68"}', 450, 'per pair', 'flat', 1
from product_categories where name='accessory'
on conflict (brand, model_name) do nothing;

insert into product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, pricing_type, sort_order)
select id, 'Local', 'Surge Protection Device', '{"type":"SPD","voltage":"1000V DC"}', 3500, 'per unit', 'flat', 2
from product_categories where name='accessory'
on conflict (brand, model_name) do nothing;

