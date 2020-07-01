export const capitalizeFirstLetter = (elem: string): string => {
  return elem
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
