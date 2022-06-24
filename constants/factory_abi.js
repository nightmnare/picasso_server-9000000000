const CollectionFactoryContract = {
  MAINNET_721_PRIVATE: "0xa4fDb09e1796730bfBA8a352074F0dd65D400Dd4", //FantomNFTFactoryPrivate
  MAINNET_721_PUBLIC: "0xCC7A2eC7A8A0564518fD3D2ca0Df8B2137626144", //FantomNFTFactory
  TESTNET_721_PRIVATE: "0xcce6E084590f6695aF7681d00e1958B405fE0f0c", //FantomNFTFactoryPrivate
  TESTNET_721_PUBLIC: "0x34D4935D69511C233eA481679FabeD579685afa9", //FantomNFTFactory
  MAINNET_1155_PRIVATE: "0x736Eae40AdFf88570b92378c97a0D11b44E1C953", //FantomArtFactoryPrivate
  MAINNET_1155_PUBLIC: "0x520DaB621f93F59d3557174280AB1B6d4FB8c956", //FantomArtFactory
  TESTNET_1155_PRIVATE: "0xAD6503dd1545bDD84c5006D6CF8E09715c5bd9B9", //FantomArtFactoryPrivate
  TESTNET_1155_PUBLIC: "0x9F36067198BE7F48e2Cff58D2E40FCba6f9d4da9", //FantomArtFactory
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
