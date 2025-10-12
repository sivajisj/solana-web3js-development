import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");


console.log(
    `🔑 Loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`,
  );
  
const tokenMintAccount = new PublicKey("9gAKzzKU5Pm3TFcsDtEyBLJWHwSeeBy7gun5EzJG5pfB");

const recipient = user.publicKey;

const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMintAccount,
    recipient,
  );

console.log(`Token Account: ${tokenAccount.address.toBase58()}`);

const link = getExplorerLink(
"address",
tokenAccount.address.toBase58(),
"devnet",
);

console.log(`Created token Account: ${link}`);
// https://explorer.solana.com/address/2dFKJd9aqHShgHzABs9nYhzrz9JuBbESWVPQF2ezoDo1?cluster=devnet