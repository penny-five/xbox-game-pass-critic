export default images => {
  if (images.length === 0) return null;

  for (let image of images) {
    if (image.type === 'Screenshot') return image.url;
  }

  return images[0].url;
};
