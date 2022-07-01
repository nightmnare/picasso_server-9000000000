const CollectionFactoryContract = {
  MAINNET_721_PRIVATE: "0xa4fDb09e1796730bfBA8a352074F0dd65D400Dd4", //FantomNFTFactoryPrivate
  MAINNET_721_PUBLIC: "0xCC7A2eC7A8A0564518fD3D2ca0Df8B2137626144", //FantomNFTFactory
  TESTNET_721_PRIVATE: "0x9eB151d7468b1b95d5528A52F4964a4b8c9D6628", //FantomNFTFactoryPrivate
  TESTNET_721_PUBLIC: "0xEd965428614957e74783a155a7C16a15F8Ac54BD", //FantomNFTFactory
  MAINNET_1155_PRIVATE: "0x736Eae40AdFf88570b92378c97a0D11b44E1C953", //FantomArtFactoryPrivate
  MAINNET_1155_PUBLIC: "0x520DaB621f93F59d3557174280AB1B6d4FB8c956", //FantomArtFactory
  TESTNET_1155_PRIVATE: "0x41A02b88Ac3c5b3e0Fb5dB04662606f89346D660", //FantomArtFactoryPrivate
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
