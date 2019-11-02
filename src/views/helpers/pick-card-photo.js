export default images => {
  if (images.length === 0) return null;

  const screenshot = images.find(({ type }) => type === 'Screenshot');

  return screenshot != null ? screenshot.url : images[0].url;
};
