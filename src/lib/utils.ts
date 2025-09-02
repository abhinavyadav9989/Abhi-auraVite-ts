import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Utility function to validate user_type against enum values
export const validateUserType = (userType: string): string => {
  const validUserTypes = [
    'group_dealer', 'individual_org', 'franchise', 'wholesale_trader',
    'consignment_seller', 'fleet_corporate', 'nbfc_bank', 'govt_psu',
    'rental_leasing', 'agri_construction', '2w_3w_network', 'dsa_broker',
    'chauffeur_driver', 'self_user', 'partner'
  ];

  if (validUserTypes.includes(userType)) {
    return userType;
  } else {
    console.warn(`Invalid user_type: ${userType}, defaulting to 'individual_org'`);
    return 'individual_org';
  }
}; 