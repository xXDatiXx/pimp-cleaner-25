export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rack {
  id: string;
  rack_number: string;
  location: string | null;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_service';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  client_id: string;
  rack_id: string | null;
  device_type: string;
  device_brand: string | null;
  device_model: string | null;
  problem_description: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: number;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  client?: Client;
  rack?: Rack;
}

export interface OrderHistory {
  id: string;
  order_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface DashboardStats {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_date: string;
  created_at: string;
}