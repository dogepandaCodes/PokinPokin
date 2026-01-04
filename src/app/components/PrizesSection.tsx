import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Prize {
  id: number;
  name: string;
  points: number;
  image: string;
}

// Flatten all prizes into one array for horizontal scrolling
const allPrizes: Prize[] = [
  {
    id: 1,
    name: 'Rainbow Bear',
    points: 50,
    image: 'https://images.unsplash.com/photo-1671043119167-d1b8f88a88c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcGx1c2glMjB0b3l8ZW58MXx8fHwxNzY3MzU3NjgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 2,
    name: 'Fluffy Bear',
    points: 60,
    image: 'https://images.unsplash.com/photo-1708392834916-15c7c9445d62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVmZmVkJTIwYW5pbWFsJTIwYmVhcnxlbnwxfHx8fDE3NjczODMyMzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 3,
    name: 'Kawaii Friends',
    points: 55,
    image: 'https://images.unsplash.com/photo-1763076704636-72bbb07a2007?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXdhaWklMjBwbHVzaGllfGVufDF8fHx8MTc2NzM4MzIzMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 4,
    name: 'Teddy Bear',
    points: 45,
    image: 'https://images.unsplash.com/photo-1753928578920-c3e936415a21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWRkeSUyMGJlYXIlMjB0b3l8ZW58MXx8fHwxNzY3MzI2NTAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 5,
    name: 'Soft Bunny',
    points: 48,
    image: 'https://images.unsplash.com/photo-1763832328828-86684ffc66b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwdG95JTIwYnVubnl8ZW58MXx8fHwxNzY3MzgzMjMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 6,
    name: 'Magical Unicorn',
    points: 75,
    image: 'https://images.unsplash.com/photo-1564470939458-1289338e2d85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVzaCUyMHVuaWNvcm58ZW58MXx8fHwxNzY3MzgzMjM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 7,
    name: 'Panda Pal',
    points: 70,
    image: 'https://images.unsplash.com/photo-1764275927195-0a77f89ce840?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVmZmVkJTIwcGFuZGF8ZW58MXx8fHwxNzY3MzgzMjM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 8,
    name: 'Kitty Cat',
    points: 65,
    image: 'https://images.unsplash.com/photo-1766229492396-986921ff2c61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVzaCUyMGNhdHxlbnwxfHx8fDE3NjczODMyMzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 9,
    name: 'Cuddly Friend',
    points: 60,
    image: 'https://images.unsplash.com/photo-1625773987755-9929a8d19d10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwc3R1ZmZlZCUyMGFuaW1hbHxlbnwxfHx8fDE3NjczODMyMzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 10,
    name: 'Baby Elephant',
    points: 80,
    image: 'https://images.unsplash.com/photo-1763666964780-b91facdfb8d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVzaCUyMGVsZXBoYW50fGVufDF8fHx8MTc2NzM4MzIzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 11,
    name: 'Giant Rainbow Bear',
    points: 100,
    image: 'https://images.unsplash.com/photo-1671043119167-d1b8f88a88c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcGx1c2glMjB0b3l8ZW58MXx8fHwxNzY3MzU3NjgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 12,
    name: 'Premium Unicorn',
    points: 120,
    image: 'https://images.unsplash.com/photo-1564470939458-1289338e2d85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVzaCUyMHVuaWNvcm58ZW58MXx8fHwxNzY3MzgzMjM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 13,
    name: 'Jumbo Panda',
    points: 110,
    image: 'https://images.unsplash.com/photo-1764275927195-0a77f89ce840?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVmZmVkJTIwcGFuZGF8ZW58MXx8fHwxNzY3MzgzMjM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 14,
    name: 'Deluxe Teddy',
    points: 95,
    image: 'https://images.unsplash.com/photo-1753928578920-c3e936415a21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWRkeSUyMGJlYXIlMjB0b3l8ZW58MXx8fHwxNzY3MzI2NTAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 15,
    name: 'Super Elephant',
    points: 130,
    image: 'https://images.unsplash.com/photo-1763666964780-b91facdfb8d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVzaCUyMGVsZXBoYW50fGVufDF8fHx8MTc2NzM4MzIzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

export function PrizesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 5); // Small threshold to account for rounding
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const currentRef = containerRef.current;
    if (currentRef) {
      updateScrollButtons();
      currentRef.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);

      return () => {
        currentRef.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 300;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-12 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Available Prizes</h2>
          <p className="text-muted-foreground">
            Redeem your points for these adorable plushies!
          </p>
        </div>

        <div className="relative">
          {/* Left scroll button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-purple-600/60 hover:bg-purple-600/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right scroll button */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-purple-600/60 hover:bg-purple-600/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Horizontal scrollable container */}
          <div ref={containerRef} className="overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex gap-4 px-2">
              {allPrizes.map((prize) => (
                <Card key={prize.id} className="flex-shrink-0 w-40 md:w-48 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={prize.image}
                      alt={prize.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3 md:p-4 text-center">
                    <h3 className="font-semibold mb-2 text-sm md:text-base">{prize.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-purple-600 font-bold">
                      <span className="text-base md:text-lg">{prize.points}</span>
                      <span className="text-xs md:text-sm">pts</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}