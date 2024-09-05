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
        * accounts[0]->TokenAgentFactory.deploy(weth) => 0xDc64a140 - gasUsed: 3,607,584 0.003607584Ξ 9.02 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[0]->tokenAgentFactory.newTokenAgent() => 0xb0279Db6 - gasUsed: 205,640 0.00020564Ξ 0.51 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgentFactory.newTokenAgent() => 0x3dE2Da43 - gasUsed: 188,540 0.00018854Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgentFactory.newTokenAgent() => 0xddEA3d67 - gasUsed: 188,540 0.00018854Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[3]->tokenAgentFactory.newTokenAgent() => 0xAbB60812 - gasUsed: 188,540 0.00018854Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * now: 9:58:17 AM, expiry: 10:00:17 AM
      ✔ Test TokenAgent secondary functions (829ms)
      ✔ Test TokenAgent invalid offers

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983378830794521243                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99891790037373257                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936802108608183                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998951181069635737                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512,1,1,1725580817,100000000000000000,1000000000000000000,200000000000000000,1000000000000000000,300000000000000000,100000000000000000"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0] - gasUsed: 279,945 0.000279945Ξ 0.70 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered(index:0, maker: 0x70997970, token: 0xe7f1725E, tokenType: 20, buySell: SELL, expiry: 10:00:17 AM, nonce: 0, count: 0, prices: [0.1,0.2,0.3], tokenIds: [], tokenss: [1000000000000000000,1000000000000000000,100000000000000000], timestamp: 9:59:58 AM)
        * trades1: [[0,"105000000000000000",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 130,068 0.000130068Ξ 0.33 USD @ 1.0 gwei 2500.00 ETH/USD
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.11)
          + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
          + tokenAgents[1].Traded(index:0, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, tokenType: 20, makerBuySell: SELL, prices: [0.1,0.2,0], tokenIds: [], tokenss: [1000000000000000000,50000000000000000,0], price: 0.104761904761904761, timestamp: 9:59:59 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983378830794521243                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99863795498404913                   100.11                   998.95                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998806733949665087                    99.89                  1001.05                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998951181069635737                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * trades2: [[0,"209523809523809523",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades2) - gasUsed: 140,500 0.0001405Ξ 0.35 USD @ 1.0 gwei 2500.00 ETH/USD
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.22)
          + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
          + tokenAgents[1].Traded(index:0, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, tokenType: 20, makerBuySell: SELL, prices: [0.2,0.3,0], tokenIds: [], tokenss: [950000000000000000,100000000000000000,0], price: 0.209523809523809523, timestamp: 10:00:00 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983378830794521243                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99863795498404913                   100.33                    997.9                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998666233799189587                    99.67                   1002.1                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998951181069635737                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-20 offers and trades (52ms)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983378830794521243                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99891790037373257                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936802108608183                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998951181069635737                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,0,0,1725580817,100000000000000000,4","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,0,1725580817,100000000000000000,4,4,5,6,7","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,1,1725580817,100000000000000000,4,200000000000000000,5,300000000000000000,6,400000000000000000,7"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0, 1, 2] - gasUsed: 590,604 0.000590604Ξ 1.48 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered(index:0, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, buySell: BUY, expiry: 10:00:17 AM, nonce: 0, count: 4, prices: [0.1], tokenIds: [], tokenss: [], timestamp: 9:59:58 AM)
          + tokenAgents[1].Offered(index:1, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, buySell: SELL, expiry: 10:00:17 AM, nonce: 0, count: 4, prices: [0.1], tokenIds: [4,5,6,7], tokenss: [], timestamp: 9:59:58 AM)
          + tokenAgents[1].Offered(index:2, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, buySell: SELL, expiry: 10:00:17 AM, nonce: 0, count: 65535, prices: [0.1,0.2,0.3,0.4], tokenIds: [4,5,6,7], tokenss: [], timestamp: 9:59:58 AM)
        * trades1: [[2,"1000000000000000000",1,[4,5,6,7]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 169,877 0.000169877Ξ 0.42 USD @ 1.0 gwei 2500.00 ETH/USD
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 4)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 4)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 5)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 5)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 6)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 6)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 7)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 7)
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 1.0)
          + tokenAgents[1].Traded(index:2, taker: 0x3C44CdDd, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, makerBuySell: SELL, prices: [0.1,0.2,0.3,0.4], tokenIds: [4,5,6,7], tokenss: [], price: 1.0, timestamp: 9:59:59 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983378830794521243                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998327295551611802                    101.0                   1000.0                                                0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998766924900508858                     99.0                   1000.0           4, 5, 6, 7, 8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998951181069635737                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-721 offers and trades

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983378830794521243                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99891790037373257                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936802108608183                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998951181069635737                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,0,0,1725580817,100000000000000000,4","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,0,1725580817,100000000000000000,40,0,10,1,10,2,10,3,10","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,1,1725580817,100000000000000000,0,10,200000000000000000,1,10,300000000000000000,2,10,400000000000000000,3,10"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0, 1, 2] - gasUsed: 685,633 0.000685633Ξ 1.71 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered(index:0, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, buySell: BUY, expiry: 10:00:17 AM, nonce: 0, count: 4, prices: [0.1], tokenIds: [], tokenss: [], timestamp: 9:59:58 AM)
          + tokenAgents[1].Offered(index:1, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, buySell: SELL, expiry: 10:00:17 AM, nonce: 0, count: 40, prices: [0.1], tokenIds: [0,1,2,3], tokenss: [10,10,10,10], timestamp: 9:59:58 AM)
          + tokenAgents[1].Offered(index:2, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, buySell: SELL, expiry: 10:00:17 AM, nonce: 0, count: 65535, prices: [0.1,0.2,0.3,0.4], tokenIds: [0,1,2,3], tokenss: [10,10,10,10], timestamp: 9:59:58 AM)
        * trades1: [[1,"2600000000000000000",1,[0,5,1,6,2,7,3,8]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 179,029 0.000179029Ξ 0.45 USD @ 1.0 gwei 2500.00 ETH/USD
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 0, tokens: 5)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 1, tokens: 6)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 2, tokens: 7)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 3, tokens: 8)
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 2.6)
          + tokenAgents[1].Traded(index:1, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, makerBuySell: SELL, prices: [0.1,0.1,0.1,0.1], tokenIds: [0,1,2,3], tokenss: [5,6,7,8], price: 2.6, timestamp: 9:59:59 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.983378830794521243                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998232266419331434                    102.6                   1000.0                         4, 5, 6, 7             0:15, 1:14, 2:13, 3:12
          2 0x3C44CdDd  9899.998757772889118629                     97.4                   1000.0                       8, 9, 10, 11             0:35, 1:36, 2:37, 3:38
          3 0x90F79bf6  9899.998951181069635737                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-1155 offers and trades


  5 passing (971ms)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
