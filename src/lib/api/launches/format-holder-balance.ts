export const formatHolderBalance = (raw: string, scale: number): string => {
  const units = BigInt(raw);
  const divisor = BigInt(10) ** BigInt(scale);
  const thousand = BigInt(1000);
  const thousandths = (units * thousand + divisor / BigInt(2)) / divisor;

  return `${thousandths / thousand}.${(thousandths % thousand).toString().padStart(3, '0')}`;
};
