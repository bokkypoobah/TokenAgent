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
        * accounts[0]->TokenAgentFactory.deploy(weth) => 0xDc64a140 - gasUsed: 3,935,039 0.003935039Ξ 9.84 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[0]->tokenAgentFactory.newTokenAgent() => 0xb0279Db6 - gasUsed: 205,638 0.000205638Ξ 0.51 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgentFactory.newTokenAgent() => 0x3dE2Da43 - gasUsed: 188,538 0.000188538Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgentFactory.newTokenAgent() => 0xddEA3d67 - gasUsed: 188,538 0.000188538Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[3]->tokenAgentFactory.newTokenAgent() => 0xAbB60812 - gasUsed: 188,538 0.000188538Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * now: 3:01:27 AM, expiry: 3:03:27 AM
      ✔ Test TokenAgent secondary functions (845ms)
      ✔ Test TokenAgent invalid offers

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982874762781002735                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998917571329200124                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936529948384238                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950952170389939                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512,1,1,1725555807,100000000000000000,1000000000000000000,200000000000000000,1000000000000000000,300000000000000000,100000000000000000"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0xa773...b693] - gasUsed: 255,363 0.000255363Ξ 0.64 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered20(offerKey:0xa773...b693, maker: 0x70997970, token: 0xe7f1725E, buySell: SELL, expiry: 3:03:27 AM, nonce: 0, prices: [0.1,0.2,0.3], tokens: [1,1,0.1], timestamp: 3:03:08 AM)
        * trades1: [["0xa773f6f0b794601d84d13e64ed0b1e900fd4cf8e26ca65d78a96842c16fbb693","105000000000000000",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 125,093 0.000125093Ξ 0.31 USD @ 1.0 gwei 2500.00 ETH/USD
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.11)
          + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
          + tokenAgents[1].Traded20(offerKey:0xa773...b693, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, makerBuySell: SELL, prices: [0.1,0.2,0], tokens: [1,0.05,0], averagePrice: 0.104761904761904761, timestamp: 3:03:09 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982874762781002735                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998662207972458013                   100.11                   998.95                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd   9899.99881143679502022                    99.89                  1001.05                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950952170389939                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * trades2: [["0xa773f6f0b794601d84d13e64ed0b1e900fd4cf8e26ca65d78a96842c16fbb693","209523809523809523",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades2) - gasUsed: 135,525 0.000135525Ξ 0.34 USD @ 1.0 gwei 2500.00 ETH/USD
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.22)
          + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
          + tokenAgents[1].Traded20(offerKey:0xa773...b693, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, makerBuySell: SELL, prices: [0.2,0.3,0], tokens: [0.95,0.1,0], averagePrice: 0.209523809523809523, timestamp: 3:03:10 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982874762781002735                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998662207972458013                   100.33                    997.9                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998675911649330845                    99.67                   1002.1                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950952170389939                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-20 offers and trades (53ms)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982874762781002735                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998917571329200124                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936529948384238                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950952170389939                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,0,0,1725555807,100000000000000000,4","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,0,1725555807,100000000000000000,4,4,5,6,7","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,1,1725555807,100000000000000000,4,200000000000000000,5,300000000000000000,6,400000000000000000,7"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0x8c85...d124, 0xa2e4...61a5, 0x3ead...b8b5] - gasUsed: 555,890 0.00055589Ξ 1.39 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered721(offerKey:0x8c85...d124, maker: 0x70997970, token: 0x9fE46736, buySell: BUY, expiry: 3:03:27 AM, nonce: 0, count: 4, prices: [0.1], tokenIds: [], timestamp: 3:03:08 AM)
          + tokenAgents[1].Offered721(offerKey:0xa2e4...61a5, maker: 0x70997970, token: 0x9fE46736, buySell: SELL, expiry: 3:03:27 AM, nonce: 0, count: 4, prices: [0.1], tokenIds: ["4","5","6","7"], timestamp: 3:03:08 AM)
          + tokenAgents[1].Offered721(offerKey:0x3ead...b8b5, maker: 0x70997970, token: 0x9fE46736, buySell: SELL, expiry: 3:03:27 AM, nonce: 0, count: 65535, prices: [0.1,0.2,0.3,0.4], tokenIds: ["4","5","6","7"], timestamp: 3:03:08 AM)
        * trades1: [["0x3ead6c7c5de7833db2d66c4a6dc6be77ddf24ea0b19f6fc4d79c6a6e4406b8b5","1000000000000000000",1,[4,5,6,7]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 164,241 0.000164241Ξ 0.41 USD @ 1.0 gwei 2500.00 ETH/USD
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 4)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 4)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 5)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 5)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 6)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 6)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 7)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 7)
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 1.0)
          + tokenAgents[1].Traded721(offerKey:0x3ead...b8b5, taker: 0x3C44CdDd, maker: 0x70997970, token: 0x9fE46736, makerBuySell: SELL, prices: [0.1,0.2,0.3,0.4], tokenIds: ["4","5","6","7"], totalPrice: 1.0, timestamp: 3:03:09 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982874762781002735                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998361680552621794                    101.0                   1000.0                                                0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998772288746532049                     99.0                   1000.0           4, 5, 6, 7, 8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950952170389939                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-721 offers and trades

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982874762781002735                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998917571329200124                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936529948384238                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950952170389939                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,0,0,1725555807,100000000000000000,4","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,0,1725555807,100000000000000000,40,0,10,1,10,2,10,3,10","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,1,1725555807,100000000000000000,0,10,200000000000000000,1,10,300000000000000000,2,10,400000000000000000,3,10"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0xe26b...a846, 0xcda6...b0c7, 0x3918...9957] - gasUsed: 664,851 0.000664851Ξ 1.66 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered1155(offerKey:0xe26b...a846, maker: 0x70997970, token: 0xCf7Ed3Ac, buySell: BUY, expiry: 3:03:27 AM, nonce: 0, count: 4, prices: [0.1], tokenIds: [], tokenss: [], timestamp: 3:03:08 AM)
          + tokenAgents[1].Offered1155(offerKey:0xcda6...b0c7, maker: 0x70997970, token: 0xCf7Ed3Ac, buySell: SELL, expiry: 3:03:27 AM, nonce: 0, count: 40, prices: [0.1], tokenIds: [0,1,2,3], tokenss: [10,10,10,10], timestamp: 3:03:08 AM)
          + tokenAgents[1].Offered1155(offerKey:0x3918...9957, maker: 0x70997970, token: 0xCf7Ed3Ac, buySell: SELL, expiry: 3:03:27 AM, nonce: 0, count: 65535, prices: [0.1,0.2,0.3,0.4], tokenIds: [0,1,2,3], tokenss: [10,10,10,10], timestamp: 3:03:08 AM)
        * trades1: [["0xcda60da0559ce83ed1c0781ddb5365473a713a6965df8b75735541a6a523b0c7","2600000000000000000",1,[0,5,1,6,2,7,3,8]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 175,728 0.000175728Ξ 0.44 USD @ 1.0 gwei 2500.00 ETH/USD
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 0, tokens: 5)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 1, tokens: 6)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 2, tokens: 7)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 3, tokens: 8)
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 2.6)
          + tokenAgents[1].Traded1155(offerKey:0xcda6...b0c7, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xCf7Ed3Ac, makerBuySell: SELL, prices: [0.1,0.1,0.1,0.1], tokenIds: [0,1,2,3], tokenss: [5,6,7,8], totalPrice: 2.6, timestamp: 3:03:09 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982874762781002735                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998252719400403277                    102.6                   1000.0                         4, 5, 6, 7             0:15, 1:14, 2:13, 3:12
          2 0x3C44CdDd   9899.99876080173206307                     97.4                   1000.0                       8, 9, 10, 11             0:35, 1:36, 2:37, 3:38
          3 0x90F79bf6  9899.998950952170389939                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-1155 offers and trades


  5 passing (989ms)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
