// Re-export the local PostgreSQL API client under the same name so existing
// imports that use `supabase.from(...)` and `supabase.auth.*` keep working.
export { api as supabase } from './api';
