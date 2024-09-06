// https://stealthaddress.dev/contracts/deployments
const NETWORKS = {
  // 1: {
  //   name: "Ethereum Mainnet",
  //   explorer: "https://etherscan.io/",
  //   nonFungibleViewer: "https://opensea.io/assets/ethereum/${contract}/${tokenId}",
  //   erc20Logos: [
  //       "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/${contract}/logo.png",
  //       "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${contract}/logo.png",
  //   ],
  //   reservoir: "https://api.reservoir.tools/",
  // },
  // 42161: {
  //   name: "Arbitrum",
  //   explorer: "https://arbiscan.io/",
  //   nonFungibleViewer: "https://opensea.io/assets/arbitrum/${contract}/${tokenId}",
  //   erc20Logos: [
  //       "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/arbitrum/assets/${contract}/logo.png",
  //       "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/${contract}/logo.png",
  //   ],
  //   reservoir: "https://api-arbitrum.reservoir.tools/",
  // },
  // 8453: {
  //   name: "Base",
  //   explorer: "https://basescan.org/",
  //   nonFungibleViewer: "https://opensea.io/assets/base/${contract}/${tokenId}",
  //   erc20Logos: [
  //       "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/base/assets/${contract}/logo.png",
  //       "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/${contract}/logo.png",
  //   ],
  //   reservoir: "https://api-base.reservoir.tools/",
  //   maxLogScrapingSize: 10_000, // TODO: Base RPC server fails for > 10k blocks for ERC-20 event log scraping
  // },
  // 100: {
  //   name: "Gnosis Chain",
  //   explorer: "https://gnosisscan.io/",
  // },
  // 10: {
  //   name: "Optimism",
  //   explorer: "https://optimistic.etherscan.io/",
  //   nonFungibleViewer: "https://opensea.io/assets/optimism/${contract}/${tokenId}",
  //   erc20Logos: [
  //       "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/optimism/assets/${contract}/logo.png",
  //       "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/${contract}/logo.png",
  //   ],
  //   reservoir: "https://api-optimism.reservoir.tools/",
  // },
  // 137: {
  //   name: "Polygon Matic",
  //   explorer: "https://polygonscan.com/",
  //   nonFungibleViewer: "https://opensea.io/assets/matic/${contract}/${tokenId}",
  //   erc20Logos: [
  //       "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/polygon/assets/${contract}/logo.png",
  //       "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/${contract}/logo.png",
  //   ],
  //   reservoir: "https://api-polygon.reservoir.tools/",
  // },
  // 534352: {
  //   name: "Scroll",
  //   explorer: "https://scrollscan.com/",
  //   erc20Logos: [
  //       "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/scroll/assets/${contract}/logo.png",
  //       "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/scroll/assets/${contract}/logo.png",
  //   ],
  //   reservoir: "https://api-scroll.reservoir.tools/",
  // },
  11155111: {
    name: "Sepolia Testnet",
    tokenAgentFactory: {
      name: "TokenAgentFactory v0.8.0",
      address: "0x598b17E44c3e8894DfcC9aAec16DaD81756F5651",
      abi: [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"NotInitialised","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract TokenAgent","name":"tokenAgent","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"Unixtime","name":"timestamp","type":"uint40"}],"name":"NewTokenAgent","type":"event"},{"inputs":[{"internalType":"uint256","name":"from","type":"uint256"},{"internalType":"uint256","name":"to","type":"uint256"}],"name":"getTokenAgentsInfo","outputs":[{"components":[{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"contract TokenAgent","name":"tokenAgent","type":"address"},{"internalType":"Account","name":"owner","type":"address"}],"internalType":"struct TokenAgentFactory.Result[]","name":"results","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"_weth","type":"address"},{"internalType":"contract TokenAgent","name":"_tokenAgentTemplate","type":"address"}],"name":"init","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"newTokenAgent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"tokenAgentTemplate","outputs":[{"internalType":"contract TokenAgent","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tokenAgents","outputs":[{"internalType":"contract TokenAgent","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"tokenAgentsByOwners","outputs":[{"internalType":"contract TokenAgent","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"tokenAgentsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"weth","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"}],
    },
    tokenAgentFactory: {
      name: "TokenAgent v0.8.0 (template)",
      address: "0x0514E4402Fe93b6bA0B014b30E5b715eD0943c25",
      abi: [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AlreadyInitialised","type":"error"},{"inputs":[],"name":"CannotOfferWETH","type":"error"},{"inputs":[{"internalType":"Price","name":"executedAveragePrice","type":"uint128"},{"internalType":"Price","name":"tradeAveragePrice","type":"uint128"}],"name":"ExecutedAveragePriceGreaterThanSpecified","type":"error"},{"inputs":[{"internalType":"Price","name":"executedAveragePrice","type":"uint128"},{"internalType":"Price","name":"tradeAveragePrice","type":"uint128"}],"name":"ExecutedAveragePriceLessThanSpecified","type":"error"},{"inputs":[{"internalType":"Price","name":"executedTotalPrice","type":"uint128"},{"internalType":"Price","name":"tradeTotalPrice","type":"uint128"}],"name":"ExecutedTotalPriceGreaterThanSpecified","type":"error"},{"inputs":[{"internalType":"Price","name":"executedTotalPrice","type":"uint128"},{"internalType":"Price","name":"tradeTotalPrice","type":"uint128"}],"name":"ExecutedTotalPriceLessThanSpecified","type":"error"},{"inputs":[{"internalType":"Count","name":"requested","type":"uint16"},{"internalType":"Count","name":"remaining","type":"uint16"}],"name":"InsufficentCountRemaining","type":"error"},{"inputs":[{"internalType":"Tokens","name":"tokensRequested","type":"uint128"},{"internalType":"Tokens","name":"tokensRemaining","type":"uint128"}],"name":"InsufficentTokensRemaining","type":"error"},{"inputs":[{"internalType":"Index","name":"index","type":"uint256"}],"name":"InvalidIndex","type":"error"},{"inputs":[{"internalType":"string","name":"reason","type":"string"}],"name":"InvalidInputData","type":"error"},{"inputs":[{"internalType":"Nonce","name":"offerNonce","type":"uint32"},{"internalType":"Nonce","name":"currentNonce","type":"uint32"}],"name":"InvalidOffer","type":"error"},{"inputs":[{"internalType":"Token","name":"token","type":"address"}],"name":"InvalidToken","type":"error"},{"inputs":[{"internalType":"TokenId","name":"tokenId","type":"uint256"}],"name":"InvalidTokenId","type":"error"},{"inputs":[],"name":"NotNewOwner","type":"error"},{"inputs":[],"name":"NotOwner","type":"error"},{"inputs":[{"internalType":"Index","name":"index","type":"uint256"},{"internalType":"Unixtime","name":"expiry","type":"uint40"}],"name":"OfferExpired","type":"error"},{"inputs":[],"name":"Owner","type":"error"},{"inputs":[],"name":"TokenIdsMustBeSortedWithNoDuplicates","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"Index","name":"index","type":"uint256"},{"indexed":true,"internalType":"Account","name":"maker","type":"address"},{"indexed":true,"internalType":"Token","name":"token","type":"address"},{"indexed":false,"internalType":"enum TokenType","name":"tokenType","type":"uint8"},{"indexed":false,"internalType":"enum BuySell","name":"buySell","type":"uint8"},{"indexed":false,"internalType":"Unixtime","name":"expiry","type":"uint40"},{"indexed":false,"internalType":"Nonce","name":"nonce","type":"uint32"},{"indexed":false,"internalType":"Count","name":"count","type":"uint16"},{"indexed":false,"internalType":"Price[]","name":"prices","type":"uint128[]"},{"indexed":false,"internalType":"TokenId[]","name":"tokenIds","type":"uint256[]"},{"indexed":false,"internalType":"Tokens[]","name":"tokenss","type":"uint128[]"},{"indexed":false,"internalType":"Unixtime","name":"timestamp","type":"uint40"}],"name":"Offered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"Nonce","name":"newNonce","type":"uint32"},{"indexed":false,"internalType":"Unixtime","name":"timestamp","type":"uint40"}],"name":"OffersInvalidated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"Unixtime","name":"timestamp","type":"uint40"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"Index","name":"index","type":"uint256"},{"indexed":true,"internalType":"Account","name":"taker","type":"address"},{"indexed":true,"internalType":"Account","name":"maker","type":"address"},{"indexed":true,"internalType":"Token","name":"token","type":"address"},{"indexed":false,"internalType":"enum TokenType","name":"tokenType","type":"uint8"},{"indexed":false,"internalType":"enum BuySell","name":"makerBuySell","type":"uint8"},{"indexed":false,"internalType":"uint256[]","name":"prices","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"tokenss","type":"uint256[]"},{"indexed":false,"internalType":"Price","name":"price","type":"uint128"},{"indexed":false,"internalType":"Unixtime","name":"timestamp","type":"uint40"}],"name":"Traded","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"Token","name":"token","type":"address"},{"internalType":"enum BuySell","name":"buySell","type":"uint8"},{"internalType":"enum Pricing","name":"pricing","type":"uint8"},{"internalType":"Unixtime","name":"expiry","type":"uint40"},{"internalType":"uint256[]","name":"data","type":"uint256[]"}],"internalType":"struct TokenAgent.OrderInput[]","name":"inputs","type":"tuple[]"}],"name":"addOffers","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"from","type":"uint256"},{"internalType":"uint256","name":"to","type":"uint256"}],"name":"getOffersInfo","outputs":[{"components":[{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"Token","name":"token","type":"address"},{"internalType":"enum TokenType","name":"tokenType","type":"uint8"},{"internalType":"enum BuySell","name":"buySell","type":"uint8"},{"internalType":"Unixtime","name":"expiry","type":"uint40"},{"internalType":"Nonce","name":"nonce","type":"uint32"},{"internalType":"Count","name":"count","type":"uint16"},{"internalType":"Price[]","name":"prices","type":"uint128[]"},{"internalType":"TokenId[]","name":"tokenIds","type":"uint256[]"},{"internalType":"Tokens[]","name":"tokenss","type":"uint128[]"},{"internalType":"Tokens[]","name":"useds","type":"uint128[]"}],"internalType":"struct TokenAgent.Result[]","name":"results","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"_weth","type":"address"},{"internalType":"address","name":"owner","type":"address"}],"name":"init","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"invalidateOrders","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"newOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nonce","outputs":[{"internalType":"Nonce","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"offers","outputs":[{"internalType":"Token","name":"token","type":"address"},{"internalType":"enum BuySell","name":"buySell","type":"uint8"},{"internalType":"Unixtime","name":"expiry","type":"uint40"},{"internalType":"Nonce","name":"nonce","type":"uint32"},{"internalType":"Count","name":"count","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"Index","name":"index","type":"uint256"},{"internalType":"Price","name":"price","type":"uint128"},{"internalType":"enum Execution","name":"execution","type":"uint8"},{"internalType":"uint256[]","name":"data","type":"uint256[]"}],"internalType":"struct TokenAgent.TradeInput[]","name":"inputs","type":"tuple[]"}],"name":"trade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"updateOffer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"weth","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"}],
    },
    tokenAgentFactory: {
      name: "WETH9",
      address: "0x07391dbE03e7a0DEa0fce6699500da081537B6c3",
      abi: [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":true,"internalType":"address","name":"guy","type":"address"},{"indexed":false,"internalType":"uint256","name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"dst","type":"address"},{"indexed":false,"internalType":"uint256","name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":true,"internalType":"address","name":"dst","type":"address"},{"indexed":false,"internalType":"uint256","name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":false,"internalType":"uint256","name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"guy","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}],
    },
    // transferHelper: {
    //   // TODO: ABI & versions
    //   name: "MagicalInternetMoney-0.8.3",
    //   address: "0xAd4EFaB0A1c32184c6254e07eb6D26A3AaEB0Ae2",
    // },
    explorer: "https://sepolia.etherscan.io/",
    nonFungibleViewer: "https://testnets.opensea.io/assets/sepolia/${contract}/${tokenId}",
    erc20Logos: [
        "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/sepolia/assets/${contract}/logo.png",
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/sepolia/assets/${contract}/logo.png",
    ],
    reservoir: "https://api-sepolia.reservoir.tools/",
  },
  // 17000: {
  //   name: "Holešky Testnet",
  //   explorer: "https://holesky.etherscan.io/",
  // },
  // 421614: {
  //   name: "Arbitrum Sepolia Testnet",
  //   explorer: "https://sepolia.arbiscan.io/",
  //   nonFungibleViewer: "https://testnets.opensea.io/assets/arbitrum-sepolia/${contract}/${tokenId}",
  // },
  // 84532: {
  //   name: "Base Sepolia Testnet",
  //   explorer: "https://sepolia.basescan.org/",
  //   nonFungibleViewer: "https://testnets.opensea.io/assets/base-sepolia/${contract}/${tokenId}",
  //   reservoir: "https://api-base-sepolia.reservoir.tools/",
  // },
  // 11155420: {
  //   name: "Optimism Sepolia Testnet",
  //   explorer: "https://sepolia-optimism.etherscan.io/",
  // },
};
