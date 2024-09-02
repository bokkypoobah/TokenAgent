const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const ADDRESS0 = "0x0000000000000000000000000000000000000000";

const BUY = 0;
const SELL = 1;

const ERC20 = 0;
const ERC721 = 1;
const ERC1155 = 2;

describe("TokenAgentFactory", function () {

  async function deployContracts() {
    const accounts = await ethers.getSigners();
    console.log("        * accounts: " + JSON.stringify(accounts.slice(0, 3).map(e => e.address)));
    const WETH9 = await ethers.getContractFactory("WETH9");
    const weth9 = await WETH9.deploy();
    const ERC20Token = await ethers.getContractFactory("ERC20Token");
    const erc20Token = await ERC20Token.deploy();
    const ERC721Token = await ethers.getContractFactory("ERC721Token");
    const erc721Token = await ERC721Token.deploy();
    const ERC1155Token = await ethers.getContractFactory("ERC1155Token");
    const erc1155Token = await ERC1155Token.deploy("https://blah.blah/blah/");
    console.log("        * weth: " + weth9.target);
    console.log("        * 20: " + erc20Token.target + ", 721: "+ erc721Token.target + ", 1155: "+ erc1155Token.target);
    const TokenAgentFactory = await ethers.getContractFactory("TokenAgentFactory");
    const tokenAgentFactory = await TokenAgentFactory.deploy(weth9);
    return { tokenAgentFactory, weth9, erc20Token, erc721Token, erc1155Token, accounts };
  }

  describe("Deploy TokenAgentFactory And TokenAgent", function () {

    it("Basic deployment", async function () {
      const { tokenAgentFactory, accounts } = await loadFixture(deployContracts);
      const tokenAgentTemplate = await tokenAgentFactory.tokenAgentTemplate();
      await expect(tokenAgentFactory.newTokenAgent())
        .to.emit(tokenAgentFactory, "NewTokenAgent")
        .withArgs(anyValue, accounts[0].address, 0, anyValue);
      const tokenAgentAddress = await tokenAgentFactory.tokenAgents(0);
      const tokenAgentByOwner = await tokenAgentFactory.tokenAgentsByOwners(accounts[0].address, 0);
      expect(await tokenAgentFactory.tokenAgentsByOwners(accounts[0].address, 0)).to.equal(tokenAgentAddress);
      const TokenAgent = await ethers.getContractFactory("TokenAgent");
      const tokenAgent = TokenAgent.attach(tokenAgentAddress);
      const tokenAgentOwner = await tokenAgent.owner();
    });

    it("Test TokenAgent ownership", async function () {
      const { tokenAgentFactory, weth9, accounts } = await loadFixture(deployContracts);
      await expect(tokenAgentFactory.newTokenAgent())
        .to.emit(tokenAgentFactory, "NewTokenAgent")
        .withArgs(anyValue, accounts[0].address, 0, anyValue);
      const tokenAgentAddress = await tokenAgentFactory.tokenAgents(0);
      const TokenAgent = await ethers.getContractFactory("TokenAgent");
      const tokenAgent = TokenAgent.attach(tokenAgentAddress);
      await expect(tokenAgent.connect(accounts[1]).init(weth9, accounts[1]))
        .to.be.revertedWithCustomError(tokenAgent, "AlreadyInitialised");
      const tokenAgentOwner = await tokenAgent.owner();
      await expect(tokenAgent.connect(accounts[1]).transferOwnership(accounts[0]))
        .to.be.revertedWithCustomError(tokenAgent, "NotOwner");
      await tokenAgent.connect(accounts[0]).transferOwnership(accounts[1]);
      await expect(tokenAgent.connect(accounts[2]).acceptOwnership())
        .to.be.revertedWithCustomError(tokenAgent, "NotNewOwner");
      await expect(tokenAgent.connect(accounts[1]).acceptOwnership())
        .to.emit(tokenAgent, "OwnershipTransferred")
        .withArgs(accounts[0].address, accounts[1].address, anyValue);
    });

    it("Test TokenAgent invalid offers", async function () {
      const { tokenAgentFactory, weth9, erc20Token, erc721Token, erc1155Token, accounts } = await loadFixture(deployContracts);
      await expect(tokenAgentFactory.newTokenAgent())
        .to.emit(tokenAgentFactory, "NewTokenAgent")
        .withArgs(anyValue, accounts[0].address, 0, anyValue);
      const tokenAgentAddress = await tokenAgentFactory.tokenAgents(0);
      const TokenAgent = await ethers.getContractFactory("TokenAgent");
      const tokenAgent = TokenAgent.attach(tokenAgentAddress);

      const now = parseInt(new Date().getTime()/1000);
      const expiry = now + 60 * 1000;

      const invalidOffer1 = [
        [accounts[0].address, SELL, expiry, 888, "999999999999999999999999999999999997"],
      ];
      await expect(tokenAgent.addOffers(invalidOffer1))
        .to.be.revertedWithCustomError(tokenAgent, "InvalidToken")
        .withArgs(accounts[0].address);
      const invalidOffer2 = [
        [weth9.target, SELL, expiry, 888, "999999999999999999999999999999999997"],
      ];
      await expect(tokenAgent.addOffers(invalidOffer2))
        .to.be.revertedWithCustomError(tokenAgent, "CannotOfferWETH");
    });

    it("Test TokenAgent offers", async function () {
      const { tokenAgentFactory, weth9, erc20Token, erc721Token, erc1155Token, accounts } = await loadFixture(deployContracts);
      await expect(tokenAgentFactory.newTokenAgent())
        .to.emit(tokenAgentFactory, "NewTokenAgent")
        .withArgs(anyValue, accounts[0].address, 0, anyValue);
      const tokenAgentAddress = await tokenAgentFactory.tokenAgents(0);
      const TokenAgent = await ethers.getContractFactory("TokenAgent");
      const tokenAgent = TokenAgent.attach(tokenAgentAddress);

      const now = parseInt(new Date().getTime()/1000);
      const expiry = now + 60 * 1000;

      const offers1 = [
        [erc20Token.target, BUY, expiry, 888, "999999999999999999999999999999999999"],
        [erc721Token.target, BUY, expiry, 888, "999999999999999999999999999999999998"],
        [erc1155Token.target, SELL, expiry, 888, "999999999999999999999999999999999997"],
      ];
      const addOffers1Tx = await tokenAgent.addOffers(offers1);
      const addOffers1TxReceipt = await addOffers1Tx.wait();
      console.log("        * addOffers1TxReceipt.gasUsed: " + addOffers1TxReceipt.gasUsed);
      // console.log("        * addOffers1TxReceipt: " + JSON.stringify(addOffers1TxReceipt, null, 2));
      const offerKeys = [];
      addOffers1TxReceipt.logs.forEach((event) => {
        const log = tokenAgent.interface.parseLog(event);
        offerKeys.push(log.args[0]);
        console.log("        + log: " + log.name + '(' + log.args.join(',') + ')');
      });
      console.log("        * offerKeys: " + offerKeys.join(','));
    });

  });

});
