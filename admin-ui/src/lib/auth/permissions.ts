// Permission codes the UI checks (md_permissions.code). Change here if your catalogue uses other codes.
export const PERMISSIONS = {
  RATE_VIEW: 'RATE_VIEW',
  RATE_CREATE: 'RATE_CREATE',
  RATE_EDIT: 'RATE_EDIT',
  RATE_DELETE: 'RATE_DELETE',
  LEAD_VIEW: 'LEAD_VIEW',
  LEAD_EDIT: 'LEAD_EDIT',
  LEAD_DELETE: 'LEAD_DELETE',
  QUOTE_VIEW: 'QUOTE_VIEW',
  ADMIN_VIEW: 'ADMIN_VIEW',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
