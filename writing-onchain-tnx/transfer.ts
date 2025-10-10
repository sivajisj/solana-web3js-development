import {
  Connection,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const suppliedToPubkey = process.argv[2] || null;

if (!suppliedToPubkey) {
  console.log("❌ Please provide a recipient public key as a command-line argument.");
  console.log("👉 Example: npx esrun send-sol.ts <RECIPIENT_PUBLIC_KEY>");
  process.exit(1);
}

const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");

const toPubkey = new PublicKey(suppliedToPubkey);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

console.log(`✅ Connection established with Solana Devnet`);
console.log(`🔑 Sender: ${senderKeypair.publicKey.toBase58()}`);
console.log(`🎯 Recipient: ${toPubkey.toBase58()}`);

const transaction = new Transaction();

const LAMPORTS_TO_SEND = 5000;

const sendSolInstruction = SystemProgram.transfer({
  fromPubkey: senderKeypair.publicKey,  // corrected: 'publicKey' not 'PublicKey'
  toPubkey,
  lamports: LAMPORTS_TO_SEND,           // corrected: 'lamports' not 'lamport'
});

transaction.add(sendSolInstruction);

const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);

console.log(`💸 Successfully sent ${LAMPORTS_TO_SEND} lamports (${LAMPORTS_TO_SEND / 1e9} SOL)`);
console.log(`📦 Transaction signature: ${signature}`);
