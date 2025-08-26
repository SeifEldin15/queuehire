const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testAuthenticatedUpdate() {
    console.log('🧪 Testing authenticated profile image update...');
    
    try {
        // First, let's try to sign in with the test user
        console.log('🔐 Attempting to sign in...');
        
        const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
            email: 'jakeshanks7828@gmail.com',
            password: 'test123' // This might not be the correct password
        });
        
        if (authError) {
            console.log('❌ Auth failed (expected):', authError.message);
            console.log('🔄 Will test with service role instead...');
            
            // Test with service role (bypasses RLS)
            const serviceSupabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-service-key'
            );
            
            console.log('🔧 Testing with service role...');
            
            const testImageUrl = `/uploads/profiles/service-test-${Date.now()}.jpg`;
            
            const { data: updateResult, error: updateError } = await serviceSupabase
                .from('users')
                .update({ 
                    profile_image: testImageUrl
                })
                .eq('email', 'jakeshanks7828@gmail.com')
                .select();
                
            if (updateError) {
                console.error('❌ Service role update error:', updateError);
                return;
            }
            
            console.log('✅ Service role update result:', updateResult);
            
            // Verify with normal client
            const { data: verifyResult, error: verifyError } = await supabase
                .from('users')
                .select('email, profile_image')
                .eq('email', 'jakeshanks7828@gmail.com')
                .single();
                
            if (verifyError) {
                console.error('❌ Verification error:', verifyError);
                return;
            }
            
            console.log('🔍 Verification result:', verifyResult);
            
            if (verifyResult.profile_image === testImageUrl) {
                console.log('✅ SUCCESS: Service role update worked! The issue is RLS.');
            } else {
                console.log('❌ FAILED: Even service role update failed. Database issue.');
            }
            
        } else {
            console.log('✅ Successfully authenticated');
            
            // Test update with authenticated user
            const testImageUrl = `/uploads/profiles/auth-test-${Date.now()}.jpg`;
            
            const { data: updateResult, error: updateError } = await supabase
                .from('users')
                .update({ 
                    profile_image: testImageUrl
                })
                .eq('id', authResult.user.id)
                .select();
                
            if (updateError) {
                console.error('❌ Authenticated update error:', updateError);
                return;
            }
            
            console.log('✅ Authenticated update result:', updateResult);
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testAuthenticatedUpdate();
