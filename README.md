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
        * accounts[0]->TokenAgentFactory.deploy(weth) => 0xDc64a140 - gasUsed: 3,708,968 0.003708968Ξ 9.27 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[0]->tokenAgentFactory.newTokenAgent() => 0xb0279Db6 - gasUsed: 205,637 0.000205637Ξ 0.51 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgentFactory.newTokenAgent() => 0x3dE2Da43 - gasUsed: 188,537 0.000188537Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgentFactory.newTokenAgent() => 0xddEA3d67 - gasUsed: 188,537 0.000188537Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[3]->tokenAgentFactory.newTokenAgent() => 0xAbB60812 - gasUsed: 188,537 0.000188537Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * now: 9:18:39 AM, expiry: 9:20:39 AM
      ✔ Test TokenAgent secondary functions (708ms)
      ✔ Test TokenAgent invalid offers

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983222768830857691                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998917801899939368                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936721122045834                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6   9899.99895111336721785                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512,1,1,1725578439,100000000000000000,1000000000000000000,200000000000000000,1000000000000000000,300000000000000000,100000000000000000"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0x1dc5...6723] - gasUsed: 258,755 0.000258755Ξ 0.65 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered(key:0x1dc5...6723, maker: 0x70997970, token: 0xe7f1725E, tokenType: 20, buySell: SELL, expiry: 9:20:39 AM, nonce: 0, count: 0, prices: [0.1,0.2,0.3], tokenIds: [], tokenss: [1000000000000000000,1000000000000000000,100000000000000000], timestamp: 9:20:20 AM)
        * trades1: [["0x1dc514fefbad40f9477f5645126df479c34316934cb480ad9bf2bf7a304f6723","105000000000000000",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 126,026 0.000126026Ξ 0.32 USD @ 1.0 gwei 2500.00 ETH/USD
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.11)
          + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
          + tokenAgents[1].Traded(key:0x1dc5...6723, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, tokenType: 20, makerBuySell: SELL, prices: [0.1,0.2,0], tokenIds: [], tokenss: [1000000000000000000,50000000000000000,0], price: 0.104761904761904761, timestamp: 9:20:21 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983222768830857691                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998659046539234898                   100.11                   998.95                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998810694967916036                    99.89                  1001.05                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6   9899.99895111336721785                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * trades2: [["0x1dc514fefbad40f9477f5645126df479c34316934cb480ad9bf2bf7a304f6723","209523809523809523",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades2) - gasUsed: 136,458 0.000136458Ξ 0.34 USD @ 1.0 gwei 2500.00 ETH/USD
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.22)
          + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
          + tokenAgents[1].Traded(key:0x1dc5...6723, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, tokenType: 20, makerBuySell: SELL, prices: [0.2,0.3,0], tokenIds: [], tokenss: [950000000000000000,100000000000000000,0], price: 0.209523809523809523, timestamp: 9:20:22 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983222768830857691                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998659046539234898                   100.33                    997.9                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd   9899.99867423682163306                    99.67                   1002.1                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6   9899.99895111336721785                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-20 offers and trades (53ms)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983222768830857691                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998917801899939368                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936721122045834                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6   9899.99895111336721785                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,0,0,1725578439,100000000000000000,4","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,0,1725578439,100000000000000000,4,4,5,6,7","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,1,1725578439,100000000000000000,4,200000000000000000,5,300000000000000000,6,400000000000000000,7"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0x6c6b...67d4, 0x2824...5b05, 0x68b9...8965] - gasUsed: 571,699 0.000571699Ξ 1.43 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered(key:0x6c6b...67d4, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, buySell: BUY, expiry: 9:20:39 AM, nonce: 0, count: 4, prices: [0.1], tokenIds: [], tokenss: [], timestamp: 9:20:20 AM)
          + tokenAgents[1].Offered(key:0x2824...5b05, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, buySell: SELL, expiry: 9:20:39 AM, nonce: 0, count: 4, prices: [0.1], tokenIds: [4,5,6,7], tokenss: [], timestamp: 9:20:20 AM)
          + tokenAgents[1].Offered(key:0x68b9...8965, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, buySell: SELL, expiry: 9:20:39 AM, nonce: 0, count: 65535, prices: [0.1,0.2,0.3,0.4], tokenIds: [4,5,6,7], tokenss: [], timestamp: 9:20:20 AM)
        * trades1: [["0x68b9be5b42170e373b97415bd7d82dbee6fa4d42dfb199517a852e2c662f8965","1000000000000000000",1,[4,5,6,7]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 165,313 0.000165313Ξ 0.41 USD @ 1.0 gwei 2500.00 ETH/USD
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 4)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 4)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 5)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 5)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 6)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 6)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 7)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 7)
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 1.0)
          + tokenAgents[1].Traded(key:0x68b9...8965, taker: 0x3C44CdDd, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, makerBuySell: SELL, prices: [0.1,0.2,0.3,0.4], tokenIds: [4,5,6,7], tokenss: [], price: 1.0, timestamp: 9:20:21 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983222768830857691                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998346102102990962                    101.0                   1000.0                                                0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998771407919206783                     99.0                   1000.0           4, 5, 6, 7, 8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6   9899.99895111336721785                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-721 offers and trades (72ms)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983222768830857691                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998917801899939368                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936721122045834                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6   9899.99895111336721785                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,0,0,1725578439,100000000000000000,4","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,0,1725578439,100000000000000000,40,0,10,1,10,2,10,3,10","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,1,1725578439,100000000000000000,0,10,200000000000000000,1,10,300000000000000000,2,10,400000000000000000,3,10"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0x9059...16b6, 0x0a93...a437, 0x8e58...a7c7] - gasUsed: 665,702 0.000665702Ξ 1.66 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered(key:0x9059...16b6, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, buySell: BUY, expiry: 9:20:39 AM, nonce: 0, count: 4, prices: [0.1], tokenIds: [], tokenss: [], timestamp: 9:20:20 AM)
          + tokenAgents[1].Offered(key:0x0a93...a437, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, buySell: SELL, expiry: 9:20:39 AM, nonce: 0, count: 40, prices: [0.1], tokenIds: [0,1,2,3], tokenss: [10,10,10,10], timestamp: 9:20:20 AM)
          + tokenAgents[1].Offered(key:0x8e58...a7c7, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, buySell: SELL, expiry: 9:20:39 AM, nonce: 0, count: 65535, prices: [0.1,0.2,0.3,0.4], tokenIds: [0,1,2,3], tokenss: [10,10,10,10], timestamp: 9:20:20 AM)
        * trades1: [["0x0a937358670384f5986f65625850c770deb2c3df73e953792f3b602ce104a437","2600000000000000000",1,[0,5,1,6,2,7,3,8]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 174,480 0.00017448Ξ 0.44 USD @ 1.0 gwei 2500.00 ETH/USD
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 0, tokens: 5)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 1, tokens: 6)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 2, tokens: 7)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 3, tokens: 8)
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 2.6)
          + tokenAgents[1].Traded(key:0x0a93...a437, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, makerBuySell: SELL, prices: [0.1,0.1,0.1,0.1], tokenIds: [0,1,2,3], tokenss: [5,6,7,8], price: 2.6, timestamp: 9:20:21 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983222768830857691                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99825209897195078                    102.6                   1000.0                         4, 5, 6, 7             0:15, 1:14, 2:13, 3:12
          2 0x3C44CdDd  9899.998762240907784394                     97.4                   1000.0                       8, 9, 10, 11             0:35, 1:36, 2:37, 3:38
          3 0x90F79bf6   9899.99895111336721785                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-1155 offers and trades (38ms)


  5 passing (886ms)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
