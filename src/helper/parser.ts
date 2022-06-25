export const parseValue = (value: string | undefined) => {
  const x = Number.parseInt(value as string);
  return Number.isNaN(x) ? 0 : x;
}
