import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Particles } from "@/components/ui/particles";
import HeroSection from '@/components/sections/HeroSection';
import BuiltOn from '@/components/sections/BuiltOn';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-black to-purple-900">
      <Head>
        <title>Grand Theft Aptos - AI-Powered Gaming Revolution</title>
        <meta name="description" content="Experience the first truly living open world game powered by AI and blockchain technology" />
        <meta property="og:title" content="Grand Theft Aptos" />
        <meta property="og:description" content="Where AI Meets Chaos - The first truly living open world" />
        <meta property="og:image" content="/og-image.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Particles
        className="fixed inset-0 -z-10"
        quantity={300}
        staticity={20}
        ease={30}
        size={0.8}
        color="#ffffff"
        refresh={false}
        vx={0.3}
        vy={0.2}
      />

      <main className="flex-grow relative z-10">
        <div className="relative">
          <HeroSection />
          <BuiltOn />
        </div>
      </main>
    </div>
  );
} 