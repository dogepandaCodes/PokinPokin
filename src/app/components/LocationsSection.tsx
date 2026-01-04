import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin, Phone, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import metrotownImage from '../../assets/metrotown.png';
import guildfordImage from '../../assets/guildford.png';
import scarboroughImage from '../../assets/stc.png';
import upperCanadaImage from '../../assets/ucm.png';

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
}

const locations: Location[] = [
  {
    id: '1',
    name: 'Metrotown',
    address: '4720 Kingsway Suite 2600, Burnaby, BC V5H 4N2',
    phone: '(604) 123-4567',
    hours: 'Mon-Sun: 10am - 9pm',
    image: metrotownImage,
  },
  {
    id: '2',
    name: 'Guildford Town Centre',
    address: '10355 152 St #1388, Surrey, BC V3R 7C1',
    phone: '(604) 234-5678',
    hours: 'Mon-Sat: 10am - 9pm, Sun: 11am - 7pm',
    image: guildfordImage,
  },
  {
    id: '3',
    name: 'Scarborough Town Centre',
    address: '300 Borough Dr, Scarborough, ON M1P 4P5',
    phone: '(437) 438-1022',
    hours: 'Mon-Sat: 10am - 9pm, Sun: 11am - 7pm',
    image: scarboroughImage,
  },
  {
    id: '4',
    name: 'Upper Canada Mall',
    address: '17600 Yonge Street, Newmarket, ON L3Y 4Z1',
    phone: '(437) 438-1022',
    hours: 'Mon-Sat: 10am - 8pm, Sun: 11am - 7pm',
    image: upperCanadaImage,
  },
];

export function LocationsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 5);
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
      const scrollAmount = 320;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Our Locations</h2>
          <p className="text-muted-foreground">
            Visit any of our locations to experience the thrill of PokinPokin
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
              {locations.map((location) => (
                <Card key={location.id} className="flex-shrink-0 w-72 md:w-80 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-40 md:h-48 overflow-hidden">
                    <img
                      src={location.image}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div className="flex gap-2 items-start">
                      <MapPin className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs md:text-sm">{location.address}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Phone className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <a
                        href={`tel:${location.phone}`}
                        className="text-xs md:text-sm hover:text-purple-600 transition-colors"
                      >
                        {location.phone}
                      </a>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <p className="text-xs md:text-sm">{location.hours}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="py-6">
              <h3 className="text-xl font-bold mb-2">Can't Visit In Person?</h3>
              <p className="text-muted-foreground mb-4">
                Call us at <a href="tel:(555)123-4567" className="text-purple-600 font-semibold hover:underline">(555) 123-4567</a> for general inquiries
              </p>
              <p className="text-sm text-muted-foreground">
                We're available Mon-Sun from 9am to 10pm PST
              </p>
            </CardContent>
          </Card>
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