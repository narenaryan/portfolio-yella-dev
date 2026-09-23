'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Photo = { src: string; alt: string; caption: string };

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = () => setActive(null);
  const prev = () => setActive((index) => index === null ? null : (index - 1 + photos.length) % photos.length);
  const next = () => setActive((index) => index === null ? null : (index + 1) % photos.length);

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') prev();
      if (event.key === 'ArrowRight') next();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [active]);

  const photo = active === null ? null : photos[active];

  return <>
    <div className="photo-grid">
      {photos.map((photo, index) => <figure key={photo.src} className="photo-card">
        <button type="button" className="photo-open" onClick={() => setActive(index)} aria-label={`Open ${photo.caption}`}>
          <Image src={photo.src} alt={photo.alt} width={900} height={700} />
        </button>
        <figcaption>{photo.caption}</figcaption>
      </figure>)}
    </div>

    {photo && <div className="lightbox" role="dialog" aria-modal="true" aria-label={photo.caption}>
      <button type="button" className="lightbox-backdrop" onClick={close} aria-label="Close image viewer" />
      <button type="button" className="lightbox-close" onClick={close} aria-label="Close">×</button>
      <button type="button" className="lightbox-nav lightbox-prev" onClick={prev} aria-label="Previous image">‹</button>
      <div className="lightbox-image-wrap">
        <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className="lightbox-image" priority />
      </div>
      <button type="button" className="lightbox-nav lightbox-next" onClick={next} aria-label="Next image">›</button>
      <div className="lightbox-caption">{photo.caption}</div>
    </div>}
  </>;
}
