import "../styles/globals.css";
import { ThemeProvider } from "../components/connectwallet/ThemeProvider";
import { WalletProvider } from "../components/connectwallet/WalletProvider";
import { AutoConnectProvider } from "../components/connectwallet/AutoConnectProvider";
import { WalletSelector } from "../components/connectwallet/WalletSelector";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ['latin'] })

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AutoConnectProvider>
        <WalletProvider>
          <div className="min-h-screen">
            <div className="container mx-auto px-4 py-2">
              <WalletSelector />
              <Component {...pageProps} />
            </div>
          </div>
        </WalletProvider>
      </AutoConnectProvider>
    </ThemeProvider>
  );
}

export default MyApp;