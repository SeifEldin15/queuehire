const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testDirectProfileImageUpdate() {
    console.log('🧪 Testing direct profile image update...');
    
    try {
        // Get the first user
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, full_name, profile_image')
            .limit(1);
            
        if (usersError) {
            console.error('❌ Error fetching users:', usersError);
            return;
        }
        
        if (!users || users.length === 0) {
            console.log('❌ No users found in database');
            return;
        }
        
        const testUser = users[0];
        console.log('👤 Testing with user:', testUser.email);
        console.log('📄 Current profile image:', testUser.profile_image);
        
        // Create a test image URL
        const testImageUrl = `/uploads/profiles/test-manual-${Date.now()}.jpg`;
        console.log('🔄 Updating profile image to:', testImageUrl);
        
        // Update the profile image
        const { data: updateResult, error: updateError } = await supabase
            .from('users')
            .update({ 
                profile_image: testImageUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', testUser.id)
            .select();
            
        if (updateError) {
            console.error('❌ Update error:', updateError);
            return;
        }
        
        console.log('✅ Update successful:', updateResult);
        
        // Verify the update
        const { data: verifyResult, error: verifyError } = await supabase
            .from('users')
            .select('id, email, profile_image')
            .eq('id', testUser.id)
            .single();
            
        if (verifyError) {
            console.error('❌ Verification error:', verifyError);
            return;
        }
        
        console.log('🔍 Verification result:', verifyResult);
        
        if (verifyResult.profile_image === testImageUrl) {
            console.log('✅ SUCCESS: Profile image update worked!');
        } else {
            console.log('❌ FAILED: Profile image not updated correctly');
            console.log('Expected:', testImageUrl);
            console.log('Actual:', verifyResult.profile_image);
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testDirectProfileImageUpdate();
