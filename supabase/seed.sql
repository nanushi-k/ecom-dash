-- ============================================================
-- ecom-dash: Seed data
-- ============================================================
-- Creates a reusable function, then calls it for a user.
--
-- Usage:
--   1. Run this entire file once to create the function
--   2. To seed data for any user, run:
--      SELECT seed_demo_data('YOUR_USER_ID_HERE');
--
-- Example:
--   SELECT seed_demo_data('d3867763-ce2e-4bb6-8648-24c6a6aa943a');
--
-- The function is idempotent — it deletes existing data for
-- the user before inserting, so it's safe to run multiple times.
-- ============================================================

CREATE OR REPLACE FUNCTION seed_demo_data(uid uuid)
RETURNS void AS $$
DECLARE
  cat text;
  prod_id uuid;
  cust_id uuid;
  ord_id uuid;
  ord_num text;
  ord_status text;
  ord_total numeric;
  item_qty integer;
  item_price numeric;
  rand_date timestamptz;
  statuses text[] := ARRAY['pending','processing','shipped','delivered','delivered','delivered','delivered','delivered','shipped','cancelled'];
  categories text[] := ARRAY['Electronics','Clothing','Home & Garden','Sports','Books','Beauty','Food & Drink','Toys','Automotive','Pet Supplies'];
  product_names text[][] := ARRAY[
    ARRAY['Wireless Earbuds','Bluetooth Speaker','USB-C Hub','Mechanical Keyboard','Webcam HD','Portable Charger'],
    ARRAY['Cotton T-Shirt','Denim Jacket','Running Shoes','Wool Sweater','Baseball Cap','Linen Pants'],
    ARRAY['LED Desk Lamp','Plant Pot Set','Kitchen Scale','Throw Blanket','Wall Clock','Scented Candle'],
    ARRAY['Yoga Mat','Resistance Bands','Water Bottle','Jump Rope','Foam Roller','Gym Gloves'],
    ARRAY['Programming Guide','Design Handbook','Cookbook Basics','Mystery Novel','Science Fiction','History Atlas'],
    ARRAY['Face Moisturizer','Lip Balm Set','Hair Serum','Sunscreen SPF50','Eye Cream','Body Lotion'],
    ARRAY['Organic Coffee','Green Tea Pack','Protein Bars','Dried Mango','Olive Oil','Honey Jar'],
    ARRAY['Building Blocks','Puzzle Set','Board Game','Plush Toy','Art Kit','RC Car'],
    ARRAY['Car Phone Mount','Dash Cam','Seat Cushion','Tire Gauge','Air Freshener','Trunk Organizer'],
    ARRAY['Dog Treats','Cat Toy Set','Pet Bed','Fish Food','Leash Set','Grooming Kit']
  ];
  first_names text[] := ARRAY['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen','Emma','Olivia','Liam','Noah','Ava','Sophia','Mason','Logan','Lucas','Mia'];
  last_names text[] := ARRAY['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson'];
  cust_ids uuid[] := '{}';
  prod_ids uuid[] := '{}';
  prod_prices numeric[] := '{}';
  existing_order_count integer;
BEGIN
  -- Clean up existing data for this user
  -- Delete order_items first (references both orders and products)
  DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE user_id = uid);
  DELETE FROM public.orders WHERE user_id = uid;
  DELETE FROM public.customers WHERE user_id = uid;
  DELETE FROM public.products WHERE user_id = uid;

  -- Get existing order count for unique order numbers
  SELECT count(*) INTO existing_order_count FROM public.orders;

  -- Insert products (6 per category = 60 products)
  FOR i IN 1..10 LOOP
    cat := categories[i];
    FOR j IN 1..6 LOOP
      prod_id := gen_random_uuid();
      item_price := round((random() * 450 + 5)::numeric, 2);
      INSERT INTO public.products (id, user_id, name, description, price, category, stock, created_at)
      VALUES (
        prod_id,
        uid,
        product_names[i][j],
        'High-quality ' || lower(product_names[i][j]) || ' in our ' || cat || ' collection.',
        item_price,
        cat,
        floor(random() * 200 + 10)::integer,
        now() - (random() * 365)::integer * interval '1 day'
      );
      prod_ids := array_append(prod_ids, prod_id);
      prod_prices := array_append(prod_prices, item_price);
    END LOOP;
  END LOOP;

  -- Insert 100 customers
  FOR i IN 1..100 LOOP
    cust_id := gen_random_uuid();
    INSERT INTO public.customers (id, user_id, name, email, address, created_at)
    VALUES (
      cust_id,
      uid,
      first_names[floor(random() * 30 + 1)::integer] || ' ' || last_names[floor(random() * 30 + 1)::integer],
      'customer' || i || '_' || left(uid::text, 8) || '@example.com',
      floor(random() * 9999 + 1)::text || ' ' ||
        (ARRAY['Oak St','Elm Ave','Pine Rd','Maple Dr','Cedar Ln','Birch Way','Walnut Blvd','Spruce Ct'])[floor(random() * 8 + 1)::integer] || ', ' ||
        (ARRAY['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego'])[floor(random() * 8 + 1)::integer],
      now() - (random() * 365)::integer * interval '1 day'
    );
    cust_ids := array_append(cust_ids, cust_id);
  END LOOP;

  -- Insert 500 orders spread across last 12 months
  FOR i IN 1..500 LOOP
    ord_id := gen_random_uuid();
    ord_num := 'ORD-' || left(uid::text, 4) || '-' || lpad(i::text, 5, '0');
    ord_status := statuses[floor(random() * 10 + 1)::integer];
    rand_date := now() - (random() * 365)::integer * interval '1 day' - (random() * 24)::integer * interval '1 hour';
    ord_total := 0;

    INSERT INTO public.orders (id, user_id, customer_id, order_number, status, total, created_at)
    VALUES (
      ord_id,
      uid,
      cust_ids[floor(random() * 100 + 1)::integer],
      ord_num,
      ord_status,
      0,
      rand_date
    );

    -- 1-5 items per order
    FOR j IN 1..floor(random() * 4 + 1)::integer LOOP
      DECLARE
        pidx integer := floor(random() * 60 + 1)::integer;
      BEGIN
        item_qty := floor(random() * 4 + 1)::integer;
        item_price := prod_prices[pidx];
        ord_total := ord_total + (item_qty * item_price);

        INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
        VALUES (ord_id, prod_ids[pidx], item_qty, item_price);
      END;
    END LOOP;

    -- Update order total
    UPDATE public.orders SET total = ord_total WHERE id = ord_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Seed data for your user(s) below:
-- ============================================================
SELECT seed_demo_data('d3867763-ce2e-4bb6-8648-24c6a6aa943a');

-- To seed for another user, just add another line:
-- SELECT seed_demo_data('another-user-uuid-here');
