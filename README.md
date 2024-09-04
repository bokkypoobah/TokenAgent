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
        * accounts: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","0x70997970C51812dc3A010C7d01b50e0d17dc79C8","0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"]
        + erc20Token.Transfer(from:0x0000000000, to:0xf39Fd6e51a, tokens: 1000000.0)
        * weth: 0x5FbDB2315678afecb367f032d93F642f64180aa3
        * 20: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512, 721: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0, 1155: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
        * now: 8:23:56 AM
        * expiry: 8:25:56 AM

          # Account                               ETH                     WETH                   ERC-20
          - ---------------- ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88   9899.97582399045650029                    100.0                   1000.0
          1 0x70997970C51812  9899.998900433986039052                    100.0                   1000.0
          2 0x3C44CdDdB6a900  9899.998920424262229125                    100.0                   1000.0
          3 0x90F79bf6EB2c4f  9899.998935623907350608                    100.0                   1000.0

        * addOffers1TxReceipt.gasUsed: 266509
        + tokenAgents[1].Offer20Added(offerKey:0x591a...4b83, token: 0xe7f1725E77, nonce: 0, buySell: 1 (SELL), expiry: 8:25:56 AM, prices: ["0.1","0.2","0.3"], tokens: ["1.0","1.0","0.1"], timestamp: 8:25:34 AM)
        * offerKeys: 0x591a25a8ec67b72466f4c58dc9a4f319d693b3420a979b897fffe22864724b83
        * trades1: [["0x591a25a8ec67b72466f4c58dc9a4f319d693b3420a979b897fffe22864724b83","1050000000000000000","105000000000000000",1]]
        >        expiry/timestamp 1725488756 1725488735
        > ERC-20 price/tokens/used 100000000000000000 1000000000000000000 0
        >        remaining 1000000000000000000
        >        totalTokens/totalWETHTokens 1000000000000000000 100000000000000000
        > ERC-20 price/tokens/used 200000000000000000 1000000000000000000 0
        >        remaining 1000000000000000000
        >        totalTokens/totalWETHTokens 1050000000000000000 110000000000000000
        >        tokens/totalTokens/totalWETHTokens 1050000000000000000 1050000000000000000 110000000000000000
        >        msg.sender BUY/owner SELL - averagePrice/_trade.averagePrice 104761904761904761 105000000000000000
        * trades1TxReceipt.gasUsed: 141938
        + weth.Transfer(from: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, to: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, tokens: 0.11)
        + erc20Token.Transfer(from: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, to: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, tokens: 1.05)
        + tokenAgents[1].Traded(0x591a25a8ec67b72466f4c58dc9a4f319d693b3420a979b897fffe22864724b83,1050000000000000000,105000000000000000,1,1725488735)

          # Account                               ETH                     WETH                   ERC-20
          - ---------------- ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88   9899.97582399045650029                    100.0                   1000.0
          1 0x70997970C51812  9899.998633924326962295                   100.11                   998.95
          2 0x3C44CdDdB6a900  9899.998778485954223665                    99.89                  1001.05
          3 0x90F79bf6EB2c4f  9899.998935623907350608                    100.0                   1000.0

        * trades2: [["0x591a25a8ec67b72466f4c58dc9a4f319d693b3420a979b897fffe22864724b83","1050000000000000000","209523809523809523",1]]
        >        expiry/timestamp 1725488756 1725488736
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
        >        msg.sender BUY/owner SELL - averagePrice/_trade.averagePrice 209523809523809523 209523809523809523
        * trades2TxReceipt.gasUsed: 157358
        + weth.Transfer(from: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, to: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, tokens: 0.22)
        + erc20Token.Transfer(from: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, to: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, tokens: 1.05)
        + tokenAgents[1].Traded(0x591a25a8ec67b72466f4c58dc9a4f319d693b3420a979b897fffe22864724b83,1050000000000000000,209523809523809523,1,1725488736)

          # Account                               ETH                     WETH                   ERC-20
          - ---------------- ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88   9899.97582399045650029                    100.0                   1000.0
          1 0x70997970C51812  9899.998633924326962295                   100.33                    997.9
          2 0x3C44CdDdB6a900  9899.998621127654928749                    99.67                   1002.1
          3 0x90F79bf6EB2c4f  9899.998935623907350608                    100.0                   1000.0

      ✔ Test TokenAgent ERC-20 offers and trades (750ms)


  1 passing (752ms)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
