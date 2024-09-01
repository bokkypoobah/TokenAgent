const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const ADDRESS0 = "0x0000000000000000000000000000000000000000";

const BUY = 0;
const SELL = 1;

const ERC20 = 0;
const ERC721 = 1;
const ERC1155 = 2;

describe("SmartWalletFactory", function () {

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
    const SmartWalletFactory = await ethers.getContractFactory("SmartWalletFactory");
    const smartWalletFactory = await SmartWalletFactory.deploy(weth9);
    return { smartWalletFactory, weth9, erc20Token, erc721Token, erc1155Token, accounts };
  }

  describe("Deploy SmartWalletFactory And SmartWallet", function () {

    it("Basic deployment", async function () {
      const { smartWalletFactory, accounts } = await loadFixture(deployContracts);
      const smartWalletTemplate = await smartWalletFactory.smartWalletTemplate();
      await expect(smartWalletFactory.newSmartWallet())
        .to.emit(smartWalletFactory, "NewSmartWallet")
        .withArgs(anyValue, accounts[0].address, 0, anyValue);
      const smartWalletAddress = await smartWalletFactory.smartWallets(0);
      const smartWalletByOwner = await smartWalletFactory.smartWalletsByOwners(accounts[0].address, 0);
      expect(await smartWalletFactory.smartWalletsByOwners(accounts[0].address, 0)).to.equal(smartWalletAddress);
      const SmartWallet = await ethers.getContractFactory("SmartWallet");
      const smartWallet = SmartWallet.attach(smartWalletAddress);
      const smartWalletOwner = await smartWallet.owner();
    });

    it("Test SmartWallet ownership", async function () {
      const { smartWalletFactory, weth9, accounts } = await loadFixture(deployContracts);
      await expect(smartWalletFactory.newSmartWallet())
        .to.emit(smartWalletFactory, "NewSmartWallet")
        .withArgs(anyValue, accounts[0].address, 0, anyValue);
      const smartWalletAddress = await smartWalletFactory.smartWallets(0);
      const SmartWallet = await ethers.getContractFactory("SmartWallet");
      const smartWallet = SmartWallet.attach(smartWalletAddress);
      await expect(smartWallet.connect(accounts[1]).init(weth9, accounts[1]))
        .to.be.revertedWithCustomError(smartWallet, "AlreadyInitialised");
      const smartWalletOwner = await smartWallet.owner();
      await expect(smartWallet.connect(accounts[1]).transferOwnership(accounts[0]))
        .to.be.revertedWithCustomError(smartWallet, "NotOwner");
      await smartWallet.connect(accounts[0]).transferOwnership(accounts[1]);
      await expect(smartWallet.connect(accounts[2]).acceptOwnership())
        .to.be.revertedWithCustomError(smartWallet, "NotNewOwner");
      await expect(smartWallet.connect(accounts[1]).acceptOwnership())
        .to.emit(smartWallet, "OwnershipTransferred")
        .withArgs(accounts[0].address, accounts[1].address, anyValue);
    });

    it("Test SmartWallet offers", async function () {
      const { smartWalletFactory, erc20Token, accounts } = await loadFixture(deployContracts);
      await expect(smartWalletFactory.newSmartWallet())
        .to.emit(smartWalletFactory, "NewSmartWallet")
        .withArgs(anyValue, accounts[0].address, 0, anyValue);
      const smartWalletAddress = await smartWalletFactory.smartWallets(0);
      const SmartWallet = await ethers.getContractFactory("SmartWallet");
      const smartWallet = SmartWallet.attach(smartWalletAddress);

      const now = parseInt(new Date().getTime()/1000);
      const expiry = now + 60 * 1000;

      // const offers1 = [
      //   [accounts[0].address, BUY, ERC20, erc20Token.target, 888, [1, 2, 3], [11, 22, 33, 44], "999999999999999999999999999999999999", expiry],
      //   [accounts[1].address, BUY, ERC721, erc20Token.target, 888, [4, 5, 6], [55, 66, 77, 88], "999999999999999999999999999999999998", expiry],
      //   [ADDRESS0, SELL, ERC1155, erc20Token.target, 888, [7, 8, 9], [999], "999999999999999999999999999999999997", expiry],
      // ];
      const offers1 = [
        [BUY, ERC20, expiry, erc20Token.target, 888, "999999999999999999999999999999999999"],
        [BUY, ERC721, expiry, erc20Token.target, 888, "999999999999999999999999999999999998"],
        [SELL, ERC1155, expiry, erc20Token.target, 888, "999999999999999999999999999999999997"],
      ];
      const addOffers1Tx = await smartWallet.addOffers(offers1);
      const addOffers1TxReceipt = await addOffers1Tx.wait();
      console.log("        * addOffers1TxReceipt.gasUsed: " + addOffers1TxReceipt.gasUsed);
      // console.log("        * addOffers1TxReceipt: " + JSON.stringify(addOffers1TxReceipt, null, 2));
      const offerKeys = [];
      addOffers1TxReceipt.logs.forEach((event) => {
        const log = smartWallet.interface.parseLog(event);
        offerKeys.push(log.args[0]);
        console.log("        * log: " + log.name + '(' + log.args.join(',') + ')');
      });
      console.log("        * offerKeys: " + offerKeys.join(','));

    });
  });

});
