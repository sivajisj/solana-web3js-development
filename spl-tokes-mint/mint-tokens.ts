import { mintTo } from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("devnet"));

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const user = getKeypairFromEnvironment("SECRET_KEY");

// Substitute in your token mint account from create-token-mint.ts
const tokenMintAccount = new PublicKey("9gAKzzKU5Pm3TFcsDtEyBLJWHwSeeBy7gun5EzJG5pfB");

// Substitute in your own, or a friend's token account address, based on the previous step.
const recipientAssociatedTokenAccount = new PublicKey(
  "2dFKJd9aqHShgHzABs9nYhzrz9JuBbESWVPQF2ezoDo1",
);

const transactionSignature = await mintTo(
  connection,
  user,
  tokenMintAccount,
  recipientAssociatedTokenAccount,
  user,
  10 * MINOR_UNITS_PER_MAJOR_UNITS,
);

const link = getExplorerLink("transaction", transactionSignature, "devnet");

console.log(`✅ Success! Mint Token Transaction: ${link}`);

//https://explorer.solana.com/tx/34GGfSbMRA5Sh1aMaXirZn8WGqvMfDmKrmymCWEAXxD55679eYS6fw3AXncLGYNai3f9rNLvDKRGmSZPDEwgk5Fe?cluster=devnet