/**
 *Submitted for verification at Etherscan.io on 2024-09-09
*/

pragma solidity ^0.8.27;

// ----------------------------------------------------------------------------
// TokenAgent with factory v0.8.1 testing
//
// https://github.com/bokkypoobah/TokenAgent
//
// Deployed to Sepolia
// - WETH 0x07391dbE03e7a0DEa0fce6699500da081537B6c3
// - TokenAgent template 0x35e401362D24a2243b9a441542a4D4FFe50db1bF
// - TokenAgentFactory 0x81c9d0d4c60e6Ec7bb13879f703b113c930Cd914
//
// TODO:
// - FILL for ERC-721/1155?
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

interface WETH is IERC20 {
    receive() external payable;
    function deposit() external payable;
    function withdraw(uint wad) external;
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

type Account is address;  // 2^160
type Count is uint16;     // 2^16  = 65,536
type Index is uint32;     // 2^32  = 4,294,967,296
type Nonce is uint24;     // 2^24  = 16,777,216
type Price is uint128;    // 2^128 = 340, 282,366,920,938,463,463, 374,607,431,768,211,456
type Token is address;    // 2^160
type TokenId is uint;     // 2^256 = 115,792, 089,237,316,195,423,570, 985,008,687,907,853,269, 984,665,640,564,039,457, 584,007,913,129,639,936
type TokenId16 is uint16; // 2^16 = 65,536
type Tokens is uint128;   // 2^128 = 340, 282,366,920,938,463,463, 374,607,431,768,211,456
type Unixtime is uint40;  // 2^40  = 1,099,511,627,776. For Unixtime, 1,099,511,627,776 seconds = 34865.285000507356672 years

enum BuySell { BUY, SELL }
enum Execution { FILL, FILLORKILL }
enum TokenIdType { TOKENID256, TOKENID16 }
enum TokenType { UNKNOWN, ERC20, ERC721, ERC1155, INVALID }

bytes4 constant ERC721_INTERFACE = 0x80ac58cd;
bytes4 constant ERC1155_INTERFACE = 0xd9b67a26;

Token constant THEDAO = Token.wrap(0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413);

library ArrayUtils {
    function indexOfTokenIds(TokenId[] memory tokenIds, TokenId target) internal pure returns (uint) {
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
    function indexOfTokenId16s(TokenId16[] memory tokenIds, TokenId16 target) internal pure returns (uint) {
        if (tokenIds.length > 0) {
            uint left;
            uint right = tokenIds.length - 1;
            uint mid;
            while (left <= right) {
                mid = (left + right) / 2;
                if (TokenId16.unwrap(tokenIds[mid]) < TokenId16.unwrap(target)) {
                    left = mid + 1;
                } else if (TokenId16.unwrap(tokenIds[mid]) > TokenId16.unwrap(target)) {
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
    function recoverTokens(IERC20 token, Tokens tokens) public onlyOwner {
        if (address(token) == address(0)) {
            payable(msg.sender).transfer((Tokens.unwrap(tokens) == 0 ? address(this).balance : Tokens.unwrap(tokens)));
        } else {
            token.transfer(msg.sender, Tokens.unwrap(tokens) == 0 ? token.balanceOf(address(this)) : Tokens.unwrap(tokens));
        }
    }
    function recoverERC721Token(IERC721Partial token, TokenId tokenId) public onlyOwner {
        token.transferFrom(address(this), msg.sender, TokenId.unwrap(tokenId));
    }
    function recoverERC1155Token(IERC1155Partial token, TokenId tokenId, Tokens tokens) public onlyOwner {
        token.safeTransferFrom(address(this), msg.sender, TokenId.unwrap(tokenId), Tokens.unwrap(tokens), "");

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
    function _getTokenType(Token token) internal view returns (TokenType _tokenType) {
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
    }

    function getTokenTypes(Token[] memory tokens) public view returns (TokenType[] memory _tokenTypes) {
        _tokenTypes = new TokenType[](tokens.length);
        for (uint i = 0; i < tokens.length; i++) {
            _tokenTypes[i] = _getTokenType(tokens[i]);
        }
    }
}

/// @notice User owned TokenAgent
contract TokenAgent is TokenInfo, Owned, NonReentrancy {

    struct AddOffer {
        Token token;             // 160 bits
        BuySell buySell;         // 8 bits
        Unixtime expiry;         // 40 bits
        Count count;             // 16 bits
        Price[] prices;          // token/WETH 18dp
        TokenId[] tokenIds;      // ERC-721/1155
        Tokens[] tokenss;        // ERC-20/1155
    }
    struct UpdateOffer {
        Index index;             // 160 bits
        Unixtime expiry;         // 40 bits
        Count count;             // 16 bits
        Price[] prices;          // token/WETH 18dp
        TokenId[] tokenIds;      // ERC-721/1155
        Tokens[] tokenss;        // ERC-20/1155
    }
    struct Offer {
        Token token;             // 160 bits
        BuySell buySell;         // 8 bits
        Unixtime expiry;         // 40 bits
        Count count;             // 16 bits
        Nonce nonce;             // 24 bits
        TokenIdType tokenIdType; // 8 bits
        Price[] prices;          // token/WETH 18dp
        TokenId16[] tokenId16s;  // ERC-721/1155, when max[tokenIds...] < 2 ** 16
        TokenId[] tokenIds;      // ERC-721/1155, when max[tokenIds...] >= 2 ** 16
        Tokens[] tokenss;        // ERC-20/1155
        Tokens[] useds;          // ERC-20
    }
    struct OfferInfo {
        uint index;
        Token token;
        TokenType tokenType;
        BuySell buySell;
        Unixtime expiry;
        Count count;
        Nonce nonce;
        Price[] prices;
        TokenId[] tokenIds;
        Tokens[] tokenss;
        Tokens[] useds;
    }
    struct TradeInput {
        Index index;             // 32 bits
        Price price;             // 128 bits min - ERC-20 max average when buying, min average when selling; ERC-721/1155 max total price when buying, min total price when selling
        Execution execution;     // 8 bits - Only for ERC-20 - FILL or FILLORKILL
        TokenId[] tokenIds;
        Tokens[] tokenss;
    }

    WETH public weth;
    Nonce public nonce;
    Offer[] public offers;

    event InternalTransfer(address indexed from, address indexed to, uint ethers, Unixtime timestamp);
    event Offered(Index index, Account indexed maker, Token indexed token, TokenType tokenType, BuySell buySell, Unixtime expiry, Count count, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
    event OfferUpdated(Index index, Account indexed maker, Token indexed token, TokenType tokenType, BuySell buySell, Unixtime expiry, Count count, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
    event OffersInvalidated(Nonce newNonce, Unixtime timestamp);
    event Traded(Index index, Account indexed taker, Account indexed maker, Token indexed token, TokenType tokenType, BuySell makerBuySell, uint[] prices, uint[] tokenIds, uint[] tokenss, Price price, Unixtime timestamp);

    error CannotOfferWETH();
    error ExecutedAveragePriceGreaterThanSpecified(Price executedAveragePrice, Price tradeAveragePrice);
    error ExecutedAveragePriceLessThanSpecified(Price executedAveragePrice, Price tradeAveragePrice);
    error ExecutedTotalPriceGreaterThanSpecified(Price executedTotalPrice, Price tradeTotalPrice);
    error ExecutedTotalPriceLessThanSpecified(Price executedTotalPrice, Price tradeTotalPrice);
    error InsufficentEthersRemaining(uint ethersRequested, uint ethersRemaining);
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

    function init(WETH _weth, Account owner) external {
        super.initOwned(owner);
        weth = _weth;
    }
    function invalidateOrders() external onlyOwner {
        nonce = Nonce.wrap(Nonce.unwrap(nonce) + 1);
        emit OffersInvalidated(nonce, Unixtime.wrap(uint40(block.timestamp)));
    }

    // AddOffer:
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
    function addOffers(AddOffer[] calldata inputs) external onlyOwner {
        for (uint i = 0; i < inputs.length; i++) {
            AddOffer memory input = inputs[i];
            TokenType tokenType = tokenTypes[input.token];
            if (Token.unwrap(input.token) == address(weth)) {
                revert CannotOfferWETH();
            }
            if (tokenType == TokenType.UNKNOWN) {
                tokenType = _getTokenType(input.token);
                if (tokenType == TokenType.INVALID) {
                    revert InvalidToken(input.token);
                }
                tokenTypes[input.token] = tokenType;
            }
            Offer storage offer = offers.push();
            offer.token = input.token;
            offer.buySell = input.buySell;
            offer.expiry = input.expiry;
            offer.count = input.count;
            offer.nonce = nonce;
            if (input.prices.length == 0) {
                revert InvalidInputData("all: prices array must contain at least one price");
            } else if (tokenType == TokenType.ERC20 && input.prices.length != 1 && input.tokenss.length != input.prices.length) {
                revert InvalidInputData("ERC-20: tokenss array length must match prices array length");
            } else if (tokenType == TokenType.ERC721 && input.prices.length != 1 && input.tokenIds.length != input.prices.length) {
                revert InvalidInputData("ERC-721: tokenIds array length must match prices array length");
            } else if (tokenType == TokenType.ERC1155 && input.tokenIds.length != input.tokenss.length) {
                revert InvalidInputData("ERC-1155: tokenIds and tokenss array length must match");
            } else if (tokenType == TokenType.ERC1155 && input.prices.length != 1 && input.tokenIds.length != input.prices.length) {
                revert InvalidInputData("ERC-1155: tokenIds and tokenss array length must match prices array length");
            }
            offer.prices = input.prices;
            if (tokenType == TokenType.ERC721 || tokenType == TokenType.ERC1155) {
                if (input.tokenIds.length > 1) {
                    for (uint j = 1; j < input.tokenIds.length; j++) {
                        if (TokenId.unwrap(input.tokenIds[j - 1]) >= TokenId.unwrap(input.tokenIds[j])) {
                            revert TokenIdsMustBeSortedWithNoDuplicates();
                        }
                    }
                }
                if (input.tokenIds.length > 0) {
                    uint maxTokenId;
                    for (uint j = 0; j < input.tokenIds.length; j++) {
                        if (maxTokenId < TokenId.unwrap(input.tokenIds[j])) {
                            maxTokenId = TokenId.unwrap(input.tokenIds[j]);
                        }
                    }
                    if (maxTokenId < 2 ** 16) {
                        offer.tokenIdType = TokenIdType.TOKENID16;
                    }
                }
                if (offer.tokenIdType == TokenIdType.TOKENID16) {
                    for (uint j = 0; j < input.tokenIds.length; j++) {
                        offer.tokenId16s.push(TokenId16.wrap(uint16(TokenId.unwrap(input.tokenIds[j]))));
                    }
                } else {
                    offer.tokenIds = input.tokenIds;
                }
            }
            if (tokenType == TokenType.ERC20 || tokenType == TokenType.ERC1155) {
                offer.tokenss = input.tokenss;
                for (uint j = 0; j < input.tokenss.length; j++) {
                    offer.useds.push();
                }
            }
            emit Offered(Index.wrap(uint32(offers.length - 1)), Account.wrap(msg.sender), offer.token, tokenType, offer.buySell, offer.expiry, offer.count, nonce, input.prices, input.tokenIds, input.tokenss, Unixtime.wrap(uint40(block.timestamp)));
        }
    }

    // Cannot update token and buySell
    function updateOffers(UpdateOffer[] calldata inputs) external onlyOwner {
        for (uint i = 0; i < inputs.length; i++) {
            UpdateOffer memory input = inputs[i];
            uint index = Index.unwrap(input.index);
            Offer storage offer = offers[index];
            offer.expiry = input.expiry;
            offer.count = input.count;
            offer.nonce = nonce;
            TokenType tokenType = tokenTypes[offer.token];
            if (input.prices.length == 0) {
                revert InvalidInputData("all: prices array must contain at least one price");
            } else if (tokenType == TokenType.ERC20 && input.prices.length != 1 && input.tokenss.length != input.prices.length) {
                revert InvalidInputData("ERC-20: tokenss array length must match prices array length");
            } else if (tokenType == TokenType.ERC721 && input.prices.length != 1 && input.tokenIds.length != input.prices.length) {
                revert InvalidInputData("ERC-721: tokenIds array length must match prices array length");
            } else if (tokenType == TokenType.ERC1155 && input.tokenIds.length != input.tokenss.length) {
                revert InvalidInputData("ERC-1155: tokenIds and tokenss array length must match");
            } else if (tokenType == TokenType.ERC1155 && input.prices.length != 1 && input.tokenIds.length != input.prices.length) {
                revert InvalidInputData("ERC-1155: tokenIds and tokenss array length must match prices array length");
            }
            offer.prices = input.prices;
            if (tokenType == TokenType.ERC721 || tokenType == TokenType.ERC1155) {
                if (input.tokenIds.length > 1) {
                    for (uint j = 1; j < input.tokenIds.length; j++) {
                        if (TokenId.unwrap(input.tokenIds[j - 1]) >= TokenId.unwrap(input.tokenIds[j])) {
                            revert TokenIdsMustBeSortedWithNoDuplicates();
                        }
                    }
                }
                if (input.tokenIds.length > 0) {
                    uint maxTokenId;
                    for (uint j = 0; j < input.tokenIds.length; j++) {
                        if (maxTokenId < TokenId.unwrap(input.tokenIds[j])) {
                            maxTokenId = TokenId.unwrap(input.tokenIds[j]);
                        }
                    }
                    if (maxTokenId < 2 ** 16) {
                        offer.tokenIdType = TokenIdType.TOKENID16;
                    }
                }
                if (offer.tokenIdType == TokenIdType.TOKENID16) {
                    for (uint j = 0; j < input.tokenIds.length; j++) {
                        offer.tokenId16s.push(TokenId16.wrap(uint16(TokenId.unwrap(input.tokenIds[j]))));
                    }
                } else {
                    offer.tokenIds = input.tokenIds;
                }
            }
            if (tokenType == TokenType.ERC20 || tokenType == TokenType.ERC1155) {
                offer.tokenss = input.tokenss;
            }
            emit OfferUpdated(Index.wrap(uint32(index)), Account.wrap(msg.sender), offer.token, tokenType, offer.buySell, offer.expiry, offer.count, nonce, input.prices, input.tokenIds, input.tokenss, Unixtime.wrap(uint40(block.timestamp)));
        }
    }

    // TradeInput:
    // ERC-20
    //   tokenIds[], tokenss[tokens0]
    // ERC-721
    //   tokenIds[tokenId0, tokenId1, ...], tokenss[]
    // ERC-1155
    //   tokenIds[tokenId0, tokenId1, ...], tokenss[tokens0, tokens1, ...]
    function trade(TradeInput[] calldata inputs, bool paymentsInEth) external payable nonReentrant notOwner {
        uint totalEth = msg.value;
        if (totalEth > 0) {
            emit InternalTransfer(msg.sender, address(this), totalEth, Unixtime.wrap(uint40(block.timestamp)));
        }
        uint takerToOwnerTotal;
        uint ownerToTakerTotal;
        for (uint i = 0; i < inputs.length; i++) {
            TradeInput memory input = inputs[i];
            if (Index.unwrap(input.index) >= offers.length) {
                revert InvalidIndex(input.index);
            }
            Offer storage offer = offers[Index.unwrap(input.index)];
            TokenType tokenType = tokenTypes[offer.token];
            if (Nonce.unwrap(offer.nonce) != Nonce.unwrap(nonce)) {
                revert InvalidOffer(offer.nonce, nonce);
            }
            if (Unixtime.unwrap(offer.expiry) != 0 && block.timestamp > Unixtime.unwrap(offer.expiry)) {
                revert OfferExpired(input.index, offer.expiry);
            }
            uint price;
            uint[] memory prices_;
            uint[] memory tokenIds_;
            uint[] memory tokenss_;
            if (tokenType == TokenType.ERC20) {
                if (input.tokenss.length != 1) {
                    revert InvalidInputData("Expecting single price input");
                }
                uint tokens = uint(Tokens.unwrap(input.tokenss[0]));
                uint totalTokens;
                uint totalWETHTokens;
                prices_ = new uint[](offer.prices.length);
                tokenIds_ = new uint[](0);
                tokenss_ = new uint[](offer.prices.length);
                uint k;
                for (uint j = 0; j < offer.prices.length && tokens > 0; j++) {
                    uint _price = Price.unwrap(offer.prices[j]);
                    if (Tokens.unwrap(offer.tokenss[j]) > Tokens.unwrap(offer.useds[j])) {
                        uint remaining = Tokens.unwrap(offer.tokenss[j]) - Tokens.unwrap(offer.useds[j]);
                        if (tokens >= remaining) {
                            totalTokens += remaining;
                            totalWETHTokens += remaining * _price / 10**18;
                            offer.useds[j] = Tokens.wrap(Tokens.unwrap(offer.useds[j]) + uint128(remaining));
                            prices_[k] = _price;
                            tokenss_[k] = remaining;
                            tokens -= remaining;
                        } else {
                            totalTokens += tokens;
                            totalWETHTokens += tokens * _price / 10**18;
                            offer.useds[j] = Tokens.wrap(Tokens.unwrap(offer.useds[j]) + uint128(tokens));
                            prices_[k] = _price;
                            tokenss_[k] = tokens;
                            tokens = 0;
                        }
                        k++;
                    }
                }
                if (input.execution == Execution.FILLORKILL && totalTokens < uint(Tokens.unwrap(input.tokenss[0]))) {
                    revert InsufficentTokensRemaining(input.tokenss[0], Tokens.wrap(uint128(totalTokens)));
                }
                if (totalTokens > 0) {
                    price = totalWETHTokens * 10**18 / totalTokens;
                    if (offer.buySell == BuySell.BUY) {
                        if (price < Price.unwrap(input.price)) {
                            revert ExecutedAveragePriceLessThanSpecified(Price.wrap(uint128(price)), input.price);
                        }
                        IERC20(Token.unwrap(offer.token)).transferFrom(msg.sender, Account.unwrap(owner), totalTokens);
                        ownerToTakerTotal += totalWETHTokens;
                    } else {
                        if (price > Price.unwrap(input.price)) {
                            revert ExecutedAveragePriceGreaterThanSpecified(Price.wrap(uint128(price)), input.price);
                        }
                        takerToOwnerTotal += totalWETHTokens;
                        IERC20(Token.unwrap(offer.token)).transferFrom(Account.unwrap(owner), msg.sender, totalTokens);
                    }
                }
            } else if (tokenType == TokenType.ERC721) {
                if (Count.unwrap(offer.count) != type(uint16).max) {
                    if (Count.unwrap(offer.count) < input.tokenIds.length) {
                        revert InsufficentCountRemaining(Count.wrap(uint16(input.tokenIds.length)), offer.count);
                    }
                    offer.count = Count.wrap(Count.unwrap(offer.count) - uint16(input.tokenIds.length));
                }
                prices_ = new uint[](input.tokenIds.length);
                tokenIds_ = new uint[](input.tokenIds.length);
                tokenss_ = new uint[](0);
                for (uint j = 0; j < input.tokenIds.length; j++) {
                    uint p;
                    if (offer.tokenIds.length > 0) {
                        uint k;
                        if (offer.tokenIdType == TokenIdType.TOKENID16) {
                            if (TokenId.unwrap(input.tokenIds[j]) < 2 ** 16) {
                                k = ArrayUtils.indexOfTokenId16s(offer.tokenId16s, TokenId16.wrap(uint16(TokenId.unwrap(input.tokenIds[j]))));
                            } else {
                                k = type(uint).max;
                            }
                        } else {
                            k = ArrayUtils.indexOfTokenIds(offer.tokenIds, input.tokenIds[j]);
                        }
                        if (k == type(uint).max) {
                            revert InvalidTokenId(input.tokenIds[j]);
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
                    tokenIds_[j] = TokenId.unwrap(input.tokenIds[j]);
                    price += p;
                    if (offer.buySell == BuySell.BUY) {
                        IERC721Partial(Token.unwrap(offer.token)).transferFrom(msg.sender, Account.unwrap(owner), TokenId.unwrap(input.tokenIds[j]));
                    } else {
                        IERC721Partial(Token.unwrap(offer.token)).transferFrom(Account.unwrap(owner), msg.sender, TokenId.unwrap(input.tokenIds[j]));
                    }
                }
                if (offer.buySell == BuySell.BUY) {
                    if (price < Price.unwrap(input.price)) {
                        revert ExecutedTotalPriceLessThanSpecified(Price.wrap(uint128(price)), input.price);
                    }
                    ownerToTakerTotal += price;
                } else {
                    if (price > Price.unwrap(input.price)) {
                        revert ExecutedTotalPriceGreaterThanSpecified(Price.wrap(uint128(price)), input.price);
                    }
                    takerToOwnerTotal += price;
                }
            } else if (tokenType == TokenType.ERC1155) {
                if (input.tokenIds.length != input.tokenss.length) {
                    revert InvalidInputData("tokenIds must have the same length as tokenss");
                }
                uint totalCount;
                for (uint j = 0; j < input.tokenss.length; j++) {
                    totalCount += Tokens.unwrap(input.tokenss[j]);
                }
                if (Count.unwrap(offer.count) < totalCount) {
                    revert InsufficentCountRemaining(Count.wrap(uint16(totalCount)), offer.count);
                }
                if (Count.unwrap(offer.count) != type(uint16).max) {
                    offer.count = Count.wrap(Count.unwrap(offer.count) - uint16(totalCount));
                }
                prices_ = new uint[](input.tokenIds.length);
                tokenIds_ = new uint[](input.tokenIds.length);
                tokenss_ = new uint[](input.tokenIds.length);
                for (uint j = 0; j < input.tokenIds.length; j++) {
                    uint p;
                    if (offer.tokenIds.length > 0) {
                        uint k;
                        if (offer.tokenIdType == TokenIdType.TOKENID16) {
                            if (TokenId.unwrap(input.tokenIds[j]) < 2 ** 16) {
                                k = ArrayUtils.indexOfTokenId16s(offer.tokenId16s, TokenId16.wrap(uint16(TokenId.unwrap(input.tokenIds[j]))));
                            } else {
                                k = type(uint).max;
                            }
                        } else {
                            k = ArrayUtils.indexOfTokenIds(offer.tokenIds, input.tokenIds[j]);
                        }
                        if (k == type(uint).max) {
                            revert InvalidTokenId(input.tokenIds[j]);
                        }
                        if (Tokens.unwrap(offer.useds[k]) + Tokens.unwrap(input.tokenss[j]) > Tokens.unwrap(offer.tokenss[k])) {
                            revert InsufficentCountRemaining(Count.wrap(uint16(Tokens.unwrap(input.tokenss[j]))), Count.wrap(uint16(Tokens.unwrap(offer.tokenss[k]))));
                        }
                        offer.useds[k] = Tokens.wrap(Tokens.unwrap(offer.useds[k]) + uint128(Tokens.unwrap(input.tokenss[j])));
                        if (offer.prices.length == offer.tokenIds.length) {
                            p = Price.unwrap(offer.prices[k]);
                        } else {
                            p = Price.unwrap(offer.prices[0]);
                        }
                    } else {
                        p = Price.unwrap(offer.prices[0]);
                    }
                    prices_[j] = p;
                    tokenIds_[j] = uint(TokenId.unwrap(input.tokenIds[j]));
                    tokenss_[j] = uint(Tokens.unwrap(input.tokenss[j]));
                    price += p * uint(Tokens.unwrap(input.tokenss[j]));
                    if (offer.buySell == BuySell.BUY) {
                        IERC1155Partial(Token.unwrap(offer.token)).safeTransferFrom(msg.sender, Account.unwrap(owner), TokenId.unwrap(input.tokenIds[j]), Tokens.unwrap(input.tokenss[j]), "");
                    } else {
                        IERC1155Partial(Token.unwrap(offer.token)).safeTransferFrom(Account.unwrap(owner), msg.sender, TokenId.unwrap(input.tokenIds[j]), Tokens.unwrap(input.tokenss[j]), "");
                    }
                }
                if (offer.buySell == BuySell.BUY) {
                    if (price < Price.unwrap(input.price)) {
                        revert ExecutedTotalPriceLessThanSpecified(Price.wrap(uint128(price)), input.price);
                    }
                    ownerToTakerTotal += price;
                } else {
                    if (price > Price.unwrap(input.price)) {
                        revert ExecutedTotalPriceGreaterThanSpecified(Price.wrap(uint128(price)), input.price);
                    }
                    takerToOwnerTotal += price;
                }
            }
            emit Traded(input.index, Account.wrap(msg.sender), owner, offer.token, tokenType, offer.buySell, prices_, tokenIds_, tokenss_, Price.wrap(uint128(price)), Unixtime.wrap(uint40(block.timestamp)));
        }
        if (takerToOwnerTotal < ownerToTakerTotal) {
            uint diff = ownerToTakerTotal - takerToOwnerTotal;
            if (paymentsInEth) {
                weth.transferFrom(Account.unwrap(owner), address(this), diff);
                weth.withdraw(diff);
                emit InternalTransfer(address(this), msg.sender, diff, Unixtime.wrap(uint40(block.timestamp)));
                payable(msg.sender).transfer(diff);
            } else {
                weth.transferFrom(Account.unwrap(owner), msg.sender, diff);
            }
        } else if (takerToOwnerTotal > ownerToTakerTotal){
            uint diff = takerToOwnerTotal - ownerToTakerTotal;
            if (paymentsInEth) {
                if (diff > totalEth) {
                    revert InsufficentEthersRemaining(diff, totalEth);
                }
                totalEth -= diff;
                emit InternalTransfer(address(this), address(weth), diff, Unixtime.wrap(uint40(block.timestamp)));
                weth.deposit{value: diff}();
                weth.transfer(Account.unwrap(owner), diff);
            } else {
                weth.transferFrom(msg.sender, Account.unwrap(owner), diff);
            }
        }
        if (totalEth > 0) {
            emit InternalTransfer(address(this), msg.sender, totalEth, Unixtime.wrap(uint40(block.timestamp)));
            payable(msg.sender).transfer(totalEth);
        }
    }

    receive() external payable {
    }

    function getOffersInfo(uint from, uint to) public view returns (OfferInfo[] memory results) {
        uint start = from < offers.length ? from : offers.length;
        uint end = to < offers.length ? to : offers.length;
        results = new OfferInfo[](end - start);
        uint k;
        for (uint i = start; i < end; i++) {
            if (i < offers.length) {
                Offer memory offer = offers[i];
                TokenId[] memory tokenIds;
                if (offer.tokenIdType == TokenIdType.TOKENID16) {
                    tokenIds = new TokenId[](offer.tokenId16s.length);
                    for (uint j = 0; j < offer.tokenId16s.length; j++) {
                        tokenIds[j] = TokenId.wrap(uint(TokenId16.unwrap(offer.tokenId16s[j])));
                    }
                } else {
                    tokenIds = offer.tokenIds;
                }
                results[k++] = OfferInfo(i, offer.token, tokenTypes[offer.token], offer.buySell, offer.expiry, offer.count, offer.nonce, offer.prices, tokenIds, offer.tokenss, offer.useds);
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

    WETH public weth;
    TokenAgent public tokenAgentTemplate;
    TokenAgentRecord[] public tokenAgentRecords;
    mapping(Account => Index[]) public tokenAgentIndicesByOwners;
    mapping(TokenAgent => Index) public tokenAgentIndex;

    event NewTokenAgent(TokenAgent indexed tokenAgent, Account indexed owner, Index indexed index, Index indexByOwner, Unixtime timestamp);

    error NotInitialised();
    error GoAway();

    constructor() {
        tokenAgentTemplate = new TokenAgent();
    }

    function init(WETH _weth, TokenAgent _tokenAgentTemplate) public {
        if (address(weth) != address(0)) {
            revert GoAway();
        }
        weth = _weth;
        tokenAgentTemplate = _tokenAgentTemplate;
    }

    function newTokenAgent() public {
        if (address(weth) == address(0)) {
            revert NotInitialised();
        }
        TokenAgent tokenAgent = TokenAgent(payable(createClone(address(tokenAgentTemplate))));
        tokenAgent.init(weth, Account.wrap(msg.sender));
        tokenAgentRecords.push(TokenAgentRecord(tokenAgent, Index.wrap(uint32(tokenAgentIndicesByOwners[Account.wrap(msg.sender)].length))));
        tokenAgentIndicesByOwners[Account.wrap(msg.sender)].push(Index.wrap(uint32(tokenAgentRecords.length - 1)));
        emit NewTokenAgent(tokenAgent, Account.wrap(msg.sender), Index.wrap(uint32(tokenAgentRecords.length - 1)), Index.wrap(uint32(tokenAgentIndicesByOwners[Account.wrap(msg.sender)].length - 1)), Unixtime.wrap(uint40(block.timestamp)));
    }

    function tokenAgentsLength() public view returns (uint) {
        return tokenAgentRecords.length;
    }
    function tokenAgentsByOwnerLength(Account owner) public view returns (uint) {
        return tokenAgentIndicesByOwners[owner].length;
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
