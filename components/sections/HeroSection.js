import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuroraText } from "@/components/ui/aurora-text";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function HeroSection() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-white">
      {/* Built on Aptos Text */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-16 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20"
      >
        
      </motion.div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-gray-800 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Image
            src="/logo.png"
            alt="GTA Logo"
            width={200}
            height={200}
            className="mx-auto mb-8"
          />
          
          <h1 className="text-6xl md:text-8xl font-bold mb-4 font-display">
            Grand Theft <AuroraText>Aptos</AuroraText>
          </h1>
          
          <h2 className="text-2xl md:text-3xl mb-4 text-gray-700 font-display tracking-wide">
            Where AI Meets Chaos
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-600 font-display">
            The first truly living open world
          </p>
          
          <Link href="/">
            <RainbowButton className="text-xl py-4 font-display">
              Enter the Revolution
            </RainbowButton>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <span className="block w-6 h-6 border-b-2 border-r-2 border-white rotate-45" />
      </motion.div>
    </div>
  );
} 