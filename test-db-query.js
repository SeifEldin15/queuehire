const { createClient } = require('@supabase/supabase-js');

// Using the URL from your console logs
const supabaseUrl = 'https://mqahcqbffhbxayepbpqg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYWhjcWJmZmhieGF5ZXBicHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2ODgzNjEsImV4cCI6MjAzOTI2NDM2MX0.h1GzKHmtKMtgY_eAeDONBLU8Wk4bT13THQN6HfCNGiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getUserData() {
  console.log('Querying user data for ID: 2221c29d-5393-4649-9b8a-0d66246554b0');
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', '2221c29d-5393-4649-9b8a-0d66246554b0');
  
  console.log('Query result:');
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
  
  // Also check if user exists at all
  const { data: allUsers, error: allError } = await supabase
    .from('users')
    .select('id, email, professional_bio, skills_expertise, required_skills')
    .limit(5);
    
  console.log('\nFirst 5 users in table:');
  console.log('Data:', JSON.stringify(allUsers, null, 2));
  console.log('Error:', allError);
}

getUserData().catch(console.error);
