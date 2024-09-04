const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const ADDRESS0 = "0x0000000000000000000000000000000000000000";

const BUY = 0;
const SELL = 1;

const ERC20 = 0;
const ERC721 = 1;
const ERC1155 = 2;

const FILL = 0;
const FILLORKILL = 1;

describe("TokenAgentFactory", function () {

  function padLeft(s, n) {
    var o = s.toString();
    while (o.length < n) {
      o = " " + o;
    }
    return o;
  }
  function padRight(s, n) {
    var o = s;
    while (o.length < n) {
      o = o + " ";
    }
    return o;
  }
  async function printState(data) {
    console.log();
    console.log("          # Account                               ETH                     WETH                   ERC-20");
    console.log("          - ---------------- ------------------------ ------------------------ ------------------------");
    for (let i = 0; i < 4; i++) {
      const balance = await ethers.provider.getBalance(data.accounts[i].address);
      const wethBalance = await data.weth.balanceOf(data.accounts[i].address);
      const erc20Balance = await data.erc20Token.balanceOf(data.accounts[i].address);
      console.log("          " + i + " " + data.accounts[i].address.substring(0, 16) + " " +
        padLeft(ethers.formatEther(balance), 24) + " " +
        padLeft(ethers.formatEther(wethBalance), 24) + " " +
        padLeft(ethers.formatEther(erc20Balance), 24)
      );
    }
    console.log();
  }

  async function deployContracts() {
    const accounts = await ethers.getSigners();
    console.log("        * accounts: " + JSON.stringify(accounts.slice(0, 3).map(e => e.address)));
    const WETH9 = await ethers.getContractFactory("WETH9");
    const weth = await WETH9.deploy();
    const ERC20Token = await ethers.getContractFactory("ERC20Token");
    const erc20Token = await ERC20Token.deploy();
    const ERC721Token = await ethers.getContractFactory("ERC721Token");
    const erc721Token = await ERC721Token.deploy();
    const ERC1155Token = await ethers.getContractFactory("ERC1155Token");
    const erc1155Token = await ERC1155Token.deploy("https://blah.blah/blah/");
    console.log("        * weth: " + weth.target);
    console.log("        * 20: " + erc20Token.target + ", 721: "+ erc721Token.target + ", 1155: "+ erc1155Token.target);
    const TokenAgentFactory = await ethers.getContractFactory("TokenAgentFactory");
    const tokenAgentFactory = await TokenAgentFactory.deploy(weth);

    const TokenAgent = await ethers.getContractFactory("TokenAgent");
    const tokenAgents = [];
    for (let i = 0; i < 4; i++) {
      await tokenAgentFactory.connect(accounts[i]).newTokenAgent();
      const tokenAgentAddress = await tokenAgentFactory.tokenAgentsByOwners(accounts[i].address, 0);
      const tokenAgent = TokenAgent.attach(tokenAgentAddress);
      tokenAgents.push(tokenAgent);
    }

    const amountWeth = ethers.parseUnits("100", 18);
    for (let i = 0; i < 4; i++) {
      await accounts[i].sendTransaction({ to: weth.target, value: amountWeth });
    }

    const amountERC20 = ethers.parseUnits("1000", 18);
    for (let i = 1; i < 4; i++) {
      await erc20Token.transfer(accounts[i], amountERC20);
    }
    await erc20Token.transfer(ADDRESS0, ethers.parseUnits("996000", 18));

    const approveAmount = ethers.parseUnits("12.345", 18);
    for (let i = 1; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        await weth.connect(accounts[i]).approve(tokenAgents[j], approveAmount);
        await erc20Token.connect(accounts[i]).approve(tokenAgents[j], approveAmount);
      }
    }

    const now = parseInt(new Date().getTime()/1000);
    const expiry60s = now + 60 * 1000;

    return { tokenAgentFactory, tokenAgents, weth, erc20Token, erc721Token, erc1155Token, accounts, now, expiry60s };
  }

  describe("Deploy TokenAgentFactory And TokenAgent", function () {

    it("Test TokenAgent ownership", async function () {
      const d = await loadFixture(deployContracts);
      await expect(d.tokenAgentFactory.newTokenAgent())
        .to.emit(d.tokenAgentFactory, "NewTokenAgent")
        .withArgs(anyValue, d.accounts[0].address, 1, anyValue);
      const tokenAgentAddress = await d.tokenAgentFactory.tokenAgents(4);
      const TokenAgent = await ethers.getContractFactory("TokenAgent");
      const tokenAgent = TokenAgent.attach(tokenAgentAddress);
      await expect(tokenAgent.connect(d.accounts[1]).init(d.weth, d.accounts[1]))
        .to.be.revertedWithCustomError(tokenAgent, "AlreadyInitialised");
      expect(await tokenAgent.owner()).to.equal(d.accounts[0].address);
      await expect(tokenAgent.connect(d.accounts[1]).transferOwnership(d.accounts[0]))
        .to.be.revertedWithCustomError(tokenAgent, "NotOwner");
      await tokenAgent.connect(d.accounts[0]).transferOwnership(d.accounts[1]);
      await expect(tokenAgent.connect(d.accounts[2]).acceptOwnership())
        .to.be.revertedWithCustomError(tokenAgent, "NotNewOwner");
      await expect(tokenAgent.connect(d.accounts[1]).acceptOwnership())
        .to.emit(tokenAgent, "OwnershipTransferred")
        .withArgs(d.accounts[0].address, d.accounts[1].address, anyValue);
      // await printState(d);
    });

    it("Test TokenAgent invalid offers", async function () {
      const d = await loadFixture(deployContracts);
      await expect(d.tokenAgentFactory.newTokenAgent())
        .to.emit(d.tokenAgentFactory, "NewTokenAgent")
        .withArgs(anyValue, d.accounts[0].address, 1, anyValue);
      const tokenAgentAddress = await d.tokenAgentFactory.tokenAgents(4);
      const TokenAgent = await ethers.getContractFactory("TokenAgent");
      const tokenAgent = TokenAgent.attach(tokenAgentAddress);
      const invalidOffer1 = [[d.accounts[0].address, SELL, d.expiry60s, [[888, "999999999999999999999999999999999997"]]]];
      await expect(tokenAgent.addOffers(invalidOffer1))
        .to.be.revertedWithCustomError(tokenAgent, "InvalidToken")
        .withArgs(d.accounts[0].address);
      const invalidOffer2 = [
        [d.weth.target, SELL, d.expiry60s, [[888, "999999999999999999999999999999999997"]]],
      ];
      await expect(tokenAgent.addOffers(invalidOffer2))
        .to.be.revertedWithCustomError(tokenAgent, "CannotOfferWETH");
    });

    it("Test TokenAgent offers", async function () {
      const d = await loadFixture(deployContracts);
      await printState(d);

      const offers1 = [
        [ d.erc20Token.target,
          SELL,
          d.expiry60s,
          [
            [ethers.parseUnits("0.1", 18), ethers.parseUnits("1", 18)],
            [ethers.parseUnits("0.2", 18), ethers.parseUnits("1", 18)],
            [ethers.parseUnits("0.3", 18), ethers.parseUnits("0.1", 18)]
          ]
        ],
        // [erc20Token.target, SELL, expiry, [[ethers.parseUnits("0.11111", 18), ethers.parseUnits("1", 18)], [ethers.parseUnits("0.22222", 18), ethers.parseUnits("9", 18)]]],
        // [erc20Token.target, SELL, expiry, ethers.parseUnits("0.12345", 18), ethers.parseUnits("1", 18)],
        // [erc721Token.target, BUY, expiry, ethers.parseUnits("0.123456", 18), ethers.parseUnits("1000.2", 18)],
        // [erc1155Token.target, SELL, expiry, ethers.parseUnits("0.1234567", 18), ethers.parseUnits("1000.3", 18)],
      ];
      const addOffers1Tx = await d.tokenAgents[1].connect(d.accounts[1]).addOffers(offers1);
      const addOffers1TxReceipt = await addOffers1Tx.wait();
      console.log("        * addOffers1TxReceipt.gasUsed: " + addOffers1TxReceipt.gasUsed);
      const offerKeys = [];
      addOffers1TxReceipt.logs.forEach((event) => {
        const log = d.tokenAgents[1].interface.parseLog(event);
        offerKeys.push(log.args[0]);
        // console.log("        + " + log.name + JSON.stringify(log.args.map(e => e.toString())));
        console.log("        + " + log.name + '(key:' + log.args[0].substring(0, 20) + ', token: ' + log.args[1].substring(0, 12) + ', nonce: ' + log.args[2] + ', info: ' + JSON.stringify(log.args[3].map(e => e.toString())) + ') @ ' + new Date(parseInt(log.args[4]) * 1000).toLocaleString());
      });
      console.log("        * offerKeys: " + offerKeys.join(','));

      const trades1 = [
        [offerKeys[0], ethers.parseUnits("2.1", 18).toString(), ethers.parseUnits("0.157142857142857142", 18).toString(), FILLORKILL],
        // [offerKeys[1], ethers.parseUnits("10", 18).toString()],
        // [offerKeys[2], ethers.parseUnits("30", 18).toString()]
      ];
      console.log("        * trades1: " + JSON.stringify(trades1));
      const trades1Tx = await d.tokenAgents[1].connect(d.accounts[2]).trade(trades1);
      const trades1TxReceipt = await trades1Tx.wait();
      console.log("        * trades1TxReceipt.gasUsed: " + trades1TxReceipt.gasUsed);
      trades1TxReceipt.logs.forEach((event) => {
        if (event.address == d.weth.target) {
          const log = d.weth.interface.parseLog(event);
          console.log("        + weth." + log.name + '(' + log.args.join(',') + ')');
        } else if (event.address == d.erc20Token.target) {
          const log = d.erc20Token.interface.parseLog(event);
          console.log("        + erc20Token." + log.name + '(' + log.args.join(',') + ')');
        } else if (event.address == d.tokenAgents[1].target) {
          const log = d.tokenAgents[1].interface.parseLog(event);
          console.log("        + " + log.name + '(' + log.args.join(',') + ')');
        }
      });

      await printState(d);
    });

  });

});
