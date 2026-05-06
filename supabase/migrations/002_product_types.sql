-- ─────────────────────────────────────────────────────────
-- Migration 002: Add proper product types/models structure
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────

-- First clear old seed data
DELETE FROM product_models;

-- ─── SOLAR PANELS ─────────────────────────────────────────
-- JA Solar
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'JA Solar', 'JAM72S30 580W',
  '{"wattage":580,"type":"Mono PERC","efficiency":"21.5%","warranty_years":12,"voc":"49.5V","isc":"14.76A"}',
  28, 'per watt', 1 FROM product_categories WHERE name='solar_panel';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'JA Solar', 'JAM72D40 590W',
  '{"wattage":590,"type":"Bifacial PERC","efficiency":"21.8%","warranty_years":12}',
  30, 'per watt', 2 FROM product_categories WHERE name='solar_panel';

-- Longi Solar
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Longi Solar', 'Hi-MO6 580W',
  '{"wattage":580,"type":"Mono HPBC","efficiency":"22.0%","warranty_years":12,"voc":"51.4V"}',
  30, 'per watt', 3 FROM product_categories WHERE name='solar_panel';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Longi Solar', 'Hi-MO X 605W',
  '{"wattage":605,"type":"TOPCon","efficiency":"22.6%","warranty_years":12}',
  34, 'per watt', 4 FROM product_categories WHERE name='solar_panel';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Longi Solar', 'HiBlack 555W',
  '{"wattage":555,"type":"Mono PERC","efficiency":"21.2%","warranty_years":10}',
  27, 'per watt', 5 FROM product_categories WHERE name='solar_panel';

-- Canadian Solar
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Canadian Solar', 'HiKu6 580W',
  '{"wattage":580,"type":"Mono PERC","efficiency":"21.5%","warranty_years":12}',
  32, 'per watt', 6 FROM product_categories WHERE name='solar_panel';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Canadian Solar', 'HiKu7 610W',
  '{"wattage":610,"type":"TOPCon","efficiency":"22.5%","warranty_years":12}',
  36, 'per watt', 7 FROM product_categories WHERE name='solar_panel';

-- Risen Energy
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Risen Energy', 'RSM144 580W',
  '{"wattage":580,"type":"Mono PERC","efficiency":"21.3%","warranty_years":10}',
  25, 'per watt', 8 FROM product_categories WHERE name='solar_panel';

-- Jinko Solar
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Jinko Solar', 'Tiger Neo 580W',
  '{"wattage":580,"type":"TOPCon","efficiency":"22.27%","warranty_years":12}',
  29, 'per watt', 9 FROM product_categories WHERE name='solar_panel';

-- ─── INVERTERS ─────────────────────────────────────────────
-- Growatt On-Grid
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Growatt', 'MIN 3600TL-X (3.6kW)',
  '{"kw":3.6,"type":"On-Grid","mppt":2,"efficiency":"97.2%","warranty_years":5}',
  18000, 'per kW', 1 FROM product_categories WHERE name='inverter';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Growatt', 'MIN 6000TL-X (6kW)',
  '{"kw":6,"type":"On-Grid","mppt":2,"efficiency":"97.5%","warranty_years":5}',
  17000, 'per kW', 2 FROM product_categories WHERE name='inverter';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Growatt', 'MOD 10KTL3-X (10kW)',
  '{"kw":10,"type":"On-Grid","mppt":3,"efficiency":"98.0%","warranty_years":5}',
  16500, 'per kW', 3 FROM product_categories WHERE name='inverter';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Growatt', 'SPH 6000TL BL-UP (6kW Hybrid)',
  '{"kw":6,"type":"Hybrid","mppt":2,"efficiency":"97.5%","warranty_years":5,"battery_compatible":true}',
  22000, 'per kW', 4 FROM product_categories WHERE name='inverter';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Growatt', 'SPH 10000TL3 BH (10kW Hybrid)',
  '{"kw":10,"type":"Hybrid","mppt":2,"efficiency":"97.8%","warranty_years":5,"battery_compatible":true}',
  21000, 'per kW', 5 FROM product_categories WHERE name='inverter';

