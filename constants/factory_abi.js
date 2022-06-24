const CollectionFactoryContract = {
  MAINNET_721_PRIVATE: "0xa4fDb09e1796730bfBA8a352074F0dd65D400Dd4", //FantomNFTFactoryPrivate
  MAINNET_721_PUBLIC: "0xCC7A2eC7A8A0564518fD3D2ca0Df8B2137626144", //FantomNFTFactory
  TESTNET_721_PRIVATE: "0xB7eC773954597f4fb9Ff5AAB16a5c8C05bbba477", //FantomNFTFactoryPrivate
  TESTNET_721_PUBLIC: "0xfa20Ed48d82D76f66631E93ec4f72C7bA21E81aB", //FantomNFTFactory
  MAINNET_1155_PRIVATE: "0x736Eae40AdFf88570b92378c97a0D11b44E1C953", //FantomArtFactoryPrivate
  MAINNET_1155_PUBLIC: "0x520DaB621f93F59d3557174280AB1B6d4FB8c956", //FantomArtFactory
  TESTNET_1155_PRIVATE: "0xaC225C2093De359DC425d192F65280Ae292E57AE", //FantomArtFactoryPrivate
  TESTNET_1155_PUBLIC: "0xeC2f1d8Eb6C3F99a4b03ba138b1127a6E080dD15", //FantomArtFactory
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
