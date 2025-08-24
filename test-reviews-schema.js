const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ahhvbwtkzlpfthnlhgrj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaHZid3RremxwZnRobmxoZ3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxNjI3OTUsImV4cCI6MjA1MDczODc5NX0.T7y2PtjQc_uo7WLrO8K-cEfJOq8tWd3k6lGzLvCyJ-M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReviewsSchema() {
  try {
    // Test if reviews table exists by trying to select from it
    console.log('Testing reviews table...');
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('Reviews table does not exist yet:', error.message);
      return false;
    }
    
    console.log('Reviews table exists!');
    
    // Test if user_rating_stats view exists
    console.log('Testing user_rating_stats view...');
    const { data: statsData, error: statsError } = await supabase
      .from('user_rating_stats')
      .select('*')
      .limit(1);
    
    if (statsError) {
      console.log('user_rating_stats view does not exist yet:', statsError.message);
      return false;
    }
    
    console.log('user_rating_stats view exists!');
    return true;
    
  } catch (err) {
    console.error('Error testing schema:', err);
    return false;
  }
}

testReviewsSchema().then((exists) => {
  if (exists) {
    console.log('✅ Reviews schema is ready!');
  } else {
    console.log('❌ Reviews schema needs to be applied');
    console.log('Please run the SQL from supabase/add-reviews-system.sql in your Supabase SQL editor');
  }
  process.exit(0);
});
