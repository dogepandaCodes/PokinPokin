import React from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from '../../assets/store.png';

export function HeroSection() {
  const scrollToPricing = () => {
    document
      .getElementById("pricing")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
              🎉 Now Open at 4 Locations!
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              The Ultimate Claw Machine Experience
            </h1>
            <p className="text-xl text-white/90">
              Test your skills, win amazing prizes, and collect
              points for exclusive rewards. Join thousands of
              players in the most exciting arcade adventure!
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={scrollToPricing}
                className="bg-white text-purple-700 hover:bg-white/90"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-purple-600 bg-white hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-colors"
                onClick={() =>
                  document
                    .getElementById("locations")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Find a Location
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm text-white/80">
                  Claw Machines
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-sm text-white/80">
                  Prizes
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm text-white/80">
                  Online Support
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="PokinPokin Claw Machine Store"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-purple-900 px-4 py-2 rounded-full font-bold shadow-lg animate-bounce">
              ⭐️ Win Big!
            </div>
            <div className="absolute -bottom-4 -left-4 bg-pink-400 text-white px-4 py-2 rounded-full font-bold shadow-lg">
              🧸 Premium Prizes
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}