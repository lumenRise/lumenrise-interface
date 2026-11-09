import { ApiError, getApiChain, getApiUserId } from './client';
import normalizeProviderUserId from '../normalize-provider-user-id';

const readUserId = (value: unknown): string => {
  if (getApiChain() === 'base') {
    if (
      typeof value === 'string' &&
      /^did:privy:[A-Za-z0-9_-]+$/.test(value) &&
      value === getApiUserId()
    ) {
      return value;
    }

    throw new ApiError('The server returned a mismatched Privy identity.', 'invalid-response');
  }

  const userId = normalizeProviderUserId(value);

  if (userId) {
    return userId;
  }

  throw new ApiError('The server returned an invalid registration response.', 'invalid-response');
};

export default readUserId;
