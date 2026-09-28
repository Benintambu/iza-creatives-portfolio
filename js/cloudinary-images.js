const UPLOAD_PATH = '/image/upload/';

/** Return a responsive Cloudinary delivery URL without changing the stored original. */
export function cloudinaryImageUrl(source, width = 1000) {
    if (!source || !source.includes('res.cloudinary.com/')) return source;

    const uploadIndex = source.indexOf(UPLOAD_PATH);
    if (uploadIndex === -1) return source;

    const pathStart = uploadIndex + UPLOAD_PATH.length;
    const pathParts = source.slice(pathStart).split('/');
    const firstPart = pathParts[0];
    const hasTransformations = /^(?:[a-z]_[^/]+,?)+$/.test(firstPart);

    if (hasTransformations) pathParts.shift();

    pathParts.unshift(`f_auto,q_auto,w_${width},c_limit`);
    return `${source.slice(0, pathStart)}${pathParts.join('/')}`;
}
