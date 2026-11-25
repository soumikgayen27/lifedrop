import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAsync } from './useAsync';
import type { Donor } from '../types';

export function useMyDonor() {
  const { session } = useAuth();
  return useAsync(async () => {
    const { data, error } = await supabase.from('donors').select('*').eq('user_id', session!.user.id).maybeSingle();
    if (error) throw new Error(error.message);
    return data as Donor | null;
  }, [session?.user.id]);
}
