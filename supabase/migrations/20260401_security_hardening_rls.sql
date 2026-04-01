-- Security Hardening: Enable RLS and Create Policies
-- Applied on 2026-04-01

-- Tables: products, orders, users, settings, camarotes, inventory, staff, promotions, challenges

-- 1. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camarotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read-only access" ON public.products;
DROP POLICY IF EXISTS "Allow admin full access" ON public.products;

-- 3. Create role-based check function
CREATE OR REPLACE FUNCTION public.check_user_role(target_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = target_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Set policies for 'products'
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write products" ON public.products FOR ALL TO authenticated USING (public.check_user_role('admin')) WITH CHECK (public.check_user_role('admin'));

-- 5. Set policies for 'orders'
CREATE POLICY "Anon insert orders" ON public.orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Staff select orders" ON public.orders FOR SELECT TO authenticated USING (public.check_user_role('admin') OR public.check_user_role('bar'));
CREATE POLICY "Staff update orders" ON public.orders FOR UPDATE TO authenticated USING (public.check_user_role('admin') OR public.check_user_role('bar')) WITH CHECK (public.check_user_role('admin') OR public.check_user_role('bar'));

-- 6. Set policies for 'users'
CREATE POLICY "Admin full users" ON public.users FOR ALL TO authenticated USING (public.check_user_role('admin')) WITH CHECK (public.check_user_role('admin'));
CREATE POLICY "Self read users" ON public.users FOR SELECT TO authenticated USING (id = auth.uid());

-- 7. Set policies for 'settings'
CREATE POLICY "Public read settings" ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write settings" ON public.settings FOR ALL TO authenticated USING (public.check_user_role('admin')) WITH CHECK (public.check_user_role('admin'));

-- 8. Set policies for 'camarotes'
CREATE POLICY "Public read camarotes" ON public.camarotes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write camarotes" ON public.camarotes FOR ALL TO authenticated USING (public.check_user_role('admin')) WITH CHECK (public.check_user_role('admin'));

-- 9. Set policies for 'inventory', 'staff', 'promotions', 'challenges'
-- (Applying similar logic: Admin full access, restricted read if needed)
CREATE POLICY "Admin full inventory" ON public.inventory FOR ALL TO authenticated USING (public.check_user_role('admin')) WITH CHECK (public.check_user_role('admin'));
CREATE POLICY "Admin full staff" ON public.staff FOR ALL TO authenticated USING (public.check_user_role('admin')) WITH CHECK (public.check_user_role('admin'));
CREATE POLICY "Admin full promotions" ON public.promotions FOR ALL TO authenticated USING (public.check_user_role('admin')) WITH CHECK (public.check_user_role('admin'));
CREATE POLICY "Admin full challenges" ON public.challenges FOR ALL TO authenticated USING (public.check_user_role('admin')) WITH CHECK (public.check_user_role('admin'));

-- Grant read access to inventory/staff/promos/challenges for bar role
CREATE POLICY "Bar read management" ON public.inventory FOR SELECT TO authenticated USING (public.check_user_role('bar'));
CREATE POLICY "Bar read staff" ON public.staff FOR SELECT TO authenticated USING (public.check_user_role('bar'));
CREATE POLICY "Bar read promotions" ON public.promotions FOR SELECT TO authenticated USING (public.check_user_role('bar'));
CREATE POLICY "Bar read challenges" ON public.challenges FOR SELECT TO authenticated USING (public.check_user_role('bar'));
