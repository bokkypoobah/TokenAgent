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
        * accounts[0]->TokenAgentFactory.deploy(weth) => 0xDc64a140 - gasUsed: 3,947,991 0.003947991Ξ 9.87 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[0]->tokenAgentFactory.newTokenAgent() => 0xb0279Db6 - gasUsed: 205,638 0.000205638Ξ 0.51 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgentFactory.newTokenAgent() => 0x3dE2Da43 - gasUsed: 188,538 0.000188538Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgentFactory.newTokenAgent() => 0xddEA3d67 - gasUsed: 188,538 0.000188538Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[3]->tokenAgentFactory.newTokenAgent() => 0xAbB60812 - gasUsed: 188,538 0.000188538Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * now: 1:13:58 AM, expiry: 1:15:58 AM
      ✔ Test TokenAgent secondary functions (893ms)
      ✔ Test TokenAgent invalid offers

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982854824994811936                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998917558201208698                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936519074405941                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950943010800322                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512,1,1,1725549358,100000000000000000,1000000000000000000,200000000000000000,1000000000000000000,300000000000000000,100000000000000000"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0x866b...0713] - gasUsed: 255,470 0.00025547Ξ 0.64 USD @ 1.0 gwei 2500.00 ETH/USD
        + tokenAgents[1].Offered20(offerKey:0x866b...0713, maker: 0x70997970, token: 0xe7f1725E, buySell: SELL, expiry: 1:15:58 AM, nonce: 0, prices: ["0.1","0.2","0.3"], tokens: ["1.0","1.0","0.1"], timestamp: 1:15:39 AM)
        * trades1: [["0x866bc8283ceedba56271cf6b1a367f23c5f343ca5c0b6624b7373563d23a0713","105000000000000000",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 124,943 0.000124943Ξ 0.31 USD @ 1.0 gwei 2500.00 ETH/USD
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.11)
        + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
        + tokenAgents[1].Traded20(offerKey:0x866b...0713, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, makerBuySell: SELL, prices: ["0.1","0.2","0.0"], tokens: ["1.0","0.05","0.0"], averagePrice: 0.104761904761904761, timestamp: 1:15:40 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982854824994811936                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998662087844317108                   100.11                   998.95                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998811575921225823                    99.89                  1001.05                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950943010800322                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * trades2: [["0x866bc8283ceedba56271cf6b1a367f23c5f343ca5c0b6624b7373563d23a0713","209523809523809523",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades2) - gasUsed: 135,375 0.000135375Ξ 0.34 USD @ 1.0 gwei 2500.00 ETH/USD
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.22)
        + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
        + tokenAgents[1].Traded20(offerKey:0x866b...0713, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, makerBuySell: SELL, prices: ["0.2","0.3","0.0"], tokens: ["0.95","0.1","0.0"], averagePrice: 0.209523809523809523, timestamp: 1:15:41 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982854824994811936                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998662087844317108                   100.33                    997.9                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998676200775697698                    99.67                   1002.1                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950943010800322                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-20 offers and trades (55ms)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982854824994811936                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998917558201208698                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936519074405941                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950943010800322                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,0,0,1725549358,100000000000000000,4","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,0,1725549358,100000000000000000,4,4,5,6,7","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,1,1725549358,100000000000000000,4,200000000000000000,5,300000000000000000,6,400000000000000000,7"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0xecfb...a1c4, 0x9e50...f635, 0xc46d...5ff5] - gasUsed: 621,881 0.000621881Ξ 1.55 USD @ 1.0 gwei 2500.00 ETH/USD
        + tokenAgents[1].Offered721(offerKey:0xecfb...a1c4, maker: 0x70997970, token: 0x9fE46736, buySell: BUY, expiry: 1:15:58 AM, nonce: 0, count: 4, prices: ["0.1"], tokenIds: [], timestamp: 1:15:39 AM)
        + tokenAgents[1].Offered721(offerKey:0x9e50...f635, maker: 0x70997970, token: 0x9fE46736, buySell: SELL, expiry: 1:15:58 AM, nonce: 0, count: 4, prices: ["0.1"], tokenIds: ["4","5","6","7"], timestamp: 1:15:39 AM)
        + tokenAgents[1].Offered721(offerKey:0xc46d...5ff5, maker: 0x70997970, token: 0x9fE46736, buySell: SELL, expiry: 1:15:58 AM, nonce: 0, count: 65535, prices: ["0.1","0.2","0.3","0.4"], tokenIds: ["4","5","6","7"], timestamp: 1:15:39 AM)
        * trades1: [["0xc46dade1b693fca925642bb29b09e8877f30c642dc28864325fb87fd35db5ff5","1000000000000000000",1,[4,5,6,7]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 165,408 0.000165408Ξ 0.41 USD @ 1.0 gwei 2500.00 ETH/USD
        + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 4)
        + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 4)
        + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 5)
        + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 5)
        + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 6)
        + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 6)
        + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 7)
        + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 7)
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 1.0)
        + tokenAgents[1].Traded721(offerKey:0xc46d...5ff5, taker: 0x3C44CdDd, maker: 0x70997970, token: 0x9fE46736, makerBuySell: SELL, prices: ["0.1","0.2","0.3","0.4"], tokenIds: ["4","5","6","7"], totalPrice: 1.0, timestamp: 1:15:40 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982854824994811936                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998295676332440941                    101.0                   1000.0                                                0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998771110870954101                     99.0                   1000.0           4, 5, 6, 7, 8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950943010800322                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-721 offers and trades (38ms)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982854824994811936                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998917558201208698                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936519074405941                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950943010800322                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,0,0,1725549358,100000000000000000,4","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,0,1725549358,100000000000000000,40,0,10,1,10,2,10,3,10","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,1,1725549358,100000000000000000,0,10,200000000000000000,1,10,300000000000000000,2,10,400000000000000000,3,10"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0xf57e...d006, 0xee13...a6d7, 0xe057...f177] - gasUsed: 730,815 0.000730815Ξ 1.83 USD @ 1.0 gwei 2500.00 ETH/USD
        + tokenAgents[1].Offered1155(offerKey:0xf57e...d006, maker: 0x70997970, token: 0xCf7Ed3Ac, buySell: BUY, expiry: 1:15:58 AM, nonce: 0, count: 4, prices: ["0.1"], tokenIds: [], tokenss: [], timestamp: 1:15:39 AM)
        + tokenAgents[1].Offered1155(offerKey:0xee13...a6d7, maker: 0x70997970, token: 0xCf7Ed3Ac, buySell: SELL, expiry: 1:15:58 AM, nonce: 0, count: 40, prices: ["0.1"], tokenIds: ["0","1","2","3"], tokenss: ["10","10","10","10"], timestamp: 1:15:39 AM)
        + tokenAgents[1].Offered1155(offerKey:0xe057...f177, maker: 0x70997970, token: 0xCf7Ed3Ac, buySell: SELL, expiry: 1:15:58 AM, nonce: 0, count: 65535, prices: ["0.1","0.2","0.3","0.4"], tokenIds: ["0","1","2","3"], tokenss: ["10","10","10","10"], timestamp: 1:15:39 AM)
        * trades1: [["0xee133e72c3c24cffec197dca5b134587765af76ae5cbd375ddf3969786f4a6d7","2000000000000000000",1,[0,5,1,5,2,5,3,5]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 174,157 0.000174157Ξ 0.44 USD @ 1.0 gwei 2500.00 ETH/USD
        + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 0, tokens: 5)
        + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 1, tokens: 5)
        + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 2, tokens: 5)
        + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 3, tokens: 5)
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 2.0)
        + tokenAgents[1].Traded1155(offerKey:0xee13...a6d7, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xCf7Ed3Ac, makerBuySell: SELL, prices: ["0.1","0.1","0.1","0.1"], tokenIds: ["0","1","2","3"], tokenss: ["5","5","5","5"], totalPrice: 2.0, timestamp: 1:15:40 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982854824994811936                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998186742180260143                    102.0                   1000.0                         4, 5, 6, 7             0:15, 1:15, 2:15, 3:15
          2 0x3C44CdDd  9899.998762361860018674                     98.0                   1000.0                       8, 9, 10, 11             0:35, 1:35, 2:35, 3:35
          3 0x90F79bf6  9899.998950943010800322                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-1155 offers and trades (39ms)


  5 passing (1s)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
