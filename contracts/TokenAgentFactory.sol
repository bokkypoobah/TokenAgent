pragma solidity ^0.8.24;

// ----------------------------------------------------------------------------
// TokenAgent with factory v0.8.1 testing
//
// https://github.com/bokkypoobah/TokenAgent
//
// Deployed to Sepolia
// - WETH 0x07391dbE03e7a0DEa0fce6699500da081537B6c3
// - TokenAgent template
// - TokenAgentFactory
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
    function transferFrom(address from, address to, uint tokenId) external;
}

interface IERC1155Partial {
    function safeTransferFrom(address from, address to, uint id, uint amount, bytes calldata data) external;
}

type Account is address; // 2^160
type Count is uint16;    // 2^16  = 65,536
type Index is uint32;    // 2^32  = 4,294,967,296
type Nonce is uint32;    // 2^32  = 4,294,967,296
type Price is uint128;   // 2^128 = 340, 282,366,920,938,463,463, 374,607,431,768,211,456
type Token is address;   // 2^160
type TokenId is uint;    // 2^256 = 115,792, 089,237,316,195,423,570, 985,008,687,907,853,269, 984,665,640,564,039,457, 584,007,913,129,639,936
type Tokens is uint128;  // 2^128 = 340, 282,366,920,938,463,463, 374,607,431,768,211,456
type Unixtime is uint40; // 2^40  = 1,099,511,627,776. For Unixtime, 1,099,511,627,776 seconds = 34865.285000507356672 years

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
    Account public owner;
    Account public pendingOwner;

    event OwnershipTransferStarted(Account indexed previousOwner, Account indexed newOwner, Unixtime timestamp);
    event OwnershipTransferred(Account indexed previousOwner, Account indexed newOwner, Unixtime timestamp);

    error AlreadyInitialised();
    error NotOwner();
    error Owner();
    error NotNewOwner();

    modifier onlyOwner {
        if (msg.sender != Account.unwrap(owner)) {
            revert NotOwner();
        }
        _;
    }
    modifier notOwner {
        if (msg.sender == Account.unwrap(owner)) {
            revert Owner();
        }
        _;
    }

    function initOwned(Account _owner) internal {
        if (Account.unwrap(owner) != address(0)) {
            revert AlreadyInitialised();
        }
        owner = _owner;
    }
    function transferOwnership(Account _pendingOwner) public onlyOwner {
        pendingOwner = _pendingOwner;
        emit OwnershipTransferStarted(owner, _pendingOwner, Unixtime.wrap(uint40(block.timestamp)));
    }
    function acceptOwnership() public {
        if (msg.sender != Account.unwrap(pendingOwner)) {
            revert NotNewOwner();
        }
        emit OwnershipTransferred(owner, pendingOwner, Unixtime.wrap(uint40(block.timestamp)));
        owner = pendingOwner;
        pendingOwner = Account.wrap(address(0));
    }
}

