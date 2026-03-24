import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mlcxhmjxqkmvdxukestr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sY3hobWp4cWttdmR4dWtlc3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE1NDAsImV4cCI6MjA4OTI1NzU0MH0.QH0x4C3W5QXvDV8w7XmNZ_EayrsWivoCgEoR96ytfEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
