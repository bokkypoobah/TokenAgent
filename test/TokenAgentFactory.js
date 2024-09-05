const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const DEBUGSETUPEVENTS = false;

const ADDRESS0 = "0x0000000000000000000000000000000000000000";

const GASPRICE = ethers.parseUnits("1", "gwei");
const ETHUSD = 2500.0;

const BUY = 0;
const SELL = 1;

const ERC20 = 0;
const ERC721 = 1;
const ERC1155 = 2;

const FILL = 0;
const FILLORKILL = 1;

const SINGLE = 0;
const MULTIPLE = 1;

// const DATE_FORMAT_OPTIONS = {
//   year: "numeric",
//   month: "numeric",
//   day: "numeric",
//   hour: "numeric",
//   minute: "numeric",
//   second: "numeric",
//   hour12: false,
//   timeZone: "utc",
// };

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
  function printLogs(d, label, txReceipt) {
    const tokenAgentAdresses = {};
    for (let i = 0; i < 4; i++) {
      tokenAgentAdresses[d.tokenAgents[i].target] = i;
    }
    const fee = BigInt(txReceipt.gasUsed) * GASPRICE;
    const feeUsd = parseFloat(ethers.formatEther(fee)) * ETHUSD;
    console.log("        * " + label + " - gasUsed: " + txReceipt.gasUsed + " " + ethers.formatEther(fee) + "Ξ " + feeUsd.toFixed(2) + " USD @ " + ethers.formatUnits(GASPRICE, "gwei") + " gwei " + ETHUSD.toFixed(2) + " ETH/USD");
    txReceipt.logs.forEach((event) => {
      if (event.address in tokenAgentAdresses) {
        const log = d.tokenAgents[1].interface.parseLog(event);
        // console.log(JSON.stringify(log.map(e => e.toString())));
        if (log.name == "Offer20Added") {
          console.log("        + tokenAgents[" + tokenAgentAdresses[event.address] + "]." + log.name + '(offerKey:' + log.args[0].substring(0, 6) + '...' + log.args[0].slice(-4) + ', token: ' + log.args[1].substring(0, 12) + ', nonce: ' + log.args[2] + ', buySell: ' + (log.args[3][0] ? ' SELL' : ' BUY') + ', expiry: ' + new Date(parseInt(log.args[3][1]) * 1000).toLocaleTimeString() + ', prices: ' + JSON.stringify(log.args[3][2].map(e => ethers.formatEther(e))) + ', tokens: ' + JSON.stringify(log.args[3][3].map(e => ethers.formatEther(e))) + ', timestamp: ' + new Date(parseInt(log.args[4]) * 1000).toLocaleTimeString() + ')');
        } else if (log.name == "Offer721Added") {
          // console.log("        + " + log.name + JSON.stringify(log.args.map(e => e.toString())));
          console.log("        + tokenAgents[" + tokenAgentAdresses[event.address] + "]." + log.name + '(offerKey:' + log.args[0].substring(0, 6) + '...' + log.args[0].slice(-4) + ', token: ' + log.args[1].substring(0, 12) + ', nonce: ' + log.args[2] + ', buySell: ' + (log.args[3][0] ? ' SELL' : ' BUY')+ ', expiry: ' + new Date(parseInt(log.args[3][1]) * 1000).toLocaleTimeString() + ', count: ' + log.args[3][2] + ', prices: ' + JSON.stringify(log.args[3][3].map(e => ethers.formatEther(e))) + ', tokenIds: ' + JSON.stringify(log.args[3][4].map(e => e.toString())) + ', timestamp: ' + new Date(parseInt(log.args[4]) * 1000).toLocaleTimeString() + ')');
        } else {
          console.log("        + tokenAgents[" + tokenAgentAdresses[event.address] + "]." + log.name + '(' + log.args.join(',') + ')');
        }
      } else if (event.address == d.weth.target) {
        const log = d.weth.interface.parseLog(event);
        console.log("        + weth." + log.name + '(from: ' + log.args[0].substring(0, 10) + ', to: ' + log.args[1].substring(0, 10) + ', tokens: ' + ethers.formatEther(log.args[2]) + ')');
      } else if (event.address == d.erc20Token.target) {
        const log = d.erc20Token.interface.parseLog(event);
        console.log("        + erc20Token." + log.name + '(from: ' + log.args[0].substring(0, 10) + ', to: ' + log.args[1].substring(0, 10) + ', tokens: ' + ethers.formatEther(log.args[2]) + ')');
      } else if (event.address == d.erc721Token.target) {
        const log = d.erc721Token.interface.parseLog(event);
        console.log("        + erc721Token." + log.name + '(from: ' + log.args[0].substring(0, 10) + ', to: ' + log.args[1].substring(0, 10) + ', tokenId: ' + log.args[2] + ')');
      } else if (event.address == d.tokenAgents[1].target) {
        const log = d.tokenAgents[1].interface.parseLog(event);
        // TODO
        console.log("        + tokenAgents[1]." + log.name + '(' + log.args.join(',') + ')');
        // console.log("        + " + log.name + '(offerKey: ' + log.args[0][0].substring(0, 10) + '...' + log.args[0][0].slice(-8) + ')');
      }
    });
  }
  async function printState(d) {
    console.log();
    console.log("          # Account                               ETH          " + d.weth.target.substring(0, 10) + " WETH        " + d.erc20Token.target.substring(0, 10) + " ERC-20       " + d.erc721Token.target.substring(0, 10) + " ERC-721      " + d.erc1155Token.target.substring(0, 10) + " ERC-1155");
    console.log("          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------");
    const erc721Balances = {};
    for (let tokenId = 0; tokenId < 16; tokenId++) {
      const owner = await d.erc721Token.ownerOf(tokenId);
      if (!(owner in erc721Balances)) {
        erc721Balances[owner] = [];
      }
      erc721Balances[owner].push(tokenId);
    }

    const erc1155Balances = {};
    for (let tokenId = 0; tokenId < 4; tokenId++) {
      for (let i = 0; i < 4; i++) {
        const count = await d.erc1155Token.balanceOf(d.accounts[i].address, tokenId);
        if (!(d.accounts[i].address in erc1155Balances)) {
          erc1155Balances[d.accounts[i].address] = {};
        }
        if (!(tokenId in erc1155Balances[d.accounts[i].address])) {
          erc1155Balances[d.accounts[i].address][tokenId] = parseInt(count);
        }
      }
    }
    for (let i = 0; i < 4; i++) {
      const balance = await ethers.provider.getBalance(d.accounts[i].address);
      const wethBalance = await d.weth.balanceOf(d.accounts[i].address);
      const erc20Balance = await d.erc20Token.balanceOf(d.accounts[i].address);
      const erc721TokenIds = erc721Balances[d.accounts[i].address] || [];
      const erc1155TokenIds = erc1155Balances[d.accounts[i].address];
      const erc1155Info = [];
      for (const [tokenId, count] of Object.entries(erc1155TokenIds)) {
        erc1155Info.push(tokenId + ':' + count);
      }
      console.log("          " + i + " " + d.accounts[i].address.substring(0, 16) + " " +
        padLeft(ethers.formatEther(balance), 24) + " " +
        padLeft(ethers.formatEther(wethBalance), 24) + " " +
        padLeft(ethers.formatEther(erc20Balance), 24) + " " +
        padLeft(erc721TokenIds.join(","), 24) + " " +
        padLeft(erc1155Info.join(","), 24)
      );
    }
    console.log();
  }

  async function deployContracts() {
    const accounts = await ethers.getSigners();
    const WETH9 = await ethers.getContractFactory("WETH9");
    const weth = await WETH9.deploy();
    const ERC20Token = await ethers.getContractFactory("ERC20Token");
    const erc20Token = await ERC20Token.deploy();
    const erc20TokenTxDeployment = await erc20Token.waitForDeployment();
    const erc20TokenTx = await erc20TokenTxDeployment.deploymentTransaction();
    const erc20TokenTxReceipt = await erc20TokenTx.wait();
    erc20TokenTxReceipt.logs.forEach((event) => {
      const log = erc20Token.interface.parseLog(event);
      DEBUGSETUPEVENTS && console.log("        + erc20Token." + log.name + '(from:' + log.args[0].substring(0, 10) + ', to:' + log.args[1].substring(0, 10) + ', tokens: ' + ethers.formatEther(log.args[2]) + ')');
    });

    const ERC721Token = await ethers.getContractFactory("ERC721Token");
    const erc721Token = await ERC721Token.deploy();
    const ERC1155Token = await ethers.getContractFactory("ERC1155Token");
    const erc1155Token = await ERC1155Token.deploy("https://blah.blah/blah/");
    const TokenAgentFactory = await ethers.getContractFactory("TokenAgentFactory");
    const tokenAgentFactory = await TokenAgentFactory.deploy(weth);
    const tokenAgentFactoryTxDeployment = await tokenAgentFactory.waitForDeployment();
    const tokenAgentFactoryTx = await tokenAgentFactoryTxDeployment.deploymentTransaction();
    const tokenAgentFactoryTxReceipt = await tokenAgentFactoryTx.wait();
    const fee = BigInt(tokenAgentFactoryTxReceipt.gasUsed) * GASPRICE;
    const feeUsd = parseFloat(ethers.formatEther(fee)) * ETHUSD;
    console.log("        * accounts[0]->TokenAgentFactory.deploy(weth) => " + tokenAgentFactory.target.substring(0, 10) + " - gasUsed: " + tokenAgentFactoryTxReceipt.gasUsed + " " + ethers.formatEther(fee) + "Ξ " + feeUsd.toFixed(2) + " USD @ " + ethers.formatUnits(GASPRICE, "gwei") + " gwei " + ETHUSD.toFixed(2) + " ETH/USD");

    const TokenAgent = await ethers.getContractFactory("TokenAgent");
    const tokenAgents = [];
    for (let i = 0; i < 4; i++) {
      const newTokenAgentTx = await tokenAgentFactory.connect(accounts[i]).newTokenAgent();
      const newTokenAgentTxReceipt = await newTokenAgentTx.wait();
      const fee = BigInt(newTokenAgentTxReceipt.gasUsed) * GASPRICE;
      const feeUsd = parseFloat(ethers.formatEther(fee)) * ETHUSD;
      newTokenAgentTxReceipt.logs.forEach((event) => {
        const log = tokenAgentFactory.interface.parseLog(event);
        // console.log("        + tokenAgentFactory." + log.name + ' ' + JSON.stringify(log.args.map(e => e.toString())));
        DEBUGSETUPEVENTS && console.log("        + tokenAgentFactory." + log.name + '(tokenAgent: ' + log.args[0].substring(0, 12) + ', owner: ' + log.args[1].substring(0, 12) + ', index: ' + log.args[2] + ', timestamp: ' + new Date(parseInt(log.args[3]) * 1000).toLocaleTimeString() + ')');
        console.log("        * accounts[" + i + "]->tokenAgentFactory.newTokenAgent() => " + log.args[0].substring(0, 10) + " - gasUsed: " + newTokenAgentTxReceipt.gasUsed + " " + ethers.formatEther(fee) + "Ξ " + feeUsd + " USD @ " + ethers.formatUnits(GASPRICE, "gwei") + " gwei " + ETHUSD.toFixed(2) + " ETH/USD");
      });

      const tokenAgentAddress = await tokenAgentFactory.tokenAgentsByOwners(accounts[i].address, 0);
      const tokenAgent = TokenAgent.attach(tokenAgentAddress);
      tokenAgents.push(tokenAgent);
    }

    const amountWeth = ethers.parseUnits("100", 18);
    for (let i = 0; i < 4; i++) {
      const mintTx = await accounts[i].sendTransaction({ to: weth.target, value: amountWeth });
      const mintTxReceipt = await mintTx.wait();
      mintTxReceipt.logs.forEach((event) => {
        const log = weth.interface.parseLog(event);
        DEBUGSETUPEVENTS && console.log("        + weth." + log.name + '(dst:' + log.args[0].substring(0, 12) + ', wad: ' + ethers.formatEther(log.args[1]) + ')');
      });
    }

    const amountERC20 = ethers.parseUnits("1000", 18);
    for (let i = 1; i < 4; i++) {
      const transferTx = await erc20Token.transfer(accounts[i], amountERC20);
      const transferTxReceipt = await transferTx.wait();
      transferTxReceipt.logs.forEach((event) => {
        const log = weth.interface.parseLog(event);
        DEBUGSETUPEVENTS && console.log("        + erc20Token." + log.name + '(from:' + log.args[0].substring(0, 12) + ', to:' + log.args[1].substring(0, 12) + ', tokens: ' + ethers.formatEther(log.args[2]) + ')');
      });
    }
    const transfer1Tx = await erc20Token.transfer(ADDRESS0, ethers.parseUnits("996000", 18));
    const transfer1TxReceipt = await transfer1Tx.wait();
    transfer1TxReceipt.logs.forEach((event) => {
      const log = weth.interface.parseLog(event);
      DEBUGSETUPEVENTS && console.log("        + erc20Token." + log.name + '(from:' + log.args[0].substring(0, 12) + ', to:' + log.args[1].substring(0, 12) + ', tokens: ' + ethers.formatEther(log.args[2]) + ')');
    });

    const approveAmount = ethers.parseUnits("12.345", 18);
    for (let i = 1; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const approvalTx = await weth.connect(accounts[i]).approve(tokenAgents[j], approveAmount);
        const approvalTxReceipt = await approvalTx.wait();
        approvalTxReceipt.logs.forEach((event) => {
          const log = weth.interface.parseLog(event);
          DEBUGSETUPEVENTS && console.log("        + weth." + log.name + '(owner:' + log.args[0].substring(0, 12) + ', spender:' + log.args[1].substring(0, 12) + ', tokens: ' + ethers.formatEther(log.args[2]) + ')');
        });
      }
    }
    for (let i = 1; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const approvalTx = await erc20Token.connect(accounts[i]).approve(tokenAgents[j], approveAmount);
        const approvalTxReceipt = await approvalTx.wait();
        approvalTxReceipt.logs.forEach((event) => {
          const log = weth.interface.parseLog(event);
          DEBUGSETUPEVENTS && console.log("        + erc20Token." + log.name + '(owner:' + log.args[0].substring(0, 12) + ', spender:' + log.args[1].substring(0, 12) + ', tokens: ' + ethers.formatEther(log.args[2]) + ')');
        });
      }
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const mintTx = await erc721Token.mint(accounts[i]);
        const mintTxReceipt = await mintTx.wait();
        mintTxReceipt.logs.forEach((event) => {
          const log = erc721Token.interface.parseLog(event);
          DEBUGSETUPEVENTS && console.log("        + erc721Token." + log.name + '(from:' + log.args[0].substring(0, 12) + ', to: ' + log.args[1].substring(0, 12) + ', tokenId: ' + log.args[2]);
        });
      }
    }

    for (let i = 1; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const setApprovalForAllTx = await erc721Token.connect(accounts[i]).setApprovalForAll(tokenAgents[j], true);
        const setApprovalForAllTxReceipt = await setApprovalForAllTx.wait();
        setApprovalForAllTxReceipt.logs.forEach((event) => {
          const log = erc721Token.interface.parseLog(event);
          DEBUGSETUPEVENTS && console.log("        + erc721Token." + log.name + '(owner:' + log.args[0].substring(0, 12) + ', operator: ' + log.args[1].substring(0, 12) + ', approved: ' + log.args[2]);
        });
      }
    }

    for (let tokenId = 0; tokenId < 4; tokenId++) {
        for (let i = 0; i < 4; i++) {
          const mintTx = await erc1155Token.mint(accounts[i], tokenId, 10 * (i + 1), "0x");
          const mintTxReceipt = await mintTx.wait();
          mintTxReceipt.logs.forEach((event) => {
            const log = erc1155Token.interface.parseLog(event);
            DEBUGSETUPEVENTS && console.log("        + erc1155Token." + log.name + '(operator:' + log.args[0].substring(0, 12) + ', from: ' + log.args[1].substring(0, 12) + ', to: ' + log.args[2].substring(0, 12) + ', id: ' + log.args[3] + ', amount: ' + log.args[4]);
          });
        }
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const setApprovalForAllTx = await erc1155Token.connect(accounts[i]).setApprovalForAll(tokenAgents[j], true);
        const setApprovalForAllTxReceipt = await setApprovalForAllTx.wait();
        setApprovalForAllTxReceipt.logs.forEach((event) => {
          const log = erc1155Token.interface.parseLog(event);
          DEBUGSETUPEVENTS && console.log("        + erc1155Token." + log.name + '(owner:' + log.args[0].substring(0, 12) + ', operator: ' + log.args[1].substring(0, 12) + ', approved: ' + log.args[2]);
        });
      }
    }

    const now = parseInt(new Date().getTime()/1000);
    const expiry = parseInt(now) + 120;
    console.log("        * now: " + new Date(parseInt(now) * 1000).toLocaleTimeString() + ", expiry: " + new Date(parseInt(expiry) * 1000).toLocaleTimeString());

    return { tokenAgentFactory, tokenAgents, weth, erc20Token, erc721Token, erc1155Token, accounts, now, expiry };
  }

  describe("Deploy TokenAgentFactory And TokenAgent", function () {

    it("Test TokenAgent secondary functions", async function () {
      const d = await loadFixture(deployContracts);
      await expect(d.tokenAgentFactory.newTokenAgent())
        .to.emit(d.tokenAgentFactory, "NewTokenAgent")
        .withArgs(anyValue, d.accounts[0].address, 1, anyValue);
      expect(await d.tokenAgentFactory.tokenAgentsLength(d.accounts[0].address)).to.equal(2);
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
      const invalidOffer1 = [[d.accounts[0].address, SELL, SINGLE, d.expiry, [888, "999999999999999999999999999999999997"]]];
      await expect(tokenAgent.addOffers(invalidOffer1))
        .to.be.revertedWithCustomError(tokenAgent, "InvalidToken")
        .withArgs(d.accounts[0].address);
      const invalidOffer2 = [
        [d.weth.target, SELL, SINGLE, d.expiry, [888, "999999999999999999999999999999999997"]],
      ];
      await expect(tokenAgent.addOffers(invalidOffer2))
        .to.be.revertedWithCustomError(tokenAgent, "CannotOfferWETH");
    });

    // TODO: Test TokenAgent error conditions

    it("Test TokenAgent ERC-20 offers and trades", async function () {
      const d = await loadFixture(deployContracts);
      await printState(d);

      const offers1 = [
        [
          d.erc20Token.target,
          SELL,
          MULTIPLE,
          d.expiry,
          [ethers.parseUnits("0.1", 18), ethers.parseUnits("1", 18),
           ethers.parseUnits("0.2", 18), ethers.parseUnits("1", 18),
           ethers.parseUnits("0.3", 18), ethers.parseUnits("0.1", 18)],
        ],
      ];
      console.log("        * offers1: " + JSON.stringify(offers1.map(e => e.toString())));
      const addOffers1Tx = await d.tokenAgents[1].connect(d.accounts[1]).addOffers(offers1);
      const addOffers1TxReceipt = await addOffers1Tx.wait();
      const offerKeys = [];
      addOffers1TxReceipt.logs.forEach((event) => {
        const log = d.tokenAgents[1].interface.parseLog(event);
        offerKeys.push(log.args[0]);
      });
      printLogs(d, "accounts[1]->tokenAgents[1].addOffers(offers1) => " + JSON.stringify(offerKeys.map(e => e.substring(0, 10))), addOffers1TxReceipt);

      if (true) {
        const trades1 = [
          [offerKeys[0], ethers.parseUnits("0.1050000000000000000", 18).toString(), FILLORKILL, [ethers.parseUnits("1.05", 18).toString()]],
        ];
        console.log("        * trades1: " + JSON.stringify(trades1));
        const trades1Tx = await d.tokenAgents[1].connect(d.accounts[2]).trade(trades1);
        const trades1TxReceipt = await trades1Tx.wait();
        printLogs(d, "accounts[2]->tokenAgents[1].trade(trades1)", trades1TxReceipt);
        await printState(d);

        const trades2 = [
          [offerKeys[0], ethers.parseUnits("0.209523809523809523", 18).toString(), FILLORKILL, [ethers.parseUnits("1.05", 18).toString()]],
        ];
        console.log("        * trades2: " + JSON.stringify(trades2));
        const trades2Tx = await d.tokenAgents[1].connect(d.accounts[2]).trade(trades2);
        const trades2TxReceipt = await trades2Tx.wait();
        printLogs(d, "accounts[2]->tokenAgents[1].trade(trades2)", trades2TxReceipt);
        await printState(d);
      }
    });

    it.only("Test TokenAgent ERC-721 offers and trades", async function () {
      const d = await loadFixture(deployContracts);
      await printState(d);

      const offers1 = [
        [
          d.erc721Token.target,
          BUY,
          SINGLE,
          d.expiry,
          [5, ethers.parseUnits("0.1", 18)],
        ],
        [
          d.erc721Token.target,
          SELL,
          SINGLE,
          d.expiry,
          [6, ethers.parseUnits("0.1", 18), 4, 5, 6, 7],
        ],
        [
          d.erc721Token.target,
          SELL,
          MULTIPLE,
          d.expiry,
          [ethers.parseUnits("0.1", 18), 1, ethers.parseUnits("0.2", 18), 2, ethers.parseUnits("0.3", 18), 3],
        ],
      ];
      const addOffers1Tx = await d.tokenAgents[1].connect(d.accounts[1]).addOffers(offers1);
      const addOffers1TxReceipt = await addOffers1Tx.wait();
      printLogs(d, "accounts[1]->tokenAgents[1].addOffers(offers1)", addOffers1TxReceipt);
      const offerKeys = [];
      addOffers1TxReceipt.logs.forEach((event) => {
        const log = d.tokenAgents[1].interface.parseLog(event);
        offerKeys.push(log.args[0]);
      });
      console.log("        * offerKeys: " + offerKeys.join(','));

      if (true) {
        const trades1 = [
          [offerKeys[0], ethers.parseUnits("0.157142857142857142", 18).toString(), FILLORKILL, [8, 9, 10, 11]],
          [offerKeys[1], ethers.parseUnits("0.157142857142857142", 18).toString(), FILLORKILL, [4, 5, 6, 7]],
          // [offerKeys[1], ethers.parseUnits("10", 18).toString()],
          // [offerKeys[2], ethers.parseUnits("30", 18).toString()]
        ];
        console.log("        * trades1: " + JSON.stringify(trades1));
        const trades1Tx = await d.tokenAgents[1].connect(d.accounts[2]).trade(trades1);
        const trades1TxReceipt = await trades1Tx.wait();
        printLogs(d, "accounts[2]->tokenAgents[1].trade(trades1)", trades1TxReceipt);
        await printState(d);
      }
    });

  });

});
