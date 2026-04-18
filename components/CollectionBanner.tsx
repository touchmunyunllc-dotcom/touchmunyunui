import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCollectionColor } from '@/utils/colorUtils';

interface Collection {
  id: string;
  title: string;
  link?: string;
}

const collections: Collection[] = [
  { id: '1', title: 'SHOP THE SUMMER COLLECTION', link: '/collections' },
  { id: '2', title: 'NEW ARRIVALS NOW AVAILABLE', link: '/new-arrivals' },
  { id: '3', title: 'BEST SELLERS - LIMITED TIME', link: '/best-sellers' },
  { id: '4', title: 'FIRST TIME PURCHASE 10% OFF COUPON', link: '/register' },
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
      }, 300); // Half of transition duration
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const currentCollection = collections[currentIndex];
  const collectionColors = getCollectionColor(currentCollection.title);

  const BannerContent = () => (
    <div className="relative w-full h-16 sm:h-20 flex items-center justify-center overflow-hidden">
      {/* Context-based gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${collectionColors.gradient} opacity-5`} />
      
      {/* Subtle gradient overlays on sides */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-account-menu via-account-menu/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-account-menu via-account-menu/80 to-transparent z-10 pointer-events-none" />
      
      {/* Central text with context color */}
      <div className={`relative z-0 transition-opacity duration-[600ms] ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {currentCollection.link ? (
          <Link
            href={currentCollection.link}
            className={`${collectionColors.text} hover:opacity-80 transition-all duration-300 text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase letter-spacing-wide drop-shadow-lg`}
          >
            {currentCollection.title}
          </Link>
        ) : (
          <span className={`${collectionColors.text} text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase letter-spacing-wide drop-shadow-lg`}>
            {currentCollection.title}
          </span>
        )}
      </div>

      {/* Premium Navigation dots with context color */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
        {collections.map((_, index) => {
          const dotColors = getCollectionColor(collections[index].title);
          return (
            <button
              key={index}
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsVisible(true);
                }, 300);
              }}
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? `${dotColors.bg} border ${dotColors.border} w-4 h-1.5 shadow-lg`
                  : 'bg-foreground/30 hover:bg-foreground/50 w-1.5 h-1.5'
              }`}
              aria-label={`Go to collection ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-account-menu border-b border-foreground/10">
      <BannerContent />
    </div>
  );
};

