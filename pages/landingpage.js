import { useState, useEffect } from 'react';
import Head from 'next/head';
import HeroSection from '@/components/sections/HeroSection';

export default function LandingPage() {
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

      <main className="flex-grow relative z-10">
        <div className="relative">
          <HeroSection />
        </div>
      </main>
    </div>
  );
} 