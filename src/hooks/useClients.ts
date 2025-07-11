import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch clients",
          variant: "destructive",
        });
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add client",
          variant: "destructive",
        });
        return null;
      }

      setClients(prev => [data, ...prev]);
      toast({
        title: "Client Added",
        description: `${data.name} has been added successfully.`,
      });
      return data;
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update client",
          variant: "destructive",
        });
        return null;
      }

      setClients(prev => prev.map(client => client.id === id ? data : client));
      toast({
        title: "Client Updated",
        description: `${data.name} has been updated successfully.`,
      });
      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete client",
          variant: "destructive",
        });
        return false;
      }

      setClients(prev => prev.filter(client => client.id !== id));
      toast({
        title: "Client Deleted",
        description: "Client has been deleted successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchClients();

    // Set up real-time subscription
    const channel = supabase
      .channel('clients-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'clients' },
        () => {
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    clients,
    loading,
    addClient,
    updateClient,
    deleteClient,
    refetch: fetchClients
  };
};