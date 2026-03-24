
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mlcxhmjxqkmvdxukestr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sY3hobWp4cWttdmR4dWtlc3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE1NDAsImV4cCI6MjA4OTI1NzU0MH0.QH0x4C3W5QXvDV8w7XmNZ_EayrsWivoCgEoR96ytfEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('Testing Admin Login...');
  try {
    const { data: adminData, error: adminErr } = await supabase.auth.signInWithPassword({
      email: 'esquina60@esquina60.com',
      password: '102030adm',
    });
    if (adminErr) {
        console.error('Admin Error:', adminErr.message, adminErr.status);
    } else {
        console.log('Admin Result: Success');
    }
  } catch (e) {
      console.error('Admin Fatal Error:', e);
  }

  console.log('\nTesting Bar Login...');
  try {
    const { data: barData, error: barErr } = await supabase.auth.signInWithPassword({
      email: 'esquina60bar@esquina60.com',
      password: '102030bar',
    });
    if (barErr) {
        console.error('Bar Error:', barErr.message, barErr.status);
    } else {
        console.log('Bar Result: Success');
    }
  } catch (e) {
      console.error('Bar Fatal Error:', e);
  }
}

testLogin();
