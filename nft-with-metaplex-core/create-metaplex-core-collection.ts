import { createCollection, mplCore } from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  percentAmount,
  sol,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { log } from "console";
import { promises as fs } from "fs";
import * as path from "path";

const connection = new Connection(clusterApiUrl("devnet"));
const user = await getKeypairFromFile();
await airdropIfRequired(
    connection,
    user.publicKey,
    1*LAMPORTS_PER_SOL,
    0.1* LAMPORTS_PER_SOL,
);

console.log("Loaded user:", user.publicKey.toBase58());


const umi = createUmi(connection).use(mplCore()).use(irysUploader());

const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey)

umi.use(keypairIdentity(umiKeypair))


//uploading offchain metadata to Irys: 
const collectionImagePath = "assets/collection.png";
 
const buffer = await fs.readFile(collectionImagePath);
let file = createGenericFile(buffer, collectionImagePath, {
  contentType: "image/png",
}); 


const [image] = await umi.uploader.upload([file]);
console.log("image uri:", image);

const metadata = {
  name: "My Collection",
  description: "My Collection description",
  image,
  external_url: "https://example.com",
  properties: {
    files: [
      {
        uri: image,
        type: "image/jpeg",
      },
    ],
    category: "image",
  },
};

const uri = await umi.uploader.uploadJson(metadata);
console.log("Collection offchain metadata URI:", uri);


const collection = generateSigner(umi);

await createCollection(umi, {
  collection,
  name: "My Collection",
  uri,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink("address", collection.publicKey, "devnet");
console.log(`Collection: ${explorerLink}`);
console.log(`Collection address is:  ${collection.publicKey}`);
console.log(" Finished successfully!");