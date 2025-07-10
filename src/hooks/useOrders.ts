
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Order } from '@/types/database';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          clients(name),
          racks(rack_number)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('orders')
        .insert([{ ...order, order_number: orderNumber }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};
