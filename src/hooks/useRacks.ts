import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Rack } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useRacks = () => {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRacks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('racks')
        .select('*')
        .order('rack_number', { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch racks",
          variant: "destructive",
        });
        return;
      }

      setRacks(data || []);
    } catch (error) {
      console.error('Error fetching racks:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRack = async (rackData: Omit<Rack, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('racks')
        .insert([rackData])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add rack",
          variant: "destructive",
        });
        return null;
      }

      setRacks(prev => [...prev, data].sort((a, b) => a.rack_number.localeCompare(b.rack_number)));
      toast({
        title: "Rack Added",
        description: `Rack ${data.rack_number} has been added successfully.`,
      });
      return data;
    } catch (error) {
      console.error('Error adding rack:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateRack = async (id: string, rackData: Partial<Rack>) => {
    try {
      const { data, error } = await supabase
        .from('racks')
        .update(rackData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update rack",
          variant: "destructive",
        });
        return null;
      }

      setRacks(prev => prev.map(rack => rack.id === id ? data : rack));
      toast({
        title: "Rack Updated",
        description: `Rack ${data.rack_number} has been updated successfully.`,
      });
      return data;
    } catch (error) {
      console.error('Error updating rack:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateRackStatus = async (id: string, status: Rack['status']) => {
    try {
      const { data, error } = await supabase
        .from('racks')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update rack status",
          variant: "destructive",
        });
        return null;
      }

      setRacks(prev => prev.map(rack => rack.id === id ? data : rack));
      toast({
        title: "Rack Status Updated",
        description: `Rack ${data.rack_number} status updated to ${status}.`,
      });
      return data;
    } catch (error) {
      console.error('Error updating rack status:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteRack = async (id: string) => {
    try {
      const { error } = await supabase
        .from('racks')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete rack",
          variant: "destructive",
        });
        return false;
      }

      setRacks(prev => prev.filter(rack => rack.id !== id));
      toast({
        title: "Rack Deleted",
        description: "Rack has been deleted successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting rack:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchRacks();

    // Set up real-time subscription
    const channel = supabase
      .channel('racks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'racks' },
        () => {
          fetchRacks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    racks,
    loading,
    addRack,
    updateRack,
    updateRackStatus,
    deleteRack,
    refetch: fetchRacks
  };
};