import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';

// Simple in-memory cache so each URL loads only once
const cache = {};

/**
 * Loads a Lottie animation from a URL and renders it.
 * Falls back to a blank div while loading or on error.
 */
export default function LottieIcon({ src, loop = true, style = {}, autoplay = true }) {
  const [data, setData] = useState(cache[src] || null);

  useEffect(() => {
    if (!src || cache[src]) return;
    fetch(src)
      .then(r => r.json())
      .then(json => { cache[src] = json; setData(json); })
      .catch(() => {});
  }, [src]);

  if (!data) return <div style={style} />;
  return <Lottie animationData={data} loop={loop} autoplay={autoplay} style={style} />;
}
