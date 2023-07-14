export function capitalize(value: string): string {
  return `${value[0].toLocaleUpperCase()}${value.slice(1)}`;
}

export function convertClassName(className: string): string {
  const convertedName = className.replace(
    /[A-Z]/g,
    (match) => `-${match.toLowerCase()}`
  );
  return convertedName;
}
