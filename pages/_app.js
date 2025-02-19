import "../styles/globals.css";
import { ThemeProvider } from "../components/connectwallet/ThemeProvider";
import { WalletProvider } from "../components/connectwallet/WalletProvider";
import { AutoConnectProvider } from "../components/connectwallet/AutoConnectProvider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ['latin'] })

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AutoConnectProvider>
        <WalletProvider>
          <Component {...pageProps} />
        </WalletProvider>
      </AutoConnectProvider>
    </ThemeProvider>
  );
}

export default MyApp;