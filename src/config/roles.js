/**
 * Role & permission matrix. The storefront only uses `customer`, but the
 * admin panel will build on this without touching storefront code.
 */
export const ROLES = {
  customer: "customer",
  support: "support",
  editor: "editor",
  admin: "admin",
  superAdmin: "super_admin",
};

export const PERMISSIONS = {
  "courses:read": [ROLES.support, ROLES.editor, ROLES.admin, ROLES.superAdmin],
  "courses:write": [ROLES.editor, ROLES.admin, ROLES.superAdmin],
  "orders:read": [ROLES.support, ROLES.admin, ROLES.superAdmin],
  "orders:refund": [ROLES.admin, ROLES.superAdmin],
  "users:read": [ROLES.support, ROLES.admin, ROLES.superAdmin],
  "users:write": [ROLES.admin, ROLES.superAdmin],
  "coupons:write": [ROLES.admin, ROLES.superAdmin],
};

export function can(role, permission) {
  return PERMISSIONS[permission]?.includes(role) ?? false;
}
