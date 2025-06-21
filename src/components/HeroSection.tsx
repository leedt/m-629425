

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate parallax effect
  const backgroundY = scrollY * 0.5;
  const contentY = scrollY * 0.2;

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background image with parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{
          backgroundImage: "url('https://img-v2.gtsstatic.net/reno/imagereader.aspx?imageurl=https%3A%2F%2Fmediarem.metrolist.net%2Fmetrolist%2Flistingpics%2Fbigphoto%2F2025%2F04%2F03%2Fde76072a-b004-43e0-9683-036853ab2f5e.jpg%3Fdate%3D2025-06-13&option=N&h=472&permitphotoenlargement=false')",
          transform: `translateY(${backgroundY}px)`,
          backgroundPosition: `center ${50 + scrollY * 0.05}%`
        }} 
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      
      {/* Content */}
      <div 
        className="relative h-full flex flex-col justify-start items-center text-center px-4 pt-[15vh]" 
        style={{ transform: `translateY(${contentY}px)` }}
      >
        <div className="max-w-3xl animate-fade-in">
          <span className="inline-block text-white/90 text-lg mb-4 tracking-wide border-b border-white/30 pb-2">
            {t.hero.subtitle}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 whitespace-nowrap">
            {t.hero.title}
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            {t.hero.description}
          </p>
        </div>
      </div>
    </section>
  );
}

