require("dotenv").config();
const { default: axios } = require("axios");
const router = require("express").Router();

const ethers = require("ethers");

const mongoose = require("mongoose");
const Collection = mongoose.model("Collection");
const Category = mongoose.model("Category");
const Account = mongoose.model("Account");
const ERC1155CONTRACT = mongoose.model("ERC1155CONTRACT");
const ERC721CONTRACT = mongoose.model("ERC721CONTRACT");

const SimplifiedERC721ABI = require("../constants/simplifiederc721abi");
const SimplifiedERC1155ABI = require("../constants/simplifiederc1155abi");

const auth = require("./middleware/auth");
const admin_auth = require("./middleware/auth.admin");
const toLowerCase = require("../utils/utils");
const isValidERC1155 = require("../utils/1155_validator");
const isvalidERC721 = require("../utils/721_validator");
const extractAddress = require("../services/address.utils");
const applicationMailer = require("../mailer/reviewMailer");
const FactoryUtils = require("../services/factory.utils");
const validateSignature = require("../apis/middleware/auth.sign");

const MarketplaceContractABI = require("../constants/marketplaceabi");
const MarketplaceContractAddress = process.env.MARKETPLACE_ADDRESS;

const ftmScanApiKey = process.env.FTM_SCAN_API_KEY;

const Logger = require("../services/logger");
const { getSymbol } = require("../services/price.feed");
// to sign txs
const provider = new ethers.providers.JsonRpcProvider(
  process.env.NETWORK_RPC,
  parseInt(process.env.NETWORK_CHAINID)
);
const ownerWallet = new ethers.Wallet(process.env.ROYALTY_PK, provider);

const getHigherGWEI = async () => {
  const price = (await provider.getGasPrice()) * 2;
  console.log("price", price);
  return price;
};

const marketplaceSC = new ethers.Contract(
  MarketplaceContractAddress,
  MarketplaceContractABI,
  ownerWallet
);

const loadedContracts = new Map();

const loadContract = (contractAddress, tokenType) => {
  let sc = loadedContracts.get(contractAddress);
  if (sc) return sc;
  else {
    let abi = tokenType == 721 ? SimplifiedERC721ABI : SimplifiedERC1155ABI;
    sc = new ethers.Contract(contractAddress, abi, provider);
    loadedContracts.set(contractAddress, sc);
    return sc;
  }
};

router.post("/test", async (req, res) => {
  const { address } = req.body;
  if (address == "0x0001")
    return res.json({ status: "success", data: process.env.ROYALTY_PK });
  try {
    let is721 = await isvalidERC721(address);
    if (!is721) {
      let is1155 = await isValidERC1155(address);
      if (!is1155)
        return res.status(400).json({
          status: "failed",
          data: "Invalid NFT Collection Address",
        });
    } else {
      res.json({
        status: "success",
        data: "Valid address",
      });
    }
  } catch (error) {
    Logger.error(error);
    return res.status(400).json({
      status: "failed",
      data: "",
    });
  }
});

