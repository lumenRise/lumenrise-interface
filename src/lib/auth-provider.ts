import normalizeProviderUserId from './normalize-provider-user-id';

const providerTokenStorageKey = '__BLUX__JWT_STORE';
const providerSessionStorageKey = '__BLUX__RECENT_LOGIN_CONFIG';
const userIdClaims = ['sub', 'user_id', 'userId', 'uid', 'id'] as const;

// Blux public IDs and legacy numeric IDs are identifiers, not credentials.
const getAuthProviderUserId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    let token = window.localStorage.getItem(providerTokenStorageKey);

    if (!token) {
      const record = window.localStorage.getItem(providerSessionStorageKey);

      if (!record) {
        return null;
      }

      const session: unknown = JSON.parse(record);

      if (!session || typeof session !== 'object' || !('jwt' in session) || typeof session.jwt !== 'string') {
        return null;
      }

      token = session.jwt;
    }

    const parts = token.split('.');

    if (parts.length < 2 || !parts[1]) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload: unknown = JSON.parse(atob(padded));

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return null;
    }

    for (const claim of userIdClaims) {
      const userId = normalizeProviderUserId((payload as Record<string, unknown>)[claim]);

      if (userId) {
        return userId;
      }
    }

    return null;
  } catch {
    return null;
  }
};

export { getAuthProviderUserId };
