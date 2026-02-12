
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// URLs e Chaves do Supabase fornecidas
const supabaseUrl = 'https://ugkyvvrxlqrihihesias.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVna3l2dnJ4bHFyaWhpaGVzaWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODAyMzcsImV4cCI6MjA4NjQ1NjIzN30.7Xr4z5D3s5tQuFK4lh7NhFcCSNquAc1MbqccK8h1pNs'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
