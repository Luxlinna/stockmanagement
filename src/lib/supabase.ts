// Re-exports the local PostgreSQL API client under the same name
// so every existing import ( import { supabase } from '@/lib/supabase' ) keeps working unchanged.
export { api as supabase } from './api';