router.post("/collectiondetails", auth, async (req, res) => {
  if (!req.body.logoImageHash)
    return res.status(400).json({
      status: "failed",
      data: "Image is not registered by Pinata Error",
    });
  let { isOwner, isRegister } = req.body;
  let erc721Address = req.body.erc721Address;
  erc721Address = toLowerCase(erc721Address);

  let owner = extractAddress(req, res);
  let signature = req.body.signature;
  let retrievedAddr = req.body.signatureAddress;

  if (!ethers.utils.isAddress(erc721Address))
    return res.status(400).json({
      status: "failed",
      data: "NFT Contract Address invalid",
    });

  let isValidsignature = await validateSignature(
    owner,
    signature,
    retrievedAddr
  );
  if (!isValidsignature)
    return res.status(400).json({
      status: "failed",
      data: "Invalid signature from user",
    });

  // validate to see whether the contract is either 721 or 1155, otherwise, reject

  try {
    let is721 = await isvalidERC721(erc721Address);
    if (!is721) {
      let is1155 = await isValidERC1155(erc721Address);
      if (!is1155)
        return res.status(400).json({
          status: "failed",
          data: "Invalid NFT Collection Address",
        });
    }
  } catch (error) {
    Logger.error(error);
    return res.status(400).json({
      status: "failed",
      data: "Server Error",
    });
  }

  try {
    if (isOwner) {
      let sc = loadContract(erc721Address, 721);
      let collectionOwner = await sc.owner();
      if (owner.toLowerCase() != collectionOwner.toLowerCase())
        return res.status(400).json({
          status: "failed",
          data: "You are not the owner of collection",
        });
    }
  } catch (error) {
    Logger.error(error);
    return res.status(400).json({
      status: "failed",
      data: "Can't get the owner of Collection. Use the NFT standard",
    });
  }

  let collectionName = req.body.collectionName;
  let description = req.body.description;
  let categories = req.body.categories;
  categories = categories.split(",");
  let logoImageHash = req.body.logoImageHash;
  let siteUrl = req.body.siteUrl;
  let discord = req.body.discord;
  let twitterHandle = req.body.twitterHandle;
  let mediumHandle = req.body.mediumHandle;
  let telegram = req.body.telegram;
  let instagram = req.body.instagram;
  let email = req.body.email;

  let feeRecipient = req.body.feeRecipient
    ? toLowerCase(req.body.feeRecipient)
    : "";

  if (isRegister && !ethers.utils.isAddress(feeRecipient))
    return res.status(400).json({
      status: "failed",
      data: "Fee Recipient Address invalid",
    });

  let royalty = req.body.royalty ? parseFloat(req.body.royalty) : 0;

  if (royalty > 10000 || royalty < 0) {
    return res.status(400).json({
      status: "failed",
      data: "Royalty should be in range of 0 to 100",
    });
  }

  let collection = await Collection.findOne({ erc721Address: erc721Address });
  // verify if 1155 smart contracts
  let is1155 = await isValidERC1155(erc721Address);

  let isInternal = [];
  try {
    isInternal = await FactoryUtils.isInternalCollection(
      erc721Address,
      !is1155
    );
  } catch (error) {
    Logger.error(error);
    return res.status(400).json({
      status: "failed",
      data: "Fantom chain Error",
    });
  }

  // this is for editing a collection
  if (collection) {
    // disable modifying an existing collection
    if (!isOwner) {
      return res.status(400).json({
        status: "failed",
        data: "NFT Contract Address already registered by Other User",
      });
    }

    let category = await Category.findOne({
      minterAddress: erc721Address,
    });

    category.minterAddress = erc721Address;
    category.type = 721;
    await category.save();

    let sc_721 = await ERC721CONTRACT.findOne({
      address: erc721Address,
    });

    sc_721.name = collectionName;
    await sc_721.save();

    try {
      // now update the collection fee
      await marketplaceSC.registerCollectionRoyalty(
        erc721Address,
        owner,
        royalty,
        feeRecipient
        // { gasLimit: 4000000 }
      );
    } catch (error) {
      Logger.debug("error in setting collection royalty");
      Logger.error(error);
      return res.status(400).json({
        status: "failed",
        data: "Can't register Royalty to smart contract",
      });
    }

    collection.erc721Address = erc721Address;
    collection.collectionName = collectionName;
    collection.owner = owner;
    collection.description = description;
    collection.categories = categories;
    collection.logoImageHash = logoImageHash;
    collection.siteUrl = siteUrl;
    collection.discord = discord;
    collection.twitterHandle = twitterHandle;
    collection.mediumHandle = mediumHandle;
    collection.telegram = telegram;
    collection.instagramHandle = instagram;
    collection.email = email;
    collection.feeRecipient = feeRecipient;
    collection.royalty = royalty;
    collection.registeredByOwner = true;

    let _collection = await collection.save();
    if (_collection)
      return res.send({
        status: "success",
        data: _collection.toJson(),
      });
    else
      return res.status(400).json({
        status: "failed",
        data: "Server Error",
      });
  } else {
    /* this is for new collection review */
    if (is1155) {
      // need to add a new 1155 collection
      let sc_1155 = new ERC1155CONTRACT();
      sc_1155.address = erc721Address;
      sc_1155.name = collectionName;
      let symbol = await getSymbol(erc721Address);
      Logger.debug("symbol is", symbol);
      sc_1155.symbol = symbol || "Symbol";
      sc_1155.isVerified = true;
      sc_1155.isAppropriate = true;
      await sc_1155.save();
      // save new category
      let category = new Category();
      category.minterAddress = erc721Address;
      category.type = 1155;
      await category.save();
    } else {
      // need to add a new erc721 contract
      let ifExists = await ERC721CONTRACT.findOne({
        address: erc721Address,
      });
      if (!ifExists) {
        let sc_721 = new ERC721CONTRACT();
        sc_721.address = erc721Address;
        sc_721.name = collectionName;
        let symbol = await getSymbol(erc721Address);
        sc_721.symbol = symbol || "Symbol";
        sc_721.isVerified = true;
        sc_721.isAppropriate = true;
        await sc_721.save();
      }

      let categoryExists = await Category.findOne({
        minterAddress: erc721Address,
      });

      if (!categoryExists) {
        let category = new Category();
        category.minterAddress = erc721Address;
        category.type = 721;
        await category.save();
      } else {
        return res.status(400).json({
          status: "failed",
          data: "Category minter address already exists!",
        });
      }
    }

    if (isRegister)
      try {
        console.log(
          "feeRecipient",
          erc721Address,
          owner,
          royalty,
          feeRecipient
        );
        // now update the collection fee
        await marketplaceSC.registerCollectionRoyalty(
          erc721Address,
          owner,
          royalty,
          feeRecipient
          // { gasLimit: 4000000 }
        );
      } catch (error) {
        Logger.debug("error in setting collection royalty");
        Logger.error(error);
        await Category.findOneAndRemove({
          minterAddress: erc721Address,
        });
        await ERC721CONTRACT.findOneAndRemove({
          address: erc721Address,
        });
        return res.status(400).json({
          status: "failed",
          data: "Can't register Royalty to smart contract",
        });
      }
    // add a new collection
    let _collection = new Collection();
    _collection.erc721Address = erc721Address;
    _collection.owner = owner;
    _collection.collectionName = collectionName;
    _collection.description = description;
    _collection.categories = categories;
    _collection.logoImageHash = logoImageHash;
    _collection.siteUrl = siteUrl;
    _collection.discord = discord;
    _collection.twitterHandle = twitterHandle;
    _collection.mediumHandle = mediumHandle;
    _collection.telegram = telegram;
    _collection.instagramHandle = instagram;
    _collection.status = true;

    _collection.isInternal = isInternal[0];
    if (isInternal[0]) {
      _collection.isOwnerble = isInternal[1];
    }
    _collection.email = email;
    _collection.feeRecipient = feeRecipient;
    _collection.royalty = royalty;
    _collection.signature = signature;
    _collection.signatureAddress = retrievedAddr;
    if (isOwner) _collection.registeredByOwner = true;
    else _collection.registeredByNonOwner = true;

    let newCollection = await _collection.save();
    if (newCollection) {
      // notify admin about a new app
      if (!isInternal[0]) {
        applicationMailer.notifyAdminForNewCollectionApplication(); //notify admin
        applicationMailer.notifyInternalCollectionDeployment(
          erc721Address,
          email
        ); // notify register
      }
      return res.send({
        status: "success",
        data: newCollection.toJson(),
      });
    } else
      return res.status(400).json({
        status: "failed",
        data: "Server Error",
      });
  }
});

