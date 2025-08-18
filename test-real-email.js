// Test with realistic email
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file
let supabaseUrl, supabaseAnonKey;
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1];
    }
  }
} catch (error) {
  console.error('Could not read .env file:', error.message);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealEmail() {
  console.log('🧪 Testing with realistic email...\n');
  
  // Use a real email format (you can use your own email for testing)
  const testEmail = 'queuehire.test@gmail.com';
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Test User',
          user_type: 'job_seeker'
        }
      }
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
      
      if (error.message.includes('already registered')) {
        console.log('\n✅ This email was already used - signup works!');
        console.log('Try with a different email for testing.');
      }
    } else {
      console.log('✅ Signup successful!');
      console.log('User ID:', data.user?.id);
      console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('Confirmation sent:', data.user?.confirmation_sent_at ? 'Yes' : 'No');
      
      if (!data.user?.email_confirmed_at) {
        console.log('\n📧 Verification email should be sent!');
        console.log('Check your inbox (and spam folder) for:', testEmail);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
  
  console.log('\n🔧 If still no emails:');
  console.log('1. Check Supabase Dashboard: Authentication > Settings');
  console.log('2. Ensure "Enable email confirmations" is ON');
  console.log('3. Check email templates are configured');
  console.log('4. Try using your real email for testing');
}

testRealEmail();
