import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
const connection = new Connection(clusterApiUrl("devnet"));

const sender = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${sender.publicKey.toBase58()}`,
);

// Add the recipient public key here.
const recipient = new PublicKey("7nmq5hpADVRnJdk4gT8JpNe3xGHFeukUxDpM9mHSYZQt");

// Substitute in your token mint account
const tokenMintAccount = new PublicKey("9gAKzzKU5Pm3TFcsDtEyBLJWHwSeeBy7gun5EzJG5pfB");

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

console.log(`💸 Attempting to send 1 token to ${recipient.toBase58()}...`);

// Get or create the source token account to store this token
const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  sender.publicKey,
);

// Get or create the destination token account to store this token
const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  recipient,
);

// Transfer the tokens
const signature = await transfer(
  connection,
  sender,
  sourceTokenAccount.address,
  destinationTokenAccount.address,
  sender,
  1 * MINOR_UNITS_PER_MAJOR_UNITS,
);

const explorerLink = getExplorerLink("transaction", signature, "devnet");

console.log(`✅ Transaction confirmed, explorer link is: ${explorerLink}`);

//https://explorer.solana.com/tx/3txieNBToNasLFx9U8LmXHzNVcsVfsiMBj4eVDwUQUr9iaG1MEPfNaRt8E6BqetmMcKRH5HuSXMi87bPVzksjAc8?cluster=devnet