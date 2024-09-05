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
        * accounts[0]->TokenAgentFactory.deploy(weth) => 0xDc64a140 - gasUsed: 5748557 0.005748557Ξ 14.37 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[0]->tokenAgentFactory.newTokenAgent() => 0xb0279Db6 - gasUsed: 207530 0.00020753Ξ 0.518825 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgentFactory.newTokenAgent() => 0x3dE2Da43 - gasUsed: 190430 0.00019043Ξ 0.476075 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgentFactory.newTokenAgent() => 0xddEA3d67 - gasUsed: 190430 0.00019043Ξ 0.476075 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[3]->tokenAgentFactory.newTokenAgent() => 0xAbB60812 - gasUsed: 190430 0.00019043Ξ 0.476075 USD @ 1.0 gwei 2500.00 ETH/USD
        * now: 2:45:55 PM, expiry: 2:47:55 PM
      ✔ Test TokenAgent secondary functions (908ms)
      ✔ Test TokenAgent invalid offers

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.974151411040394822                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998899659965471868                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998919769771268947                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998935064315347405                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512,1,1,1725511675,100000000000000000,1000000000000000000,200000000000000000,1000000000000000000,300000000000000000,100000000000000000"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0xb603...04f3] - gasUsed: 266509 0.000266509Ξ 0.67 USD @ 1.0 gwei 2500.00 ETH/USD
        + tokenAgents[1].Offer20Added(offerKey:0xb603...04f3, token: 0xe7f1725E, nonce: 0, buySell: SELL, expiry: 2:47:55 PM, prices: ["0.1","0.2","0.3"], tokens: ["1.0","1.0","0.1"], timestamp: 2:47:36 PM)
        * trades1: [["0xb603e4d79b7a3c67bfecc51439310efbc10d466f12840fa74b993935625404f3","105000000000000000",1,["1050000000000000000"]]]
        > ERC-20 price/tokens/used 100000000000000000 1000000000000000000 0
        >        remaining 1000000000000000000
        >        totalTokens/totalWETHTokens 1000000000000000000 100000000000000000
        > ERC-20 price/tokens/used 200000000000000000 1000000000000000000 0
        >        remaining 1000000000000000000
        >        totalTokens/totalWETHTokens 1050000000000000000 110000000000000000
        >        tokens/totalTokens/totalWETHTokens 1050000000000000000 1050000000000000000 110000000000000000
        >        msg.sender BUY/owner SELL - averagePrice/_trade.price 104761904761904761 105000000000000000
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 148275 0.000148275Ξ 0.37 USD @ 1.0 gwei 2500.00 ETH/USD
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.11)
        + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
        + tokenAgents[1].Traded20(0xb603e4d79b7a3c67bfecc51439310efbc10d466f12840fa74b993935625404f3, 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512, 100000000000000000,1000000000000000000,200000000000000000,50000000000000000,0,0, 104761904761904761, 1725511657)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.974151411040394822                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998633150574503165                   100.11                   998.95                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998771494580439022                    99.89                  1001.05                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998935064315347405                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * trades2: [["0xb603e4d79b7a3c67bfecc51439310efbc10d466f12840fa74b993935625404f3","209523809523809523",1,["1050000000000000000"]]]
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
        * accounts[2]->tokenAgents[1].trade(trades2) - gasUsed: 163698 0.000163698Ξ 0.41 USD @ 1.0 gwei 2500.00 ETH/USD
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.22)
        + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
        + tokenAgents[1].Traded20(0xb603e4d79b7a3c67bfecc51439310efbc10d466f12840fa74b993935625404f3, 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512, 0,0,200000000000000000,950000000000000000,300000000000000000,100000000000000000, 209523809523809523, 1725511658)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.974151411040394822                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998633150574503165                   100.33                    997.9                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998607796395787678                    99.67                   1002.1                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998935064315347405                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-20 offers and trades (62ms)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.974151411040394822                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998899659965471868                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998919769771268947                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998935064315347405                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0x2cea...29a4, 0xf87b...4555, 0x36aa...11c5] - gasUsed: 648013 0.000648013Ξ 1.62 USD @ 1.0 gwei 2500.00 ETH/USD
        + tokenAgents[1].Offer721Added(offerKey:0x2cea...29a4, token: 0x9fE46736, nonce: 0, buySell: BUY, expiry: 2:47:55 PM, count: 5, prices: ["0.1"], tokenIds: [], timestamp: 2:47:36 PM)
        + tokenAgents[1].Offer721Added(offerKey:0xf87b...4555, token: 0x9fE46736, nonce: 0, buySell: SELL, expiry: 2:47:55 PM, count: 6, prices: ["0.1"], tokenIds: ["4","5","6","7"], timestamp: 2:47:36 PM)
        + tokenAgents[1].Offer721Added(offerKey:0x36aa...11c5, token: 0x9fE46736, nonce: 0, buySell: SELL, expiry: 2:47:55 PM, count: 65535, prices: ["0.1","0.2","0.3","0.4"], tokenIds: ["4","5","6","7"], timestamp: 2:47:36 PM)
        * trades1: [["0x36aa099e3191a4c73b7d15e5a65980b50e3dfd9a392a3a19cb81121da1e511c5","1000000000000000000",1,[4,5,6,7]]]
        >        tokenId/index 4 0
        >        msg.sender BUY/owner SELL tokenId/count/price 4 65535 100000000000000000
        >        tokenId/index 5 1
        >        msg.sender BUY/owner SELL tokenId/count/price 5 65535 200000000000000000
        >        tokenId/index 6 2
        >        msg.sender BUY/owner SELL tokenId/count/price 6 65535 300000000000000000
        >        tokenId/index 7 3
        >        msg.sender BUY/owner SELL tokenId/count/price 7 65535 400000000000000000
        >        msg.sender BUY/owner SELL totalPrice 1000000000000000000
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 192897 0.000192897Ξ 0.48 USD @ 1.0 gwei 2500.00 ETH/USD
        + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 4)
        + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 4)
        + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 5)
        + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 5)
        + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 6)
        + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 6)
        + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 7)
        + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 7)
        + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 1.0)
        + tokenAgents[1].Traded721(0x36aa099e3191a4c73b7d15e5a65980b50e3dfd9a392a3a19cb81121da1e511c5, 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0, 100000000000000000,4,200000000000000000,5,300000000000000000,6,400000000000000000,7, 1000000000000000000, 1725511657)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.974151411040394822                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998251646014836797                    101.0                   1000.0                                                0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998726872522046023                     99.0                   1000.0           4, 5, 6, 7, 8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998935064315347405                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

      ✔ Test TokenAgent ERC-721 offers and trades (44ms)


  4 passing (1s)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
