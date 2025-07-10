
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Rack } from '@/types/database';

export const useRacks = () => {
  return useQuery({
    queryKey: ['racks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('racks')
        .select('*')
        .order('rack_number');
      
      if (error) throw error;
      return data as Rack[];
    },
  });
};

export const useCreateRack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rack: Omit<Rack, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('racks')
        .insert([rack])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racks'] });
    },
  });
};
