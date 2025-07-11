import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client:clients(*),
          rack:racks(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        });
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'client' | 'rack'>) => {
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('orders')
        .insert([{ ...orderData, order_number: orderNumber }])
        .select(`
          *,
          client:clients(*),
          rack:racks(*)
        `)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add order",
          variant: "destructive",
        });
        return null;
      }

      setOrders(prev => [data, ...prev]);
      toast({
        title: "Order Added",
        description: `Order ${data.order_number} has been created successfully.`,
      });
      return data;
    } catch (error) {
      console.error('Error adding order:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', id)
        .select(`
          *,
          client:clients(*),
          rack:racks(*)
        `)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update order",
          variant: "destructive",
        });
        return null;
      }

      setOrders(prev => prev.map(order => order.id === id ? data : order));
      toast({
        title: "Order Updated",
        description: `Order ${data.order_number} has been updated successfully.`,
      });
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          client:clients(*),
          rack:racks(*)
        `)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
        return null;
      }

      setOrders(prev => prev.map(order => order.id === id ? data : order));
      toast({
        title: "Status Updated",
        description: `Order ${data.order_number} status updated to ${status}.`,
      });
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete order",
          variant: "destructive",
        });
        return false;
      }

      setOrders(prev => prev.filter(order => order.id !== id));
      toast({
        title: "Order Deleted",
        description: "Order has been deleted successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    orders,
    loading,
    addOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    refetch: fetchOrders
  };
};