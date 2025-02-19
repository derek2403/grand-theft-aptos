import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import ChatInterface from '../components/ChatInterface';
import WalletConnection from '../components/WalletConnection';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <WalletConnection />
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Blockchain Transaction Assistant
        </h1>
        <ChatInterface />
      </div>
    </div>
  );
}