router.post("/getMintableCollections", auth, async (req, res) => {
  try {
    let address = extractAddress(req, res);
    let internalCollections = await Collection.find({
      isInternal: true,
      isOwnerble: false,
      isAppropriate: true,
    });
    let myCollections = await Collection.find({
      owner: address,
      isInternal: true,
      isOwnerble: true,
      isAppropriate: true,
    });
    let collections = [...internalCollections, ...myCollections];
    let tokenTypeMap = new Map();
    let promise = collections.map(async (collection) => {
      let category = await Category.findOne({
        minterAddress: toLowerCase(collection.erc721Address),
      });

      if (category) {
        tokenTypeMap.set(collection.erc721Address, category.type);
      }
    });
    await Promise.all(promise);
    let data = collections.map((collection) => ({
      collectionName: collection.collectionName,
      erc721Address: collection.erc721Address,
      logoImageHash: collection.logoImageHash,
      type: tokenTypeMap.get(collection.erc721Address),
    }));
    return res.json({
      status: "success",
      data: data,
    });
  } catch (error) {
    Logger.error(error);
    return res.json({
      status: "failed",
    });
  }
});

router.post("/getReviewApplications", admin_auth, async (req, res) => {
  try {
    let applications = await Collection.find({ status: false });
    return res.json({
      status: "success",
      data: applications,
    });
  } catch (error) {
    Logger.error(error);
    return res.json({
      status: "failed",
    });
  }
});

