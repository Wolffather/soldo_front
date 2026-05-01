export const STORAGE_KEYS = {
  /** Admin-panel JWT (set after password login / admin OAuth) */
  ADMIN_TOKEN: 'token',
  ADMIN_ROLE: 'role',
  ADMIN_USER_ID: 'userId',

  /** User cabinet JWT (set after cabinet login / OAuth) */
  USER_TOKEN: 'user_token',
  USER_ROLE: 'user_role',
} as const;
