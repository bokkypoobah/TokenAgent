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
        * accounts[0]->TokenAgentFactory.deploy(weth) => 0xDc64a140 - gasUsed: 3,955,883 0.003955883Ξ 9.89 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[0]->tokenAgentFactory.newTokenAgent() => 0xb0279Db6 - gasUsed: 205,660 0.00020566Ξ 0.51 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgentFactory.newTokenAgent() => 0x3dE2Da43 - gasUsed: 188,560 0.00018856Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgentFactory.newTokenAgent() => 0xddEA3d67 - gasUsed: 188,560 0.00018856Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[3]->tokenAgentFactory.newTokenAgent() => 0xAbB60812 - gasUsed: 188,560 0.00018856Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * now: 2:40:15 AM, expiry: 2:42:15 AM
      ✔ Test TokenAgent secondary functions (885ms)
      ✔ Test TokenAgent invalid offers

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982842643584704816                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998917518737644916                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936482142385676                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950908138638517                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512,1,1,1725554535,100000000000000000,1000000000000000000,200000000000000000,1000000000000000000,300000000000000000,100000000000000000"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0xe660...2983] - gasUsed: 255,468 0.000255468Ξ 0.64 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered20(offerKey:0xe660...2983, maker: 0x70997970, token: 0xe7f1725E, buySell: SELL, expiry: 2:42:15 AM, nonce: 0, prices: ["0.1","0.2","0.3"], tokens: ["1.0","1.0","0.1"], timestamp: 2:41:56 AM)
        * trades1: [["0xe6609b8c1bb650dd58659d67da5a1cb90c3210c565a39f3be62cbfd4fbc02983","105000000000000000",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 125,093 0.000125093Ξ 0.31 USD @ 1.0 gwei 2500.00 ETH/USD
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.11)
          + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
          + tokenAgents[1].Traded20(offerKey:0xe660...2983, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, makerBuySell: SELL, prices: ["0.1","0.2","0.0"], tokens: ["1.0","0.05","0.0"], averagePrice: 0.104761904761904761, timestamp: 2:41:57 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982842643584704816                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99866205038075612                   100.11                   998.95                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998811388989021658                    99.89                  1001.05                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950908138638517                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * trades2: [["0xe6609b8c1bb650dd58659d67da5a1cb90c3210c565a39f3be62cbfd4fbc02983","209523809523809523",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades2) - gasUsed: 135,525 0.000135525Ξ 0.34 USD @ 1.0 gwei 2500.00 ETH/USD
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.22)
          + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
          + tokenAgents[1].Traded20(offerKey:0xe660...2983, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, makerBuySell: SELL, prices: ["0.2","0.3","0.0"], tokens: ["0.95","0.1","0.0"], averagePrice: 0.209523809523809523, timestamp: 2:41:58 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982842643584704816                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99866205038075612                   100.33                    997.9                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998675863843332283                    99.67                   1002.1                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950908138638517                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-20 offers and trades (54ms)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982842643584704816                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998917518737644916                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936482142385676                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950908138638517                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,0,0,1725554535,100000000000000000,4","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,0,1725554535,100000000000000000,4,4,5,6,7","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,1,1725554535,100000000000000000,4,200000000000000000,5,300000000000000000,6,400000000000000000,7"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0x0fe7...2884, 0x8b03...f825, 0x6061...2f45] - gasUsed: 555,938 0.000555938Ξ 1.39 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered721(offerKey:0x0fe7...2884, maker: 0x70997970, token: 0x9fE46736, buySell: BUY, expiry: 2:42:15 AM, nonce: 0, count: 4, prices: ["0.1"], tokenIds: [], timestamp: 2:41:56 AM)
          + tokenAgents[1].Offered721(offerKey:0x8b03...f825, maker: 0x70997970, token: 0x9fE46736, buySell: SELL, expiry: 2:42:15 AM, nonce: 0, count: 4, prices: ["0.1"], tokenIds: ["4","5","6","7"], timestamp: 2:41:56 AM)
          + tokenAgents[1].Offered721(offerKey:0x6061...2f45, maker: 0x70997970, token: 0x9fE46736, buySell: SELL, expiry: 2:42:15 AM, nonce: 0, count: 65535, prices: ["0.1","0.2","0.3","0.4"], tokenIds: ["4","5","6","7"], timestamp: 2:41:56 AM)
        * trades1: [["0x6061ef15c23b9de3a838d2c44897204a8193f405cda35acb4a59b250eaa12f45","1000000000000000000",1,[4,5,6,7]]]
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
          + tokenAgents[1].Traded721(offerKey:0x6061...2f45, taker: 0x3C44CdDd, maker: 0x70997970, token: 0x9fE46736, makerBuySell: SELL, prices: ["0.1","0.2","0.3","0.4"], tokenIds: ["4","5","6","7"], totalPrice: 1.0, timestamp: 2:41:57 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982842643584704816                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99836157996099953                    101.0                   1000.0                                                0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998772240940533487                     99.0                   1000.0           4, 5, 6, 7, 8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950908138638517                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-721 offers and trades

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982842643584704816                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998917518737644916                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936482142385676                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950908138638517                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,0,0,1725554535,100000000000000000,4","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,0,1725554535,100000000000000000,40,0,10,1,10,2,10,3,10","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,1,1725554535,100000000000000000,0,10,200000000000000000,1,10,300000000000000000,2,10,400000000000000000,3,10"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0xbcf3...f246, 0xe53f...e267, 0x56f1...fcb7] - gasUsed: 664,863 0.000664863Ξ 1.66 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered1155(offerKey:0xbcf3...f246, maker: 0x70997970, token: 0xCf7Ed3Ac, buySell: BUY, expiry: 2:42:15 AM, nonce: 0, count: 4, prices: ["0.1"], tokenIds: [], tokenss: [], timestamp: 2:41:56 AM)
          + tokenAgents[1].Offered1155(offerKey:0xe53f...e267, maker: 0x70997970, token: 0xCf7Ed3Ac, buySell: SELL, expiry: 2:42:15 AM, nonce: 0, count: 40, prices: ["0.1"], tokenIds: ["0","1","2","3"], tokenss: ["10","10","10","10"], timestamp: 2:41:56 AM)
          + tokenAgents[1].Offered1155(offerKey:0x56f1...fcb7, maker: 0x70997970, token: 0xCf7Ed3Ac, buySell: SELL, expiry: 2:42:15 AM, nonce: 0, count: 65535, prices: ["0.1","0.2","0.3","0.4"], tokenIds: ["0","1","2","3"], tokenss: ["10","10","10","10"], timestamp: 2:41:56 AM)
        * trades1: [["0xe53f27db66b05b81612cb8689b52bae4abee1fe5120b371b7de52bd265e8e267","2600000000000000000",1,[0,5,1,6,2,7,3,8]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 173,396 0.000173396Ξ 0.43 USD @ 1.0 gwei 2500.00 ETH/USD
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 0, tokens: 5)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 1, tokens: 6)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 2, tokens: 7)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 3, tokens: 8)
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 2.6)
          + tokenAgents[1].Traded1155(offerKey:0xe53f...e267, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xCf7Ed3Ac, makerBuySell: SELL, prices: ["0.1","0.1","0.1","0.1"], tokenIds: ["0","1","2","3"], tokenss: ["5","6","7","8"], totalPrice: 2.6, timestamp: 2:41:57 AM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982842643584704816                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998252654808831305                    102.6                   1000.0                         4, 5, 6, 7             0:15, 1:14, 2:13, 3:12
          2 0x3C44CdDd    9899.9987630859289352                     97.4                   1000.0                       8, 9, 10, 11             0:35, 1:36, 2:37, 3:38
          3 0x90F79bf6  9899.998950908138638517                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-1155 offers and trades


  5 passing (1s)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