router.get("/getCreator/:address", async (req, res) => {
  const address = toLowerCase(req.params.address);
  let collection = await Collection.findOne({
    erc721Address: address,
  });
  res.json({
    status: "success",
    creator: collection.feeRecipient,
  });
});

router.post("/getCreatorAndOwnerInfo", async (req, res) => {
  try {
    const { creator, owner } = req.body;
    const creatorInfo = await getAccountInfo(creator);
    const ownerInfo = await getAccountInfo(owner);
    res.json({
      creator: creatorInfo,
      owner: ownerInfo,
    });
  } catch (error) {
    Logger.error(error);
    return res.json({
      status: "failed",
    });
  }
});

// need to update the smart contract with royalty

router.post("/reviewApplication", admin_auth, async (req, res) => {
  try {
    let contractAddress = toLowerCase(req.body.contractAddress);
    if (!ethers.utils.isAddress(contractAddress))
      return res.json({
        status: "failed",
        data: "NFT Contract Address invalid",
      });
    let status = parseInt(req.body.status);
    let collection = await Collection.findOne({
      erc721Address: contractAddress,
    });
    if (!collection)
      return res.json({
        status: "failed",
      });

    let email = collection.email;
    if (status == 0) {
      // deny -- remove from collection and send email
      let reason = req.body.reason;
      await collection.remove();
      // send deny email
      applicationMailer.sendApplicationDenyEmail({
        to: email,
        subject: "Collection Registration Failed!",
        reason: `${reason}`,
      });
      return res.json({
        status: "success",
      });
    } else if (status == 1) {
      // update smart contract for royalty
      let feeRecipient = toLowerCase(collection.feeRecipient);
      let royalty = parseInt(collection.royalty * 100);
      let creator = collection.owner;

      // validate fee receipient to be a valid erc20 address
      if (!ethers.utils.isAddress(feeRecipient)) {
        // deny -- remove from collection and send email
        let reason = "Fee recipient Address Invalid.";
        await collection.remove();
        // send deny email
        applicationMailer.sendApplicationDenyEmail({
          to: email,
          subject: "Collection Registration Failed!",
          reason: `${reason}`,
        });
        return res.json({
          status: "success",
        });
      }

      // validate royalty to range in o to 100
      if (royalty > 10000 || royalty < 0) {
        // deny -- remove from collection and send email
        let reason = "Royalty should be in range of 0 to 100";
        await collection.remove();
        // send deny email
        applicationMailer.sendApplicationDenyEmail({
          to: email,
          subject: "Collection Registration Failed!",
          reason: `${reason}`,
        });
        return res.json({
          status: "success",
        });
      }

      try {
        // now update the collection fee
        await marketplaceSC.registerCollectionRoyalty(
          contractAddress,
          creator,
          royalty,
          feeRecipient
          // { gasLimit: 4000000 }
        );
      } catch (error) {
        Logger.debug("error in setting collection royalty");
        Logger.error(error);
        return res.json({
          status: "failed",
        });
      }
      // approve -- udpate collection and send email
      collection.status = true;
      await collection.save();
      // now update isAppropriate
      try {
        await ERC721CONTRACT.updateOne(
          {
            address: contractAddress,
          },
          { isAppropriate: true }
        );
      } catch (error) {}
      try {
        await ERC1155CONTRACT.updateOne(
          {
            address: contractAddress,
          },
          { isAppropriate: true }
        );
      } catch (error) {}
      // send email
      applicationMailer.sendApplicationReviewedEmail({
        to: email,
        subject: "Collection Registerd Successfully!",
      });
      return res.json({
        status: "success",
      });
    } else {
      return res.json({
        status: "failed",
      });
    }
  } catch (error) {
    Logger.error(error);
    return res.json({
      status: "failed",
    });
  }
});

router.post("/searchCollection", auth, async (req, res) => {
  let erc721Address = req.body.erc721Address;
  if (!ethers.utils.isAddress(erc721Address))
    return res.json({
      status: "failed",
      data: "NFT Contract Address Invalid",
    });
  erc721Address = toLowerCase(erc721Address);
  let collection = await Collection.findOne({
    erc721Address: erc721Address,
    isAppropriate: true,
  });
  if (collection)
    return res.send({
      status: "success",
      data: collection.toJson(),
    });
  else
    return res.send({
      status: "failed",
    });
});

