import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

export default function BuiltOn() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 50]);

  // Add console log to check if component is rendering
  console.log('BuiltOn component rendering');

  return (
    <section ref={sectionRef} className="py-16 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background opacity-80" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          style={{ opacity, y }}
          className="text-center flex flex-col items-center justify-center min-h-[200px]"
        >
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-4xl font-medium text-gray-700 font-display tracking-wide">Fully Built On</h2>
            <div className="relative w-48 h-12">
              <Image
                src="/partners/aptos.png"
                alt="Aptos"
                fill
                priority
                className="object-contain"
                onError={(e) => {
                  console.error('Image failed to load:', e);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully');
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 