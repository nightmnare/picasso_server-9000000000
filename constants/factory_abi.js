const CollectionFactoryContract = {
  MAINNET_721_PRIVATE: '0xa4fDb09e1796730bfBA8a352074F0dd65D400Dd4', //FantomNFTFactoryPrivate
  MAINNET_721_PUBLIC: '0xCC7A2eC7A8A0564518fD3D2ca0Df8B2137626144', //FantomNFTFactory
  TESTNET_721_PRIVATE: '0xc40a0Cfd3A7D2cD33B6b80F0B4f5B2839C18f972', //FantomNFTFactoryPrivate
  TESTNET_721_PUBLIC: '0xdF32D0563C02a668baba719f461017F229cab135', //FantomNFTFactory
  MAINNET_1155_PRIVATE: '0x736Eae40AdFf88570b92378c97a0D11b44E1C953', //FantomArtFactoryPrivate
  MAINNET_1155_PUBLIC: '0x520DaB621f93F59d3557174280AB1B6d4FB8c956', //FantomArtFactory
  TESTNET_1155_PRIVATE: '0x84A76f55ef08d327e1Da995cd51eE12326D19813', //FantomArtFactoryPrivate
  TESTNET_1155_PUBLIC: '0x35B8088636118D4920491115Bf70bB0Ad8465c63', //FantomArtFactory
  ABI: [
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'exists',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function'
    }
  ]
};

module.exports = CollectionFactoryContract;
