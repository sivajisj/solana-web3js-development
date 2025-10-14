import {
    mplCore,
    create,
    fetchCollection,
  } from "@metaplex-foundation/mpl-core";
  import {
    createGenericFile,
    generateSigner,
    keypairIdentity,
    publicKey as UMIPublicKey,
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
  
  // create a new connection to Solana's devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"));
  
  // load keypair from local file system
  // assumes that the keypair is already generated using `solana-keygen new`
  const user = await getKeypairFromFile();
  console.log("Loaded user:", user.publicKey.toBase58());
  
  await airdropIfRequired(
    connection,
    user.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.1 * LAMPORTS_PER_SOL,
  );
  
  const umi = createUmi(connection).use(mplCore()).use(irysUploader());
  
  // convert to umi compatible keypair
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  
  // assigns a signer to our umi instance, and loads the MPL metadata program and Irys uploader plugins.
  umi.use(keypairIdentity(umiKeypair));

  const assetImagePath = "assets/nft.png";

const buffer = await fs.readFile(assetImagePath);
let file = createGenericFile(buffer, assetImagePath, {
  contentType: "image/png",
});

// upload image and get image uri
const [image] = await umi.uploader.upload([file]);
console.log("image uri:", image);

const metadata = {
  name: "My Asset",
  description: "My Asset Description",
  image,
  external_url: "https://example.com",
  attributes: [
    {
      trait_type: "trait1",
      value: "value1",
    },
    {
      trait_type: "trait2",
      value: "value2",
    },
  ],
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

// upload offchain json using irys and get metadata uri
const uri = await umi.uploader.uploadJson(metadata);
console.log("Asset offchain metadata URI:", uri);

// Substitute in your collection NFT address from create-metaplex-nft-collection.ts
const collection = await fetchCollection(
    umi,
    UMIPublicKey("6W8d9EBbjuBYnifVGcZ8tQXv84PgPxrCk2t4rwGtwahU"),
  );
  const asset = generateSigner(umi);
  
  // create and mint NFT
  await create(umi, {
    asset,
    collection,
    name: "My Asset",
    uri,
  }).sendAndConfirm(umi, { send: { commitment: "finalized" } });
  
  let explorerLink = getExplorerLink("address", asset.publicKey, "devnet");
  console.log(`Asset: ${explorerLink}`);
  console.log(`Asset address: ${asset.publicKey}`);