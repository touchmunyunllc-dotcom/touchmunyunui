import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCollectionColor } from '@/utils/colorUtils';

interface Collection {
  id: string;
  title: string;
  link?: string;
}

const collections: Collection[] = [
  { id: '1', title: 'Shop the summer collection', link: '/collections' },
  { id: '2', title: 'New arrivals now available', link: '/new-arrivals' },
  { id: '3', title: 'Best sellers — limited time', link: '/best-sellers' },
  { id: '4', title: 'First purchase 10% off', link: '/register' },
];

export const CollectionBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % collections.length);
        setIsVisible(true);
      }, 250);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const currentCollection = collections[currentIndex];
  const collectionColors = getCollectionColor(currentCollection.title);

  return (
    <div className="border-b border-white/10 bg-account-menu/95 backdrop-blur-sm">
      <div className="page-shell relative flex h-11 sm:h-12 items-center justify-center">
        <div
          className={`transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
        >
          {currentCollection.link ? (
            <Link
              href={currentCollection.link}
              className={`${collectionColors.text} text-xs sm:text-sm font-semibold tracking-[0.12em] uppercase hover:opacity-90 transition-opacity`}
            >
              {currentCollection.title}
            </Link>
          ) : (
            <span
              className={`${collectionColors.text} text-xs sm:text-sm font-semibold tracking-[0.12em] uppercase`}
            >
              {currentCollection.title}
            </span>
          )}
        </div>

        <div className="absolute right-0 flex gap-1">
          {collections.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsVisible(true);
                }, 200);
              }}
              className={`rounded-full transition-all ${
                index === currentIndex
                  ? `w-4 h-1 ${collectionColors.bg}`
                  : 'w-1 h-1 bg-white/25 hover:bg-white/40'
              }`}
              aria-label={`Announcement ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
