import normalizeProviderUserId from './normalize-provider-user-id';

const getAuthProviderUserId = async (token: string, signal: AbortSignal): Promise<string | null> => {
  const response = await fetch('https://api.blux.cc/users', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
  });

  if (response.status === 401 || response.status === 403 || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Account verification is temporarily unavailable.');
  }

  const payload: unknown = await response.json();

  if (!payload || typeof payload !== 'object' || !('result' in payload)) {
    throw new Error('Invalid sign-in response.');
  }

  const result = payload.result;

  if (!result || typeof result !== 'object' || !('id' in result) || typeof result.id !== 'string') {
    return null;
  }

  const id = normalizeProviderUserId(result.id);

  return id && !/^\d+$/.test(id) ? id : null;
};

export { getAuthProviderUserId };
