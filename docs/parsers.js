function parseTokenEventLogs(logs, chainId, latestBlockNumber) {
  // console.log(now() + " INFO functions:parseTokenAgentEventLogs - logs: " + JSON.stringify(logs, null, 2));
  const erc20Interface = new ethers.utils.Interface(ERC20ABI);
  const erc721Interface = new ethers.utils.Interface(ERC721ABI);
  const records = [];
  for (const log of logs) {
    if (!log.removed) {
      // const contract = log.address;
      let eventRecord = null;
      if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
        // ERC-20 event Transfer(address indexed from, address indexed to, uint tokens);
        // ERC-721 TODO
        const logData = erc20Interface.parseLog(log);
        const [from, to, tokens] = logData.args;
        eventRecord = { eventType: "Transfer", from, to, tokens: tokens.toString() /*, contractType: 20*/ };

      } else if (log.topics[0] == "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c") {
        // WETH Deposit (index_topic_1 address dst, uint256 wad)
        const to = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        tokens = ethers.BigNumber.from(log.data).toString();
        eventRecord = { eventType: "Deposit", from: ADDRESS0, to, tokens /*, contractType: 20*/ };

      } else if (log.topics[0] == "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65") {
        // WETH Withdrawal (index_topic_1 address src, uint256 wad)
        const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        tokens = ethers.BigNumber.from(log.data).toString();
        eventRecord = { eventType: "Withdrawal", from, to: ADDRESS0, tokens /*, contractType: 20*/ };

      } else if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925") {
        // ERC-20 event Approval(address indexed owner, address indexed spender, uint tokens);
        // ERC-721 Approval (address indexed owner, address indexed approved, uint256 indexed tokenId)
        if (log.topics.length == 4) {
          const logData = erc721Interface.parseLog(log);
          const [owner, approved, tokenId] = logData.args;
          eventRecord = { eventType: "Approval", owner, approved, tokenId: tokenId.toString() /*, contractType: 721*/ };
        } else {
          const logData = erc20Interface.parseLog(log);
          const [owner, spender, tokens] = logData.args;
          eventRecord = { eventType: "Approval", owner, spender, tokens: tokens.toString() /*, contractType: 20*/ };
        }
      } else if (log.topics[0] == "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31") {
        // ERC-721 event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
        // ERC-1155 event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
        const logData = erc721Interface.parseLog(log);
        const [owner, operator, approved] = logData.args;
        // NOTE: Both 721 and 1155 fall into this category, but assigning all to 721
        eventRecord = { eventType: "ApprovalForAll", owner, operator, approved /*, contractType: 721*/ };
      } else {
        console.log(now() + " INFO functions:parseTokenEventLogs - UNHANDLED log: " + JSON.stringify(log));
      }
      if (eventRecord) {
        records.push( {
          chainId,
          blockNumber: parseInt(log.blockNumber),
          logIndex: parseInt(log.logIndex),
          txIndex: parseInt(log.transactionIndex),
          txHash: log.transactionHash,
          contract: log.address,
          ...eventRecord,
          confirmations: latestBlockNumber - log.blockNumber,
        });
      }
    }
  }
  // console.log(now() + " INFO functions:parseTokenEventLogs - records: " + JSON.stringify(records, null, 2));
  return records;
}

