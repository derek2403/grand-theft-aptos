import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuroraText } from "@/components/ui/aurora-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Particles } from "@/components/ui/particles";
import { useTheme } from "next-themes";

export default function HeroSection() {
  const containerRef = useRef(null);
  const { resolvedTheme } = useTheme();

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-white">
      <div className="absolute inset-0">
        {/* Blue particles layer */}
        <Particles
          className="absolute inset-0"
          quantity={60}
          color="#4f46e5"  // Indigo color
          lineColor="#4f46e5"
          speed={0.3}     // Reduced from 6
          size={1}      // Reduced from 3
          lineWidth={0.5}  // Made lines thinner
          lineDistance={200}
        />
        {/* Purple particles layer */}
        <Particles
          className="absolute inset-0"
          quantity={50}
          ease={40}
          staticity={40}
          color="#a855f7"  // Purple color
          size={2}         // Increased size
          speed={1}
          refresh={false}
          vx={-0.1}
          vy={-0.1}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-gray-800 px-4 pt-20">
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
            Grand Theft{" "}
            <AuroraText 
              className="animate-fast-gradient"
              style={{ 
                "--gradient-speed": "2s"
              }}
            >
              Aptos
            </AuroraText>
          </h1>
          
          <h2 className="text-2xl md:text-3xl mb-3 text-gray-700 font-display tracking-wide">
            Where{" "}
            <AuroraText 
              style={{ 
                "--color-1": "210 100% 50%",
                "--color-2": "220 100% 60%",
                "--color-4": "195 100% 45%"
              }}
              className="font-bold"
            >
              AI
            </AuroraText>
            {" "}Meets{" "}
            <AuroraText 
              style={{ "--color-1": "0 100% 60%", "--color-2": "30 100% 60%", "--color-4": "345 100% 60%" }}
              className="font-bold"
            >
              Chaos
            </AuroraText>
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
            <p className="text-xl text-gray-600 font-display">100% Built On</p>
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