require("dotenv").config();
const ethers = require("ethers");

const CollectionFactoryContract = require("../constants/factory_abi");
const provider = new ethers.providers.JsonRpcProvider(
  process.env.NETWORK_RPC,
  parseInt(process.env.NETWORK_CHAINID)
);

let network = process.env.RUNTIME;
//mainnet
network = false;

const loadContract = async (isPrivate, is721) => {
  let address;
  if (network)
    address = isPrivate
      ? is721
        ? CollectionFactoryContract.TESTNET_721_PRIVATE
        : CollectionFactoryContract.TESTNET_1155_PRIVATE
      : is721
      ? CollectionFactoryContract.TESTNET_721_PUBLIC
      : CollectionFactoryContract.TESTNET_1155_PUBLIC;
  else
    address = isPrivate
      ? is721
        ? CollectionFactoryContract.MAINNET_721_PRIVATE
        : CollectionFactoryContract.MAINNET_1155_PRIVATE
      : is721
      ? CollectionFactoryContract.MAINNET_721_PUBLIC
      : CollectionFactoryContract.MAINNET_1155_PUBLIC;
  console.log("contract1", address, network);
  return new ethers.Contract(address, CollectionFactoryContract.ABI, provider);
};

const isInternalCollection = async (address, is721) => {
  console.log("address", address);
  let private_sc = await loadContract(true, is721);
  let public_sc = await loadContract(false, is721);
  let isPrivate = await private_sc.exists(address);
  console.log("isPrivate", isPrivate);
  let isPublic = await public_sc.exists(address);
  console.log("isPublic", isPublic);
  return [isPrivate || isPublic, isPrivate];
};

const FactoryUtils = {
  loadContract,
  isInternalCollection,
};

module.exports = FactoryUtils;
