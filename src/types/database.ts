
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Rack {
  id: string;
  rack_number: string;
  location?: string;
  capacity?: number;
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_service';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  client_id: string;
  rack_id?: string;
  device_type: string;
  device_brand?: string;
  device_model?: string;
  problem_description: string;
  estimated_cost?: number;
  actual_cost?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: number;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface DashboardStats {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_date: string;
  created_at: string;
}
