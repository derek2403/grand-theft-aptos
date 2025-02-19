import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuroraText } from "@/components/ui/aurora-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Particles } from "@/components/ui/particles";

export default function HeroSection() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-white">
      <Particles
        className="absolute inset-0 -z-10"
        quantity={300}
        ease={30}
        staticity={50}
        color="#666666"
        size={0.8}
      />
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
            width={300}
            height={300}
            className="mx-auto mb-10"
          />
          
          <h1 className="text-6xl md:text-8xl font-bold mb-3 font-display">
            Grand Theft <AuroraText>Aptos</AuroraText>
          </h1>
          
          <h2 className="text-2xl md:text-3xl mb-3 text-gray-700 font-display tracking-wide">
            Where AI Meets Chaos
          </h2>
          
          <p className="text-xl md:text-2xl mb-6 text-gray-600 font-display">
            The first truly living open world
          </p>
          
          <Link href="/">
            <RainbowButton className="text-2xl py-5 px-10 font-display">
              Enter the Revolution
            </RainbowButton>
          </Link>

          {/* Built on Aptos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-14 flex flex-col items-center gap-0"
          >
            <p className="text-xl text-gray-600 font-display">Built On</p>
            <div className="relative w-36 h-24">
              <Image
                src="/partners/aptos.png"
                alt="Aptos"
                fill
                priority
                className="object-contain"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 