-- Huawei
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Huawei', 'SUN2000-5KTL-M1 (5kW)',
  '{"kw":5,"type":"On-Grid","mppt":2,"efficiency":"98.6%","warranty_years":5,"smart_monitoring":true}',
  26000, 'per kW', 6 FROM product_categories WHERE name='inverter';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Huawei', 'SUN2000-10KTL-M1 (10kW)',
  '{"kw":10,"type":"On-Grid","mppt":2,"efficiency":"98.6%","warranty_years":5,"smart_monitoring":true}',
  25000, 'per kW', 7 FROM product_categories WHERE name='inverter';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Huawei', 'SUN2000-6KTL-L1 (6kW Hybrid)',
  '{"kw":6,"type":"Hybrid","mppt":2,"efficiency":"98.6%","warranty_years":5,"battery_compatible":true}',
  30000, 'per kW', 8 FROM product_categories WHERE name='inverter';

-- Sungrow
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Sungrow', 'SG5.0RT (5kW)',
  '{"kw":5,"type":"On-Grid","mppt":2,"efficiency":"98.4%","warranty_years":5}',
  21000, 'per kW', 9 FROM product_categories WHERE name='inverter';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Sungrow', 'SG10RT (10kW)',
  '{"kw":10,"type":"On-Grid","mppt":3,"efficiency":"98.4%","warranty_years":5}',
  20000, 'per kW', 10 FROM product_categories WHERE name='inverter';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Sungrow', 'SH6.0RT (6kW Hybrid)',
  '{"kw":6,"type":"Hybrid","mppt":2,"efficiency":"98.0%","warranty_years":5,"battery_compatible":true}',
  25000, 'per kW', 11 FROM product_categories WHERE name='inverter';

-- Sofar Solar
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Sofar Solar', 'SOFAR 3.6KTLX-G3 (3.6kW)',
  '{"kw":3.6,"type":"On-Grid","mppt":2,"efficiency":"97.6%","warranty_years":5}',
  14000, 'per kW', 12 FROM product_categories WHERE name='inverter';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Sofar Solar', 'SOFAR 8.8KTLX-G3 (8.8kW)',
  '{"kw":8.8,"type":"On-Grid","mppt":2,"efficiency":"98.0%","warranty_years":5}',
  13500, 'per kW', 13 FROM product_categories WHERE name='inverter';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Sofar Solar', 'HYD 6KTL-3PH (6kW Hybrid)',
  '{"kw":6,"type":"Hybrid","mppt":2,"efficiency":"97.5%","warranty_years":5,"battery_compatible":true}',
  18000, 'per kW', 14 FROM product_categories WHERE name='inverter';

-- Fronius
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Fronius', 'Primo 5.0-1 (5kW)',
  '{"kw":5,"type":"On-Grid","mppt":2,"efficiency":"98.0%","warranty_years":7,"origin":"Austria"}',
  33000, 'per kW', 15 FROM product_categories WHERE name='inverter';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Fronius', 'Symo GEN24 10.0 (10kW Hybrid)',
  '{"kw":10,"type":"Hybrid","mppt":2,"efficiency":"98.1%","warranty_years":7,"battery_compatible":true}',
  37000, 'per kW', 16 FROM product_categories WHERE name='inverter';

-- ─── BATTERIES ─────────────────────────────────────────────
-- Pylontech
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Pylontech', 'US2000C (2.4kWh)',
  '{"kwh":2.4,"chemistry":"LFP","warranty_years":10,"cycles":6000,"voltage":"48V","weight_kg":24}',
  95000, 'per unit', 1 FROM product_categories WHERE name='battery';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Pylontech', 'US3000C (3.5kWh)',
  '{"kwh":3.5,"chemistry":"LFP","warranty_years":10,"cycles":6000,"voltage":"48V","weight_kg":35}',
  140000, 'per unit', 2 FROM product_categories WHERE name='battery';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Pylontech', 'US5000 (5.12kWh)',
  '{"kwh":5.12,"chemistry":"LFP","warranty_years":10,"cycles":6000,"voltage":"48V","weight_kg":54}',
  180000, 'per unit', 3 FROM product_categories WHERE name='battery';

