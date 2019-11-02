export default score => {
  if (score >= 90) return 'very-high';
  if (score >= 80) return 'high';
  if (score >= 70) return 'average';
  if (score >= 60) return 'mixed';
  return 'bad';
};