// TokenAgentFactory
// event NewTokenAgent(TokenAgent indexed tokenAgent, Account indexed owner, Index indexed index, Index indexByOwner, Unixtime timestamp);
function parseTokenAgentFactoryEventLogs(logs, chainId, tokenAgentFactoryAddress, tokenAgentFactoryAbi, latestBlockNumber) {
  // console.log(now() + " INFO functions:parseTokenAgentFactoryEventLogs - logs: " + JSON.stringify(logs, null, 2));
  const interface = new ethers.utils.Interface(tokenAgentFactoryAbi);
  const records = [];
  for (const log of logs) {
    if (!log.removed) {
      const logData = interface.parseLog(log);
      const contract = log.address;
      let eventRecord = null;
      if (logData.eventFragment.name == "NewTokenAgent") {
        // event NewTokenAgent(TokenAgent indexed tokenAgent, Account indexed owner, Index indexed index, Index indexByOwner, Unixtime timestamp);
        const [tokenAgent, owner, index, indexByOwner, timestamp] = logData.args;
        eventRecord = {
          eventType: "NewTokenAgent", tokenAgent, owner, index, indexByOwner,
          timestamp,
        };
      } else {
        console.log(now() + " INFO functions:parseTokenAgentFactoryEventLogs - UNHANDLED log: " + JSON.stringify(log));
      }
      if (eventRecord) {
        records.push( {
          chainId,
          blockNumber: parseInt(log.blockNumber),
          logIndex: parseInt(log.logIndex),
          txIndex: parseInt(log.transactionIndex),
          txHash: log.transactionHash,
          contract,
          ...eventRecord,
          confirmations: latestBlockNumber - log.blockNumber,
        });
      }
    }
  }
  // console.log(now() + " INFO functions:parseTokenAgentFactoryEventLogs - records: " + JSON.stringify(records, null, 2));
  return records;
}

// TokenAgent
// event OwnershipTransferStarted(Account indexed previousOwner, Account indexed newOwner, Unixtime timestamp);
// event OwnershipTransferred(Account indexed previousOwner, Account indexed newOwner, Unixtime timestamp);
// event InternalTransfer(address indexed from, address indexed to, uint ethers, Unixtime timestamp);
// event Offered(Index index, Token indexed token, TokenType tokenType, Account indexed maker, BuySell buySell, Unixtime expiry, Count count, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
// event OfferUpdated(Index index, Token indexed token, TokenType tokenType, Account indexed maker, BuySell buySell, Unixtime expiry, Count count, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
// event OffersInvalidated(Nonce newNonce, Unixtime timestamp);
// event Traded(Index index, Token indexed token, TokenType tokenType, Account indexed taker, Account indexed maker, BuySell makerBuySell, uint[] prices, uint[] tokenIds, uint[] tokenss, Price price, Unixtime timestamp);
function parseTokenAgentEventLogs(logs, chainId, tokenAgentAddress, tokenAgentAbi, latestBlockNumber) {
  // console.log(now() + " INFO functions:parseTokenAgentEventLogs - logs: " + JSON.stringify(logs, null, 2));
  const interface = new ethers.utils.Interface(tokenAgentAbi);
  const records = [];
  for (const log of logs) {
    if (!log.removed) {
      const logData = interface.parseLog(log);
      const contract = log.address;
      let eventRecord = null;
      if (logData.eventFragment.name == "Offered") {
        // event Offered(Index index, Token indexed token, TokenType tokenType, Account indexed maker, BuySell buySell, Unixtime expiry, Count count, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
        const [index, token, tokenType, maker, buySell, expiry, count, nonce, prices, tokenIds, tokenss, timestamp] = logData.args;
        eventRecord = {
          eventType: "Offered", index, maker, token, tokenType, buySell, expiry, count, nonce,
          prices: prices.map(e => ethers.BigNumber.from(e).toString()),
          tokenIds: tokenIds.map(e => ethers.BigNumber.from(e).toString()),
          tokenss: tokenss.map(e => ethers.BigNumber.from(e).toString()),
          timestamp,
        };
      } else if (logData.eventFragment.name == "OffersInvalidated") {
        // event OffersInvalidated(Nonce newNonce, Unixtime timestamp);
        const [newNonce, timestamp] = logData.args;
        eventRecord = { eventType: "OffersInvalidated", newNonce, timestamp };
      } else {
        console.log(now() + " INFO functions:parseTokenAgentEventLogs - UNHANDLED log: " + JSON.stringify(log));
      }
      if (eventRecord) {
        records.push( {
          chainId,
          blockNumber: parseInt(log.blockNumber),
          logIndex: parseInt(log.logIndex),
          txIndex: parseInt(log.transactionIndex),
          txHash: log.transactionHash,
          contract,
          ...eventRecord,
          confirmations: latestBlockNumber - log.blockNumber,
        });
      }
    }
  }
  // console.log(now() + " INFO functions:parseTokenAgentEventLogs - records: " + JSON.stringify(records, null, 2));
  return records;
}
