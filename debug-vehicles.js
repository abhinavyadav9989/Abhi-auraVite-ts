// Enhanced Debug script to check vehicles and dealer associations
// Run this in your browser console on the Inventory page

async function debugVehiclesAndDealer() {
  try {
    console.log('=== STARTING DEBUG ===');
    
    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('User error:', userError);
      return;
    }
    console.log('1. Current user:', user);
    console.log('   User email:', user.email);
    
    // 2. Check ALL dealers in the database
    const { data: allDealers, error: dealersError } = await supabase
      .from('dealers')
      .select('*');
    
    if (dealersError) {
      console.error('Dealers error:', dealersError);
      return;
    }
    console.log('2. All dealers in database:', allDealers);
    
    // 3. Find dealer by created_by field
    const dealerByCreatedBy = allDealers.filter(d => d.created_by === user.email);
    console.log('3. Dealers with created_by = user.email:', dealerByCreatedBy);
    
    // 4. Find dealer by owner_user_id field (if it exists)
    const dealerByOwnerId = allDealers.filter(d => d.owner_user_id === user.id);
    console.log('4. Dealers with owner_user_id = user.id:', dealerByOwnerId);
    
    // 5. Get ALL vehicles in database
    const { data: allVehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*');
    
    if (vehiclesError) {
      console.error('Vehicles error:', vehiclesError);
      return;
    }
    console.log('5. All vehicles in database:', allVehicles);
    console.log('   Total vehicles:', allVehicles.length);
    
    // 6. Check vehicles for each dealer
    allDealers.forEach(dealer => {
      const dealerVehicles = allVehicles.filter(v => v.dealer_id === dealer.id);
      console.log(`6. Dealer "${dealer.name}" (${dealer.id}) has ${dealerVehicles.length} vehicles:`, dealerVehicles);
    });
    
    // 7. Check vehicles without dealer_id
    const vehiclesWithoutDealer = allVehicles.filter(v => !v.dealer_id);
    console.log('7. Vehicles without dealer_id:', vehiclesWithoutDealer);
    
    // 8. Check vehicles with invalid dealer_id
    const validDealerIds = allDealers.map(d => d.id);
    const vehiclesWithInvalidDealer = allVehicles.filter(v => v.dealer_id && !validDealerIds.includes(v.dealer_id));
    console.log('8. Vehicles with invalid dealer_id:', vehiclesWithInvalidDealer);
    
    // 9. Test the exact query used by Inventory page
    console.log('9. Testing Inventory page query...');
    const dealerProfile = allDealers.filter(d => d.created_by === user.email);
    console.log('   Dealer profile found by created_by:', dealerProfile);
    
    if (dealerProfile.length > 0) {
      const { data: inventoryVehicles, error: inventoryError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('dealer_id', dealerProfile[0].id);
      
      if (inventoryError) {
        console.error('   Inventory query error:', inventoryError);
      } else {
        console.log('   Vehicles found by Inventory page query:', inventoryVehicles);
      }
    } else {
      console.log('   No dealer profile found - this is the problem!');
    }
    
    console.log('=== DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

// Run the enhanced debug function
debugVehiclesAndDealer();
