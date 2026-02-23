const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseEnv = Boolean(
  url &&
    anon &&
    !url.includes('example.supabase.co') &&
    anon !== 'public-anon-key',
);
