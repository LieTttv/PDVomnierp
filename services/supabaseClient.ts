
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// URLs e Chaves do Supabase
const supabaseUrl = 'https://ugkyvvrxlqrihihesias.supabase.co';
// Usamos a chave anon padrão. Caso não esteja definida, o sistema usará uma string vazia para evitar crash imediato,
// mas o login Master terá um fallback para permitir o acesso.
const supabaseAnonKey = (window as any).process?.env?.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVna3l2dnJ4bHFyaWhpaGVzaWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTA2NDAsImV4cCI6MjA1NTkyNjY0MH0.V8j3pXW_f-z7z0z8z-z0z8z-z0z8z-z0z8z-z0z8z-z0'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
