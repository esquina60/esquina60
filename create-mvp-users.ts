import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mlcxhmjxqkmvdxukestr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sY3hobWp4cWttdmR4dWtlc3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE1NDAsImV4cCI6MjA4OTI1NzU0MH0.QH0x4C3W5QXvDV8w7XmNZ_EayrsWivoCgEoR96ytfEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUsers() {
  console.log('Criando usuários MVP...');
  
  // Create / Login Admin
  const { data: adminAuth, error: adminErr } = await supabase.auth.signUp({
    email: 'esquinaadm@esquina60.com',
    password: '102030esquina',
  });
  if (adminErr) {
    console.error('Admin signup error:', adminErr.message);
  } else if (adminAuth.user) {
    console.log('Admin criado na Autenticação.');
    await supabase.from('users').upsert({
      id: adminAuth.user.id,
      email: 'esquinaadm@esquina60.com',
      role: 'admin',
      establishmentId: 'default'
    });
    console.log('Admin inserido em public.users');
  }

  // Create / Login Bar
  const { data: barAuth, error: barErr } = await supabase.auth.signUp({
    email: 'esquinabar@esquina60.com',
    password: '102030esquina',
  });
  if (barErr) {
    console.error('Bar signup error:', barErr.message);
  } else if (barAuth.user) {
    console.log('Bar criado na Autenticação.');
    await supabase.from('users').upsert({
      id: barAuth.user.id,
      email: 'esquinabar@esquina60.com',
      role: 'bar',
      establishmentId: 'default'
    });
    console.log('Bar inserido em public.users');
  }
}

createUsers();