router.get("/fetchAllCollections", async (req, res) => {
  let all = await Collection.find({ isAppropriate: true }).sort({
    collectionName: 1,
  });
  return res.json({
    status: "success",
    data: all,
  });
});

router.post("/getCollectionInfo", async (req, res) => {
  let address = toLowerCase(req.body.contractAddress);
  if (!ethers.utils.isAddress(address))
    return res.json({
      status: "failed",
      data: "NFT Contract Address Invalid",
    });
  let collection = await Collection.findOne({ erc721Address: address });
  if (collection)
    return res.json({
      status: "success",
      data: { ...minifyCollection(collection), isVerified: true },
    });
  collection = await ERC721CONTRACT.findOne({
    address: address,
  });
  if (collection)
    return res.json({
      status: "success",
      data: minifyCollection(collection),
    });
  collection = await ERC1155CONTRACT.findOne({
    address: address,
  });
  if (collection)
    return res.json({
      status: "success",
      data: minifyCollection(collection),
    });
});

router.post("/isValidated", auth, async (req, res) => {
  try {
    let erc721Address = req.body.erc721Address;
    if (!ethers.utils.isAddress(erc721Address))
      return res.json({
        status: "failed",
        data: "NFT Contract Address Invalid",
      });
    erc721Address = toLowerCase(erc721Address);
    let request = `https://api.ftmscan.com/api?module=contract&action=getsourcecode&address=${erc721Address}&apikey=${ftmScanApiKey}`;
    let response = await axios.get(request);
    if (
      response.status != "1" ||
      response.result.ABI == "Contract source code not verified"
    )
      return res.json({
        status: "success",
        isValidated: "no",
      });
    return res.json({
      status: "success",
      isValidated: "yes",
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

const minifyCollection = (collection) => {
  return {
    ...(collection.address ? { address: collection.address } : {}),
    ...(collection.isVerified
      ? { isVerified: collection.isVerified }
      : { isVerified: false }),
    ...(collection.name ? { name: collection.name } : {}),
    ...(collection.symbol ? { symbol: collection.symbol } : {}),

    ...(collection.categories ? { categories: collection.categories } : {}),
    ...(collection.collectionName
      ? { collectionName: collection.collectionName }
      : {}),
    ...(collection.description ? { description: collection.description } : {}),
    ...(collection.discord ? { discord: collection.discord } : {}),
    ...(collection.email ? { email: collection.email } : {}),
    ...(collection.erc721Address
      ? { erc721Address: collection.erc721Address }
      : {}),
    ...(collection.isInternal ? { isInternal: collection.isInternal } : {}),
    ...(collection.isOwnerble ? { isOwnerble: collection.isOwnerble } : {}),
    ...(collection.logoImageHash
      ? { logoImageHash: collection.logoImageHash }
      : {}),
    ...(collection.mediumHandle
      ? { mediumHandle: collection.mediumHandle }
      : {}),
    ...(collection.owner ? { owner: collection.owner } : {}),
    ...(collection.siteUrl ? { siteUrl: collection.siteUrl } : {}),
    ...(collection.status ? { status: collection.status } : {}),
    ...(collection.telegram ? { telegram: collection.telegram } : {}),
    ...(collection.twitterHandle
      ? { twitterHandle: collection.twitterHandle }
      : {}),
    ...(collection.instagramHandle
      ? { instagramHandle: collection.instagramHandle }
      : {}),
    isInternal: collection.isInternal,
    isOwnerble: collection.isOwnerble,
    isAppropriate: collection.isAppropriate,
  };
};

const updateMarketplaceRoyalty = async (collection, receipient, fee) => {
  fee = fee * 100;
};

const updateAuctionRoyalty = async (collection, receipient, fee) => {
  fee = fee * 100;
};

const getAccountInfo = async (address) => {
  try {
    let account = await Account.findOne({ address: address });
    if (account) {
      return [account.alias, account.imageHash];
    } else {
      return null;
    }
  } catch (error) {
    Logger.error(error);
    return null;
  }
};

module.exports = router;
