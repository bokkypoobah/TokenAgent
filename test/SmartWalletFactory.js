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

    const FixedSupplyToken = await ethers.getContractFactory("FixedSupplyToken");
    const fixedSupplyToken = await FixedSupplyToken.deploy();

    const SmartWalletFactory = await ethers.getContractFactory("SmartWalletFactory");
    const smartWalletFactory = await SmartWalletFactory.deploy(weth9);

    return { smartWalletFactory, weth9, fixedSupplyToken, accounts };
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
      const { smartWalletFactory, fixedSupplyToken, accounts } = await loadFixture(deployContracts);
      await expect(smartWalletFactory.newSmartWallet())
        .to.emit(smartWalletFactory, "NewSmartWallet")
        .withArgs(anyValue, accounts[0].address, 0, anyValue);
      const smartWalletAddress = await smartWalletFactory.smartWallets(0);
      const SmartWallet = await ethers.getContractFactory("SmartWallet");
      const smartWallet = SmartWallet.attach(smartWalletAddress);

      const now = parseInt(new Date().getTime()/1000);
      const expiry = now + 60 * 1000;

      // const offers1 = [
      //   [accounts[0].address, BUY, ERC20, fixedSupplyToken.target, 888, [1, 2, 3], [11, 22, 33, 44], "999999999999999999999999999999999999", expiry],
      //   [accounts[1].address, BUY, ERC721, fixedSupplyToken.target, 888, [4, 5, 6], [55, 66, 77, 88], "999999999999999999999999999999999998", expiry],
      //   [ADDRESS0, SELL, ERC1155, fixedSupplyToken.target, 888, [7, 8, 9], [999], "999999999999999999999999999999999997", expiry],
      // ];
      const offers1 = [
        [BUY, ERC20, expiry, fixedSupplyToken.target, 888, "999999999999999999999999999999999999"],
        [BUY, ERC721, expiry, fixedSupplyToken.target, 888, "999999999999999999999999999999999998"],
        [SELL, ERC1155, expiry, fixedSupplyToken.target, 888, "999999999999999999999999999999999997"],
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


    // it("Should set the right owner", async function () {
    //   const { lock, owner } = await loadFixture(deployContracts);
    //
    //   expect(await lock.owner()).to.equal(owner.address);
    // });

    // it("Should receive and store the funds to lock", async function () {
    //   const { lock, lockedAmount } = await loadFixture(
    //     deployContracts
    //   );
    //
    //   expect(await ethers.provider.getBalance(lock.target)).to.equal(
    //     lockedAmount
    //   );
    // });

    // it("Should fail if the unlockTime is not in the future", async function () {
    //   // We don't use the fixture here because we want a different deployment
    //   const latestTime = await time.latest();
    //   const Lock = await ethers.getContractFactory("Lock");
    //   await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
    //     "Unlock time should be in the future"
    //   );
    // });

  });

  describe("Withdrawals", function () {

    // describe("Validations", function () {
    //   it("Should revert with the right error if called too soon", async function () {
    //     const { lock } = await loadFixture(deployContracts);
    //
    //     await expect(lock.withdraw()).to.be.revertedWith(
    //       "You can't withdraw yet"
    //     );
    //   });
    //
    //   it("Should revert with the right error if called from another account", async function () {
    //     const { lock, unlockTime, otherAccount } = await loadFixture(
    //       deployContracts
    //     );
    //
    //     // We can increase the time in Hardhat Network
    //     await time.increaseTo(unlockTime);
    //
    //     // We use lock.connect() to send a transaction from another account
    //     await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
    //       "You aren't the owner"
    //     );
    //   });
    //
    //   it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
    //     const { lock, unlockTime } = await loadFixture(
    //       deployContracts
    //     );
    //
    //     // Transactions are sent using the first signer by default
    //     await time.increaseTo(unlockTime);
    //
    //     await expect(lock.withdraw()).not.to.be.reverted;
    //   });
    // });

    // describe("Events", function () {
    //   it("Should emit an event on withdrawals", async function () {
    //     const { lock, unlockTime, lockedAmount } = await loadFixture(
    //       deployContracts
    //     );
    //
    //     await time.increaseTo(unlockTime);
    //
    //     await expect(lock.withdraw())
    //       .to.emit(lock, "Withdrawal")
    //       .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
    //   });
    // });

    // describe("Transfers", function () {
    //   it("Should transfer the funds to the owner", async function () {
    //     const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
    //       deployContracts
    //     );
    //
    //     await time.increaseTo(unlockTime);
    //
    //     await expect(lock.withdraw()).to.changeEtherBalances(
    //       [owner, lock],
    //       [lockedAmount, -lockedAmount]
    //     );
    //   });
    // });

  });
});
