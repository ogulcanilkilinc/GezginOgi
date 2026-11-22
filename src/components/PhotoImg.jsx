import React, { useEffect, useState } from 'react';
import { getOptimizedImageUrl } from '../data/curatedPhotoResolver';
import { isPrivatePhoto, resolvePhotoSrc } from '../services/account';

// <img> that also understands the private cloud photo references ("gz:<path>"): those are fetched
// with the user's session and kept on the device. Every other source behaves like a normal image.
export default function PhotoImg({ src, width, onError, ...rest }) {
  const [url, setUrl] = useState(isPrivatePhoto(src) ? '' : src);

  useEffect(() => {
    let alive = true;
    if (!isPrivatePhoto(src)) {
      setUrl(src);
      return undefined;
    }
    setUrl('');
    resolvePhotoSrc(src)
      .then((u) => alive && setUrl(u))
      .catch(() => alive && onError && onError({ target: { style: {}, nextElementSibling: null } }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (!url) return null;
  return <img src={width ? getOptimizedImageUrl(url, width) : url} onError={onError} {...rest} />;
}
