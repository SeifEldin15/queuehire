const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkImages() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, profile_image, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Recent users and their profile images:');
  data.forEach((user, i) => {
    console.log(`${i+1}. ${user.email}`);
    console.log(`   Image: ${user.profile_image}`);
    console.log(`   Created: ${user.created_at}`);
    console.log('');
  });
}

checkImages();
