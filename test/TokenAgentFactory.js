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

    const amountWeth = ethers.parseUnits("100", 18);
    await accounts[0].sendTransaction({ to: weth9.target, value: amountWeth });
    await accounts[1].sendTransaction({ to: weth9.target, value: amountWeth });
    await accounts[2].sendTransaction({ to: weth9.target, value: amountWeth });
    await accounts[3].sendTransaction({ to: weth9.target, value: amountWeth });
    // const weth0Tx = await data.user0Signer.sendTransaction({ to: data.weth.address, value: amountWeth });

    const amountERC20 = ethers.parseUnits("1000", 18);
    await erc20Token.transfer(accounts[1], amountERC20);
    await erc20Token.transfer(accounts[2], amountERC20);
    await erc20Token.transfer(accounts[3], amountERC20);
    await erc20Token.transfer(ADDRESS0, ethers.parseUnits("996000", 18));

    return { tokenAgentFactory, weth9, erc20Token, erc721Token, erc1155Token, accounts };
  }

  function padLeft(s, n) {
    var o = s.toString();
    while (o.length < n) {
      o = " " + o;
    }
    return o;
  }
  // function padRight(s, n) {
  //   var o = s;
  //   while (o.length < n) {
  //     o = o + " ";
  //   }
  //   return o;
  // }

  async function printState(data) {
    console.log();
    console.log("          # Account                               ETH                     WETH                   ERC-20");
    console.log("          - ---------------- ------------------------ ------------------------ ------------------------");
    for (let i = 0; i < 4; i++) {
      const balance = await ethers.provider.getBalance(data.accounts[i].address);
      const wethBalance = await data.weth9.balanceOf(data.accounts[i].address);
      const erc20Balance = await data.erc20Token.balanceOf(data.accounts[i].address);
      console.log("          " + i + " " + data.accounts[i].address.substring(0, 16) + " " +
        padLeft(ethers.formatEther(balance), 24) + " " +
        padLeft(ethers.formatEther(wethBalance), 24) + " " +
        padLeft(ethers.formatEther(erc20Balance), 24)
      );
    }
    console.log();
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

    it.only("Test TokenAgent offers", async function () {
      const data = await loadFixture(deployContracts);
      const { tokenAgentFactory, weth9, erc20Token, erc721Token, erc1155Token, accounts } = data;
      await expect(tokenAgentFactory.connect(accounts[1]).newTokenAgent())
        .to.emit(tokenAgentFactory, "NewTokenAgent")
        .withArgs(anyValue, accounts[1].address, 0, anyValue);
      const tokenAgentAddress = await tokenAgentFactory.tokenAgents(0);
      const TokenAgent = await ethers.getContractFactory("TokenAgent");
      const tokenAgent = TokenAgent.attach(tokenAgentAddress);

      const approveAmount = ethers.parseUnits("10000.00001", 18);
      await weth9.connect(accounts[0]).approve(tokenAgentAddress, approveAmount);
      await weth9.connect(accounts[1]).approve(tokenAgentAddress, approveAmount);
      await weth9.connect(accounts[2]).approve(tokenAgentAddress, approveAmount);
      await weth9.connect(accounts[3]).approve(tokenAgentAddress, approveAmount);
      await erc20Token.connect(accounts[0]).approve(tokenAgentAddress, approveAmount);
      await erc20Token.connect(accounts[1]).approve(tokenAgentAddress, approveAmount);
      await erc20Token.connect(accounts[2]).approve(tokenAgentAddress, approveAmount);
      await erc20Token.connect(accounts[3]).approve(tokenAgentAddress, approveAmount);

      await printState(data);

      const now = parseInt(new Date().getTime()/1000);
      const expiry = now + 60 * 1000; // 0 ok, 1 fail, <now fail

      const offers1 = [
        [erc20Token.target, SELL, expiry, [[ethers.parseUnits("0.1", 18), ethers.parseUnits("1", 18)], [ethers.parseUnits("0.2", 18), ethers.parseUnits("1", 18)], [ethers.parseUnits("0.3", 18), ethers.parseUnits("8", 18)]]],
        // [erc20Token.target, SELL, expiry, [[ethers.parseUnits("0.11111", 18), ethers.parseUnits("1", 18)], [ethers.parseUnits("0.22222", 18), ethers.parseUnits("9", 18)]]],
        // [erc20Token.target, SELL, expiry, ethers.parseUnits("0.12345", 18), ethers.parseUnits("1", 18)],
        // [erc721Token.target, BUY, expiry, ethers.parseUnits("0.123456", 18), ethers.parseUnits("1000.2", 18)],
        // [erc1155Token.target, SELL, expiry, ethers.parseUnits("0.1234567", 18), ethers.parseUnits("1000.3", 18)],
      ];
      const addOffers1Tx = await tokenAgent.connect(accounts[1]).addOffers(offers1);
      const addOffers1TxReceipt = await addOffers1Tx.wait();
      console.log("        * addOffers1TxReceipt.gasUsed: " + addOffers1TxReceipt.gasUsed);
      // console.log("        * addOffers1TxReceipt: " + JSON.stringify(addOffers1TxReceipt, null, 2));
      const offerKeys = [];
      addOffers1TxReceipt.logs.forEach((event) => {
        const log = tokenAgent.interface.parseLog(event);
        offerKeys.push(log.args[0]);
        // console.log("        + " + log.name + JSON.stringify(log.args.map(e => e.toString())));
        console.log("        + " + log.name + '(key:' + log.args[0].substring(0, 20) + ', token: ' + log.args[1].substring(0, 12) + ', nonce: ' + log.args[2] + ', info: ' + JSON.stringify(log.args[3].map(e => e.toString())) + ') @ ' + new Date(parseInt(log.args[4]) * 1000).toLocaleString());
      });
      console.log("        * offerKeys: " + offerKeys.join(','));

      const trades1 = [
        [offerKeys[0], ethers.parseUnits("2", 18).toString(), ethers.parseUnits("0.15", 18).toString()],
        // [offerKeys[1], ethers.parseUnits("10", 18).toString()],
        // [offerKeys[2], ethers.parseUnits("30", 18).toString()]
      ];
      console.log("        * trades1: " + JSON.stringify(trades1));
      const trades1Tx = await tokenAgent.connect(accounts[2]).trade(trades1);
      const trades1TxReceipt = await trades1Tx.wait();
      console.log("        * trades1TxReceipt.gasUsed: " + trades1TxReceipt.gasUsed);
      trades1TxReceipt.logs.forEach((event) => {
        if (event.address == weth9.target) {
          const log = weth9.interface.parseLog(event);
          console.log("        + weth9." + log.name + '(' + log.args.join(',') + ')');
        } else if (event.address == erc20Token.target) {
          const log = erc20Token.interface.parseLog(event);
          console.log("        + erc20Token." + log.name + '(' + log.args.join(',') + ')');
        } else if (event.address == tokenAgent.target) {
          const log = tokenAgent.interface.parseLog(event);
          console.log("        + " + log.name + '(' + log.args.join(',') + ')');
        }
      });

      await printState(data);

      // const trades2 = [
      //   // [offerKeys[0], ethers.parseUnits("10", 18).toString()],
      //   [offerKeys[1], ethers.parseUnits("1", 18).toString()],
      //   // [offerKeys[2], ethers.parseUnits("30", 18).toString()]
      // ];
      // console.log("        * trades2: " + JSON.stringify(trades2));
      // const trades2Tx = await tokenAgent.connect(accounts[2]).trade(trades2);
      // const trades2TxReceipt = await trades2Tx.wait();
      // console.log("        * trades2TxReceipt.gasUsed: " + trades2TxReceipt.gasUsed);
      //
      // await printState(data);

    });

  });

});
