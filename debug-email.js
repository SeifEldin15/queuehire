// Email Debug Script for Supabase
// Run this to test email functionality and check settings

const { createClient } = require('@supabase/supabase-js');

// Read environment variables directly from .env.local file
const fs = require('fs');
const path = require('path');

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
  console.error('❌ Could not read .env file:', error.message);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailConfiguration() {
  console.log('🔍 Testing Supabase Email Configuration');
  console.log('=====================================');
  
  console.log('\n📋 Configuration Check:');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Anon Key:', supabaseAnonKey.substring(0, 20) + '...');
  
  // Test with a dummy email to see what error we get
  console.log('\n📧 Testing signup with test email...');
  
  const testEmail = 'test-' + Date.now() + '@example.com';
  
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
      console.log('❌ Signup Error:', error.message);
      
      if (error.message.includes('email')) {
        console.log('\n💡 Email-related issues detected:');
        console.log('- Check if email confirmation is enabled in Supabase Dashboard');
        console.log('- Verify SMTP settings in Authentication > Settings');
        console.log('- Check email rate limits');
      }
    } else {
      console.log('✅ Signup successful!');
      console.log('User created:', data.user?.id);
      console.log('Email sent:', data.user?.email_confirmed_at ? 'Already confirmed' : 'Verification email should be sent');
      
      if (!data.user?.email_confirmed_at) {
        console.log('\n📧 If you don\'t receive the email, check:');
        console.log('1. Spam/Junk folder');
        console.log('2. Supabase email settings in Dashboard');
        console.log('3. SMTP configuration');
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
  
  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Go to Supabase Dashboard > Authentication > Settings');
  console.log('2. Check "Enable email confirmations" is ON');
  console.log('3. Verify Email Templates are configured');
  console.log('4. Check SMTP settings (Custom SMTP recommended for production)');
  console.log('5. Check rate limits and usage quotas');
  
  console.log('\n📝 Supabase Dashboard URL:');
  console.log(`https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}/auth/users`);
}

testEmailConfiguration().catch(console.error);
