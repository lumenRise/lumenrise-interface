import { getApiChain } from '../client';
import type { Holder } from '../../../types/launch/holders';

export const appendHolders = (items: Holder[], next: Holder[]): Holder[] => {
  const seen = new Set(
    items.map((item): string =>
      getApiChain() === 'base' ? item.address.toLowerCase() : item.address,
    ),
  );

  return [
    ...items,
    ...next.filter((item): boolean => {
      const address = getApiChain() === 'base' ? item.address.toLowerCase() : item.address;

      if (seen.has(address)) {
        return false;
      }

      seen.add(address);

      return true;
    }),
  ];
};
