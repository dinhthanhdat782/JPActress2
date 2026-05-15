const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return null;

  const uploadIndex = url.indexOf('/upload/');
  let publicPath = url.slice(uploadIndex + '/upload/'.length);
  publicPath = publicPath.split('?')[0];

  const parts = publicPath.split('/').filter(Boolean);
  if (!parts.length) return null;

  if (/^v\d+$/.test(parts[0])) {
    parts.shift();
  }

  if (!parts.length) return null;
  const last = parts[parts.length - 1];
  parts[parts.length - 1] = last.replace(/\.[^/.]+$/, '');

  return parts.join('/');
};

module.exports = { extractPublicIdFromUrl };
