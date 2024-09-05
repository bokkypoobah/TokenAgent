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
        * accounts[0]->TokenAgentFactory.deploy(weth) => 0xDc64a140 - gasUsed: 5,647,386 0.005647386Ξ 14.12 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[0]->tokenAgentFactory.newTokenAgent() => 0xb0279Db6 - gasUsed: 207,479 0.000207479Ξ 0.52 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgentFactory.newTokenAgent() => 0x3dE2Da43 - gasUsed: 190,379 0.000190379Ξ 0.48 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgentFactory.newTokenAgent() => 0xddEA3d67 - gasUsed: 190,379 0.000190379Ξ 0.48 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[3]->tokenAgentFactory.newTokenAgent() => 0xAbB60812 - gasUsed: 190,379 0.000190379Ξ 0.48 USD @ 1.0 gwei 2500.00 ETH/USD
        * now: 12:22:31 AM, expiry: 12:24:31 AM
      ✔ Test TokenAgent secondary functions (791ms)
      ✔ Test TokenAgent invalid offers

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.974660255177911127                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998900383044070334                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998920430503949151                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998935677835222109                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512,1,1,1725546271,100000000000000000,1000000000000000000,200000000000000000,1000000000000000000,300000000000000000,100000000000000000"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0xd80c...cf03] - gasUsed: 264,756 0.000264756Ξ 0.66 USD @ 1.0 gwei 2500.00 ETH/USD
        + tokenAgents[1].Offered20(offerKey:0xd80c...cf03, maker: 0x70997970, token: 0xe7f1725E, buySell: SELL, expiry: 12:24:31 AM, nonce: 0, prices: ["0.1","0.2","0.3"], tokens: ["1.0","1.0","0.1"], timestamp: 12:24:13 AM)
        * trades1: [["0xd80ce2f83521ecec2e434c694a0fbea4abfdf8af8cf7bebfa30dbe2134bacf03","105000000000000000",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 133,575 0.000133575Ξ 0.33 USD @ 1.0 gwei 2500.00 ETH/USD
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.11)
        + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
        + tokenAgents[1].Traded20(offerKey:0xd80c...cf03, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, makerBuySell: SELL, prices: ["0.1","0.2","0.0"], tokens: ["1.0","0.05","0.0"], averagePrice: 0.104761904761904761, timestamp: 12:24:14 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.974660255177911127                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998635626656732306                   100.11                   998.95                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998786855332438851                    99.89                  1001.05                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998935677835222109                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * trades2: [["0xd80ce2f83521ecec2e434c694a0fbea4abfdf8af8cf7bebfa30dbe2134bacf03","209523809523809523",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades2) - gasUsed: 144,223 0.000144223Ξ 0.36 USD @ 1.0 gwei 2500.00 ETH/USD
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.22)
        + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
        + tokenAgents[1].Traded20(offerKey:0xd80c...cf03, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, makerBuySell: SELL, prices: ["0.2","0.3","0.0"], tokens: ["0.95","0.1","0.0"], averagePrice: 0.209523809523809523, timestamp: 12:24:15 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.974660255177911127                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998635626656732306                   100.33                    997.9                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998642632170187976                    99.67                   1002.1                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998935677835222109                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-20 offers and trades (63ms)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.974660255177911127                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998900383044070334                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998920430503949151                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998935677835222109                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,0,0,1725546271,100000000000000000,4","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,0,1725546271,100000000000000000,4,4,5,6,7","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,1,1725546271,100000000000000000,4,200000000000000000,5,300000000000000000,6,400000000000000000,7"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0x6d60...65e4, 0x4779...b3c5, 0x19c9...2d15] - gasUsed: 647,766 0.000647766Ξ 1.62 USD @ 1.0 gwei 2500.00 ETH/USD
        + tokenAgents[1].Offered721(offerKey:0x6d60...65e4, maker: 0x70997970, token: 0x9fE46736, buySell: BUY, expiry: 12:24:31 AM, nonce: 0, count: 4, prices: ["0.1"], tokenIds: [], timestamp: 12:24:13 AM)
        + tokenAgents[1].Offered721(offerKey:0x4779...b3c5, maker: 0x70997970, token: 0x9fE46736, buySell: SELL, expiry: 12:24:31 AM, nonce: 0, count: 4, prices: ["0.1"], tokenIds: ["4","5","6","7"], timestamp: 12:24:13 AM)
        + tokenAgents[1].Offered721(offerKey:0x19c9...2d15, maker: 0x70997970, token: 0x9fE46736, buySell: SELL, expiry: 12:24:31 AM, nonce: 0, count: 65535, prices: ["0.1","0.2","0.3","0.4"], tokenIds: ["4","5","6","7"], timestamp: 12:24:13 AM)
        * trades1: [["0x19c958f4f3e5c33d420214c2b22515095f9eded124810f121a17a0c704242d15","1000000000000000000",1,[4,5,6,7]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 181,964 0.000181964Ξ 0.45 USD @ 1.0 gwei 2500.00 ETH/USD
        + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 4)
        + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 4)
        + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 5)
        + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 5)
        + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 6)
        + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 6)
        + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 7)
        + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 7)
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 1.0)
        + tokenAgents[1].Traded721(offerKey:0x19c9...2d15, taker: 0x3C44CdDd, maker: 0x70997970, token: 0x9fE46736, makerBuySell: SELL, prices: ["0.1","0.2","0.3","0.4"], tokenIds: ["4","5","6","7"], totalPrice: 1.0, timestamp: 12:24:14 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.974660255177911127                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998252616096388676                    101.0                   1000.0                                                0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998738466269397555                     99.0                   1000.0           4, 5, 6, 7, 8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998935677835222109                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-721 offers and trades (42ms)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.974660255177911127                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998900383044070334                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998920430503949151                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998935677835222109                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,0,0,1725546271,100000000000000000,4","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,0,1725546271,100000000000000000,40,4,10,5,10,6,10,7,10","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,1,1725546271,100000000000000000,4,10,200000000000000000,5,10,300000000000000000,6,10,400000000000000000,7,10"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0xe5cf...d2f6, 0x3451...45d7, 0xf6ec...7bb7] - gasUsed: 632,929 0.000632929Ξ 1.58 USD @ 1.0 gwei 2500.00 ETH/USD
        + tokenAgents[1].Offered1155(offerKey:0xe5cf...d2f6, maker: 0x70997970, token: 0xCf7Ed3Ac, buySell: BUY, expiry: 12:24:31 AM, nonce: 0, count: 4, prices: ["0.1"], tokenIds: [], tokenss: [], timestamp: 12:24:13 AM)
        + tokenAgents[1].Offered1155(offerKey:0x3451...45d7, maker: 0x70997970, token: 0xCf7Ed3Ac, buySell: SELL, expiry: 12:24:31 AM, nonce: 0, count: 40, prices: ["0.1"], tokenIds: ["4","5"], tokenss: ["10","10"], timestamp: 12:24:13 AM)
        + tokenAgents[1].Offered1155(offerKey:0xf6ec...7bb7, maker: 0x70997970, token: 0xCf7Ed3Ac, buySell: SELL, expiry: 12:24:31 AM, nonce: 0, count: 65535, prices: ["0.1","0.2"], tokenIds: ["4","5"], tokenss: ["10","10"], timestamp: 12:24:13 AM)
      ✔ Test TokenAgent ERC-1155 offers and trades


  5 passing (940ms)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
