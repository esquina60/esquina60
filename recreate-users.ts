
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mlcxhmjxqkmvdxukestr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sY3hobWp4cWttdmR4dWtlc3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE1NDAsImV4cCI6MjA4OTI1NzU0MH0.QH0x4C3W5QXvDV8w7XmNZ_EayrsWivoCgEoR96ytfEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUsers() {
  console.log('Creating users...');
  
  const { data: admin, error: adminErr } = await supabase.auth.signUp({
    email: 'esquina60@esquina60.com',
    password: '102030adm',
  });
  if (adminErr) console.error('Admin signup error:', adminErr.message);
  else console.log('Admin signup initiated.');

  const { data: bar, error: barErr } = await supabase.auth.signUp({
    email: 'esquina60bar@esquina60.com',
    password: '102030bar',
  });
  if (barErr) console.error('Bar signup error:', barErr.message);
  else console.log('Bar signup initiated.');
}

createUsers();
