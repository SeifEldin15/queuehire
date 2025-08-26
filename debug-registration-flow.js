const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRegistrationFlow() {
    console.log('🧪 Testing Registration Flow with Profile Image...');
    
    try {
        // Simulate the registration flow
        const testEmail = `test-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        const testProfileImage = '/uploads/profiles/test-image-123.jpg';
        
        console.log('📝 Step 1: Simulating user completing profile with image...');
        
        // This simulates what happens in seeker/recruiter pages
        const registrationData = {
            fullName: 'Test User',
            userType: 'job_seeker',
            skills: 'JavaScript, React',
            bio: 'Test bio',
            profileImage: testProfileImage
        };
        
        console.log('💾 Registration data:', registrationData);
        
        // This simulates what happens in the confirm page
        const pendingProfile = {
            fullName: registrationData.fullName,
            role: registrationData.userType,
            skills: registrationData.skills,
            skills_needed: undefined,
            bio: registrationData.bio,
            profile_image: registrationData.profileImage,
        };
        
        console.log('💾 Pending profile data that would be saved to localStorage:', pendingProfile);
        
        // Simulate the pendingProfile being stored (we'll just check what data structure looks like)
        console.log('✅ Profile image in pending data:', pendingProfile.profile_image);
        
        // Now let's check what would happen during profile creation
        console.log('📝 Step 2: Simulating profile creation with pending data...');
        
        // This simulates what happens in useAuth.tsx fetchProfile function
        const optionalFields = {};
        
        if (pendingProfile?.profile_image) {
            optionalFields.profile_image = pendingProfile.profile_image;
        }
        
        const finalProfileData = {
            id: 'test-user-id',
            email: testEmail,
            user_type: pendingProfile.role,
            full_name: pendingProfile.fullName,
            professional_bio: pendingProfile.bio,
            skills_expertise: pendingProfile.skills,
            plan_type: 'Free',
            ...optionalFields
        };
        
        console.log('🏗️ Final profile data that would be inserted:', finalProfileData);
        console.log('✅ Profile image in final data:', finalProfileData.profile_image);
        
        // Let's also test the login page updateProfile call
        console.log('📝 Step 3: Simulating login page profile update...');
        
        const loginPageUpdate = {
            user_type: pendingProfile.role,
            full_name: pendingProfile.fullName,
            skills_expertise: pendingProfile.role === "job_seeker" ? pendingProfile.skills : undefined,
            required_skills: pendingProfile.role === "hiring" ? pendingProfile.skills_needed : undefined,
            professional_bio: pendingProfile.bio || "",
            profile_image: pendingProfile.profile_image || "",
        };
        
        console.log('🔄 Login page update data:', loginPageUpdate);
        console.log('✅ Profile image in login update:', loginPageUpdate.profile_image);
        
        // Check if there's an actual user in the database to test with
        console.log('📝 Step 4: Checking for existing users in database...');
        
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, full_name, profile_image, user_type')
            .limit(3);
            
        if (usersError) {
            console.error('❌ Error fetching users:', usersError);
        } else {
            console.log('👥 Sample users in database:');
            users.forEach(user => {
                console.log(`  - ${user.email}: profile_image = "${user.profile_image}"`);
            });
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

testRegistrationFlow();
