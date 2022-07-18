const CollectionFactoryContract = {
  MAINNET_721_PRIVATE: "0x5c64661368957ac19d6673063D0160aD3A27d079", //FantomNFTFactoryPrivate
  MAINNET_721_PUBLIC: "0x719e023b7a3dBC2fCD03A859De3d08E67BB0f3D9", //FantomNFTFactory
  TESTNET_721_PRIVATE: "0x9eB151d7468b1b95d5528A52F4964a4b8c9D6628", //FantomNFTFactoryPrivate
  TESTNET_721_PUBLIC: "0xEd965428614957e74783a155a7C16a15F8Ac54BD", //FantomNFTFactory
  MAINNET_1155_PRIVATE: "0x736Eae40AdFf88570b92378c97a0D11b44E1C953", //FantomArtFactoryPrivate
  MAINNET_1155_PUBLIC: "0x21ab799aEDBB9f79149b5A07b528365c29306625", //FantomArtFactory
  TESTNET_1155_PRIVATE: "0x7039E456A4C18e20452e3D53cb4Cff42da0651E2", //FantomArtFactoryPrivate
  TESTNET_1155_PUBLIC: "0xA6d9FE6E3eD58d654EfB89648Eee4b3d42df217E", //FantomArtFactory
  ABI: [
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "exists",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
  ],
};

module.exports = CollectionFactoryContract;
