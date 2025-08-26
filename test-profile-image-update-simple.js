const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfileImageUpdate() {
    console.log('🔍 Testing profile image update...');
    
    try {
        // First, let's check if we can connect to Supabase
        console.log('🔌 Testing Supabase connection...');
        
        // Try to get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error('❌ Session error:', sessionError);
        }
        
        if (!session) {
            console.log('❌ No active session found. User needs to be logged in.');
            
            // Let's just test if we can read the users table structure
            console.log('🔍 Testing database connection by checking users table...');
            
            const { data, error } = await supabase
                .from('users')
                .select('id, full_name, profile_image')
                .limit(1);
                
            if (error) {
                console.error('❌ Database connection error:', error);
                return;
            }
            
            console.log('✅ Database connection successful');
            console.log('📊 Sample data structure:', data);
            return;
        }
        
        console.log('✅ Session found for user:', session.user.id);
        
        // Check current profile
        const { data: currentProfile, error: fetchError } = await supabase
            .from('users')
            .select('id, full_name, profile_image, user_type')
            .eq('id', session.user.id)
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
            .eq('id', session.user.id)
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
            .eq('id', session.user.id)
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
