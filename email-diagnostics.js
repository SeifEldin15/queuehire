// Comprehensive email diagnostics
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

async function comprehensiveEmailTest() {
  console.log('🔍 COMPREHENSIVE EMAIL DIAGNOSTICS');
  console.log('=====================================\n');
  
  // Extract project ID from URL
  const projectId = supabaseUrl.split('//')[1].split('.')[0];
  console.log('📋 Project Info:');
  console.log('Project ID:', projectId);
  console.log('Dashboard URL:', `https://supabase.com/dashboard/project/${projectId}`);
  console.log('Auth Settings:', `https://supabase.com/dashboard/project/${projectId}/auth/settings`);
  console.log('Email Templates:', `https://supabase.com/dashboard/project/${projectId}/auth/templates`);
  console.log();
  
  // Test 1: Check existing users
  console.log('👥 Checking existing users...');
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log('❌ Cannot list users (expected - need service key)');
    } else {
      console.log(`✅ Found ${users.users?.length || 0} users`);
    }
  } catch (err) {
    console.log('❌ Cannot access admin functions (expected)');
  }
  
  // Test 2: Try signup with different email providers
  console.log('\n📧 Testing different email providers...');
  
  const emailProviders = [
    'test.queuehire@gmail.com',
    'test.queuehire@outlook.com', 
    'test.queuehire@yahoo.com'
  ];
  
  for (const email of emailProviders) {
    console.log(`\nTesting: ${email}`);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'TestPassword123!',
        options: {
          data: {
            full_name: 'Test User',
            user_type: 'job_seeker'
          }
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          console.log('⚠️  Email already used (this is good - signup works)');
        } else {
          console.log('❌ Error:', error.message);
        }
      } else {
        console.log('✅ Signup successful!');
        console.log('   User ID:', data.user?.id);
        console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
        console.log('   Confirmation sent:', data.user?.confirmation_sent_at ? 'Yes' : 'No');
      }
    } catch (err) {
      console.log('❌ Unexpected error:', err.message);
    }
  }
  
  // Test 3: Check current auth session
  console.log('\n🔐 Checking current auth session...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session) {
      console.log('✅ Current session found for:', session.user.email);
    } else {
      console.log('ℹ️  No current session (this is normal for testing)');
    }
  } catch (err) {
    console.log('❌ Session check error:', err.message);
  }
  
  console.log('\n🚨 CRITICAL STEPS TO CHECK:');
  console.log('=====================================');
  console.log('1. 🌐 Go to Supabase Dashboard:');
  console.log(`   ${`https://supabase.com/dashboard/project/${projectId}/auth/settings`}`);
  console.log();
  console.log('2. ✅ Verify these settings are ENABLED:');
  console.log('   • Enable email confirmations = ON');
  console.log('   • Enable signup = ON');
  console.log();
  console.log('3. 📧 Check Email Templates:');
  console.log(`   ${`https://supabase.com/dashboard/project/${projectId}/auth/templates`}`);
  console.log('   • Confirm email template should exist');
  console.log('   • Check subject line and content');
  console.log();
  console.log('4. 📮 Check SMTP Settings:');
  console.log('   • Using built-in Supabase SMTP (limited)');
  console.log('   • Consider setting up custom SMTP for production');
  console.log();
  console.log('5. 📊 Check Rate Limits:');
  console.log('   • Supabase free tier has email limits');
  console.log('   • Check if you\'ve hit daily/hourly limits');
  console.log();
  console.log('6. 🔍 Manual Check:');
  console.log(`   Go to: ${`https://supabase.com/dashboard/project/${projectId}/auth/users`}`);
  console.log('   Look for recently created users');
  console.log('   Check their email_confirmed_at status');
  console.log();
  console.log('💡 QUICK FIX OPTIONS:');
  console.log('=====================================');
  console.log('Option A: Temporarily disable email confirmation');
  console.log('   1. Auth Settings > Enable email confirmations = OFF');
  console.log('   2. Users can register without email verification');
  console.log();
  console.log('Option B: Manual email confirmation');
  console.log('   1. Find user in Auth > Users');
  console.log('   2. Click user > Set email as confirmed');
  console.log();
  console.log('Option C: Setup custom SMTP');
  console.log('   1. Use Gmail, SendGrid, or other email service');
  console.log('   2. More reliable than built-in SMTP');
}

comprehensiveEmailTest();
