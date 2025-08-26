const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runMigration() {
    console.log('🔧 Running profile image fix migration...');
    
    try {
        // Read the migration SQL
        const migrationSQL = fs.readFileSync('fix-profile-image-migration.sql', 'utf8');
        
        console.log('📄 Migration SQL:');
        console.log(migrationSQL);
        
        // Note: We can't run DDL statements through the regular Supabase client
        // This would need to be run through the Supabase Dashboard SQL editor or CLI
        console.log('⚠️  This migration needs to be run through the Supabase Dashboard SQL editor.');
        console.log('📝 Steps:');
        console.log('1. Go to your Supabase project dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the migration SQL above');
        console.log('4. Click "Run" to execute the migration');
        
        // For now, let's just test the current state
        console.log('🔍 Checking current function definition...');
        
        const { data, error } = await supabase
            .from('users')
            .select('id, email, profile_image')
            .limit(1);
            
        if (error) {
            console.error('❌ Error querying users:', error);
        } else {
            console.log('✅ Successfully connected to database');
            console.log('📊 Sample data:', data);
        }
        
    } catch (error) {
        console.error('❌ Migration error:', error);
    }
}

runMigration();
