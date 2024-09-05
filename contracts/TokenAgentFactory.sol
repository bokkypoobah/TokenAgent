pragma solidity ^0.8.24;

// ----------------------------------------------------------------------------
// TokenAgent with factory
//
// https://github.com/bokkypoobah/TokenAgent
//
// Deployed to Sepolia
//
// SPDX-License-Identifier: MIT
//
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
// ----------------------------------------------------------------------------

// import "hardhat/console.sol";


/// @notice https://github.com/optionality/clone-factory/blob/32782f82dfc5a00d103a7e61a17a5dedbd1e8e9d/contracts/CloneFactory.sol
/*
The MIT License (MIT)

Copyright (c) 2018 Murray Software, LLC.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
//solhint-disable max-line-length
//solhint-disable no-inline-assembly

contract CloneFactory {

  function createClone(address target) internal returns (address result) {
    bytes20 targetBytes = bytes20(target);
    assembly {
      let clone := mload(0x40)
      mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
      mstore(add(clone, 0x14), targetBytes)
      mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
      result := create(0, clone, 0x37)
    }
  }

  function isClone(address target, address query) internal view returns (bool result) {
    bytes20 targetBytes = bytes20(target);
    assembly {
      let clone := mload(0x40)
      mstore(clone, 0x363d3d373d3d3d363d7300000000000000000000000000000000000000000000)
      mstore(add(clone, 0xa), targetBytes)
      mstore(add(clone, 0x1e), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)

      let other := add(clone, 0x40)
      extcodecopy(query, other, 0, 0x2d)
      result := and(
        eq(mload(clone), mload(other)),
        eq(mload(add(clone, 0xd)), mload(add(other, 0xd)))
      )
    }
  }
}
// End CloneFactory.sol


interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed owner, address indexed spender, uint tokens);

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);

    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint balance);
    function allowance(address owner, address spender) external view returns (uint remaining);
    function transfer(address to, uint tokens) external returns (bool success);
    function approve(address spender, uint tokens) external returns (bool success);
    function transferFrom(address from, address to, uint tokens) external returns (bool success);
}

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721Partial {
    function transferFrom(address from, address to, uint256 tokenId) external;
}

interface IERC1155Partial {
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
}

type Account is address;
type Count is uint16;
type Nonce is uint32;
type OfferKey is bytes32;
type Price is uint128;
type Token is address;
type TokenId is uint256;
type Tokens is uint128;
type Unixtime is uint40; // 2^40 = 1,099,511,627,776 seconds = 34865.285000507356672 years

enum BuySell { BUY, SELL }
enum Execution { FILL, FILLORKILL }
enum Pricing { SINGLE, MULTIPLE }
enum TokenType { UNKNOWN, ERC20, ERC721, ERC1155, INVALID }

bytes4 constant ERC721_INTERFACE = 0x80ac58cd;
bytes4 constant ERC1155_INTERFACE = 0xd9b67a26;

Token constant THEDAO = Token.wrap(0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413);

library ArraySearch {
    function includesTokenId(TokenId[] memory tokenIds, TokenId target) internal pure returns (uint) {
        if (tokenIds.length > 0) {
            uint left;
            uint right = tokenIds.length - 1;
            uint mid;
            while (left <= right) {
                mid = (left + right) / 2;
                if (TokenId.unwrap(tokenIds[mid]) < TokenId.unwrap(target)) {
                    left = mid + 1;
                } else if (TokenId.unwrap(tokenIds[mid]) > TokenId.unwrap(target)) {
                    if (mid < 1) {
                        break;
                    }
                    right = mid - 1;
                } else {
                    return mid;
                }
            }
        }
        return type(uint).max;
    }
}

/// @notice Ownership
contract Owned {
    bool initialised;
    address public owner;
    address public newOwner;

    event OwnershipTransferred(address indexed from, address indexed to, Unixtime timestamp);

    error AlreadyInitialised();
    error NotOwner();
    error NotNewOwner();

    modifier onlyOwner {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    function initOwned(address _owner) internal {
        if (initialised) {
            revert AlreadyInitialised();
        }
        owner = _owner;
        initialised = true;
    }
    function transferOwnership(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }
    function acceptOwnership() public {
        if (msg.sender != newOwner) {
            revert NotNewOwner();
        }
        emit OwnershipTransferred(owner, newOwner, Unixtime.wrap(uint40(block.timestamp)));
        owner = newOwner;
        newOwner = address(0);
    }
}

/// @notice Reentrancy guard
contract NonReentrancy {
    modifier nonReentranct() {
        assembly {
            if tload(0) { revert(0, 0) }
            tstore(0, 1)
        }
        _;
        assembly {
            tstore(0, 0)
        }
    }
}

/// @notice User owned TokenAgent
contract TokenAgent is Owned, NonReentrancy {

    // ints
    // 2^128 = -170, 141,183,460,469,231,731, 687,303,715,884,105,728 to 170, 141,183,460,469,231,731, 687,303,715,884,105,727

    // uints
    // 2^16 = 65,536
    // 2^32 = 4,294,967,296
    // 2^48 = 281,474,976,710,656
    // 2^60 = 1, 152,921,504, 606,846,976
    // 2^64 = 18, 446,744,073,709,551,616
    // 2^128 = 340, 282,366,920,938,463,463, 374,607,431,768,211,456
    // 2^256 = 115,792, 089,237,316,195,423,570, 985,008,687,907,853,269, 984,665,640,564,039,457, 584,007,913,129,639,936
    //
    // ERC-20:
    // wethAmount = tokens * price / 10^18
    // 12.3456    = 100 * 0.123456

    struct OfferInput {
        Token token; // 160 bits
        BuySell buySell; // 8 bits
        Pricing pricing; // 8 bits
        Unixtime expiry; // 64 bits
        uint256[] inputs;
    }
    struct Offer20 {
        Token token; // 160 bits
        Unixtime expiry; // 64 bits
        Nonce nonce; // 32 bits
        Price[] prices; // 128 bits // token/WETH 18dp
        Tokens[] tokenss; // 128 bits // ERC-20
        Tokens[] useds; // 128 bits // ERC-20
    }
    struct Offer721 {
        Token token; // 160 bits
        Unixtime expiry; // 64 bits
        Nonce nonce; // 32 bits
        Count count; // 16 bits
        Price[] prices;
        TokenId[] tokenIds;
    }
    struct Offer1155 {
        Token token; // 160 bits
        Unixtime expiry; // 64 bits
        Nonce nonce; // 32 bits
        Count count; // 16 bits
        Price[] prices;
        TokenId[] tokenIds;
        Tokens[] tokenss;
    }

    struct TradeInput {
        OfferKey offerKey; // 256 bits
        Price price; // 128 bits min - ERC-20 max average when buying, min average when selling; ERC-721/1155 max total price when buying, min total price when selling
        Execution execution; // 8 bits - ERC-20 unused; ERC-721 single price or multiple prices
        uint256[] inputs;
    }

    IERC20 public weth;
    Nonce public nonce;
    mapping(OfferKey => Offer20) public offer20s;
    mapping(OfferKey => Offer721) public offer721s;
    mapping(OfferKey => Offer1155) public offer1155s;
    mapping(Token => TokenType) tokenTypes;

    event Offered20(OfferKey offerKey, Account indexed maker, Token indexed token, BuySell buySell, Unixtime expiry, Nonce nonce, Price[] prices, Tokens[] tokenss, Unixtime timestamp);
    event Offered721(OfferKey offerKey, Account indexed maker, Token indexed token, BuySell buySell, Unixtime expiry, Nonce nonce, Count count, Price[] prices, TokenId[] tokenIds, Unixtime timestamp);
    event Offered1155(OfferKey offerKey, Account indexed maker, Token indexed token, BuySell buySell, Unixtime expiry, Nonce nonce, Count count, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
    event OffersInvalidated(Nonce newNonce, Unixtime timestamp);
    event Traded20(OfferKey offerKey, Account indexed taker, Account indexed maker, Token indexed token, BuySell makerBuySell, uint[] prices, uint[] tokens, Price averagePrice, Unixtime timestamp);
    event Traded721(OfferKey offerKey, Account indexed taker, Account indexed maker, Token indexed token, BuySell makerBuySell, uint[] prices, uint[] tokenIds, Price totalPrice, Unixtime timestamp);
    event Traded1155(OfferKey offerKey, Account indexed taker, Account indexed maker, Token indexed token, BuySell makerBuySell, uint[] prices, uint[] tokenIds, uint[] tokenss, Price totalPrice, Unixtime timestamp);

    error CannotOfferWETH();
    error ExecutedAveragePriceGreaterThanSpecified(Price executedAveragePrice, Price tradeAveragePrice);
    error ExecutedAveragePriceLessThanSpecified(Price executedAveragePrice, Price tradeAveragePrice);
    error ExecutedTotalPriceGreaterThanSpecified(Price executedTotalPrice, Price tradeTotalPrice);
    error ExecutedTotalPriceLessThanSpecified(Price executedTotalPrice, Price tradeTotalPrice);
    error InsufficentTokensRemaining(Tokens tokensRequested, Tokens tokensRemaining);
    error InsufficentCountRemaining(Count requested, Count remaining);
    error InvalidInputData(string reason);
    error InvalidOffer(Nonce offerNonce, Nonce currentNonce);
    error InvalidOfferKey(OfferKey offerKey);
    error InvalidToken(Token token);
    error InvalidTokenId(TokenId tokenId);
    error OfferExpired(OfferKey offerKey, Unixtime expiry);
    error TokenIdsMustBeSortedWithNoDuplicates();

    constructor() {
    }

    function init(IERC20 _weth, address owner) external {
        super.initOwned(owner);
        weth = _weth;
    }
    function invalidateOrders() external onlyOwner {
        nonce = Nonce.wrap(Nonce.unwrap(nonce) + 1);
        emit OffersInvalidated(nonce, Unixtime.wrap(uint40(block.timestamp)));
    }

    function addOffers(OfferInput[] calldata _offerInputs) external onlyOwner {
        for (uint i = 0; i < _offerInputs.length; i++) {
            OfferInput memory offerInput = _offerInputs[i];
            TokenType tokenType = _getTokenType(offerInput.token);
            OfferKey offerKey = makeOfferKey(offerInput, tokenType);

            if (tokenType == TokenType.INVALID) {
                revert InvalidToken(offerInput.token);
            }
            if (Token.unwrap(offerInput.token) == address(weth)) {
                revert CannotOfferWETH();
            }
            if (tokenType == TokenType.ERC20) {
                // All: [price0, tokens0, price1, tokens1, ...]
                // -> prices [one, two, ...], tokens [one, two, ...]
                // uint startGas = gasleft();
                offer20s[offerKey].token = offerInput.token;
                offer20s[offerKey].expiry = offerInput.expiry;
                offer20s[offerKey].nonce = nonce;
                if (offerInput.inputs.length == 0 || (offerInput.inputs.length % 2) != 0) {
                    revert InvalidInputData("length");
                }
                for (uint j = 0; j < offerInput.inputs.length; j += 2) {
                    offer20s[offerKey].prices.push(Price.wrap(uint128(offerInput.inputs[j])));
                    offer20s[offerKey].tokenss.push(Tokens.wrap(uint128(offerInput.inputs[j + 1])));
                    offer20s[offerKey].useds.push(Tokens.wrap(0));
                }
                // uint usedGas = startGas - gasleft();
                // console.log("usedGas", usedGas);
                emit Offered20(offerKey, Account.wrap(msg.sender), offerInput.token, offerInput.buySell, offerInput.expiry, nonce, offer20s[offerKey].prices, offer20s[offerKey].tokenss, Unixtime.wrap(uint40(block.timestamp)));
            } else if (tokenType == TokenType.ERC721) {
                // Single price: [price0, count] - b/s count @ price0 with any tokenId
                // -> prices[price0], tokenIds[], count
                // Single price: [price0, count, tokenId0, tokenId1, ...] - b/s count @ price0 with specified tokenIds
                // -> prices[price0], tokenIds[tokenId0, tokenId1], count
                // Multiple prices: [price0, tokenId0, price1, tokenId1, ...] - b/s individual tokenIds with specified prices
                // -> prices[price0, price1, ...], tokenIds[tokenId0, tokenId1, ...]
                offer721s[offerKey].token = offerInput.token;
                offer721s[offerKey].expiry = offerInput.expiry;
                offer721s[offerKey].nonce = nonce;
                if (offerInput.inputs.length == 0) {
                    revert InvalidInputData("zero length");
                }
                if (offerInput.pricing == Pricing.SINGLE) {
                    if (offerInput.inputs[1] >= type(uint16).max) {
                        revert InvalidInputData("count must be < 65535");
                    }
                    if (offerInput.inputs.length < 2) {
                        revert InvalidInputData("length < 2");
                    }
                    offer721s[offerKey].prices.push(Price.wrap(uint128(offerInput.inputs[0])));
                    offer721s[offerKey].count = Count.wrap(uint16(offerInput.inputs[1]));
                    for (uint j = 2; j < offerInput.inputs.length; j++) {
                        offer721s[offerKey].tokenIds.push(TokenId.wrap(offerInput.inputs[j]));
                    }
                } else {
                    if ((offerInput.inputs.length % 2) != 0) {
                        revert InvalidInputData("length not even");
                    }
                    offer721s[offerKey].count = Count.wrap(type(uint16).max);
                    for (uint j = 0; j < offerInput.inputs.length; j += 2) {
                        offer721s[offerKey].prices.push(Price.wrap(uint128(offerInput.inputs[j])));
                        offer721s[offerKey].tokenIds.push(TokenId.wrap(offerInput.inputs[j+1]));
                    }
                }
                if (offer721s[offerKey].tokenIds.length > 1) {
                    for (uint j = 1; j < offer721s[offerKey].tokenIds.length; j++) {
                        if (TokenId.unwrap(offer721s[offerKey].tokenIds[j - 1]) >= TokenId.unwrap(offer721s[offerKey].tokenIds[j])) {
                            revert TokenIdsMustBeSortedWithNoDuplicates();
                        }
                    }
                }
                emit Offered721(offerKey, Account.wrap(msg.sender), offerInput.token, offerInput.buySell, offerInput.expiry, nonce, offer721s[offerKey].count, offer721s[offerKey].prices, offer721s[offerKey].tokenIds, Unixtime.wrap(uint40(block.timestamp)));
            } else if (tokenType == TokenType.ERC1155) {
                // Single price: [price0, count] - b/s count @ price0 with any tokenId and any tokens
                // -> prices[price0], tokenIds[], tokenss [], count
                // Single price: [price0, count, tokenId0, tokens0, tokenId1, tokens1, ...] - b/s count @ price0 with specified tokenIds and tokens
                // -> prices[price0], tokenIds[tokenId0, tokenId1, ...], tokenss [tokens0, tokens1, ...], count
                // Multiple prices: [price0, tokenId0, tokens0, price1, tokenId1, tokens1, ...] - b/s individual tokenIds and tokens with specified prices
                // -> prices[price0, price1, ...], tokenIds[tokenId0, tokenId1, ...], tokenss [tokens0, tokens1, ...]
                offer1155s[offerKey].token = offerInput.token;
                offer1155s[offerKey].expiry = offerInput.expiry;
                offer1155s[offerKey].nonce = nonce;
                if (offerInput.inputs.length == 0) {
                    revert InvalidInputData("zero length");
                }
                if (offerInput.pricing == Pricing.SINGLE) {
                    if (offerInput.inputs[1] >= type(uint16).max) {
                        revert InvalidInputData("count must be < 65535");
                    }
                    if (offerInput.inputs.length < 2) {
                        revert InvalidInputData("length < 2");
                    }
                    if ((offerInput.inputs.length % 2) != 0) {
                        revert InvalidInputData("length not even");
                    }
                    offer1155s[offerKey].prices.push(Price.wrap(uint128(offerInput.inputs[0])));
                    offer1155s[offerKey].count = Count.wrap(uint16(offerInput.inputs[1]));
                    for (uint j = 2; j < offerInput.inputs.length; j += 2) {
                        offer1155s[offerKey].tokenIds.push(TokenId.wrap(offerInput.inputs[j]));
                        offer1155s[offerKey].tokenss.push(Tokens.wrap(uint128(offerInput.inputs[j+1])));
                    }
                } else {
                    if ((offerInput.inputs.length % 3) != 0) {
                        revert InvalidInputData("length not divisible by 3");
                    }
                    offer1155s[offerKey].count = Count.wrap(type(uint16).max);
                    for (uint j = 0; j < offerInput.inputs.length; j += 3) {
                        offer1155s[offerKey].prices.push(Price.wrap(uint128(offerInput.inputs[j])));
                        offer1155s[offerKey].tokenIds.push(TokenId.wrap(offerInput.inputs[j+1]));
                        offer1155s[offerKey].tokenss.push(Tokens.wrap(uint128(offerInput.inputs[j+2])));
                    }
                }
                emit Offered1155(offerKey, Account.wrap(msg.sender), offerInput.token, offerInput.buySell, offerInput.expiry, nonce, offer1155s[offerKey].count, offer1155s[offerKey].prices, offer1155s[offerKey].tokenIds, offer1155s[offerKey].tokenss, Unixtime.wrap(uint40(block.timestamp)));
            }
        }
    }

    function updateOffer(/*OfferUpdate[] calldata _offerOpdates*/) external onlyOwner {
        // TODO: Update offer.tokenIds, offer.tokenss, price, expiry?
    }

    function trade(TradeInput[] calldata _trades) external nonReentranct {
        for (uint i = 0; i < _trades.length; i++) {
            TradeInput memory _trade = _trades[i];
            OfferKey offerKey = _trade.offerKey;
            BuySell buySell = BuySell(uint(OfferKey.unwrap(offerKey)) % 2);
            TokenType tokenType = TokenType((uint(OfferKey.unwrap(offerKey)) % 16) / 2);

            if (tokenType == TokenType.ERC20) {
                // All: taker inputs[tokens]
                Offer20 storage offer = offer20s[offerKey];
                if (Token.unwrap(offer.token) == address(0)) {
                    revert InvalidOfferKey(offerKey);
                }
                if (Nonce.unwrap(offer.nonce) != Nonce.unwrap(nonce)) {
                    revert InvalidOffer(offer.nonce, nonce);
                }
                if (Unixtime.unwrap(offer.expiry) != 0 && block.timestamp > Unixtime.unwrap(offer.expiry)) {
                    revert OfferExpired(offerKey, offer.expiry);
                }
                if (_trade.inputs.length != 1) {
                    revert InvalidInputData("Expecting single price input");
                }
                uint128 tokens = uint128(_trade.inputs[0]);
                uint128 totalTokens = 0;
                uint128 totalWETHTokens = 0;
                uint[] memory prices_ = new uint[](offer.prices.length);
                uint[] memory tokens_ = new uint[](offer.prices.length);
                uint k;
                for (uint j = 0; j < offer.prices.length && tokens > 0; j++) {
                    uint128 _price = Price.unwrap(offer.prices[j]);
                    uint128 _remaining = Tokens.unwrap(offer.tokenss[j]) - Tokens.unwrap(offer.useds[j]);
                    // console.log("        > ERC-20 price/tokens/used", uint(Price.unwrap(offer.prices[j])), uint(Tokens.unwrap(offer.tokenss[j])), uint(Tokens.unwrap(offer.useds[j])));
                    // console.log("        >        remaining", _remaining);
                    if (_remaining > 0) {
                        if (tokens >= _remaining) {
                            tokens -= _remaining;
                            totalTokens += _remaining;
                            offer.useds[j] = Tokens.wrap(Tokens.unwrap(offer.useds[j]) + _remaining);
                            prices_[k] = _price;
                            tokens_[k] = _remaining;
                            totalWETHTokens += _remaining * _price / 10**18;
                        } else {
                            totalTokens += tokens;
                            offer.useds[j] = Tokens.wrap(Tokens.unwrap(offer.useds[j]) + tokens);
                            prices_[k] = _price;
                            tokens_[k] = tokens;
                            totalWETHTokens += tokens * _price / 10**18;
                            tokens = 0;
                        }
                        k++;
                    }
                    // console.log("        >        totalTokens/totalWETHTokens", totalTokens, totalWETHTokens);
                }
                // console.log("        >        tokens/totalTokens/totalWETHTokens", _trade.inputs[0], totalTokens, totalWETHTokens);
                if (_trade.execution == Execution.FILLORKILL && totalTokens < _trade.inputs[0]) {
                    revert InsufficentTokensRemaining(Tokens.wrap(uint128(_trade.inputs[0])), Tokens.wrap(totalTokens));
                }
                if (totalTokens > 0) {
                    uint128 averagePrice = totalWETHTokens * 10**18 / totalTokens;
                    if (buySell == BuySell.BUY) {
                        // console.log("        >        msg.sender SELL/owner BUY - averagePrice/_trade.price", averagePrice, Price.unwrap(_trade.price));
                        if (averagePrice < Price.unwrap(_trade.price)) {
                            revert ExecutedAveragePriceLessThanSpecified(Price.wrap(averagePrice), _trade.price);
                        }
                        IERC20(Token.unwrap(offer.token)).transferFrom(msg.sender, owner, totalTokens);
                        weth.transferFrom(owner, msg.sender, totalWETHTokens);
                    } else {
                        // console.log("        >        msg.sender BUY/owner SELL - averagePrice/_trade.price", averagePrice, Price.unwrap(_trade.price));
                        if (averagePrice > Price.unwrap(_trade.price)) {
                            revert ExecutedAveragePriceGreaterThanSpecified(Price.wrap(averagePrice), _trade.price);
                        }
                        weth.transferFrom(msg.sender, owner, totalWETHTokens);
                        IERC20(Token.unwrap(offer.token)).transferFrom(owner, msg.sender, totalTokens);
                    }
                    emit Traded20(_trade.offerKey, Account.wrap(msg.sender), Account.wrap(owner), offer.token, buySell, prices_, tokens_, Price.wrap(uint128(averagePrice)), Unixtime.wrap(uint40(block.timestamp)));
                }
            } else if (tokenType == TokenType.ERC721) {
                Offer721 storage offer = offer721s[offerKey];
                if (Token.unwrap(offer.token) == address(0)) {
                    revert InvalidOfferKey(offerKey);
                }
                if (Nonce.unwrap(offer.nonce) != Nonce.unwrap(nonce)) {
                    revert InvalidOffer(offer.nonce, nonce);
                }
                if (Unixtime.unwrap(offer.expiry) != 0 && block.timestamp > Unixtime.unwrap(offer.expiry)) {
                    revert OfferExpired(offerKey, offer.expiry);
                }
                if (Count.unwrap(offer.count) < _trade.inputs.length) {
                    revert InsufficentCountRemaining(Count.wrap(uint16(_trade.inputs.length)), offer.count);
                }
                if (Count.unwrap(offer.count) != type(uint16).max) {
                    offer.count = Count.wrap(Count.unwrap(offer.count) + 1);
                }
                uint totalPrice;
                uint[] memory prices_ = new uint[](_trade.inputs.length);
                uint[] memory tokenIds_ = new uint[](_trade.inputs.length);
                for (uint j = 0; j < _trade.inputs.length; j++) {
                    // uint256 tokenId = _trade.inputs[j];
                    // - prices[price0], tokenIds[]
                    // - prices[price0], tokenIds[tokenId0, tokenId1, ...]
                    // - prices[price0, price1, ...], tokenIds[tokenId0, tokenId1, ...]
                    uint price;
                    if (offer.tokenIds.length > 0) {
                        uint index = ArraySearch.includesTokenId(offer.tokenIds, TokenId.wrap(_trade.inputs[j]));
                        // console.log("        >        tokenId/index", tokenId, index);
                        if (index == type(uint).max) {
                            revert InvalidTokenId(TokenId.wrap(_trade.inputs[j]));
                        }
                        if (offer.prices.length == offer.tokenIds.length) {
                            price = Price.unwrap(offer.prices[index]);
                        } else {
                            price = Price.unwrap(offer.prices[0]);
                        }
                    } else {
                        price = Price.unwrap(offer.prices[0]);
                    }
                    prices_[j] = price;
                    tokenIds_[j] = _trade.inputs[j];
                    totalPrice += price;
                    if (buySell == BuySell.BUY) {
                        // console.log("        >        msg.sender SELL/owner BUY tokenId/count/price", tokenId, uint256(Count.unwrap(offer.count)), price);
                        IERC721Partial(Token.unwrap(offer.token)).transferFrom(msg.sender, owner, _trade.inputs[j]);
                    } else {
                        // console.log("        >        msg.sender BUY/owner SELL tokenId/count/price", tokenId, uint256(Count.unwrap(offer.count)), price);
                        IERC721Partial(Token.unwrap(offer.token)).transferFrom(owner, msg.sender, _trade.inputs[j]);
                    }
                }
                if (buySell == BuySell.BUY) {
                    // console.log("        >        msg.sender SELL/owner BUY totalPrice", totalPrice);
                    if (totalPrice < Price.unwrap(_trade.price)) {
                        revert ExecutedTotalPriceLessThanSpecified(Price.wrap(uint128(totalPrice)), _trade.price);
                    }
                    weth.transferFrom(owner, msg.sender, totalPrice);
                } else {
                    // console.log("        >        msg.sender BUY/owner SELL totalPrice", totalPrice);
                    if (totalPrice > Price.unwrap(_trade.price)) {
                        revert ExecutedTotalPriceGreaterThanSpecified(Price.wrap(uint128(totalPrice)), _trade.price);
                    }
                    weth.transferFrom(msg.sender, owner, totalPrice);
                }
                emit Traded721(offerKey, Account.wrap(msg.sender), Account.wrap(owner), offer.token, buySell, prices_, tokenIds_, Price.wrap(uint128(totalPrice)), Unixtime.wrap(uint40(block.timestamp)));
            } else if (tokenType == TokenType.ERC1155) {
                Offer1155 memory offer = offer1155s[offerKey];
                if (Token.unwrap(offer.token) == address(0)) {
                    revert InvalidOfferKey(offerKey);
                }
                if (Nonce.unwrap(offer.nonce) != Nonce.unwrap(nonce)) {
                    revert InvalidOffer(offer.nonce, nonce);
                }
                if (Unixtime.unwrap(offer.expiry) != 0 && block.timestamp > Unixtime.unwrap(offer.expiry)) {
                    revert OfferExpired(offerKey, offer.expiry);
                }
                {
                    uint totalCount;
                    for (uint j = 0; j < _trade.inputs.length; j += 2) {
                        totalCount += _trade.inputs[j+1];
                    }
                    if (Count.unwrap(offer.count) < totalCount) {
                        revert InsufficentCountRemaining(Count.wrap(uint16(totalCount)), offer.count);
                    }
                    if (Count.unwrap(offer.count) != type(uint16).max) {
                        offer.count = Count.wrap(Count.unwrap(offer.count) + 1);
                    }
                }
                uint totalPrice;
                uint[] memory prices_ = new uint[](_trade.inputs.length / 2);
                uint[] memory tokenIds_ = new uint[](_trade.inputs.length / 2);
                uint[] memory tokenss_ = new uint[](_trade.inputs.length / 2);
                for (uint j = 0; j < _trade.inputs.length; j += 2) {
                    // uint256 tokenId = _trade.inputs[j];
                    // - prices[price0], tokenIds[], tokenss[]
                    // - prices[price0], tokenIds[tokenId0, tokenId1, ...], tokenss[tokens0, tokens1, ...]
                    // - prices[price0, price1, ...], tokenIds[tokenId0, tokenId1, ...], tokenss[tokens0, tokens1, ...]
                    uint price;
                    if (offer.tokenIds.length > 0) {
                        uint index = ArraySearch.includesTokenId(offer.tokenIds, TokenId.wrap(_trade.inputs[j]));
                        // console.log("        >        tokenId/index", tokenId, index);
                        if (index == type(uint).max) {
                            revert InvalidTokenId(TokenId.wrap(_trade.inputs[j]));
                        }
                        if (offer.prices.length == offer.tokenIds.length) {
                            price = Price.unwrap(offer.prices[index]);
                        } else {
                            price = Price.unwrap(offer.prices[0]);
                        }
                    } else {
                        price = Price.unwrap(offer.prices[0]);
                    }
                    // Check individual tokens
                    prices_[j/2] = price;
                    tokenIds_[j/2] = _trade.inputs[j];
                    tokenss_[j/2] = _trade.inputs[j+1];
                    totalPrice += price * _trade.inputs[j+1];
                    if (buySell == BuySell.BUY) {
                        // console.log("        >        msg.sender SELL/owner BUY tokenId/count/price", tokenId, uint256(Count.unwrap(offer.count)), price);
                        IERC1155Partial(Token.unwrap(offer.token)).safeTransferFrom(msg.sender, owner, _trade.inputs[j], _trade.inputs[j+1], "");
                    } else {
                        // console.log("        >        msg.sender BUY/owner SELL tokenId/count/price", tokenId, uint256(Count.unwrap(offer.count)), price);
                        IERC1155Partial(Token.unwrap(offer.token)).safeTransferFrom(owner, msg.sender, _trade.inputs[j], _trade.inputs[j+1], "");
                    }
                }
                if (buySell == BuySell.BUY) {
                    // console.log("        >        msg.sender SELL/owner BUY totalPrice", totalPrice);
                    if (totalPrice < Price.unwrap(_trade.price)) {
                        revert ExecutedTotalPriceLessThanSpecified(Price.wrap(uint128(totalPrice)), _trade.price);
                    }
                    weth.transferFrom(owner, msg.sender, totalPrice);
                } else {
                    // console.log("        >        msg.sender BUY/owner SELL totalPrice", totalPrice);
                    if (totalPrice > Price.unwrap(_trade.price)) {
                        revert ExecutedTotalPriceGreaterThanSpecified(Price.wrap(uint128(totalPrice)), _trade.price);
                    }
                    weth.transferFrom(msg.sender, owner, totalPrice);
                }
                emit Traded1155(offerKey, Account.wrap(msg.sender), Account.wrap(owner), offer.token, buySell, prices_, tokenIds_, tokenss_, Price.wrap(uint128(totalPrice)), Unixtime.wrap(uint40(block.timestamp)));
            }
        }
    }

    function makeOfferKey(OfferInput memory offerInput, TokenType tokenType) internal view returns (OfferKey offerKey) {
        bytes32 hash = keccak256(abi.encodePacked(offerInput.token, offerInput.buySell, offerInput.pricing, offerInput.expiry, block.timestamp));
        hash = bytes32(((uint(hash) >> 4) << 4) + (uint(tokenType) * 2) + uint(offerInput.buySell));
        return OfferKey.wrap(hash);
    }

    function _supportsInterface(Token token, bytes4 _interface) internal view returns (bool b) {
        try IERC165(Token.unwrap(token)).supportsInterface(_interface) returns (bool _b) {
            b = _b;
        } catch {
        }
    }

    function _decimals(Token token) internal view returns (uint8 __d) {
        try IERC20(Token.unwrap(token)).decimals() returns (uint8 _d) {
            __d = _d;
        } catch {
            if (Token.unwrap(token) == Token.unwrap(THEDAO)) {
                return 16;
            } else {
                __d = type(uint8).max;
            }
        }
    }

    function _getTokenType(Token token) internal returns (TokenType _tokenType) {
        // uint startGas = gasleft();
        _tokenType = tokenTypes[token];
        if (_tokenType == TokenType.UNKNOWN) {
            if (Token.unwrap(token).code.length > 0) {
                if (_supportsInterface(token, ERC721_INTERFACE)) {
                    _tokenType = TokenType.ERC721;
                } else if (_supportsInterface(token, ERC1155_INTERFACE)) {
                    _tokenType = TokenType.ERC1155;
                } else {
                    if (_decimals(token) != type(uint8).max) {
                        _tokenType = TokenType.ERC20;
                    } else {
                        _tokenType = TokenType.INVALID;
                    }
                }
            } else {
                _tokenType = TokenType.INVALID;
            }
            tokenTypes[token] = _tokenType;
        }
        // uint usedGas = startGas - gasleft();
        // console.log("        > _getTokenType()", Token.unwrap(token), uint(_tokenType), usedGas);
    }
}

/// @notice TokenAgent factory
contract TokenAgentFactory is CloneFactory {
    TokenAgent public tokenAgentTemplate;

    IERC20 public weth;
    TokenAgent[] public tokenAgents;
    mapping(address => TokenAgent[]) public tokenAgentsByOwners;

    event NewTokenAgent(TokenAgent indexed tokenAgent, address indexed owner, uint indexed index, Unixtime timestamp);

    constructor(IERC20 _weth) {
        tokenAgentTemplate = new TokenAgent();
        weth = _weth;
    }

    function tokenAgentsLength(address owner) public view returns (uint){
        return tokenAgentsByOwners[owner].length;
    }

    function newTokenAgent() public {
        TokenAgent tokenAgent = TokenAgent(createClone(address(tokenAgentTemplate)));
        tokenAgent.init(weth, msg.sender);
        tokenAgents.push(tokenAgent);
        tokenAgentsByOwners[msg.sender].push(tokenAgent);
        emit NewTokenAgent(tokenAgent, msg.sender, tokenAgentsByOwners[msg.sender].length - 1, Unixtime.wrap(uint40(block.timestamp)));
    }

}
