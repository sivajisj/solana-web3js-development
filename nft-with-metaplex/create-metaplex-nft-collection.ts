import {
    createNft,
    mplTokenMetadata,
  } from "@metaplex-foundation/mpl-token-metadata";
  import {
    createGenericFile,
    generateSigner,
    keypairIdentity,
    percentAmount,
  } from "@metaplex-foundation/umi";
  import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
  import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
  import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
  } from "@solana-developers/helpers";
  import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
  import { promises as fs } from "fs";
  import * as path from "path";

// // create a new connection to Solana's devnet cluster
const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.1 * LAMPORTS_PER_SOL
);
console.log("Loaded user:", user.publicKey.toBase58());

const umi = createUmi(connection);
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi.use(keypairIdentity(umiKeypair)).use(mplTokenMetadata()).use(irysUploader())

const collectionImagePath = path.resolve(__dirname, "assets", "collection.png");

const buffer = await fs.readFile(collectionImagePath);
let file = createGenericFile(buffer, collectionImagePath, {
  contentType: "image/png"
})
const [image] = await umi.uploader.upload([file]);
console.log("image uri : ", image);

const uri = await umi.uploader.uploadJson({
  name: "SJ Collection",
  symbol: "SJ",
  description: "SJ Collection description",
  image,
})
console.log("Collection offchain metadata URI:", uri);


// generate mint keypair
const collectionMint = generateSigner(umi);

// create and mint NFT
await createNft(umi, {
  mint: collectionMint,
  name: "SJ Collection",
  uri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink(
  "address",
  collectionMint.publicKey,
  "devnet",
);
console.log(`Collection NFT:  ${explorerLink}`);
console.log(`Collection NFT address is:`, collectionMint.publicKey);
console.log(" Finished successfully!");

