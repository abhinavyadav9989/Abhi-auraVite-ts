export type Permission =
  | 'view'
  | 'edit'
  | 'delete'
  | 'manage_inventory'
  | 'manage_team'
  | 'view_reports'
  | 'manage_branches';

export const hasPermission = (granted: Permission[] | undefined | null, required: Permission): boolean => {
  if (!Array.isArray(granted)) return false;
  return granted.includes(required);
};

export const hasAnyPermission = (granted: Permission[] | undefined | null, requiredAny: Permission[]): boolean => {
  if (!Array.isArray(granted)) return false;
  return requiredAny.some((p) => granted.includes(p));
};

export const hasAllPermissions = (granted: Permission[] | undefined | null, requiredAll: Permission[]): boolean => {
  if (!Array.isArray(granted)) return false;
  return requiredAll.every((p) => granted.includes(p));
};


