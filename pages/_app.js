import { WalletProvider } from '../contexts/WalletContext';
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
}
