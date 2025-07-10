
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get orders count by status
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('status');
      
      if (ordersError) throw ordersError;

      // Get available racks count
      const { data: availableRacks, error: racksError } = await supabase
        .from('racks')
        .select('id')
        .eq('status', 'available');
      
      if (racksError) throw racksError;

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      const inProgressOrders = orders?.filter(o => o.status === 'in_progress').length || 0;
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
      const availableRacksCount = availableRacks?.length || 0;

      return {
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        availableRacks: availableRacksCount,
      };
    },
  });
};