-- BYD
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'BYD', 'Battery-Box Premium LVS 4.0 (4kWh)',
  '{"kwh":4.0,"chemistry":"LFP","warranty_years":10,"cycles":6000,"voltage":"48V"}',
  160000, 'per unit', 4 FROM product_categories WHERE name='battery';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'BYD', 'Battery-Box Premium LVS 8.0 (8kWh)',
  '{"kwh":8.0,"chemistry":"LFP","warranty_years":10,"cycles":6000,"voltage":"48V"}',
  300000, 'per unit', 5 FROM product_categories WHERE name='battery';

-- Dyness
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Dyness', 'B4850 (4.8kWh)',
  '{"kwh":4.8,"chemistry":"LFP","warranty_years":7,"cycles":4000,"voltage":"48V"}',
  140000, 'per unit', 6 FROM product_categories WHERE name='battery';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Dyness', 'Tower T10 (9.6kWh)',
  '{"kwh":9.6,"chemistry":"LFP","warranty_years":7,"cycles":4000,"voltage":"48V"}',
  260000, 'per unit', 7 FROM product_categories WHERE name='battery';

-- AGM Lead Acid
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'AGM Local', 'Lead Acid 100Ah',
  '{"ah":100,"chemistry":"AGM","warranty_years":2,"voltage":"12V","weight_kg":30}',
  18000, 'per unit', 8 FROM product_categories WHERE name='battery';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'AGM Local', 'Lead Acid 200Ah',
  '{"ah":200,"chemistry":"AGM","warranty_years":3,"voltage":"12V","weight_kg":58}',
  35000, 'per unit', 9 FROM product_categories WHERE name='battery';

-- ─── CABLES ────────────────────────────────────────────────
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Kuka', 'Solar DC Cable 4mm²',
  '{"size_mm":4,"voltage_dc":1500,"color":"Red/Black","standard":"IEC 62930","xlpo_insulation":true}',
  65, 'per meter', 1 FROM product_categories WHERE name='cable';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Kuka', 'Solar DC Cable 6mm²',
  '{"size_mm":6,"voltage_dc":1500,"color":"Red/Black","standard":"IEC 62930","xlpo_insulation":true}',
  85, 'per meter', 2 FROM product_categories WHERE name='cable';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Generic', 'AC Cable 6mm²',
  '{"size_mm":6,"type":"AC","voltage":440}',
  55, 'per meter', 3 FROM product_categories WHERE name='cable';

-- ─── STRUCTURE & LABOUR ────────────────────────────────────
INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Local', 'GI Mounting Structure (Roof)',
  '{"material":"Galvanized Iron","type":"Roof Mount","thickness_mm":2}',
  5000, 'per kW', 1 FROM product_categories WHERE name='structure';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Local', 'GI Mounting Structure (Ground)',
  '{"material":"Galvanized Iron","type":"Ground Mount","thickness_mm":3}',
  7000, 'per kW', 2 FROM product_categories WHERE name='structure';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Labour', 'Installation Labour',
  '{"includes":"Panel mounting, wiring, inverter setup, testing, commissioning"}',
  4000, 'per kW', 1 FROM product_categories WHERE name='accessory';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'FESCO/LESCO', 'Net Metering Application',
  '{"includes":"Application, Processing, DISCO coordination"}',
  15000, 'flat fee', 2 FROM product_categories WHERE name='accessory';

INSERT INTO product_models (category_id, brand, model_name, specs, price_per_unit, unit_label, sort_order)
SELECT id, 'Local', 'MC4 Connectors (pair)',
  '{"type":"MC4","voltage":1500,"current":"30A"}',
  800, 'per pair', 3 FROM product_categories WHERE name='accessory';
