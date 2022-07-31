const CollectionFactoryContract = {
  MAINNET_721_PRIVATE: "0x4FB4E190EdB108A3498DF77813a867764dAf64D0", //FantomNFTFactoryPrivate
  MAINNET_721_PUBLIC: "0x5d03bec8164961748218F0feBb4E1dBfA98C8Ee5", //FantomNFTFactory
  TESTNET_721_PRIVATE: "0x9eB151d7468b1b95d5528A52F4964a4b8c9D6628", //FantomNFTFactoryPrivate
  TESTNET_721_PUBLIC: "0xEd965428614957e74783a155a7C16a15F8Ac54BD", //FantomNFTFactory
  MAINNET_1155_PRIVATE: "0xEe022CF02B9519F2338cA16c529175f8E40344B6", //FantomArtFactoryPrivate
  MAINNET_1155_PUBLIC: "0x148820b4675d931346cB66464fE42647Ff779212", //FantomArtFactory
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
