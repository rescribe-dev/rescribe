export const pairwiseDifferece = (elements: number[]): number => {
  let differencesSum = 0;
  let differencesCount = 0;
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      differencesSum += Math.abs(elements[i] - elements[j]);
      differencesCount++;
    }
  }
  return differencesSum / differencesCount;
};
