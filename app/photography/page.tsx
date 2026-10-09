import { socialMetadata } from '@/lib/social';
import { getPhotography } from '@/lib/content';
import { PhotoGallery } from '@/components/PhotoGallery';

export const metadata = socialMetadata({ title: 'Photography', path: '/photography/', description: "City life, architecture, and the landscapes in between. A collection of moments from my wanderings with a camera." });

export default function PhotographyPage() {
  const gallery = getPhotography();
  return <main className="container">
    <section>
      <h1 className="page-title">Photography</h1>
      <p className="photo-intro">{gallery.intro}</p>
    </section>
    <PhotoGallery photos={gallery.photos.map((photo) => ({ src: photo.src, alt: photo.alt, caption: photo.caption }))} />
  </main>;
}
