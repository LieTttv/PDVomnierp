
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabaseUrl = 'https://ugkyvvrxlqrihihesias.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVna3l2dnJ4bHFyaWhpaGVzaWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTA2NDAsImV4cCI6MjA1NTkyNjY0MH0.YOUR_ACTUAL_KEY_HERE'; // Substitua pelo seu Anon Key real completo

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
