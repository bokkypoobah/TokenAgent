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
        * now: 9:28:50 AM, expiry: 9:30:50 AM
      ✔ Test TokenAgent secondary functions (805ms)
      ✔ Test TokenAgent invalid offers

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975378411595193534                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998900492977500059                    100.0                   1000.0                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998920459678408956                    100.0                   1000.0                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f  9899.998935645383800735                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

        * addOffers gasUsed: 266509
        + tokenAgents[1].Offer20Added(offerKey:0x6cca...5bb3, token: 0xe7f1725E77, nonce: 0, buySell: 1 (SELL), expiry: 9:30:50 AM, prices: ["0.1","0.2","0.3"], tokens: ["1.0","1.0","0.1"], timestamp: 9:30:32 AM)
        * offerKeys: 0x6ccad1733143a2926ce58ff87ed8e67064b3e26cde64ded7742bfcfd47555bb3
        * trades1: [["0x6ccad1733143a2926ce58ff87ed8e67064b3e26cde64ded7742bfcfd47555bb3","1050000000000000000","105000000000000000",1]]
        >        expiry/timestamp 1725492650 1725492633
        > ERC-20 price/tokens/used 100000000000000000 1000000000000000000 0
        >        remaining 1000000000000000000
        >        totalTokens/totalWETHTokens 1000000000000000000 100000000000000000
        > ERC-20 price/tokens/used 200000000000000000 1000000000000000000 0
        >        remaining 1000000000000000000
        >        totalTokens/totalWETHTokens 1050000000000000000 110000000000000000
        >        tokens/totalTokens/totalWETHTokens 1050000000000000000 1050000000000000000 110000000000000000
        >        msg.sender BUY/owner SELL - averagePrice/_trade.price 104761904761904761 105000000000000000
        * trades1 gasUsed: 141938
        + weth.Transfer(from: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, to: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, tokens: 0.11)
        + erc20Token.Transfer(from: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, to: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, tokens: 1.05)
        + tokenAgents[1].Traded(0x6ccad1733143a2926ce58ff87ed8e67064b3e26cde64ded7742bfcfd47555bb3,1050000000000000000,105000000000000000,1,1725492633)

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975378411595193534                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998633983589196446                   100.11                   998.95                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998778521496870254                    99.89                  1001.05                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f  9899.998935645383800735                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

        * trades2: [["0x6ccad1733143a2926ce58ff87ed8e67064b3e26cde64ded7742bfcfd47555bb3","1050000000000000000","209523809523809523",1]]
        >        expiry/timestamp 1725492650 1725492634
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
        * trades2 gasUsed: 157358
        + weth.Transfer(from: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, to: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, tokens: 0.22)
        + erc20Token.Transfer(from: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, to: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, tokens: 1.05)
        + tokenAgents[1].Traded(0x6ccad1733143a2926ce58ff87ed8e67064b3e26cde64ded7742bfcfd47555bb3,1050000000000000000,209523809523809523,1,1725492634)

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975378411595193534                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998633983589196446                   100.33                    997.9                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998621163320471936                    99.67                   1002.1                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f  9899.998935645383800735                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

      ✔ Test TokenAgent ERC-20 offers and trades (61ms)

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975378411595193534                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998900492977500059                    100.0                   1000.0                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998920459678408956                    100.0                   1000.0                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f  9899.998935645383800735                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

        * addOffers1 gasUsed: 620448
        + tokenAgents[1].Offer721Added(offerKey:0x741d...9414, token: 0x9fE4673667, nonce: 0, buySell: 0, expiry: 9:30:50 AM, count: 5, prices: ["0.1"], tokenIds: [], timestamp: 9:30:32 AM)
        + tokenAgents[1].Offer721Added(offerKey:0xe99e...c425, token: 0x9fE4673667, nonce: 0, buySell: 1, expiry: 9:30:50 AM, count: 6, prices: ["0.1"], tokenIds: ["1","2","3","4"], timestamp: 9:30:32 AM)
        + tokenAgents[1].Offer721Added(offerKey:0x7a53...9015, token: 0x9fE4673667, nonce: 0, buySell: 1, expiry: 9:30:50 AM, count: 65535, prices: ["0.1","0.2","0.3"], tokenIds: ["1","2","3"], timestamp: 9:30:32 AM)
        * offerKeys: 0x741d01265b8c4191a04311471182ffd90732a84854da741ffc00967834a09414,0xe99e4dfe30a2d72a3579390bd98dccbb0ed12d7fccefaaa3c15c0cd54b90c425,0x7a53abf1534bb85e841e06c35f805a2db57b7e32ebea46d0b5237fe92fe09015
        * trades1: [["0x741d01265b8c4191a04311471182ffd90732a84854da741ffc00967834a09414","2100000000000000000","157142857142857142",1]]
        > ERC-721 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0 0
        * trades1 gasUsed: 43628

          # Account                               ETH          0x5FbDB231 WETH        0xe7f1725E ERC-20       0x9fE46736 ERC-721      0xCf7Ed3Ac ERC-1155
          - ---------------- ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.975378411595193534                    100.0                   1000.0                  0,1,2,3      0:10,1:10,2:10,3:10
          1 0x70997970C51812  9899.998280044073507323                    100.0                   1000.0                  4,5,6,7      0:20,1:20,2:20,3:20
          2 0x3C44CdDdB6a900  9899.998876831622434232                    100.0                   1000.0                8,9,10,11      0:30,1:30,2:30,3:30
          3 0x90F79bf6EB2c4f  9899.998935645383800735                    100.0                   1000.0              12,13,14,15      0:40,1:40,2:40,3:40

      ✔ Test TokenAgent ERC-721 offers and trades


  4 passing (922ms)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
