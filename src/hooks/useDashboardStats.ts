import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .order('metric_date', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard stats",
          variant: "destructive",
        });
        return;
      }

      setStats(data || []);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStat = async (metricName: string, metricValue: number, metricDate?: string) => {
    try {
      const date = metricDate || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('dashboard_stats')
        .upsert(
          { metric_name: metricName, metric_value: metricValue, metric_date: date },
          { onConflict: 'metric_name,metric_date' }
        )
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update dashboard stat",
          variant: "destructive",
        });
        return null;
      }

      setStats(prev => {
        const filtered = prev.filter(s => !(s.metric_name === metricName && s.metric_date === date));
        return [data, ...filtered].sort((a, b) => b.metric_date.localeCompare(a.metric_date));
      });

      return data;
    } catch (error) {
      console.error('Error updating dashboard stat:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const getStatValue = (metricName: string, date?: string): number => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const stat = stats.find(s => s.metric_name === metricName && s.metric_date === targetDate);
    return stat ? Number(stat.metric_value) : 0;
  };

  const calculateDerivedStats = async () => {
    try {
      // Fetch current orders to calculate real-time stats
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, estimated_cost, actual_cost');

      if (error) return;

      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

      const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (Number(o.actual_cost) || Number(o.estimated_cost) || 0), 0);

      // Update all stats
      await Promise.all([
        updateStat('total_orders', totalOrders),
        updateStat('pending_orders', pendingOrders),
        updateStat('in_progress_orders', inProgressOrders),
        updateStat('completed_orders', completedOrders),
        updateStat('cancelled_orders', cancelledOrders),
        updateStat('total_revenue', totalRevenue),
      ]);

    } catch (error) {
      console.error('Error calculating derived stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription
    const channel = supabase
      .channel('dashboard-stats-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dashboard_stats' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stats,
    loading,
    updateStat,
    getStatValue,
    calculateDerivedStats,
    refetch: fetchStats
  };
};