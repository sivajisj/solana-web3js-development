import {
    findMetadataPda,
    mplTokenMetadata,
    verifyCollectionV1,
  } from "@metaplex-foundation/mpl-token-metadata";
  import {
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
  
  // Create a new connection to Solana's devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"));
  
  // Load keypair from local file system (already generated via `solana-keygen new`)
  const user = await getKeypairFromFile();
  console.log("Loaded user:", user.publicKey.toBase58());
  
  // Airdrop SOL if balance is low
  await airdropIfRequired(
    connection,
    user.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.1 * LAMPORTS_PER_SOL
  );
  
  //  Create UMI instance with proper signer identity
  const umi = createUmi(connection)
    .use(keypairIdentity(user)) // <-- required to sign transactions
    .use(irysUploader())        // optional uploader setup
    .use(mplTokenMetadata());   // load metadata plugin
  
  // Collection and NFT addresses
  const collectionAddress = UMIPublicKey("b5hqtPUsLTBvWM3qryPgm7PCYBNoSDVxXpzysEMCtrw");
  
  // Replace this with your actual NFT address
  const nftAddress = UMIPublicKey("B4LLUPJ974iK3v6AoD2bqGnMxfQhfBozzyVzLtkVR6Xo");
  
  // Verify our collection as a Certified Collection
  const metadata = findMetadataPda(umi, { mint: nftAddress });
  await verifyCollectionV1(umi, {
    metadata,
    collectionMint: collectionAddress,
    authority: umi.identity,
  }).sendAndConfirm(umi);
  
  const explorerLink = getExplorerLink("address", nftAddress, "devnet");
  console.log(` Verified collection successfully!`);
  console.log(`🔗 Explorer: ${explorerLink}`);
  