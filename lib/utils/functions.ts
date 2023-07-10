export function capitalize(value: string): string {
  return `${value[0].toLocaleUpperCase()}${value.slice(1)}`;
}
