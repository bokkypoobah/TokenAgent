# Token Agent - Work In Progress

Personal agent for peer-to-peer ERC-20/721/1155 token exchange.

#### How It Works - ERC-20 ATM

* `account1` deploys `TokenAgent1`, cloned via `TokenAgentFactory`
* `account1` approves for `TokenAgent1` to transfer WETH and ERC20
* `account1` adds offers to `TokenAgent1` to, e.g., BUY ERC20: 100 @ 0.1 ERC20/WETH, 200 @ 0.2 ERC20/WETH, ...
* `account2` interacts with `TokenAgent1` to, e.g., SELL ERC20 for WETH against the `account1`'s offers

#### How The Dapp Will Work

* Incrementally scrape all `NewTokenAgent(tokenAgent, owner, index, timestamp)` events emitted by `TokenAgentFactory` to create a list of valid `TokenAgent` addresses
* Incrementally scrape all events emitted by all the deployed `TokenAgent`, filtering by the valid `TokenAgent` addresses
* When a user wants to view the offers and trades for a particular ERC20, incrementally scrape all the ERC20 events
* The dapp will have all the data required to compute the token balances and `TokenAgent` states using the events above

## Testing

#### First Install
Clone/download this repository, and in the new folder on your computer:

```bash
npm install --save-dev hardhat
```

#### Run Test Script

Or run the test with the output saved in [./testIt.out](./testIt.out).
You may initially have to mark the script as executable using the command `chmod 700 ./10_testIt.sh`.

