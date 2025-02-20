import { useState, useEffect } from 'react';
import Head from 'next/head';
import HeroSection from '@/components/sections/HeroSection';
import { useTheme } from 'next-themes';
import { Particles } from '@/components/ui/particles'; // Update this path based on where you saved the Particles component

export default function LandingPage() {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState('#ffffff');

  useEffect(() => {
    setColor(resolvedTheme === 'dark' ? '#ffffff' : '#000000');
  }, [resolvedTheme]);

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <Head>
        <title>Grand Theft Aptos - AI-Powered Gaming Revolution</title>
        <meta name="description" content="Experience the first truly living open world game powered by AI and blockchain technology" />
        <meta property="og:title" content="Grand Theft Aptos" />
        <meta property="og:description" content="Where AI Meets Chaos - The first truly living open world" />
        <meta property="og:image" content="/og-image.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Add Particles component */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        color={color}
        refresh={false}
      />

      <main className="flex-grow relative z-10">
        <div className="relative">
          <HeroSection />
        </div>
      </main>
    </div>
  );
}