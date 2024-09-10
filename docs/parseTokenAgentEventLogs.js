
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
          type: "Offered", index, maker, token, tokenType, buySell, expiry, count, nonce,
          prices: prices.map(e => ethers.BigNumber.from(e).toString()),
          tokenIds: tokenIds.map(e => ethers.BigNumber.from(e).toString()),
          tokenss: tokenss.map(e => ethers.BigNumber.from(e).toString()),
          timestamp
        };
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
