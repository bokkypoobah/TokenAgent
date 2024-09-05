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
Compiled 1 Solidity file successfully (evm target: paris).


  TokenAgentFactory
    Deploy TokenAgentFactory And TokenAgent
        * accounts[0]->TokenAgentFactory.deploy(weth) => 0xDc64a140 - gasUsed: 4973861 0.004973861Ξ 12.43 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[0]->tokenAgentFactory.newTokenAgent() => 0xb0279Db6 - gasUsed: 207530 0.00020753Ξ 0.518825 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgentFactory.newTokenAgent() => 0x3dE2Da43 - gasUsed: 190430 0.00019043Ξ 0.476075 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgentFactory.newTokenAgent() => 0xddEA3d67 - gasUsed: 190430 0.00019043Ξ 0.476075 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[3]->tokenAgentFactory.newTokenAgent() => 0xAbB60812 - gasUsed: 190430 0.00019043Ξ 0.476075 USD @ 1.0 gwei 2500.00 ETH/USD
        * now: 11:14:40 AM, expiry: 11:16:40 AM
      ✔ Test TokenAgent secondary functions (909ms)
      ✔ Test TokenAgent invalid offers

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975357533596075541                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998900478803610355                    100.0                   1000.0                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998920447939591092                    100.0                   1000.0                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f   9899.99893563549688558                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

        * offers1: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512,1,1,1725499000,100000000000000000,1000000000000000000,200000000000000000,1000000000000000000,300000000000000000,100000000000000000"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => ["0xe473bfa4"] - gasUsed: 266509 0.000266509Ξ 0.67 USD @ 1.0 gwei 2500.00 ETH/USD
        + tokenAgents[1].Offer20Added(offerKey:0xe473...d2e3, token: 0xe7f1725E77, nonce: 0, buySell:  SELL, expiry: 11:16:40 AM, prices: ["0.1","0.2","0.3"], tokens: ["1.0","1.0","0.1"], timestamp: 11:16:20 AM)
        * trades1: [["0xe473bfa48729a3b52a817eef0b07b3b4add1d18465be0891851274d70779d2e3","1050000000000000000","105000000000000000",1]]
        >        expiry/timestamp 1725499000 1725498981
        > ERC-20 price/tokens/used 100000000000000000 1000000000000000000 0
        >        remaining 1000000000000000000
        >        totalTokens/totalWETHTokens 1000000000000000000 100000000000000000
        > ERC-20 price/tokens/used 200000000000000000 1000000000000000000 0
        >        remaining 1000000000000000000
        >        totalTokens/totalWETHTokens 1050000000000000000 110000000000000000
        >        tokens/totalTokens/totalWETHTokens 1050000000000000000 1050000000000000000 110000000000000000
        >        msg.sender BUY/owner SELL - averagePrice/_trade.price 104761904761904761 105000000000000000
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 142554 0.000142554Ξ 0.36 USD @ 1.0 gwei 2500.00 ETH/USD
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.11)
        + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
        + tokenAgents[1].Traded(0xe473bfa48729a3b52a817eef0b07b3b4add1d18465be0891851274d70779d2e3,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,1050000000000000000,105000000000000000,1,1725498981)

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975357533596075541                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998633969415040233                   100.11                   998.95                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998777893757264526                    99.89                  1001.05                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f   9899.99893563549688558                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

        * trades2: [["0xe473bfa48729a3b52a817eef0b07b3b4add1d18465be0891851274d70779d2e3","1050000000000000000","209523809523809523",1]]
        >        expiry/timestamp 1725499000 1725498982
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
        * accounts[2]->tokenAgents[1].trade(trades2) - gasUsed: 157974 0.000157974Ξ 0.39 USD @ 1.0 gwei 2500.00 ETH/USD
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.22)
        + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
        + tokenAgents[1].Traded(0xe473bfa48729a3b52a817eef0b07b3b4add1d18465be0891851274d70779d2e3,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,1050000000000000000,209523809523809523,1,1725498982)

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975357533596075541                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998633969415040233                   100.33                    997.9                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998619919580175672                    99.67                   1002.1                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f   9899.99893563549688558                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

      ✔ Test TokenAgent ERC-20 offers and trades (62ms)

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975357533596075541                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998900478803610355                    100.0                   1000.0                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998920447939591092                    100.0                   1000.0                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f   9899.99893563549688558                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

        * accounts[1]->tokenAgents[1].addOffers(offers1) - gasUsed: 620448 0.000620448Ξ 1.55 USD @ 1.0 gwei 2500.00 ETH/USD
        + tokenAgents[1].Offer721Added(offerKey:0xc827...0f04, token: 0x9fE4673667, nonce: 0, buySell:  BUY, expiry: 11:16:40 AM, count: 5, prices: ["0.1"], tokenIds: [], timestamp: 11:16:20 AM)
        + tokenAgents[1].Offer721Added(offerKey:0xb451...9f05, token: 0x9fE4673667, nonce: 0, buySell:  SELL, expiry: 11:16:40 AM, count: 6, prices: ["0.1"], tokenIds: ["1","2","3","4"], timestamp: 11:16:20 AM)
        + tokenAgents[1].Offer721Added(offerKey:0xdd2b...e785, token: 0x9fE4673667, nonce: 0, buySell:  SELL, expiry: 11:16:40 AM, count: 65535, prices: ["0.1","0.2","0.3"], tokenIds: ["1","2","3"], timestamp: 11:16:20 AM)
        * offerKeys: 0xc827b6d95f7c3e184d9ae44a479a9e85a611fbd9e425b94c8d40d88129690f04,0xb451e46dbbc5395733e0b7ffc364d4953640f4c9a86f31782dfbe125322a9f05,0xdd2b83652040bcc0d487f7dcaeb0b4c0a9b51d011668c7f7903c8891b6cae785
        * trades1: [["0xc827b6d95f7c3e184d9ae44a479a9e85a611fbd9e425b94c8d40d88129690f04","2100000000000000000","157142857142857142",1]]
        > ERC-721 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0 0
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 43640 0.00004364Ξ 0.11 USD @ 1.0 gwei 2500.00 ETH/USD

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975357533596075541                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998280029898997171                    100.0                   1000.0                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998876807883557332                    100.0                   1000.0                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f   9899.99893563549688558                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

      ✔ Test TokenAgent ERC-721 offers and trades (38ms)


  4 passing (1s)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
