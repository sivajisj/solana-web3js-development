import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";

export const BalanceDisplay: FC = () => {
  const [balance, setBalance] = useState(0);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!connection || !publicKey) return;

    // Fetch initial balance safely
    connection.getAccountInfo(publicKey).then((info) => {
      if (info) {
        setBalance(info.lamports / LAMPORTS_PER_SOL);
      } else {
        setBalance(0);
      }
    });

    // Subscribe to account balance changes
    const subscriptionId = connection.onAccountChange(
      publicKey,
      (updatedAccountInfo) => {
        setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
      },
      "confirmed"
    );

    // Cleanup the listener on unmount
    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, publicKey]);

  return (
    <div>
      {publicKey ? (
        <p>Balance: {balance.toFixed(4)} SOL</p>
      ) : (
        <p>Connect your wallet to view balance</p>
      )}
    </div>
  );
};
