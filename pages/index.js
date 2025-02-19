import { WalletSelector } from "../components/connectwallet/WalletSelector";
import { WalletInfo } from "../components/WalletInfo";



export default function Home() {
  return (
    <div className="p-4">
      <WalletSelector />
      <WalletInfo/>
    </div>
  );
}
