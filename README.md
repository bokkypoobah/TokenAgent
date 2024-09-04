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
        + tokenAgentFactory.NewTokenAgent(tokenAgent: 0xb0279Db6a2, owner: 0xf39Fd6e51a, index: 0, timestamp: 9/4/2024, 6:01:15 PM)
        + tokenAgentFactory.NewTokenAgent(tokenAgent: 0x3dE2Da43d4, owner: 0x70997970C5, index: 0, timestamp: 9/4/2024, 6:01:16 PM)
        + tokenAgentFactory.NewTokenAgent(tokenAgent: 0xddEA3d6750, owner: 0x3C44CdDdB6, index: 0, timestamp: 9/4/2024, 6:01:17 PM)
        + tokenAgentFactory.NewTokenAgent(tokenAgent: 0xAbB608121F, owner: 0x90F79bf6EB, index: 0, timestamp: 9/4/2024, 6:01:18 PM)
        + weth.Deposit(dst:0xf39Fd6e51a, wad: 100.0)
        + weth.Deposit(dst:0x70997970C5, wad: 100.0)
        + weth.Deposit(dst:0x3C44CdDdB6, wad: 100.0)
        + weth.Deposit(dst:0x90F79bf6EB, wad: 100.0)
        + erc20Token.Transfer(from:0xf39Fd6e51a, to:0x70997970C5, tokens: 1000.0)
        + erc20Token.Transfer(from:0xf39Fd6e51a, to:0x3C44CdDdB6, tokens: 1000.0)
        + erc20Token.Transfer(from:0xf39Fd6e51a, to:0x90F79bf6EB, tokens: 1000.0)
        + erc20Token.Transfer(from:0xf39Fd6e51a, to:0x0000000000, tokens: 996000.0)
        + weth.Approval(owner:0x70997970C5, spender:0xb0279Db6a2, tokens: 12.345)
        + weth.Approval(owner:0x70997970C5, spender:0x3dE2Da43d4, tokens: 12.345)
        + weth.Approval(owner:0x70997970C5, spender:0xddEA3d6750, tokens: 12.345)
        + weth.Approval(owner:0x70997970C5, spender:0xAbB608121F, tokens: 12.345)
        + weth.Approval(owner:0x3C44CdDdB6, spender:0xb0279Db6a2, tokens: 12.345)
        + weth.Approval(owner:0x3C44CdDdB6, spender:0x3dE2Da43d4, tokens: 12.345)
        + weth.Approval(owner:0x3C44CdDdB6, spender:0xddEA3d6750, tokens: 12.345)
        + weth.Approval(owner:0x3C44CdDdB6, spender:0xAbB608121F, tokens: 12.345)
        + weth.Approval(owner:0x90F79bf6EB, spender:0xb0279Db6a2, tokens: 12.345)
        + weth.Approval(owner:0x90F79bf6EB, spender:0x3dE2Da43d4, tokens: 12.345)
        + weth.Approval(owner:0x90F79bf6EB, spender:0xddEA3d6750, tokens: 12.345)
        + weth.Approval(owner:0x90F79bf6EB, spender:0xAbB608121F, tokens: 12.345)
        + erc20Token.Approval(owner:0x70997970C5, spender:0xb0279Db6a2, tokens: 12.345)
        + erc20Token.Approval(owner:0x70997970C5, spender:0x3dE2Da43d4, tokens: 12.345)
        + erc20Token.Approval(owner:0x70997970C5, spender:0xddEA3d6750, tokens: 12.345)
        + erc20Token.Approval(owner:0x70997970C5, spender:0xAbB608121F, tokens: 12.345)
        + erc20Token.Approval(owner:0x3C44CdDdB6, spender:0xb0279Db6a2, tokens: 12.345)
        + erc20Token.Approval(owner:0x3C44CdDdB6, spender:0x3dE2Da43d4, tokens: 12.345)
        + erc20Token.Approval(owner:0x3C44CdDdB6, spender:0xddEA3d6750, tokens: 12.345)
        + erc20Token.Approval(owner:0x3C44CdDdB6, spender:0xAbB608121F, tokens: 12.345)
        + erc20Token.Approval(owner:0x90F79bf6EB, spender:0xb0279Db6a2, tokens: 12.345)
        + erc20Token.Approval(owner:0x90F79bf6EB, spender:0x3dE2Da43d4, tokens: 12.345)
        + erc20Token.Approval(owner:0x90F79bf6EB, spender:0xddEA3d6750, tokens: 12.345)
        + erc20Token.Approval(owner:0x90F79bf6EB, spender:0xAbB608121F, tokens: 12.345)
        + erc721Token.Transfer(from:0x0000000000, to: 0x70997970C5, tokenId: 0
        + erc721Token.Transfer(from:0x0000000000, to: 0x70997970C5, tokenId: 1
        + erc721Token.Transfer(from:0x0000000000, to: 0x70997970C5, tokenId: 2
        + erc721Token.Transfer(from:0x0000000000, to: 0x70997970C5, tokenId: 3
        + erc721Token.Transfer(from:0x0000000000, to: 0x3C44CdDdB6, tokenId: 4
        + erc721Token.Transfer(from:0x0000000000, to: 0x3C44CdDdB6, tokenId: 5
        + erc721Token.Transfer(from:0x0000000000, to: 0x3C44CdDdB6, tokenId: 6
        + erc721Token.Transfer(from:0x0000000000, to: 0x3C44CdDdB6, tokenId: 7
        + erc721Token.Transfer(from:0x0000000000, to: 0x90F79bf6EB, tokenId: 8
        + erc721Token.Transfer(from:0x0000000000, to: 0x90F79bf6EB, tokenId: 9
        + erc721Token.Transfer(from:0x0000000000, to: 0x90F79bf6EB, tokenId: 10
        + erc721Token.Transfer(from:0x0000000000, to: 0x90F79bf6EB, tokenId: 11
        + erc721Token.ApprovalForAll(owner:0x70997970C5, operator: 0xb0279Db6a2, approved: true
        + erc721Token.ApprovalForAll(owner:0x70997970C5, operator: 0x3dE2Da43d4, approved: true
        + erc721Token.ApprovalForAll(owner:0x70997970C5, operator: 0xddEA3d6750, approved: true
        + erc721Token.ApprovalForAll(owner:0x70997970C5, operator: 0xAbB608121F, approved: true
        + erc721Token.ApprovalForAll(owner:0x3C44CdDdB6, operator: 0xb0279Db6a2, approved: true
        + erc721Token.ApprovalForAll(owner:0x3C44CdDdB6, operator: 0x3dE2Da43d4, approved: true
        + erc721Token.ApprovalForAll(owner:0x3C44CdDdB6, operator: 0xddEA3d6750, approved: true
        + erc721Token.ApprovalForAll(owner:0x3C44CdDdB6, operator: 0xAbB608121F, approved: true
        + erc721Token.ApprovalForAll(owner:0x90F79bf6EB, operator: 0xb0279Db6a2, approved: true
        + erc721Token.ApprovalForAll(owner:0x90F79bf6EB, operator: 0x3dE2Da43d4, approved: true
        + erc721Token.ApprovalForAll(owner:0x90F79bf6EB, operator: 0xddEA3d6750, approved: true
        + erc721Token.ApprovalForAll(owner:0x90F79bf6EB, operator: 0xAbB608121F, approved: true
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0xf39Fd6e51a, id: 0, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0xf39Fd6e51a, id: 0, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0xf39Fd6e51a, id: 0, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0xf39Fd6e51a, id: 0, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0x70997970C5, id: 1, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0x70997970C5, id: 1, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0x70997970C5, id: 1, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0x70997970C5, id: 1, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0x3C44CdDdB6, id: 2, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0x3C44CdDdB6, id: 2, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0x3C44CdDdB6, id: 2, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0x3C44CdDdB6, id: 2, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0x90F79bf6EB, id: 3, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0x90F79bf6EB, id: 3, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0x90F79bf6EB, id: 3, amount: 10
        + erc1155Token.TransferSingle(operator:0xf39Fd6e51a, from: 0x0000000000, to: 0x90F79bf6EB, id: 3, amount: 10
        + erc1155Token.ApprovalForAll(owner:0xf39Fd6e51a, operator: 0xb0279Db6a2, approved: true
        + erc1155Token.ApprovalForAll(owner:0xf39Fd6e51a, operator: 0x3dE2Da43d4, approved: true
        + erc1155Token.ApprovalForAll(owner:0xf39Fd6e51a, operator: 0xddEA3d6750, approved: true
        + erc1155Token.ApprovalForAll(owner:0xf39Fd6e51a, operator: 0xAbB608121F, approved: true
        + erc1155Token.ApprovalForAll(owner:0x70997970C5, operator: 0xb0279Db6a2, approved: true
        + erc1155Token.ApprovalForAll(owner:0x70997970C5, operator: 0x3dE2Da43d4, approved: true
        + erc1155Token.ApprovalForAll(owner:0x70997970C5, operator: 0xddEA3d6750, approved: true
        + erc1155Token.ApprovalForAll(owner:0x70997970C5, operator: 0xAbB608121F, approved: true
        + erc1155Token.ApprovalForAll(owner:0x3C44CdDdB6, operator: 0xb0279Db6a2, approved: true
        + erc1155Token.ApprovalForAll(owner:0x3C44CdDdB6, operator: 0x3dE2Da43d4, approved: true
        + erc1155Token.ApprovalForAll(owner:0x3C44CdDdB6, operator: 0xddEA3d6750, approved: true
        + erc1155Token.ApprovalForAll(owner:0x3C44CdDdB6, operator: 0xAbB608121F, approved: true
        + erc1155Token.ApprovalForAll(owner:0x90F79bf6EB, operator: 0xb0279Db6a2, approved: true
        + erc1155Token.ApprovalForAll(owner:0x90F79bf6EB, operator: 0x3dE2Da43d4, approved: true
        + erc1155Token.ApprovalForAll(owner:0x90F79bf6EB, operator: 0xddEA3d6750, approved: true
        + erc1155Token.ApprovalForAll(owner:0x90F79bf6EB, operator: 0xAbB608121F, approved: true
      ✔ Test TokenAgent secondary functions (772ms)
      ✔ Test TokenAgent invalid offers

          # Account                               ETH                     WETH                   ERC-20
          - ---------------- ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.977256101156018187                    100.0                   1000.0
          1 0x70997970C51812  9899.998901374957709501                    100.0                   1000.0
          2 0x3C44CdDdB6a900  9899.998921199206972019                    100.0                   1000.0
          3 0x90F79bf6EB2c4f  9899.998936272752314178                    100.0                   1000.0

        * addOffers1TxReceipt.gasUsed: 195427
        + Offer20Added(offerKey:0x2119c154...c4f20843, token: 0xe7f1725E77, nonce: 0, buySell: 1, expiry: 1725496870, points: ["0.1, 1.0","0.2, 1.0","0.3, 0.1"], timestamp: 9/4/2024, 6:02:47 PM)
        * offerKeys: 0x2119c1547cc665bfe99ddf627a536c54f5c6e15869dc263b03aa27d3c4f20843
        * trades1: [["0x2119c1547cc665bfe99ddf627a536c54f5c6e15869dc263b03aa27d3c4f20843","2100000000000000000","157142857142857142",1]]
        > ERC-20 price/tokens/used 100000000000000000 1000000000000000000 0
        >        remaining 1000000000000000000
        >        totalTokens/totalWETHTokens 1000000000000000000 100000000000000000
        > ERC-20 price/tokens/used 200000000000000000 1000000000000000000 0
        >        remaining 1000000000000000000
        >        totalTokens/totalWETHTokens 2000000000000000000 300000000000000000
        > ERC-20 price/tokens/used 300000000000000000 100000000000000000 0
        >        remaining 100000000000000000
        >        totalTokens/totalWETHTokens 2100000000000000000 330000000000000000
        >        tokens/totalTokens/totalWETHTokens 2100000000000000000 2100000000000000000 330000000000000000
        >        msg.sender BUY/owner SELL - averagePrice/_trade.averagePrice 157142857142857142 157142857142857142
        * trades1TxReceipt.gasUsed: 190523
        + weth.Transfer(from: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, to: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, tokens: 0.33)
        + erc20Token.Transfer(from: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, to: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, tokens: 2.1)
        + Traded(0x2119c1547cc665bfe99ddf627a536c54f5c6e15869dc263b03aa27d3c4f20843,2100000000000000000,157142857142857142,1,1725436968)

          # Account                               ETH                     WETH                   ERC-20
          - ---------------- ------------------------ ------------------------ ------------------------
          0 0xf39Fd6e51aad88  9899.977256101156018187                    100.0                   1000.0
          1 0x70997970C51812  9899.998705947478522497                   100.33                    997.9
          2 0x3C44CdDdB6a900  9899.998730675797347569                    99.67                   1002.1
          3 0x90F79bf6EB2c4f  9899.998936272752314178                    100.0                   1000.0

      ✔ Test TokenAgent offers


  3 passing (802ms)
```

<br />

<br />

Enjoy!

(c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
