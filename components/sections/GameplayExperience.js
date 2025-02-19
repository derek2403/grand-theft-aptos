import { useRef, Suspense } from 'react';
import { motion, useInView } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Image from 'next/image';

export default function GameplayExperience() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });

  return (
    <section ref={sectionRef} className="section-spacing relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary opacity-80" />
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Experience the Future of Gaming
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dive into a living world where every character has a purpose and every action matters
          </p>
        </motion.div>

        {/* Single Video Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="aspect-video relative rounded-xl overflow-hidden">
            <Image
              src="/videos/gameplay-thumbnail-1.jpg"
              alt="Gameplay Highlight"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="bg-primary/80 hover:bg-primary p-4 rounded-full transition-colors">
                <PlayIcon className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Simple Play Icon Component
const PlayIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
); 