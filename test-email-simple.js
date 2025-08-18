// Simple test to check what's happening with email verification
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

async function testMinimalSignup() {
  console.log('🧪 Testing minimal signup...\n');
  
  const testEmail = 'test-' + Date.now() + '@example.com';
  
  try {
    // Test with minimal data
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!'
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
      
      if (error.message.includes('Database error')) {
        console.log('\n🔧 Database trigger issue detected!');
        console.log('Problem: The database trigger that creates user profiles is failing.');
        console.log('Solution: Run the SQL fix in your Supabase dashboard.');
        console.log('File: fix-email-trigger.sql');
      }
      
      if (error.message.includes('email')) {
        console.log('\n📧 Email configuration issue detected!');
        console.log('Check your Supabase dashboard email settings.');
      }
    } else {
      console.log('✅ Signup successful!');
      console.log('User ID:', data.user?.id);
      console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('Confirmation sent:', data.user?.confirmation_sent_at ? 'Yes' : 'No');
      
      if (!data.user?.email_confirmed_at && !data.user?.confirmation_sent_at) {
        console.log('\n⚠️  No confirmation email was sent!');
        console.log('This means email confirmations might be disabled in Supabase.');
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
  
  console.log('\n🔗 Quick fixes:');
  console.log('1. Go to: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0]);
  console.log('2. Navigate to: Authentication > Settings');
  console.log('3. Enable "Confirm email" if it\'s disabled');
  console.log('4. If database errors: Run fix-email-trigger.sql in SQL Editor');
}

testMinimalSignup();
