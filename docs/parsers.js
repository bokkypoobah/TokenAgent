function parseTokenEventLogs(logs, chainId, latestBlockNumber) {
  // console.log(now() + " INFO functions:parseTokenAgentEventLogs - logs: " + JSON.stringify(logs, null, 2));
  const erc20Interface = new ethers.utils.Interface(ERC20ABI);
  const erc721Interface = new ethers.utils.Interface(ERC721ABI);
  const records = [];
  for (const log of logs) {
    if (!log.removed) {
      // const contract = log.address;
      let eventRecord = null;
      if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925") {
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
  console.log(now() + " INFO functions:parseTokenEventLogs - records: " + JSON.stringify(records, null, 2));
  return records;
}


// Token Agent
// event OwnershipTransferStarted(Account indexed previousOwner, Account indexed newOwner, Unixtime timestamp);
// event OwnershipTransferred(Account indexed previousOwner, Account indexed newOwner, Unixtime timestamp);
// event InternalTransfer(address indexed from, address indexed to, uint ethers, Unixtime timestamp);
// event Offered(Index index, Account indexed maker, Token indexed token, TokenType tokenType, BuySell buySell, Unixtime expiry, Count count, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
// event OfferUpdated(Index index, Account indexed maker, Token indexed token, TokenType tokenType, BuySell buySell, Unixtime expiry, Count count, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
// event OffersInvalidated(Nonce newNonce, Unixtime timestamp);
// event Traded(Index index, Account indexed taker, Account indexed maker, Token indexed token, TokenType tokenType, BuySell makerBuySell, uint[] prices, uint[] tokenIds, uint[] tokenss, Price price, Unixtime timestamp);
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
        // event Offered(Index index, Account indexed maker, Token indexed token, TokenType tokenType, BuySell buySell, Unixtime expiry, Count count, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
        const [index, maker, token, tokenType, buySell, expiry, count, nonce, prices, tokenIds, tokenss, timestamp] = logData.args;
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
  console.log(now() + " INFO functions:parseTokenAgentEventLogs - records: " + JSON.stringify(records, null, 2));
  return records;
}
