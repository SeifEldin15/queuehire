import { supabase } from './lib/supabaseClient.ts';

async function testProfileImageUpdate() {
    console.log('🔍 Testing profile image update...');
    
    try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
            console.error('❌ Auth error:', authError);
            return;
        }
        
        if (!user) {
            console.log('❌ No authenticated user found');
            return;
        }
        
        console.log('✅ User found:', user.id);
        
        // Check current profile
        const { data: currentProfile, error: fetchError } = await supabase
            .from('users')
            .select('id, full_name, profile_image, user_type')
            .eq('id', user.id)
            .single();
            
        if (fetchError) {
            console.error('❌ Error fetching current profile:', fetchError);
            return;
        }
        
        console.log('📄 Current profile:', currentProfile);
        
        // Test updating profile image
        const testImageUrl = '/uploads/profiles/test-image-' + Date.now() + '.jpg';
        
        console.log('🔄 Updating profile image to:', testImageUrl);
        
        const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({ 
                profile_image: testImageUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select();
            
        if (updateError) {
            console.error('❌ Error updating profile:', updateError);
            return;
        }
        
        console.log('✅ Profile updated successfully:', updateData);
        
        // Verify the update
        const { data: verifyProfile, error: verifyError } = await supabase
            .from('users')
            .select('id, full_name, profile_image, user_type')
            .eq('id', user.id)
            .single();
            
        if (verifyError) {
            console.error('❌ Error verifying update:', verifyError);
            return;
        }
        
        console.log('🔍 Verified profile:', verifyProfile);
        
        if (verifyProfile.profile_image === testImageUrl) {
            console.log('✅ Profile image update SUCCESSFUL!');
        } else {
            console.log('❌ Profile image update FAILED - image not saved');
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testProfileImageUpdate();
