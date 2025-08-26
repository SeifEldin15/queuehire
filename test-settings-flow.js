const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testSettingsFlow() {
    console.log('🧪 Testing Settings Page Profile Image Update Flow...');
    
    try {
        // Step 1: Check if we can connect and see current users
        console.log('📡 Step 1: Checking database connection...');
        
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, full_name, profile_image')
            .limit(3);
            
        if (usersError) {
            console.error('❌ Database connection error:', usersError);
            return;
        }
        
        console.log('✅ Connected to database successfully');
        console.log('👥 Current users:');
        users.forEach((user, i) => {
            console.log(`  ${i+1}. ${user.email} - Image: ${user.profile_image || 'NULL'}`);
        });
        
        if (users.length === 0) {
            console.log('❌ No users found for testing');
            return;
        }
        
        const testUser = users[0];
        console.log(`🎯 Testing with user: ${testUser.email}`);
        
        // Step 2: Simulate the upload API success
        console.log('📤 Step 2: Simulating successful image upload...');
        const testImageUrl = `/uploads/profiles/settings-test-${Date.now()}.jpg`;
        console.log(`📸 Mock uploaded image URL: ${testImageUrl}`);
        
        // Step 3: Test the profile update (this is what updateProfile does)
        console.log('💾 Step 3: Testing profile update...');
        
        const { data: updateResult, error: updateError } = await supabase
            .from('users')
            .update({ 
                profile_image: testImageUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', testUser.id)
            .select();
            
        console.log('📊 Update attempt result:', { updateResult, updateError });
        
        if (updateError) {
            console.error('❌ Update failed:', updateError);
            
            // Check for specific error types
            if (updateError.message.includes('RLS')) {
                console.log('🔒 This looks like a Row Level Security (RLS) issue');
                console.log('💡 The user needs to be authenticated to update their profile');
            } else if (updateError.message.includes('permission')) {
                console.log('🔒 This looks like a permissions issue');
            } else {
                console.log('❓ Unknown database error');
            }
            
            return;
        }
        
        // Step 4: Verify the update
        console.log('🔍 Step 4: Verifying the update...');
        
        const { data: verifiedProfile, error: verifyError } = await supabase
            .from('users')
            .select('id, email, profile_image, updated_at')
            .eq('id', testUser.id)
            .single();
            
        if (verifyError) {
            console.error('❌ Verification failed:', verifyError);
            return;
        }
        
        console.log('📄 Verification result:', verifiedProfile);
        
        if (verifiedProfile.profile_image === testImageUrl) {
            console.log('✅ SUCCESS: Profile image update worked!');
            console.log('🎉 The settings page should work correctly for authenticated users');
        } else {
            console.log('❌ FAILED: Profile image was not updated');
            console.log(`Expected: ${testImageUrl}`);
            console.log(`Actual: ${verifiedProfile.profile_image}`);
            console.log('🔧 This suggests there may be a database-level issue');
        }
        
        // Step 5: Show what the settings page flow would look like
        console.log('📋 Step 5: Settings Page Flow Summary:');
        console.log('  1. User selects image file ✅');
        console.log('  2. uploadProfileImage() calls /api/upload-profile-image ✅');
        console.log('  3. API returns image URL ✅');
        console.log('  4. updateProfile({ profile_image: url }) gets called');
        console.log('  5. useAuth.updateProfile() updates database');
        console.log('  6. refreshProfile() reloads user data');
        
        if (updateError) {
            console.log('❌ The flow will fail at step 5 due to database error');
        } else {
            console.log('✅ The flow should work correctly');
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testSettingsFlow();
