# Token Agent - Work In Progress

Personal agent for peer-to-peer ERC-20/721/1155 token exchange.

##### UI URL
[https://bokkypoobah.github.io/TokenAgent/](https://bokkypoobah.github.io/TokenAgent/)

##### Requirements
* Web3 browser, connected to Sepolia Testnet currently

##### Screenshots

###### Addresses
<kbd><img src="images/Screenshot_Addresses_20240909.png" width="600"/></kbd>

###### Token Contracts

Click on the [+] button to add a new token contract

<kbd><img src="images/Screenshot_TokenContracts_1_20240910.png" width="600"/></kbd>

Enter an ERC-20/721/1155 token contract address on the Sepolia network, or select one from the dropdown

<kbd><img src="images/Screenshot_TokenContracts_2_20240910.png" width="600"/></kbd>

List of token contracts.

Click on the [eye] checkbox for this app to watch for transfers and approval events from this token contract.

Click on the [right arrow] checkbox to permit transfers and approvals of this token contract within this app

<kbd><img src="images/Screenshot_TokenContracts_3_20240910.png" width="600"/></kbd>

###### Agents

Click on the [+] button to deploy your new Token Agent

<kbd><img src="images/Screenshot_Agents_1_20240910.png" width="600"/></kbd>

<br />

Click on [Deploy] and confirm your web3 transaction

<kbd><img src="images/Screenshot_Agents_2_20240910.png" width="600"/></kbd>

<br />

Click on the link on the top right to view the transaction

<kbd><img src="images/Screenshot_Agents_3_20240910.png" width="600"/></kbd>

<br />

Click on the [Sync] button

<kbd><img src="images/Screenshot_Agents_4_20240910.png" width="600"/></kbd>

<br />

Select Token Agent Factory and click [Do It!].

<kbd><img src="images/Screenshot_Agents_5_20240910.png" width="600"/></kbd>

<br />

Your newly deployed Token Agent should appear

<kbd><img src="images/Screenshot_Agents_6_20240910.png" width="600"/></kbd>

###### Agent

Owner of the Token Agent can add offers in the Console tab. ERC-20 only currently, as a single price with or without a limit

<kbd><img src="images/Screenshot_Agent_Console_20240911.png" width="600"/></kbd>

<br />

List of offers added by the Token Agent owner

<kbd><img src="images/Screenshot_Agent_Offers_20240911.png" width="600"/></kbd>


##### Contract

[contracts/TokenAgentFactory.sol](contracts/TokenAgentFactory.sol)

##### Deployments to Sepolia
* v0.8.0 template [TokenAgent](https://sepolia.etherscan.io/address/0x0514e4402fe93b6ba0b014b30e5b715ed0943c25#code) and [TokenAgentFactory](https://sepolia.etherscan.io/address/0x598b17e44c3e8894dfcc9aaec16dad81756f5651#code) using [WETH](https://sepolia.etherscan.io/address/0x07391dbE03e7a0DEa0fce6699500da081537B6c3#code) - [deployed/TokenAgentFactorysol v0.8.0](deployed/TokenAgentFactory_v0.8.0_Sepolia_0x598b17E44c3e8894DfcC9aAec16DaD81756F5651.sol)
* v0.8.1 template [TokenAgent](https://sepolia.etherscan.io/address/0x35e401362D24a2243b9a441542a4D4FFe50db1bF#code) and [TokenAgentFactory](https://sepolia.etherscan.io/address/0x81c9d0d4c60e6Ec7bb13879f703b113c930Cd914#code) using [WETH](https://sepolia.etherscan.io/address/0x07391dbE03e7a0DEa0fce6699500da081537B6c3#code) - [deployed/TokenAgentFactorysol v0.8.1](deployed/TokenAgentFactory_v0.8.1_Sepolia_0x81c9d0d4c60e6Ec7bb13879f703b113c930Cd914.sol)
* v0.8.1 template [TokenAgent](https://sepolia.etherscan.io/address/0x5446e959103b19e983848FB53d9fbD096eDb21A9#code) and [TokenAgentFactory](https://sepolia.etherscan.io/address/0xB6426d5E4B6515E627Ff510424978eBe223c39C4#code) using [WETH](https://sepolia.etherscan.io/address/0x07391dbE03e7a0DEa0fce6699500da081537B6c3#code) - [deployed/TokenAgentFactorysol v0.8.2](deployed/TokenAgentFactory_v0.8.2_Sepolia_0xB6426d5E4B6515E627Ff510424978eBe223c39C4.sol)

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
        * accounts[0]->TokenAgentFactory.deploy() => 0x5FC8d326 - gasUsed: 5,404,883 0.005404883Ξ 13.51 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[0]->tokenAgentFactory.newTokenAgent() => 0x23dB4a08 - gasUsed: 187,021 0.000187021Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgentFactory.newTokenAgent() => 0x8EFa1819 - gasUsed: 189,821 0.000189821Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgentFactory.newTokenAgent() => 0x6743E5c6 - gasUsed: 189,821 0.000189821Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[3]->tokenAgentFactory.newTokenAgent() => 0xA14d9C7a - gasUsed: 189,821 0.000189821Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
          Index Index by Owner tokenAgent Owner
          ----- -------------- ---------- ----------
              0              0 0x23dB4a08 0xf39Fd6e5
              1              0 0x8EFa1819 0x70997970
              2              0 0x6743E5c6 0x3C44CdDd
              3              0 0xA14d9C7a 0x90F79bf6
        * now: 5:26:36 PM, expiry: 5:28:36 PM
      ✔ Test TokenAgent secondary functions (711ms)
      ✔ Test TokenAgent invalid offers

            # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          --- ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
            0 0xf39Fd6e5  9899.973692496174290761                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
            1 0x70997970  9899.998936774625231756                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
            2 0x3C44CdDd  9899.998952196252213041                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
            3 0x90F79bf6  9899.998963934171431042                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: [["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",0,1725866916,0,["0.1","0.2","0.3"],[],["1.0","1.0","0.1"]],["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",1,1725866916,0,["0.1","0.2","0.3"],[],["1.0","1.0","0.1"]]]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0, 1] - gasUsed: 471,764 0.000471764Ξ 1.18 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered(index:0, maker: 0x70997970, token: 0xe7f1725E, tokenType: 20, buySell: BUY, expiry: 5:28:36 PM, count: 0, nonce: 0, prices: [0.1,0.2,0.3], tokenIds: [], tokenss: [1,1,0.1], timestamp: 5:28:20 PM)
          + tokenAgents[1].Offered(index:1, maker: 0x70997970, token: 0xe7f1725E, tokenType: 20, buySell: SELL, expiry: 5:28:36 PM, count: 0, nonce: 0, prices: [0.1,0.2,0.3], tokenIds: [], tokenss: [1,1,0.1], timestamp: 5:28:20 PM)

            # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          --- ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
            0 0xf39Fd6e5  9899.973692496174290761                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
            1 0x70997970  9899.998465010091194908                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
            2 0x3C44CdDd  9899.998952196252213041                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
            3 0x90F79bf6  9899.998963934171431042                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

          tokenAgents[1] Offers
            # Token      Type B/S  Expiry       Count Nonce                         Prices                       TokenIds                        Tokenss                          Useds
          --- ---------- ---- ---- ------------ ----- ----- ------------------------------ ------------------------------ ------------------------------ ------------------------------
            0 0xe7f1725E 20   BUY  5:28:36 PM       0     0               0.10, 0.20, 0.30                                              1.00, 1.00, 0.10               0.00, 0.00, 0.00
            1 0xe7f1725E 20   SELL 5:28:36 PM       0     0               0.10, 0.20, 0.30                                              1.00, 1.00, 0.10               0.00, 0.00, 0.00

        * trades1: [[1,"104761904761904761",1,[],["1050000000000000000"]]]
        * accounts[2]->tokenAgents[1].trade(trades1, false) - gasUsed: 143,568 0.000143568Ξ 0.36 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].InternalTransfer(from: 0x3C44CdDd, to: 0x8EFa1819, ethers: 10.0, timestamp: 5:28:21 PM)
          + erc20Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokens: 1.05)
          + tokenAgents[1].Traded(index:1, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xe7f1725E, tokenType: 20, makerBuySell: SELL, prices: [0.1,0.2,0], tokenIds: [], tokenss: [1,0.05,0], price: 0.104761904761904761, timestamp: 5:28:21 PM)
          + weth.Transfer(src: 0x3C44CdDd, guy: 0x70997970, wad: 0.11)
          + tokenAgents[1].InternalTransfer(from: 0x8EFa1819, to: 0x3C44CdDd, ethers: 10.0, timestamp: 5:28:21 PM)

            # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          --- ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
            0 0xf39Fd6e5  9899.973692496174290761                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
            1 0x70997970  9899.998465010091194908                   100.11                   998.95                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
            2 0x3C44CdDd  9899.998808628109362881                    99.89                  1001.05                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
            3 0x90F79bf6  9899.998963934171431042                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

          tokenAgents[1] Offers
            # Token      Type B/S  Expiry       Count Nonce                         Prices                       TokenIds                        Tokenss                          Useds
          --- ---------- ---- ---- ------------ ----- ----- ------------------------------ ------------------------------ ------------------------------ ------------------------------
            0 0xe7f1725E 20   BUY  5:28:36 PM       0     0               0.10, 0.20, 0.30                                              1.00, 1.00, 0.10               0.00, 0.00, 0.00
            1 0xe7f1725E 20   SELL 5:28:36 PM       0     0               0.10, 0.20, 0.30                                              1.00, 1.00, 0.10               1.00, 0.05, 0.00

      ✔ Test TokenAgent ERC-20 offers and trades (60ms)

            # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          --- ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
            0 0xf39Fd6e5  9899.973692496174290761                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
            1 0x70997970  9899.998936774625231756                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
            2 0x3C44CdDd  9899.998952196252213041                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
            3 0x90F79bf6  9899.998963934171431042                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,0,1725866916,4,100000000000000000,,","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,1725866916,4,100000000000000000,4,5,6,7,","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0,1,1725866916,4,100000000000000000,200000000000000000,300000000000000000,400000000000000000,4,5,6,7,"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0, 1, 2] - gasUsed: 447,807 0.000447807Ξ 1.12 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered(index:0, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, buySell: BUY, expiry: 5:28:36 PM, count: 4, nonce: 0, prices: [0.1], tokenIds: [], tokenss: [], timestamp: 5:28:20 PM)
          + tokenAgents[1].Offered(index:1, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, buySell: SELL, expiry: 5:28:36 PM, count: 4, nonce: 0, prices: [0.1], tokenIds: [4,5,6,7], tokenss: [], timestamp: 5:28:20 PM)
          + tokenAgents[1].Offered(index:2, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, buySell: SELL, expiry: 5:28:36 PM, count: 4, nonce: 0, prices: [0.1,0.2,0.3,0.4], tokenIds: [4,5,6,7], tokenss: [], timestamp: 5:28:20 PM)

            # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          --- ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
            0 0xf39Fd6e5  9899.973692496174290761                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
            1 0x70997970  9899.998488967118314232                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
            2 0x3C44CdDd  9899.998952196252213041                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
            3 0x90F79bf6  9899.998963934171431042                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

          tokenAgents[1] Offers
            # Token      Type B/S  Expiry       Count Nonce                         Prices                       TokenIds                        Tokenss                          Useds
          --- ---------- ---- ---- ------------ ----- ----- ------------------------------ ------------------------------ ------------------------------ ------------------------------
            0 0x9fE46736 721  BUY  5:28:36 PM       4     0                           0.10                                                                                             
            1 0x9fE46736 721  SELL 5:28:36 PM       4     0                           0.10                     4, 5, 6, 7                                                              
            2 0x9fE46736 721  SELL 5:28:36 PM       4     0         0.10, 0.20, 0.30, 0.40                     4, 5, 6, 7                                                              

        * trades1: [[1,"400000000000000000",1,[4,5,6,7],[]]]
        * accounts[2]->tokenAgents[1].trade(trades1, false) - gasUsed: 166,435 0.000166435Ξ 0.42 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].InternalTransfer(from: 0x3C44CdDd, to: 0x8EFa1819, ethers: 10.0, timestamp: 5:28:21 PM)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 4)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 4)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 5)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 5)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 6)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 6)
          + erc721Token.Approval(from: 0x70997970, to: 0x00000000, tokenId: 7)
          + erc721Token.Transfer(from: 0x70997970, to: 0x3C44CdDd, tokenId: 7)
          + tokenAgents[1].Traded(index:1, taker: 0x3C44CdDd, maker: 0x70997970, token: 0x9fE46736, tokenType: 721, makerBuySell: SELL, prices: [0.1,0.1,0.1,0.1], tokenIds: [4,5,6,7], tokenss: [], price: 0.4, timestamp: 5:28:21 PM)
          + weth.Transfer(src: 0x3C44CdDd, guy: 0x70997970, wad: 0.4)
          + tokenAgents[1].InternalTransfer(from: 0x8EFa1819, to: 0x3C44CdDd, ethers: 10.0, timestamp: 5:28:21 PM)

            # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          --- ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
            0 0xf39Fd6e5  9899.973692496174290761                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
            1 0x70997970  9899.998488967118314232                    100.4                   1000.0                                                0:20, 1:20, 2:20, 3:20
            2 0x3C44CdDd  9899.998785761086610216                     99.6                   1000.0           4, 5, 6, 7, 8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
            3 0x90F79bf6  9899.998963934171431042                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

          tokenAgents[1] Offers
            # Token      Type B/S  Expiry       Count Nonce                         Prices                       TokenIds                        Tokenss                          Useds
          --- ---------- ---- ---- ------------ ----- ----- ------------------------------ ------------------------------ ------------------------------ ------------------------------
            0 0x9fE46736 721  BUY  5:28:36 PM       4     0                           0.10                                                                                             
            1 0x9fE46736 721  SELL 5:28:36 PM       0     0                           0.10                     4, 5, 6, 7                                                              
            2 0x9fE46736 721  SELL 5:28:36 PM       4     0         0.10, 0.20, 0.30, 0.40                     4, 5, 6, 7                                                              

      ✔ Test TokenAgent ERC-721 offers and trades (58ms)

            # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          --- ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
            0 0xf39Fd6e5  9899.973692496174290761                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
            1 0x70997970  9899.998936774625231756                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
            2 0x3C44CdDd  9899.998952196252213041                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
            3 0x90F79bf6  9899.998963934171431042                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

        * offers1: ["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,0,1725866916,40,100000000000000000,,","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,1725866916,26,100000000000000000,0,1,2,3,5,6,7,8","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9,1,1725866916,40,100000000000000000,200000000000000000,300000000000000000,400000000000000000,0,1,2,3,10,10,10,10"]
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0, 1, 2] - gasUsed: 638,952 0.000638952Ξ 1.60 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].Offered(index:0, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, buySell: BUY, expiry: 5:28:36 PM, count: 40, nonce: 0, prices: [0.1], tokenIds: [], tokenss: [], timestamp: 5:28:20 PM)
          + tokenAgents[1].Offered(index:1, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, buySell: SELL, expiry: 5:28:36 PM, count: 26, nonce: 0, prices: [0.1], tokenIds: [0,1,2,3], tokenss: [5,6,7,8], timestamp: 5:28:20 PM)
          + tokenAgents[1].Offered(index:2, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, buySell: SELL, expiry: 5:28:36 PM, count: 40, nonce: 0, prices: [0.1,0.2,0.3,0.4], tokenIds: [0,1,2,3], tokenss: [10,10,10,10], timestamp: 5:28:20 PM)

            # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          --- ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
            0 0xf39Fd6e5  9899.973692496174290761                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
            1 0x70997970  9899.998297821901938092                    100.0                   1000.0                         4, 5, 6, 7             0:20, 1:20, 2:20, 3:20
            2 0x3C44CdDd  9899.998952196252213041                    100.0                   1000.0                       8, 9, 10, 11             0:30, 1:30, 2:30, 3:30
            3 0x90F79bf6  9899.998963934171431042                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

          tokenAgents[1] Offers
            # Token      Type B/S  Expiry       Count Nonce                         Prices                       TokenIds                        Tokenss                          Useds
          --- ---------- ---- ---- ------------ ----- ----- ------------------------------ ------------------------------ ------------------------------ ------------------------------
            0 0xCf7Ed3Ac 1155 BUY  5:28:36 PM      40     0                           0.10                                                                                             
            1 0xCf7Ed3Ac 1155 SELL 5:28:36 PM      26     0                           0.10                     0, 1, 2, 3                     5, 6, 7, 8                     0, 0, 0, 0
            2 0xCf7Ed3Ac 1155 SELL 5:28:36 PM      40     0         0.10, 0.20, 0.30, 0.40                     0, 1, 2, 3                 10, 10, 10, 10                     0, 0, 0, 0

        * trades1: [[1,"2600000000000000000",1,[0,1,2,3],[5,6,7,8]]]
        * accounts[2]->tokenAgents[1].trade(trades1, false) - gasUsed: 172,355 0.000172355Ξ 0.43 USD @ 1.0 gwei 2500.00 ETH/USD
          + tokenAgents[1].InternalTransfer(from: 0x3C44CdDd, to: 0x8EFa1819, ethers: 10.0, timestamp: 5:28:21 PM)
          + erc1155Token.TransferSingle(operator: 0x8EFa1819, from: 0x70997970, to: 0x3C44CdDd, tokenId: 0, tokens: 5)
          + erc1155Token.TransferSingle(operator: 0x8EFa1819, from: 0x70997970, to: 0x3C44CdDd, tokenId: 1, tokens: 6)
          + erc1155Token.TransferSingle(operator: 0x8EFa1819, from: 0x70997970, to: 0x3C44CdDd, tokenId: 2, tokens: 7)
          + erc1155Token.TransferSingle(operator: 0x8EFa1819, from: 0x70997970, to: 0x3C44CdDd, tokenId: 3, tokens: 8)
          + tokenAgents[1].Traded(index:1, taker: 0x3C44CdDd, maker: 0x70997970, token: 0xCf7Ed3Ac, tokenType: 1155, makerBuySell: SELL, prices: [0.1,0.1,0.1,0.1], tokenIds: [0,1,2,3], tokenss: [5,6,7,8], price: 2.6, timestamp: 5:28:21 PM)
          + weth.Transfer(src: 0x3C44CdDd, guy: 0x70997970, wad: 2.6)
          + tokenAgents[1].InternalTransfer(from: 0x8EFa1819, to: 0x3C44CdDd, ethers: 10.0, timestamp: 5:28:21 PM)

            # Account                         ETH          WETH 0x5FbDB231        ERC-20 0xe7f1725E                 ERC-721 0x9fE46736                ERC-1155 0xCf7Ed3Ac
          --- ---------- ------------------------ ------------------------ ------------------------ ---------------------------------- ----------------------------------
            0 0xf39Fd6e5  9899.973692496174290761                    100.0                   1000.0                         0, 1, 2, 3             0:10, 1:10, 2:10, 3:10
            1 0x70997970  9899.998297821901938092                    102.6                   1000.0                         4, 5, 6, 7             0:15, 1:14, 2:13, 3:12
            2 0x3C44CdDd  9899.998779841080375106                     97.4                   1000.0                       8, 9, 10, 11             0:35, 1:36, 2:37, 3:38
            3 0x90F79bf6  9899.998963934171431042                    100.0                   1000.0                     12, 13, 14, 15             0:40, 1:40, 2:40, 3:40

          tokenAgents[1] Offers
            # Token      Type B/S  Expiry       Count Nonce                         Prices                       TokenIds                        Tokenss                          Useds
          --- ---------- ---- ---- ------------ ----- ----- ------------------------------ ------------------------------ ------------------------------ ------------------------------
            0 0xCf7Ed3Ac 1155 BUY  5:28:36 PM      40     0                           0.10                                                                                             
            1 0xCf7Ed3Ac 1155 SELL 5:28:36 PM       0     0                           0.10                     0, 1, 2, 3                     5, 6, 7, 8                     0, 0, 0, 0
            2 0xCf7Ed3Ac 1155 SELL 5:28:36 PM      40     0         0.10, 0.20, 0.30, 0.40                     0, 1, 2, 3                 10, 10, 10, 10                     0, 0, 0, 0

      ✔ Test TokenAgent ERC-1155 offers and trades (57ms)


  5 passing (903ms)

        * accounts[0]->TokenAgentFactory.deploy() => 0x5FC8d326 - gasUsed: 5,404,883 0.005404883Ξ 13.51 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[0]->tokenAgentFactory.newTokenAgent() => 0x23dB4a08 - gasUsed: 187,021 0.000187021Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgentFactory.newTokenAgent() => 0x8EFa1819 - gasUsed: 189,821 0.000189821Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgentFactory.newTokenAgent() => 0x6743E5c6 - gasUsed: 189,821 0.000189821Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[3]->tokenAgentFactory.newTokenAgent() => 0xA14d9C7a - gasUsed: 189,821 0.000189821Ξ 0.47 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0, 1] - gasUsed: 471,764 0.000471764Ξ 1.18 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgents[1].trade(trades1, false) - gasUsed: 143,568 0.000143568Ξ 0.36 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0, 1, 2] - gasUsed: 447,807 0.000447807Ξ 1.12 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgents[1].trade(trades1, false) - gasUsed: 166,435 0.000166435Ξ 0.42 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[1]->tokenAgents[1].addOffers(offers1) => [0, 1, 2] - gasUsed: 638,952 0.000638952Ξ 1.60 USD @ 1.0 gwei 2500.00 ETH/USD
        * accounts[2]->tokenAgents[1].trade(trades1, false) - gasUsed: 172,355 0.000172355Ξ 0.43 USD @ 1.0 gwei 2500.00 ETH/USD
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
