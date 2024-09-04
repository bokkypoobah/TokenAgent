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

import "hardhat/console.sol";


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

type Account is address;
type Nonce is uint32;
type OfferKey is bytes32;
type Price is uint128;
type Token is address;
type TokenId is uint256;
type Tokens is uint128;
type Unixtime is uint64;

enum BuySell { BUY, SELL }
enum TokenType { UNKNOWN, ERC20, ERC721, ERC1155, INVALID }
enum Execution { FILL, FILLORKILL }

bytes4 constant ERC721_INTERFACE = 0x80ac58cd;
bytes4 constant ERC1155_INTERFACE = 0xd9b67a26;

Token constant THEDAO = Token.wrap(0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413);

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
        emit OwnershipTransferred(owner, newOwner, Unixtime.wrap(uint64(block.timestamp)));
        owner = newOwner;
        newOwner = address(0);
    }
}

/// @notice User owned TokenAgent
contract TokenAgent is Owned {

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
    //

    // struct OfferInputItem {
    //     BuySell buySell; // 8 bits
    //     Unixtime expiry; // 64 bits
    //     Tokens tokens; // 128 bits // ERC-20
    //     Price price; // 128 bits // token/WETH 18dp
    // }
    // struct OfferInput {
    //     Token token; // 160 bits
    //     OfferInputItem[] items;
    //     // Account taker; // 160 bits
    //     // TokenId[] tokenIds; // ERC-721/1155
    //     // Tokens[] tokenss; // ERC-1155
    // }

    struct OfferInputPoints {
        Price price; // 128 bits // token/WETH 18dp
        Tokens tokens; // 128 bits // ERC-20
    }
    struct OfferInput {
        Token token; // 160 bits
        BuySell buySell; // 8 bits
        Unixtime expiry; // 64 bits
        // OfferInputPoints[] points;
        Price[] prices;
        TokenId[] tokenIds;
        Tokens[] tokenss;
    }
    struct Offer20Points {
        Price price; // 128 bits // token/WETH 18dp
        Tokens tokens; // 128 bits // ERC-20
        Tokens used; // 128 bits // ERC-20
    }
    struct Offer20 {
        Token token; // 160 bits
        Nonce nonce; // 32 bits
        Unixtime expiry; // 64 bits
        Offer20Points[] points;
    }
    struct Offer721 {
        Token token; // 160 bits
        Nonce nonce; // 32 bits
        BuySell buySell; // 8 bits
        Unixtime expiry; // 64 bits
        Price price; // TODO 128 bits // token/WETH 18dp
        Tokens tokens; // TODO 128 bits // ERC-20
        Tokens remaining; // TODO 128 bits // ERC-20
    }
    struct Offer1155 {
        Token token; // 160 bits
        BuySell buySell; // 8 bits
        Unixtime expiry; // 64 bits
        Price price; // TODO 128 bits // token/WETH 18dp
        Tokens tokens; // TODO 128 bits // ERC-20
        Tokens used; // TODO 128 bits // ERC-20
    }
    struct Offer20Log {
        BuySell buySell; // 8 bits
        Unixtime expiry; // 64 bits
        // OfferInputPoints[] points;
        Price[] prices;
        Tokens[] tokenss;
    }
    // Account taker; // 160 bits
    // TokenId[] tokenIds; // ERC-721/1155
    // Tokens[] tokenss; // ERC-1155

    struct Trade {
        OfferKey offerKey; // 256 bits
        Tokens tokens; // 128 bits // ERC-20
        Price averagePrice; // 128 bits min average when selling, max average when buying
        Execution execution; // 8 bits
    }

    // TODO - buy/sell or -ve / +ve flows
    struct TradeLog {
        OfferKey offerKey; // 256 bits
        Tokens tokens; // 128 bits // ERC-20
        Price averagePrice; // 128 bits min average when selling, max average when buying
        Execution execution; // 8 bits
    }

    IERC20 public weth;
    Nonce public nonce;
    mapping(OfferKey => Offer20) public offer20s;
    mapping(OfferKey => Offer721) public offer721s;
    mapping(OfferKey => Offer1155) public offer1155s;
    mapping(Token => TokenType) tokenTypes;

    event Offer20Added(OfferKey indexed offerKey, Token indexed token, Nonce nonce, Offer20Log offer, Unixtime timestamp);
    event OffersInvalidated(Nonce newNonce, Unixtime timestamp);
    event Traded(TradeLog trade, Unixtime timestamp);

    error CannotOfferWETH();
    error ExecutedAveragePriceGreaterThanSpecified(Price executedAveragePrice, Price tradeAveragePrice);
    error ExecutedAveragePriceLessThanSpecified(Price executedAveragePrice, Price tradeAveragePrice);
    error InsufficentTokensRemaining(Tokens tokensRequested, Tokens tokensRemaining);
    error InvalidInputData();
    error InvalidOffer(Nonce offerNonce, Nonce currentNonce);
    error InvalidOfferKey(OfferKey offerKey);
    error InvalidToken(Token token);
    error OfferExpired(OfferKey offerKey, Unixtime expiry);

    constructor() {
    }

    function init(IERC20 _weth, address owner) external {
        super.initOwned(owner);
        weth = _weth;
    }
    function invalidateOrders() external onlyOwner {
        nonce = Nonce.wrap(Nonce.unwrap(nonce) + 1);
        emit OffersInvalidated(nonce, Unixtime.wrap(uint64(block.timestamp)));
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
                // prices [one, two, ...], tokens [one, two, ...]
                // uint startGas = gasleft();
                offer20s[offerKey].token = offerInput.token;
                offer20s[offerKey].nonce = nonce;
                offer20s[offerKey].expiry = offerInput.expiry;
                console.log("        >        erc20Token.prices/tokenIds.length", offerInput.prices.length, offerInput.tokenss.length);
                if (offerInput.prices.length == 0 || offerInput.prices.length != offerInput.tokenss.length) {
                    revert InvalidInputData();
                }
                for (uint j = 0; j < offerInput.prices.length; j++) {
                    offer20s[offerKey].points.push(Offer20Points(offerInput.prices[j], offerInput.tokenss[j], Tokens.wrap(0)));
                }
                // for (uint j = 0; j < offerInput.points.length; j++) {
                //     offer20s[offerKey].points.push(Offer20Points(offerInput.points[j].price, offerInput.points[j].tokens, Tokens.wrap(0)));
                // }
                // uint usedGas = startGas - gasleft();
                // console.log("usedGas", usedGas);
                emit Offer20Added(offerKey, offerInput.token, nonce, Offer20Log(offerInput.buySell, offerInput.expiry, offerInput.prices, offerInput.tokenss), Unixtime.wrap(uint64(block.timestamp)));
            } else if (tokenType == TokenType.ERC721) {
                // prices [one], tokenIds []
                // prices [one], tokenIds [one]
                // prices [one], tokenIds [one, two, ...]
                // prices [one, two, ...], tokenIds [one, two, ...]
                offer721s[offerKey].token = offerInput.token;
                offer721s[offerKey].nonce = nonce;
                offer721s[offerKey].expiry = offerInput.expiry;
                console.log("        >        erc721Token.prices/tokenIds.length", offerInput.prices.length, offerInput.tokenIds.length);
                if (offerInput.prices.length == 0 || (offerInput.prices.length > 1 && offerInput.prices.length != offerInput.tokenIds.length)) {
                    revert InvalidInputData();
                }
            } else if (tokenType == TokenType.ERC1155) {
                // prices [one], tokenIds [], tokenss []
                // prices [one], tokenIds [one, two, ...], tokenss []
                // prices [one], tokenIds [one, two, ...], tokenss [one, two, ...]
                // prices [one, two, ...], tokenIds [one, two, ...], tokenss []
                // prices [one, two, ...], tokenIds [one, two, ...], tokenss [one, two, ...]
                console.log("        >        erc1155Token.prices/tokenIds/tokenss.length", offerInput.prices.length, offerInput.tokenIds.length, offerInput.tokenss.length);
                // TODO: Not complete for the last 2 cases
                if (offerInput.prices.length == 0 ||
                    (offerInput.prices.length == 1 && offerInput.tokenss.length != 0 && offerInput.tokenIds.length != offerInput.tokenss.length) ||
                    (offerInput.prices.length > 1 && offerInput.prices.length != offerInput.tokenIds.length && offerInput.tokenIds.length != offerInput.tokenss.length)) {
                    revert InvalidInputData();
                }

            }
        }
    }

    function updateOffer(/*OfferUpdate[] calldata _offerOpdates*/) external onlyOwner {
        // TODO: Update offer.tokenIds, offer.tokenss, price, expiry?
    }

    function trade(Trade[] calldata _trades) external {
        for (uint i = 0; i < _trades.length; i++) {
            Trade memory _trade = _trades[i];
            OfferKey offerKey = _trade.offerKey;
            BuySell buySell = BuySell(uint(OfferKey.unwrap(offerKey)) % 2);
            TokenType tokenType = TokenType((uint(OfferKey.unwrap(offerKey)) % 16) / 2);

            if (tokenType == TokenType.ERC20) {
                Offer20 storage offer = offer20s[offerKey];
                if (Token.unwrap(offer.token) == address(0)) {
                    revert InvalidOfferKey(offerKey);
                }
                if (Nonce.unwrap(offer.nonce) != Nonce.unwrap(nonce)) {
                    revert InvalidOffer(offer.nonce, nonce);
                }
                console.log("        >        expiry/timestamp", Unixtime.unwrap(offer.expiry), block.timestamp);
                if (Unixtime.unwrap(offer.expiry) != 0 && block.timestamp > Unixtime.unwrap(offer.expiry)) {
                    revert OfferExpired(offerKey, offer.expiry);
                }
                uint128 tokens = Tokens.unwrap(_trade.tokens);
                uint128 totalTokens = 0;
                uint128 totalWETHTokens = 0;
                for (uint j = 0; j < offer.points.length && tokens > 0; j++) {
                    uint128 _price = Price.unwrap(offer.points[j].price);
                    uint128 _remaining = Tokens.unwrap(offer.points[j].tokens) - Tokens.unwrap(offer.points[j].used);
                    console.log("        > ERC-20 price/tokens/used", uint(Price.unwrap(offer.points[j].price)), uint(Tokens.unwrap(offer.points[j].tokens)), uint(Tokens.unwrap(offer.points[j].used)));
                    console.log("        >        remaining", _remaining);
                    if (_remaining > 0) {
                        if (tokens >= _remaining) {
                            tokens -= _remaining;
                            totalTokens += _remaining;
                            offer.points[j].used = Tokens.wrap(Tokens.unwrap(offer.points[j].used) + _remaining);
                            totalWETHTokens += _remaining * _price / 10**18;
                        } else {
                            totalTokens += tokens;
                            offer.points[j].used = Tokens.wrap(Tokens.unwrap(offer.points[j].used) + tokens);
                            totalWETHTokens += tokens * _price / 10**18;
                            tokens = 0;
                        }
                    }
                    console.log("        >        totalTokens/totalWETHTokens", totalTokens, totalWETHTokens);
                    // console.log("        > ERC-20", Token.unwrap(offer.token), uint(buySell), uint(Tokens.unwrap(_trade.tokens)));
                }
                console.log("        >        tokens/totalTokens/totalWETHTokens", uint(Tokens.unwrap(_trade.tokens)), totalTokens, totalWETHTokens);
                if (_trade.execution == Execution.FILLORKILL && totalTokens < Tokens.unwrap(_trade.tokens)) {
                    revert InsufficentTokensRemaining(_trade.tokens, Tokens.wrap(totalTokens));
                }
                if (totalTokens > 0) {
                    uint128 averagePrice = totalWETHTokens * 10**18 / totalTokens;
                    if (buySell == BuySell.BUY) {
                        // msg.sender SELL owner BUY
                        console.log("        >        msg.sender SELL/owner BUY - averagePrice/_trade.averagePrice", averagePrice, Price.unwrap(_trade.averagePrice));
                        if (averagePrice < Price.unwrap(_trade.averagePrice)) {
                            revert ExecutedAveragePriceLessThanSpecified(Price.wrap(averagePrice), _trade.averagePrice);
                        }
                        // owner offering to buy, msg.sender selling
                        IERC20(Token.unwrap(offer.token)).transferFrom(msg.sender, owner, totalTokens);
                        weth.transferFrom(owner, msg.sender, totalWETHTokens);
                    } else {
                        // msg.sender BUY owner SELL
                        console.log("        >        msg.sender BUY/owner SELL - averagePrice/_trade.averagePrice", averagePrice, Price.unwrap(_trade.averagePrice));
                        if (averagePrice > Price.unwrap(_trade.averagePrice)) {
                            revert ExecutedAveragePriceGreaterThanSpecified(Price.wrap(averagePrice), _trade.averagePrice);
                        }
                        weth.transferFrom(msg.sender, owner, totalWETHTokens);
                        IERC20(Token.unwrap(offer.token)).transferFrom(owner, msg.sender, totalTokens);
                    }
                    emit Traded(TradeLog(_trade.offerKey, _trade.tokens, _trade.averagePrice, _trade.execution), Unixtime.wrap(uint64(block.timestamp)));
                }
            } else if (tokenType == TokenType.ERC721) {
                // TODO
                Offer721 memory offer = offer721s[offerKey];
                Token token = offer.token;
                console.log("        > ERC-721", Token.unwrap(token), uint(buySell));
            } else if (tokenType == TokenType.ERC1155) {
                // TODO
                Offer1155 memory offer = offer1155s[offerKey];
                Token token = offer.token;
                console.log("        > ERC-1155", Token.unwrap(token), uint(buySell));
            }
        }
    }

    function makeOfferKey(OfferInput memory offerInput, TokenType tokenType) internal pure returns (OfferKey offerKey) {
        bytes32 hash = keccak256(abi.encodePacked(offerInput.buySell, offerInput.token));
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

    function newTokenAgent() public {
        TokenAgent tokenAgent = TokenAgent(createClone(address(tokenAgentTemplate)));
        tokenAgent.init(weth, msg.sender);
        tokenAgents.push(tokenAgent);
        tokenAgentsByOwners[msg.sender].push(tokenAgent);
        emit NewTokenAgent(tokenAgent, msg.sender, tokenAgentsByOwners[msg.sender].length - 1, Unixtime.wrap(uint64(block.timestamp)));
    }

}
