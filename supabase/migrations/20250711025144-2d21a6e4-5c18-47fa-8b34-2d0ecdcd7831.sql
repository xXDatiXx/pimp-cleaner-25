-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create racks table
CREATE TABLE public.racks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rack_number TEXT NOT NULL UNIQUE,
  location TEXT,
  capacity INTEGER DEFAULT 1,
  status rack_status NOT NULL DEFAULT 'available',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  rack_id UUID REFERENCES public.racks(id),
  device_type TEXT NOT NULL,
  device_brand TEXT,
  device_model TEXT,
  problem_description TEXT NOT NULL,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  status order_status NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 1,
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create order_history table for tracking status changes
CREATE TABLE public.order_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status order_status NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard_stats table for storing dashboard metrics
CREATE TABLE public.dashboard_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(metric_name, metric_date)
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Anyone can view clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" ON public.clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete clients" ON public.clients FOR DELETE TO authenticated USING (true);

-- Create RLS policies for racks
CREATE POLICY "Anyone can view racks" ON public.racks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage racks" ON public.racks FOR ALL TO authenticated USING (true);

-- Create RLS policies for orders
CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage orders" ON public.orders FOR ALL TO authenticated USING (true);

-- Create RLS policies for order_history
CREATE POLICY "Anyone can view order history" ON public.order_history FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert order history" ON public.order_history FOR INSERT TO authenticated WITH CHECK (true);

-- Create RLS policies for dashboard_stats
CREATE POLICY "Anyone can view dashboard stats" ON public.dashboard_stats FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage dashboard stats" ON public.dashboard_stats FOR ALL TO authenticated USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_racks_updated_at BEFORE UPDATE ON public.racks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for order status tracking
CREATE TRIGGER track_order_status_changes BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.track_order_status_change();

-- Insert some sample data for testing
INSERT INTO public.clients (name, email, phone, address) VALUES
  ('Juan Pérez', 'juan.perez@email.com', '+1234567890', 'Calle Principal 123'),
  ('María García', 'maria.garcia@email.com', '+1234567891', 'Avenida Central 456'),
  ('Carlos López', 'carlos.lopez@email.com', '+1234567892', 'Plaza Mayor 789');

INSERT INTO public.racks (rack_number, location, capacity, status, description) VALUES
  ('R001', 'Sala Principal', 1, 'available', 'Rack para reparaciones menores'),
  ('R002', 'Sala Principal', 1, 'available', 'Rack para reparaciones complejas'),
  ('R003', 'Almacén', 2, 'available', 'Rack de almacenamiento temporal'),
  ('R004', 'Taller', 1, 'maintenance', 'Rack en mantenimiento');

-- Insert sample dashboard stats
INSERT INTO public.dashboard_stats (metric_name, metric_value) VALUES
  ('total_orders', 0),
  ('pending_orders', 0),
  ('completed_orders', 0),
  ('revenue_today', 0),
  ('revenue_month', 0);