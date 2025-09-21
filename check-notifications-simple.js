// Simple script to check notifications - Copy and paste this in browser console

async function checkNotifications() {
  const { supabase } = await import('./src/api/supabaseClient.js');
  const dealerId = 'e9e50377-e600-4c92-9350-827e23737dc6';
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', dealerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('=== NOTIFICATIONS FOR DEALER ===');
  console.log(`Total: ${data.length} notifications`);
  
  data.forEach((n, i) => {
    console.log(`${i+1}. [${n.type}] ${n.title}`);
    if (n.type === 'kyb_verified') console.log('   ✅ KYB VERIFICATION FOUND!');
  });
  
  const kybCount = data.filter(n => n.type === 'kyb_verified').length;
  console.log(`\nKYB notifications: ${kybCount}`);
  
  if (kybCount === 0) {
    console.log('❌ NO KYB NOTIFICATION - Was never created!');
  }
}

checkNotifications();
