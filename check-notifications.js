// Check notifications in database - Copy and paste this in browser console
async function checkNotifications() {
  const { supabase } = await import('./src/api/supabaseClient.js');
  const dealerId = 'e9e50377-e600-4c92-9350-827e23737dc6';
  
  console.log('🔍 Checking notifications for dealer:', dealerId);
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', dealerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching notifications:', error);
    return;
  }
  
  console.log(`📊 Found ${data.length} notifications:`);
  
  if (data.length === 0) {
    console.log('❌ No notifications found for this dealer');
    return;
  }
  
  data.forEach((notification, index) => {
    console.log(`\n${index + 1}. Notification:`);
    console.log(`   ID: ${notification.id}`);
    console.log(`   Type: ${notification.type}`);
    console.log(`   Title: ${notification.title}`);
    console.log(`   Message: ${notification.message}`);
    console.log(`   Created: ${notification.created_at}`);
    console.log(`   Read: ${notification.is_read ? 'Yes' : 'No'}`);
    
    // Check specifically for KYB verification notification
    if (notification.type === 'kyb_verified') {
      console.log('   ✅ KYB VERIFICATION NOTIFICATION FOUND!');
    }
  });
  
  // Summary
  const kybNotifications = data.filter(n => n.type === 'kyb_verified');
  const welcomeNotifications = data.filter(n => n.type === 'welcome');
  
  console.log(`\n📈 Summary:`);
  console.log(`   Total notifications: ${data.length}`);
  console.log(`   KYB verification notifications: ${kybNotifications.length}`);
  console.log(`   Welcome notifications: ${welcomeNotifications.length}`);
  
  if (kybNotifications.length === 0) {
    console.log('❌ NO KYB VERIFICATION NOTIFICATION FOUND - This confirms the notification was never created!');
  } else {
    console.log('✅ KYB verification notification exists');
  }
}

// Run the check
checkNotifications();