/// @notice Reentrancy guard
contract NonReentrancy {
    modifier nonReentrant() {
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

/// @notice Token information
contract TokenInfo {
    mapping(Token => TokenType) tokenTypes;

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

/// @notice User owned TokenAgent
contract TokenAgent is TokenInfo, Owned, NonReentrancy {

    struct OrderInput {
        Token token;         // 160 bits
        BuySell buySell;     // 8 bits
        Pricing pricing;     // 8 bits
        Unixtime expiry;     // 40 bits
        Count count;         // 16 bits
        uint[] data;
    }
    struct Offer {
        Token token;         // 160 bits
        BuySell buySell;     // 8 bits
        Unixtime expiry;     // 40 bits
        Nonce nonce;         // 32 bits
        Count count;         // 16 bits
        Price[] prices;      // token/WETH 18dp
        TokenId[] tokenIds;  // ERC-721/1155
        Tokens[] tokenss;    // ERC-20/1155
        Tokens[] useds;      // ERC-20
    }
    struct OfferInfo {
        uint index;
        Token token;
        TokenType tokenType;
        BuySell buySell;
        Unixtime expiry;
        Nonce nonce;
        Count count;
        Price[] prices;
        TokenId[] tokenIds;
        Tokens[] tokenss;
        Tokens[] useds;
    }
    struct TradeInput {
        Index index;         // 32 bits
        Price price;         // 128 bits min - ERC-20 max average when buying, min average when selling; ERC-721/1155 max total price when buying, min total price when selling
        Execution execution; // 8 bits - ERC-20 unused; ERC-721 single price or multiple prices
        uint[] data;
    }

    IERC20 public weth;
    Nonce public nonce;
    Offer[] public offers;

    event Offered(Index index, Account indexed maker, Token indexed token, TokenType tokenType, BuySell buySell, Unixtime expiry, Nonce nonce, Count count, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
    event OffersInvalidated(Nonce newNonce, Unixtime timestamp);
    event Traded(Index index, Account indexed taker, Account indexed maker, Token indexed token, TokenType tokenType, BuySell makerBuySell, uint[] prices, uint[] tokenIds, uint[] tokenss, Price price, Unixtime timestamp);

    error CannotOfferWETH();
    error ExecutedAveragePriceGreaterThanSpecified(Price executedAveragePrice, Price tradeAveragePrice);
    error ExecutedAveragePriceLessThanSpecified(Price executedAveragePrice, Price tradeAveragePrice);
    error ExecutedTotalPriceGreaterThanSpecified(Price executedTotalPrice, Price tradeTotalPrice);
    error ExecutedTotalPriceLessThanSpecified(Price executedTotalPrice, Price tradeTotalPrice);
    error InsufficentTokensRemaining(Tokens tokensRequested, Tokens tokensRemaining);
    error InsufficentCountRemaining(Count requested, Count remaining);
    error InvalidInputData(string reason);
    error InvalidOffer(Nonce offerNonce, Nonce currentNonce);
    error InvalidIndex(Index index);
    error InvalidToken(Token token);
    error InvalidTokenId(TokenId tokenId);
    error OfferExpired(Index index, Unixtime expiry);
    error TokenIdsMustBeSortedWithNoDuplicates();

    constructor() {
    }

    function init(IERC20 _weth, Account owner) external {
        super.initOwned(owner);
        weth = _weth;
    }
    function invalidateOrders() external onlyOwner {
        nonce = Nonce.wrap(Nonce.unwrap(nonce) + 1);
        emit OffersInvalidated(nonce, Unixtime.wrap(uint40(block.timestamp)));
    }

    // input.data:
    // ERC-20
    //   [price0, tokens0, price1, tokens1, ...]
    //     -> count n/a, prices[price0, price1, ...], tokenIds[], tokens [tokens0, tokens1, ...]
    // ERC-721
    //   Single price: [price0] - b/s count @ price0 with any tokenId
    //     -> count, prices[price0], tokenIds[], tokens[]
    //   Single price: [price0, tokenId0, tokenId1, ...] - b/s count @ price0 with specified tokenIds
    //     -> count, prices[price0], tokenIds[tokenId0, tokenId1], tokens[]
    //   Multiple prices: [price0, tokenId0, price1, tokenId1, ...] - b/s individual tokenIds with specified prices
    //     -> count, prices[price0, price1, ...], tokenIds[tokenId0, tokenId1, ...], tokens[]
    // ERC-1155
    //   Single price: [price0] - b/s count @ price0 with any tokenId and any tokens
    //     -> count, prices[price0], tokenIds[], tokenss[]
    //   Single price: [price0, tokenId0, tokens0, tokenId1, tokens1, ...] - b/s count @ price0 with specified tokenIds and tokens
    //     -> count, prices[price0], tokenIds[tokenId0, tokenId1, ...], tokenss[tokens0, tokens1, ...]
    //   Multiple prices: [price0, tokenId0, tokens0, price1, tokenId1, tokens1, ...] - b/s individual tokenIds and tokens with specified prices
    //     -> count, prices[price0, price1, ...], tokenIds[tokenId0, tokenId1, ...], tokenss[tokens0, tokens1, ...]
    function addOffers(OrderInput[] calldata inputs) external onlyOwner {
        for (uint i = 0; i < inputs.length; i++) {
            OrderInput memory input = inputs[i];
            TokenType tokenType = _getTokenType(input.token);
            Offer storage offer = offers.push();
            uint index = offers.length - 1;
            if (tokenType == TokenType.INVALID) {
                revert InvalidToken(input.token);
            }
            if (Token.unwrap(input.token) == address(weth)) {
                revert CannotOfferWETH();
            }
            offer.token = input.token;
            offer.buySell = input.buySell;
            offer.expiry = input.expiry;
            offer.nonce = nonce;
            offer.count = input.count;
            if (tokenType == TokenType.ERC20) {
                if (input.data.length == 0 || (input.data.length % 2) != 0) {
                    revert InvalidInputData("length");
                }
                for (uint j = 0; j < input.data.length; j += 2) {
                    offer.prices.push(Price.wrap(uint128(input.data[j])));
                    offer.tokenss.push(Tokens.wrap(uint128(input.data[j + 1])));
                    offer.useds.push();
                }
                emit Offered(Index.wrap(uint32(index)), Account.wrap(msg.sender), input.token, tokenType, input.buySell, input.expiry, nonce, Count.wrap(0), offer.prices, offer.tokenIds, offer.tokenss, Unixtime.wrap(uint40(block.timestamp)));
            } else if (tokenType == TokenType.ERC721) {
                if (input.data.length == 0) {
                    revert InvalidInputData("zero length");
                }
                if (input.pricing == Pricing.SINGLE) {
                    // if (input.data[1] >= type(uint16).max) {
                    //     revert InvalidInputData("count must be < 65535");
                    // }
                    if (input.data.length < 1) {
                        revert InvalidInputData("length < 1");
                    }
                    offer.prices.push(Price.wrap(uint128(input.data[0])));
                    // offer.count = Count.wrap(uint16(input.data[1]));
                    for (uint j = 1; j < input.data.length; j++) {
                        offer.tokenIds.push(TokenId.wrap(input.data[j]));
                    }
                } else {
                    if ((input.data.length % 2) != 0) {
                        revert InvalidInputData("length not even");
                    }
                    for (uint j = 0; j < input.data.length; j += 2) {
                        offer.prices.push(Price.wrap(uint128(input.data[j])));
                        offer.tokenIds.push(TokenId.wrap(input.data[j+1]));
                    }
                }
                if (offer.tokenIds.length > 1) {
                    for (uint j = 1; j < offer.tokenIds.length; j++) {
                        if (TokenId.unwrap(offer.tokenIds[j - 1]) >= TokenId.unwrap(offer.tokenIds[j])) {
                            revert TokenIdsMustBeSortedWithNoDuplicates();
                        }
                    }
                }
                emit Offered(Index.wrap(uint32(index)), Account.wrap(msg.sender), input.token, tokenType, input.buySell, input.expiry, nonce, offer.count, offer.prices, offer.tokenIds, offer.tokenss, Unixtime.wrap(uint40(block.timestamp)));
            } else if (tokenType == TokenType.ERC1155) {
                if (input.data.length == 0) {
                    revert InvalidInputData("zero length");
                }
                if (input.pricing == Pricing.SINGLE) {
                    if (input.data.length < 1) {
                        revert InvalidInputData("length < 1");
                    }
                    if ((input.data.length % 2) != 1) {
                        revert InvalidInputData("length not odd");
                    }
                    offer.prices.push(Price.wrap(uint128(input.data[0])));
                    for (uint j = 1; j < input.data.length; j += 2) {
                        offer.tokenIds.push(TokenId.wrap(input.data[j]));
                        offer.tokenss.push(Tokens.wrap(uint128(input.data[j+1])));
                        offer.useds.push();
                    }
                } else {
                    if ((input.data.length % 3) != 0) {
                        revert InvalidInputData("length not divisible by 3");
                    }
                    for (uint j = 0; j < input.data.length; j += 3) {
                        offer.prices.push(Price.wrap(uint128(input.data[j])));
                        offer.tokenIds.push(TokenId.wrap(input.data[j+1]));
                        offer.useds.push();
                    }
                }
                emit Offered(Index.wrap(uint32(index)), Account.wrap(msg.sender), input.token, tokenType, input.buySell, input.expiry, nonce, offer.count, offer.prices, offer.tokenIds, offer.tokenss, Unixtime.wrap(uint40(block.timestamp)));
            }
        }
    }

    // input.data:
    // ERC-20
    //   prices[price0], tokenIds[], tokenss[]
    //   prices[price0], tokenIds[], tokenss[tokens0, tokens1, ...]
    //   prices[price0, price1, ...], tokenIds[], tokenss[tokens0, tokens1, ...]
    // ERC-721
    //   prices[price0], tokenIds[], tokenss[]
    //   prices[price0], tokenIds[tokenId0, tokenId1, ...], tokenss[]
    //   prices[price0, price1, ...], tokenIds[tokenId0, tokenId1, ...], tokenss[]
    // ERC-1155
    //   prices[price0], tokenIds[], tokenss[]
    //   prices[price0], tokenIds[tokenId0, tokenId1, ...], tokenss[]
    //   prices[price0, price1, ...], tokenIds[tokenId0, tokenId1, ...], tokenss[tokens0, tokens1, ...]
    struct OrderInputNew {
        Token token;         // 160 bits
        BuySell buySell;     // 8 bits
        Pricing pricing;     // 8 bits
        Unixtime expiry;     // 40 bits
        Count count;         // 16 bits
        Price[] prices;      // token/WETH 18dp
        TokenId[] tokenIds;  // ERC-721/1155
        Tokens[] tokenss;    // ERC-20/1155
    }
    function addOffersNew(OrderInputNew[] calldata inputs) external onlyOwner {
        for (uint i = 0; i < inputs.length; i++) {
            OrderInputNew memory input = inputs[i];
            TokenType tokenType = _getTokenType(input.token);
            Offer storage offer = offers.push();
            uint index = offers.length - 1;
            if (tokenType == TokenType.INVALID) {
                revert InvalidToken(input.token);
            }
            if (Token.unwrap(input.token) == address(weth)) {
                revert CannotOfferWETH();
            }
            offer.token = input.token;
            offer.buySell = input.buySell;
            offer.expiry = input.expiry;
            offer.nonce = nonce;
            offer.count = input.count;
            if (tokenType == TokenType.ERC20) {
                if (input.prices.length == 0) {
                    revert InvalidInputData("prices array must contain at least one price");
                } else if (input.prices.length != 1 && input.tokenss.length != input.prices.length) {
                    revert InvalidInputData("tokenss array length must match prices array length");
                }
                offer.prices = input.prices;
                offer.tokenss = input.tokenss;
                for (uint j = 0; j < input.prices.length; j++) {
                    offer.useds.push();
                }
                emit Offered(Index.wrap(uint32(index)), Account.wrap(msg.sender), input.token, tokenType, input.buySell, input.expiry, nonce, Count.wrap(0), offer.prices, offer.tokenIds, offer.tokenss, Unixtime.wrap(uint40(block.timestamp)));
            } else if (tokenType == TokenType.ERC721) {
                if (input.prices.length == 0) {
                    revert InvalidInputData("prices array must contain at least one price");
                } else if (input.prices.length != 1 && input.tokenIds.length != input.prices.length) {
                    revert InvalidInputData("tokenIds array length must match prices array length");
                }
                offer.prices = input.prices;
                offer.tokenIds = input.tokenIds;
                if (offer.tokenIds.length > 1) {
                    for (uint j = 1; j < offer.tokenIds.length; j++) {
                        if (TokenId.unwrap(offer.tokenIds[j - 1]) >= TokenId.unwrap(offer.tokenIds[j])) {
                            revert TokenIdsMustBeSortedWithNoDuplicates();
                        }
                    }
                }

                // if (input.data.length == 0) {
                //     revert InvalidInputData("zero length");
                // }
                // if (input.pricing == Pricing.SINGLE) {
                //     // if (input.data[1] >= type(uint16).max) {
                //     //     revert InvalidInputData("count must be < 65535");
                //     // }
                //     if (input.data.length < 1) {
                //         revert InvalidInputData("length < 1");
                //     }
                //     offer.prices.push(Price.wrap(uint128(input.data[0])));
                //     // offer.count = Count.wrap(uint16(input.data[1]));
                //     for (uint j = 1; j < input.data.length; j++) {
                //         offer.tokenIds.push(TokenId.wrap(input.data[j]));
                //     }
                // } else {
                //     if ((input.data.length % 2) != 0) {
                //         revert InvalidInputData("length not even");
                //     }
                //     for (uint j = 0; j < input.data.length; j += 2) {
                //         offer.prices.push(Price.wrap(uint128(input.data[j])));
                //         offer.tokenIds.push(TokenId.wrap(input.data[j+1]));
                //     }
                // }
                emit Offered(Index.wrap(uint32(index)), Account.wrap(msg.sender), input.token, tokenType, input.buySell, input.expiry, nonce, offer.count, offer.prices, offer.tokenIds, offer.tokenss, Unixtime.wrap(uint40(block.timestamp)));
            } else if (tokenType == TokenType.ERC1155) {
                if (input.prices.length == 0) {
                    revert InvalidInputData("prices array must contain at least one price");
                } else if (input.prices.length != 1 && (input.tokenIds.length != input.prices.length || input.tokenss.length != input.prices.length)) {
                    revert InvalidInputData("tokenIds and tokenss array length must match prices array length");
                }
                offer.prices = input.prices;
                offer.tokenIds = input.tokenIds;
                offer.tokenss = input.tokenss;
                for (uint j = 0; j < input.tokenIds.length; j++) {
                    offer.useds.push();
                }
                if (offer.tokenIds.length > 1) {
                    for (uint j = 1; j < offer.tokenIds.length; j++) {
                        if (TokenId.unwrap(offer.tokenIds[j - 1]) >= TokenId.unwrap(offer.tokenIds[j])) {
                            revert TokenIdsMustBeSortedWithNoDuplicates();
                        }
                    }
                }
                // if (input.data.length == 0) {
                //     revert InvalidInputData("zero length");
                // }
                // if (input.pricing == Pricing.SINGLE) {
                //     if (input.data.length < 1) {
                //         revert InvalidInputData("length < 1");
                //     }
                //     if ((input.data.length % 2) != 1) {
                //         revert InvalidInputData("length not odd");
                //     }
                //     offer.prices.push(Price.wrap(uint128(input.data[0])));
                //     for (uint j = 1; j < input.data.length; j += 2) {
                //         offer.tokenIds.push(TokenId.wrap(input.data[j]));
                //         offer.tokenss.push(Tokens.wrap(uint128(input.data[j+1])));
                //         offer.useds.push();
                //     }
                // } else {
                //     if ((input.data.length % 3) != 0) {
                //         revert InvalidInputData("length not divisible by 3");
                //     }
                //     for (uint j = 0; j < input.data.length; j += 3) {
                //         offer.prices.push(Price.wrap(uint128(input.data[j])));
                //         offer.tokenIds.push(TokenId.wrap(input.data[j+1]));
                //         offer.useds.push();
                //     }
                // }
                emit Offered(Index.wrap(uint32(index)), Account.wrap(msg.sender), input.token, tokenType, input.buySell, input.expiry, nonce, offer.count, offer.prices, offer.tokenIds, offer.tokenss, Unixtime.wrap(uint40(block.timestamp)));
            }
        }
    }

    function updateOffer(/*OfferUpdate[] calldata _offerOpdates*/) external onlyOwner {
        // TODO: Update offer.tokenIds, offer.tokenss, price, expiry?
    }

    function trade(TradeInput[] calldata inputs) external nonReentrant notOwner {
        for (uint i = 0; i < inputs.length; i++) {
            TradeInput memory input = inputs[i];
            uint index = Index.unwrap(input.index);
            if (index >= offers.length) {
                revert InvalidIndex(Index.wrap(uint32(index)));
            }
            Offer storage offer = offers[index];
            TokenType tokenType = _getTokenType(offer.token);
            if (Nonce.unwrap(offer.nonce) != Nonce.unwrap(nonce)) {
                revert InvalidOffer(offer.nonce, nonce);
            }
            if (Unixtime.unwrap(offer.expiry) != 0 && block.timestamp > Unixtime.unwrap(offer.expiry)) {
                revert OfferExpired(Index.wrap(uint32(index)), offer.expiry);
            }
            uint price;
            uint[] memory prices_;
            uint[] memory tokenIds_;
            uint[] memory tokenss_;
            if (tokenType == TokenType.ERC20) {
                if (input.data.length != 1) {
                    revert InvalidInputData("Expecting single price input");
                }
                uint128 tokens = uint128(input.data[0]);
                uint128 totalTokens;
                uint128 totalWETHTokens;
                prices_ = new uint[](offer.prices.length);
                tokenIds_ = new uint[](0);
                tokenss_ = new uint[](offer.prices.length);
                uint k;
                for (uint j = 0; j < offer.prices.length && tokens > 0; j++) {
                    uint128 _price = Price.unwrap(offer.prices[j]);
                    uint128 _remaining = Tokens.unwrap(offer.tokenss[j]) - Tokens.unwrap(offer.useds[j]);
                    if (_remaining > 0) {
                        if (tokens >= _remaining) {
                            tokens -= _remaining;
                            totalTokens += _remaining;
                            offer.useds[j] = Tokens.wrap(Tokens.unwrap(offer.useds[j]) + _remaining);
                            prices_[k] = _price;
                            tokenss_[k] = _remaining;
                            totalWETHTokens += _remaining * _price / 10**18;
                        } else {
                            totalTokens += tokens;
                            offer.useds[j] = Tokens.wrap(Tokens.unwrap(offer.useds[j]) + tokens);
                            prices_[k] = _price;
                            tokenss_[k] = tokens;
                            totalWETHTokens += tokens * _price / 10**18;
                            tokens = 0;
                        }
                        k++;
                    }
                }
                if (input.execution == Execution.FILLORKILL && totalTokens < input.data[0]) {
                    revert InsufficentTokensRemaining(Tokens.wrap(uint128(input.data[0])), Tokens.wrap(totalTokens));
                }
                if (totalTokens > 0) {
                    price = totalWETHTokens * 10**18 / totalTokens;
                    if (offer.buySell == BuySell.BUY) {
                        if (price < Price.unwrap(input.price)) {
                            revert ExecutedAveragePriceLessThanSpecified(Price.wrap(uint128(price)), input.price);
                        }
                        IERC20(Token.unwrap(offer.token)).transferFrom(msg.sender, Account.unwrap(owner), totalTokens);
                        weth.transferFrom(Account.unwrap(owner), msg.sender, totalWETHTokens);
                    } else {
                        if (price > Price.unwrap(input.price)) {
                            revert ExecutedAveragePriceGreaterThanSpecified(Price.wrap(uint128(price)), input.price);
                        }
                        weth.transferFrom(msg.sender, Account.unwrap(owner), totalWETHTokens);
                        IERC20(Token.unwrap(offer.token)).transferFrom(Account.unwrap(owner), msg.sender, totalTokens);
                    }
                }
            } else if (tokenType == TokenType.ERC721) {
                if (Count.unwrap(offer.count) != type(uint16).max) {
                    if (Count.unwrap(offer.count) < input.data.length) {
                        revert InsufficentCountRemaining(Count.wrap(uint16(input.data.length)), offer.count);
                    }
                    offer.count = Count.wrap(Count.unwrap(offer.count) - uint16(input.data.length));
                }
                prices_ = new uint[](input.data.length);
                tokenIds_ = new uint[](input.data.length);
                tokenss_ = new uint[](0);
                for (uint j = 0; j < input.data.length; j++) {
                    // - prices[price0], tokenIds[]
                    // - prices[price0], tokenIds[tokenId0, tokenId1, ...]
                    // - prices[price0, price1, ...], tokenIds[tokenId0, tokenId1, ...]
                    uint p;
                    if (offer.tokenIds.length > 0) {
                        uint k = ArraySearch.includesTokenId(offer.tokenIds, TokenId.wrap(input.data[j]));
                        if (k == type(uint).max) {
                            revert InvalidTokenId(TokenId.wrap(input.data[j]));
                        }
                        if (offer.prices.length == offer.tokenIds.length) {
                            p = Price.unwrap(offer.prices[k]);
                        } else {
                            p = Price.unwrap(offer.prices[0]);
                        }
                    } else {
                        p = Price.unwrap(offer.prices[0]);
                    }
                    prices_[j] = p;
                    tokenIds_[j] = input.data[j];
                    price += p;
                    if (offer.buySell == BuySell.BUY) {
                        IERC721Partial(Token.unwrap(offer.token)).transferFrom(msg.sender, Account.unwrap(owner), input.data[j]);
                    } else {
                        IERC721Partial(Token.unwrap(offer.token)).transferFrom(Account.unwrap(owner), msg.sender, input.data[j]);
                    }
                }
                if (offer.buySell == BuySell.BUY) {
                    if (price < Price.unwrap(input.price)) {
                        revert ExecutedTotalPriceLessThanSpecified(Price.wrap(uint128(price)), input.price);
                    }
                    weth.transferFrom(Account.unwrap(owner), msg.sender, price);
                } else {
                    if (price > Price.unwrap(input.price)) {
                        revert ExecutedTotalPriceGreaterThanSpecified(Price.wrap(uint128(price)), input.price);
                    }
                    weth.transferFrom(msg.sender, Account.unwrap(owner), price);
                }
            } else if (tokenType == TokenType.ERC1155) {
                uint totalCount;
                for (uint j = 0; j < input.data.length; j += 2) {
                    totalCount += input.data[j+1];
                }
                if (Count.unwrap(offer.count) < totalCount) {
                    revert InsufficentCountRemaining(Count.wrap(uint16(totalCount)), offer.count);
                }
                if (Count.unwrap(offer.count) != type(uint16).max) {
                    offer.count = Count.wrap(Count.unwrap(offer.count) - uint16(totalCount));
                }
                prices_ = new uint[](input.data.length / 2);
                tokenIds_ = new uint[](input.data.length / 2);
                tokenss_ = new uint[](input.data.length / 2);
                for (uint j = 0; j < input.data.length; j += 2) {
                    // - prices[price0], tokenIds[], tokenss[]
                    // - prices[price0], tokenIds[tokenId0, tokenId1, ...], tokenss[tokens0, tokens1, ...]
                    // - prices[price0, price1, ...], tokenIds[tokenId0, tokenId1, ...], tokenss[tokens0, tokens1, ...]
                    uint p;
                    if (offer.tokenIds.length > 0) {
                        uint k = ArraySearch.includesTokenId(offer.tokenIds, TokenId.wrap(input.data[j]));
                        if (k == type(uint).max) {
                            revert InvalidTokenId(TokenId.wrap(input.data[j]));
                        }
                        if (Tokens.unwrap(offer.useds[k]) + uint128(input.data[j+1]) > Tokens.unwrap(offer.tokenss[k])) {
                            revert InsufficentCountRemaining(Count.wrap(uint16(input.data[j+1])), Count.wrap(uint16(Tokens.unwrap(offer.tokenss[k]))));
                        }
                        offer.useds[k] = Tokens.wrap(Tokens.unwrap(offer.useds[k]) + uint128(input.data[j+1]));
                        if (offer.prices.length == offer.tokenIds.length) {
                            p = Price.unwrap(offer.prices[k]);
                        } else {
                            p = Price.unwrap(offer.prices[0]);
                        }
                    } else {
                        p = Price.unwrap(offer.prices[0]);
                    }
                    prices_[j/2] = p;
                    tokenIds_[j/2] = input.data[j];
                    tokenss_[j/2] = input.data[j+1];
                    price += p * input.data[j+1];
                    if (offer.buySell == BuySell.BUY) {
                        IERC1155Partial(Token.unwrap(offer.token)).safeTransferFrom(msg.sender, Account.unwrap(owner), input.data[j], input.data[j+1], "");
                    } else {
                        IERC1155Partial(Token.unwrap(offer.token)).safeTransferFrom(Account.unwrap(owner), msg.sender, input.data[j], input.data[j+1], "");
                    }
                }
                if (offer.buySell == BuySell.BUY) {
                    if (price < Price.unwrap(input.price)) {
                        revert ExecutedTotalPriceLessThanSpecified(Price.wrap(uint128(price)), input.price);
                    }
                    weth.transferFrom(Account.unwrap(owner), msg.sender, price);
                } else {
                    if (price > Price.unwrap(input.price)) {
                        revert ExecutedTotalPriceGreaterThanSpecified(Price.wrap(uint128(price)), input.price);
                    }
                    weth.transferFrom(msg.sender, Account.unwrap(owner), price);
                }
            }
            emit Traded(Index.wrap(uint32(index)), Account.wrap(msg.sender), owner, offer.token, tokenType, offer.buySell, prices_, tokenIds_, tokenss_, Price.wrap(uint128(price)), Unixtime.wrap(uint40(block.timestamp)));
        }
    }

    function getOffersInfo(uint from, uint to) public view returns (OfferInfo[] memory results) {
        uint start = from < offers.length ? from : offers.length;
        uint end = to < offers.length ? to : offers.length;
        results = new OfferInfo[](end - start);
        uint k;
        for (uint i = from; i < to && i < offers.length; i++) {
            if (i < offers.length) {
                Offer memory offer = offers[i];
                results[k] = OfferInfo(
                    i,
                    offer.token,
                    tokenTypes[offer.token],
                    offer.buySell,
                    offer.expiry,
                    offer.nonce,
                    offer.count,
                    offer.prices,
                    offer.tokenIds,
                    offer.tokenss,
                    offer.useds
                );
                k++;
            }
        }
    }
}

/// @notice TokenAgent factory
contract TokenAgentFactory is CloneFactory {

    struct TokenAgentRecord {
        TokenAgent tokenAgent;
        Index indexByOwner;
    }
    struct TokenAgentInfo {
        Index index;
        Index indexByOwner;
        TokenAgent tokenAgent;
        Account owner;
    }

    IERC20 public weth;
    TokenAgent public tokenAgentTemplate;
    TokenAgentRecord[] public tokenAgentRecords;
    mapping(Account => Index[]) public tokenAgentIndicesByOwners;
    mapping(TokenAgent => Index) public tokenAgentIndex;

    event NewTokenAgent(TokenAgent indexed tokenAgent, Account indexed owner, Index indexed index, Index indexByOwner, Unixtime timestamp);

    error NotInitialised();

    constructor() {
        tokenAgentTemplate = new TokenAgent();
    }

    function init(IERC20 _weth, TokenAgent _tokenAgentTemplate) public {
        if (address(weth) == address(0)) {
            weth = _weth;
            tokenAgentTemplate = _tokenAgentTemplate;
        }
    }

    function tokenAgentsLength() public view returns (uint) {
        return tokenAgentRecords.length;
    }

    function tokenAgentsByOwnerLength(Account owner) public view returns (uint) {
        return tokenAgentIndicesByOwners[owner].length;
    }

    function newTokenAgent() public {
        if (address(weth) == address(0)) {
            revert NotInitialised();
        }
        TokenAgent tokenAgent = TokenAgent(createClone(address(tokenAgentTemplate)));
        tokenAgent.init(weth, Account.wrap(msg.sender));
        tokenAgentRecords.push(TokenAgentRecord(tokenAgent, Index.wrap(uint32(tokenAgentIndicesByOwners[Account.wrap(msg.sender)].length))));
        tokenAgentIndicesByOwners[Account.wrap(msg.sender)].push(Index.wrap(uint32(tokenAgentRecords.length - 1)));
        emit NewTokenAgent(tokenAgent, Account.wrap(msg.sender), Index.wrap(uint32(tokenAgentRecords.length - 1)), Index.wrap(uint32(tokenAgentIndicesByOwners[Account.wrap(msg.sender)].length - 1)), Unixtime.wrap(uint40(block.timestamp)));
    }

    function getTokenAgentsInfo(uint from, uint to) public view returns (TokenAgentInfo[] memory results) {
        uint start = from < tokenAgentRecords.length ? from : tokenAgentRecords.length;
        uint end = to < tokenAgentRecords.length ? to : tokenAgentRecords.length;
        results = new TokenAgentInfo[](end - start);
        uint k;
        for (uint i = start; i < end; i++) {
            results[k++] = TokenAgentInfo(Index.wrap(uint32(i)), tokenAgentRecords[i].indexByOwner, tokenAgentRecords[i].tokenAgent, tokenAgentRecords[i].tokenAgent.owner());
        }
    }

    function getTokenAgentsByOwnerInfo(Account owner, uint from, uint to) public view returns (TokenAgentInfo[] memory results) {
        Index[] memory indices = tokenAgentIndicesByOwners[owner];
        uint start = from < indices.length ? from : indices.length;
        uint end = to < indices.length ? to : indices.length;
        results = new TokenAgentInfo[](end - start);
        uint k;
        for (uint i = start; i < end; i++) {
            uint index = Index.unwrap(indices[i]);
            results[k++] = TokenAgentInfo(Index.wrap(uint32(index)), Index.wrap(uint32(i)), tokenAgentRecords[index].tokenAgent, tokenAgentRecords[index].tokenAgent.owner());
        }
    }
}

// ints
// 2^128 = -170, 141,183,460,469,231,731, 687,303,715,884,105,728 to 170, 141,183,460,469,231,731, 687,303,715,884,105,727
// uints
// 2^16  = 65,536
// 2^32  = 4,294,967,296
// 2^40  = 1,099,511,627,776. For Unixtime, 1,099,511,627,776 seconds = 34865.285000507356672 years
// 2^48  = 281,474,976,710,656
// 2^60  = 1, 152,921,504, 606,846,976
// 2^64  = 18, 446,744,073,709,551,616
// 2^128 = 340, 282,366,920,938,463,463, 374,607,431,768,211,456
// 2^256 = 115,792, 089,237,316,195,423,570, 985,008,687,907,853,269, 984,665,640,564,039,457, 584,007,913,129,639,936
