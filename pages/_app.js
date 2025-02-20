import "../styles/globals.css";
import { ThemeProvider } from "../components/connectwallet/ThemeProvider";
import { WalletProvider } from "../components/connectwallet/WalletProvider";
import { AutoConnectProvider } from "../components/connectwallet/AutoConnectProvider";
import { WalletSelector } from "../components/connectwallet/WalletSelector";
import { Inter } from "next/font/google";
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Models</title>
        <link rel="icon" type="image/png" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AutoConnectProvider>
          <WalletProvider>
            <div className="fixed top-4 right-4 z-50">
              <WalletSelector />
            </div>
            <Component {...pageProps} />
          </WalletProvider>
        </AutoConnectProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;