```bash
$ ./10_testIt.sh


  TokenAgentFactory
    Deploy TokenAgentFactory And TokenAgent
        * accounts[0]->TokenAgentFactory.deploy(weth) => 0xDc64a140 - gasUsed: 5082382 0.005082382Ξ 12.71 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[0]->tokenAgentFactory.newTokenAgent() => 0xb0279Db6 - gasUsed: 207530 0.00020753Ξ 0.518825 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgentFactory.newTokenAgent() => 0x3dE2Da43 - gasUsed: 190430 0.00019043Ξ 0.476075 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgentFactory.newTokenAgent() => 0xddEA3d67 - gasUsed: 190430 0.00019043Ξ 0.476075 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[3]->tokenAgentFactory.newTokenAgent() => 0xAbB60812 - gasUsed: 190430 0.00019043Ξ 0.476075 USD @ 1.0 gwei 2500.00 ETH/USD
        * now: 11:40:45 AM, expiry: 11:42:45 AM
      ✔ Test TokenAgent secondary functions (788ms)
      ✔ Test TokenAgent invalid offers

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975188577480620797                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998900364099163457                    100.0                   1000.0                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998920352940167614                    100.0                   1000.0                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f  9899.998935555484633933                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

        * offers1: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512,1,1,1725500565,100000000000000000,1000000000000000000,200000000000000000,1000000000000000000,300000000000000000,100000000000000000"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => ["0x9f35bd23"] - gasUsed: 266509 0.000266509Ξ 0.67 USD @ 1.0 gwei 2500.00 ETH/USD
        + tokenAgents[1].Offer20Added(offerKey:0x9f35...7103, token: 0xe7f1725E77, nonce: 0, buySell:  SELL, expiry: 11:42:45 AM, prices: ["0.1","0.2","0.3"], tokens: ["1.0","1.0","0.1"], timestamp: 11:42:27 AM)
        * trades1: [["0x9f35bd236377de023d63058b9cfa71699784530fcfbf78d62af90685f8617103","105000000000000000",1,["1050000000000000000"]]]
        >        expiry/timestamp 1725500565 1725500548
        > ERC-20 price/tokens/used 100000000000000000 1000000000000000000 0
        >        remaining 1000000000000000000
        >        totalTokens/totalWETHTokens 1000000000000000000 100000000000000000
        > ERC-20 price/tokens/used 200000000000000000 1000000000000000000 0
        >        remaining 1000000000000000000
        >        totalTokens/totalWETHTokens 1050000000000000000 110000000000000000
        >        tokens/totalTokens/totalWETHTokens 1050000000000000000 1050000000000000000 110000000000000000
        >        msg.sender BUY/owner SELL - averagePrice/_trade.price 104761904761904761 105000000000000000
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 143898 0.000143898Ξ 0.36 USD @ 1.0 gwei 2500.00 ETH/USD
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.11)
        + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
        + tokenAgents[1].Traded(0x9f35bd236377de023d63058b9cfa71699784530fcfbf78d62af90685f8617103,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,1050000000000000000,105000000000000000,1,1725500548)

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975188577480620797                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998633854710593335                   100.11                   998.95                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998776454756122072                    99.89                  1001.05                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f  9899.998935555484633933                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

        * trades2: [["0x9f35bd236377de023d63058b9cfa71699784530fcfbf78d62af90685f8617103","209523809523809523",1,["1050000000000000000"]]]
        >        expiry/timestamp 1725500565 1725500549
        > ERC-20 price/tokens/used 100000000000000000 1000000000000000000 1000000000000000000
        >        remaining 0
        >        totalTokens/totalWETHTokens 0 0
        > ERC-20 price/tokens/used 200000000000000000 1000000000000000000 50000000000000000
        >        remaining 950000000000000000
        >        totalTokens/totalWETHTokens 950000000000000000 190000000000000000
        > ERC-20 price/tokens/used 300000000000000000 100000000000000000 0
        >        remaining 100000000000000000
        >        totalTokens/totalWETHTokens 1050000000000000000 220000000000000000
        >        tokens/totalTokens/totalWETHTokens 1050000000000000000 1050000000000000000 220000000000000000
        >        msg.sender BUY/owner SELL - averagePrice/_trade.price 209523809523809523 209523809523809523
        * accounts[2]->tokenAgents[1].trade(trades2) - gasUsed: 159318 0.000159318Ξ 0.40 USD @ 1.0 gwei 2500.00 ETH/USD
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.22)
        + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
        + tokenAgents[1].Traded(0x9f35bd236377de023d63058b9cfa71699784530fcfbf78d62af90685f8617103,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,1050000000000000000,209523809523809523,1,1725500549)

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975188577480620797                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998633854710593335                   100.33                    997.9                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998617136577526594                    99.67                   1002.1                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f  9899.998935555484633933                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

      ✔ Test TokenAgent ERC-20 offers and trades (61ms)

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975188577480620797                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998900364099163457                    100.0                   1000.0                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998920352940167614                    100.0                   1000.0                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f  9899.998935555484633933                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

        * accounts[1]->tokenAgents[1].addOffers(offers1) - gasUsed: 620448 0.000620448Ξ 1.55 USD @ 1.0 gwei 2500.00 ETH/USD
        + tokenAgents[1].Offer721Added(offerKey:0xfb94...c464, token: 0x9fE4673667, nonce: 0, buySell:  BUY, expiry: 11:42:45 AM, count: 5, prices: ["0.1"], tokenIds: [], timestamp: 11:42:27 AM)
        + tokenAgents[1].Offer721Added(offerKey:0xf4ba...64b5, token: 0x9fE4673667, nonce: 0, buySell:  SELL, expiry: 11:42:45 AM, count: 6, prices: ["0.1"], tokenIds: ["1","2","3","4"], timestamp: 11:42:27 AM)
        + tokenAgents[1].Offer721Added(offerKey:0x140c...c6b5, token: 0x9fE4673667, nonce: 0, buySell:  SELL, expiry: 11:42:45 AM, count: 65535, prices: ["0.1","0.2","0.3"], tokenIds: ["1","2","3"], timestamp: 11:42:27 AM)
        * offerKeys: 0xfb94c23e2a685b17206bbd178e4599b1d874d68607a0296f7d9a13223114c464,0xf4badcf51f95269068bef47bc97c269b4f93e92816218b12f7c554400f3c64b5,0x140c7938fdf7a1b7e5192ca0d99a244494f3a40cd7590cdc41e71837d5a6c6b5
        * trades1: [["0xfb94c23e2a685b17206bbd178e4599b1d874d68607a0296f7d9a13223114c464","157142857142857142",1,["2100000000000000000"]]]
        > ERC-721 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0 0
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 44764 0.000044764Ξ 0.11 USD @ 1.0 gwei 2500.00 ETH/USD

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975188577480620797                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998279915194550273                    100.0                   1000.0                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998875588882690638                    100.0                   1000.0                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f  9899.998935555484633933                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

      ✔ Test TokenAgent ERC-721 offers and trades (38ms)


  4 passing (906ms)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
