# Token Agent - Work In Progress

Personal agent for peer-to-peer ERC-20/721/1155 token exchange.

##### UI URL
[https://bokkypoobah.github.io/TokenAgent/](https://bokkypoobah.github.io/TokenAgent/)

##### Requirements
* Web3 browser, connected to Sepolia Testnet currently

##### Contract

[contracts/TokenAgentFactory.sol](contracts/TokenAgentFactory.sol)

##### Deployments to Sepolia
* v0.8.0 template [TokenAgent](https://sepolia.etherscan.io/address/0x0514e4402fe93b6ba0b014b30e5b715ed0943c25#code) and [TokenAgentFactory](https://sepolia.etherscan.io/address/0x598b17e44c3e8894dfcc9aaec16dad81756f5651#code) using [WETH](https://sepolia.etherscan.io/address/0x07391dbE03e7a0DEa0fce6699500da081537B6c3#code) - [deployed/TokenAgentFactorysol v0.8.0](deployed/TokenAgentFactory_v0.8.0_Sepolia_0x598b17E44c3e8894DfcC9aAec16DaD81756F5651.sol)

##### Notes
This project is currently heavily under development. Clear your browser's LocalStorage and IndexedDB if this dapp is not operating as expected as the configuration data may have a new format.

<br />

---

#### Info

###### How It Works - ERC-20 ATM

* `account1` deploys `TokenAgent1`, cloned via `TokenAgentFactory`
* `account1` approves for `TokenAgent1` to transfer WETH and ERC20
* `account1` adds offers to `TokenAgent1` to, e.g., BUY ERC20: 100 @ 0.1 ERC20/WETH, 200 @ 0.2 ERC20/WETH, ...
* `account2` interacts with `TokenAgent1` to, e.g., SELL ERC20 for WETH against the `account1`'s offers

###### How The Dapp Will Work

* Incrementally scrape all `NewTokenAgent(tokenAgent, owner, index, timestamp)` events emitted by `TokenAgentFactory` to create a list of valid `TokenAgent` addresses
* Incrementally scrape all events emitted by all the deployed `TokenAgent`, filtering by the valid `TokenAgent` addresses
* When a user wants to view the offers and trades for a particular ERC20, incrementally scrape all the ERC20 events
* The dapp will have all the data required to compute the token balances and `TokenAgent` states using the events above

<br />

---

#### Testing

###### First Install
Clone/download this repository, and in the new folder on your computer:

```bash
npm install --save-dev hardhat
```

###### Run Test Script

Or run the test with the output saved in [./testIt.out](./testIt.out).
You may initially have to mark the script as executable using the command `chmod 700 ./10_testIt.sh`.

```bash
$ ./10_testIt.sh


  TokenAgentFactory
    Deploy TokenAgentFactory And TokenAgent
        * accounts[0]->TokenAgentFactory.deploy(weth) => 0xDc64a140 - gasUsed: 4,037,132 0.004037132Ξ 10.09 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[0]->tokenAgentFactory.newTokenAgent() => 0xb0279Db6 - gasUsed: 205,684 0.000205684Ξ 0.51 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgentFactory.newTokenAgent() => 0x3dE2Da43 - gasUsed: 188,584 0.000188584Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgentFactory.newTokenAgent() => 0xddEA3d67 - gasUsed: 188,584 0.000188584Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[3]->tokenAgentFactory.newTokenAgent() => 0xAbB60812 - gasUsed: 188,584 0.000188584Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
          # tokenAgent Owner
          - ---------- ----------
          0 0xb0279Db6 0xf39Fd6e5
          1 0x3dE2Da43 0x70997970
          2 0xddEA3d67 0x3C44CdDd
          3 0xAbB60812 0x90F79bf6
        * now: 12:25:14 PM, expiry: 12:27:14 PM
      ✔ Test TokenAgent secondary functions (732ms)
      ✔ Test TokenAgent invalid offers

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982717536376447533                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99891740204608418                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936380855648384                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950818717202073                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512,1,1,1725589634,100000000000000000,1000000000000000000,200000000000000000,1000000000000000000,300000000000000000,100000000000000000"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0] - gasUsed: 279,891 0.000279891Ξ 0.70 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered(index:0, maker: 0x70997970, token: 0xe7f1725E, tokenType: 20, buySell: SELL, expiry: 12:27:14 PM, nonce: 0, count: 0, prices: [0.1,0.2,0.3], tokenIds: [], tokenss: [1,1,0.1], timestamp: 12:26:55 PM)
        * trades1: [[0,"105000000000000000",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 130,062 0.000130062Ξ 0.33 USD @ 1.0 gwei 2500.00 ETH/USD
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.11)
          + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
          + tokenAgents[1].Traded(index:0, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, tokenType: 20, makerBuySell: SELL, prices: [0.1,0.2,0], tokenIds: [], tokenss: [1000000000000000000,50000000000000000,0], price: 0.104761904761904761, timestamp: 12:26:56 PM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982717536376447533                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998637510654796562                   100.11                   998.95                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd   9899.99880631869606231                    99.89                  1001.05                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950818717202073                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

          tokenAgents[1] Offers
          ## Token      Type B/S  Expiry       Nonce Count                         Prices                       TokenIds                        Tokenss                          Useds
          -- ---------- ---- ---- ------------ ----- ----- ------------------------------ ------------------------------ ------------------------------ ------------------------------
           0 0xe7f1725E 20   SELL 12:27:14 PM      0     0               0.10, 0.20, 0.30                                              1.00, 1.00, 0.10               1.00, 0.05, 0.00

        * trades2: [[0,"209523809523809523",1,["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades2) - gasUsed: 140,494 0.000140494Ξ 0.35 USD @ 1.0 gwei 2500.00 ETH/USD
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 0.22)
          + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
          + tokenAgents[1].Traded(index:0, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, tokenType: 20, makerBuySell: SELL, prices: [0.2,0.3,0], tokenIds: [], tokenss: [950000000000000000,100000000000000000,0], price: 0.209523809523809523, timestamp: 12:26:57 PM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982717536376447533                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998637510654796562                   100.33                    997.9                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd   9899.99866582454503126                    99.67                   1002.1                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950818717202073                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

          tokenAgents[1] Offers
          ## Token      Type B/S  Expiry       Nonce Count                         Prices                       TokenIds                        Tokenss                          Useds
          -- ---------- ---- ---- ------------ ----- ----- ------------------------------ ------------------------------ ------------------------------ ------------------------------
           0 0xe7f1725E 20   SELL 12:27:14 PM      0     0               0.10, 0.20, 0.30                                              1.00, 1.00, 0.10               1.00, 1.00, 0.10

      ✔ Test TokenAgent ERC-20 offers and trades (57ms)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982717536376447533                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99891740204608418                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936380855648384                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950818717202073                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,0,0,1725589634,100000000000000000,4","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,0,1725589634,100000000000000000,4,4,5,6,7","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,1,1725589634,100000000000000000,4,200000000000000000,5,300000000000000000,6,400000000000000000,7"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0, 1, 2] - gasUsed: 590,530 0.00059053Ξ 1.48 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered(index:0, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, buySell: BUY, expiry: 12:27:14 PM, nonce: 0, count: 4, prices: [0.1], tokenIds: [], tokenss: [], timestamp: 12:26:55 PM)
          + tokenAgents[1].Offered(index:1, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, buySell: SELL, expiry: 12:27:14 PM, nonce: 0, count: 4, prices: [0.1], tokenIds: [4,5,6,7], tokenss: [], timestamp: 12:26:55 PM)
          + tokenAgents[1].Offered(index:2, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, buySell: SELL, expiry: 12:27:14 PM, nonce: 0, count: 65535, prices: [0.1,0.2,0.3,0.4], tokenIds: [4,5,6,7], tokenss: [], timestamp: 12:26:55 PM)
        * trades1: [[2,"1000000000000000000",1,[4,5,6,7]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 169,892 0.000169892Ξ 0.42 USD @ 1.0 gwei 2500.00 ETH/USD
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 4)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 4)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 5)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 5)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 6)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 6)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 7)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 7)
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 1.0)
          + tokenAgents[1].Traded(index:2, taker: 0x3C44CdDd, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, makerBuySell: SELL, prices: [0.1,0.2,0.3,0.4], tokenIds: [4,5,6,7], tokenss: [], price: 1.0, timestamp: 12:26:56 PM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982717536376447533                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99832687122052324                    101.0                   1000.0                                                0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998766488646511332                     99.0                   1000.0           4, 5, 6, 7, 8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950818717202073                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

          tokenAgents[1] Offers
          ## Token      Type B/S  Expiry       Nonce Count                         Prices                       TokenIds                        Tokenss                          Useds
          -- ---------- ---- ---- ------------ ----- ----- ------------------------------ ------------------------------ ------------------------------ ------------------------------
           0 0x9fE46736 721  BUY  12:27:14 PM      0     4                           0.10                                                                                             
           1 0x9fE46736 721  SELL 12:27:14 PM      0     4                           0.10                     4, 5, 6, 7                                                              
           2 0x9fE46736 721  SELL 12:27:14 PM      0 65535         0.10, 0.20, 0.30, 0.40                     4, 5, 6, 7                                                              

      ✔ Test TokenAgent ERC-721 offers and trades (39ms)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982717536376447533                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970   9899.99891740204608418                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
          2 0x3C44CdDd  9899.998936380855648384                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
          3 0x90F79bf6  9899.998950818717202073                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,0,0,1725589634,100000000000000000,4","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,0,1725589634,100000000000000000,40,0,10,1,10,2,10,3,10","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,1,1725589634,100000000000000000,0,10,200000000000000000,1,10,300000000000000000,2,10,400000000000000000,3,10"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0, 1, 2] - gasUsed: 685,559 0.000685559Ξ 1.71 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered(index:0, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, buySell: BUY, expiry: 12:27:14 PM, nonce: 0, count: 4, prices: [0.1], tokenIds: [], tokenss: [], timestamp: 12:26:55 PM)
          + tokenAgents[1].Offered(index:1, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, buySell: SELL, expiry: 12:27:14 PM, nonce: 0, count: 40, prices: [0.1], tokenIds: [0,1,2,3], tokenss: [10,10,10,10], timestamp: 12:26:55 PM)
          + tokenAgents[1].Offered(index:2, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, buySell: SELL, expiry: 12:27:14 PM, nonce: 0, count: 65535, prices: [0.1,0.2,0.3,0.4], tokenIds: [0,1,2,3], tokenss: [10,10,10,10], timestamp: 12:26:55 PM)
        * trades1: [[1,"2600000000000000000",1,[0,5,1,6,2,7,3,8]]]
        * accounts[2]->tokenAgents[1].trade(trades1) - gasUsed: 179,048 0.000179048Ξ 0.45 USD @ 1.0 gwei 2500.00 ETH/USD
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 0, tokens: 5)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 1, tokens: 6)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 2, tokens: 7)
          + erc1155Token.TransferSingle(operator: 0x3dE2Da43, from: 0x70997970, to: 0x3C44CdDd, tokenId: 3, tokens: 8)
          + weth.Transfer(from: 0x3C44CdDd, to: 0x70997970, tokens: 2.6)
          + tokenAgents[1].Traded(index:1, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, makerBuySell: SELL, prices: [0.1,0.1,0.1,0.1], tokenIds: [0,1,2,3], tokenss: [5,6,7,8], price: 2.6, timestamp: 12:26:56 PM)

          # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          - ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
          0 0xf39Fd6e5  9899.982717536376447533                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
          1 0x70997970  9899.998231842087672698                    102.6                   1000.0                         4, 5, 6, 7             0:15, 1:14, 2:13, 3:12
          2 0x3C44CdDd  9899.998757332635061248                     97.4                   1000.0                       8, 9, 10, 11             0:35, 1:36, 2:37, 3:38
          3 0x90F79bf6  9899.998950818717202073                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

          tokenAgents[1] Offers
          ## Token      Type B/S  Expiry       Nonce Count                         Prices                       TokenIds                        Tokenss                          Useds
          -- ---------- ---- ---- ------------ ----- ----- ------------------------------ ------------------------------ ------------------------------ ------------------------------
           0 0xCf7Ed3Ac 1155 BUY  12:27:14 PM      0     4                           0.10                                                                                             
           1 0xCf7Ed3Ac 1155 SELL 12:27:14 PM      0    41                           0.10                     0, 1, 2, 3                 10, 10, 10, 10                               
           2 0xCf7Ed3Ac 1155 SELL 12:27:14 PM      0 65535         0.10, 0.20, 0.30, 0.40                     0, 1, 2, 3                 10, 10, 10, 10                               

      ✔ Test TokenAgent ERC-1155 offers and trades (40ms)


  5 passing (883ms)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
