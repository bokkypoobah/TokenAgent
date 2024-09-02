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
type OfferKey is bytes32;
type Price is uint128;
type Token is address;
type TokenId is uint128;
type Tokens is uint128;
type TokenType is uint16;
type Unixtime is uint64;

enum BuySell { BUY, SELL }

bytes4 constant ERC721_INTERFACE = 0x80ac58cd;
bytes4 constant ERC1155_INTERFACE = 0xd9b67a26;

TokenType constant TOKENTYPE_UNKNOWN = TokenType.wrap(0);
TokenType constant TOKENTYPE_INVALID = TokenType.wrap(type(uint16).max);

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

    struct OfferInput {
        Token token; // 160 bits
        BuySell buySell; // 8 bits
        Unixtime expiry; // 64 bits
        Price price; // 128 bits // token/WETH 18dp
        Tokens tokens; // 128 bits // ERC-20
    }
    struct Offer20 {
        Token token; // 160 bits
        BuySell buySell; // 8 bits
        Unixtime expiry; // 64 bits
        Price price; // 128 bits // token/WETH 18dp
        Tokens tokens; // 128 bits // ERC-20
        Tokens remaining; // 128 bits // ERC-20
    }
    struct Offer721 {
        Token token; // 160 bits
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
        Tokens remaining; // TODO 128 bits // ERC-20
    }
    struct OfferLog {
        BuySell buySell; // 8 bits
        Unixtime expiry; // 64 bits
        Price price; // 128 bits // token/WETH 18dp
        Tokens tokens; // 128 bits // ERC-20
    }
    // Account taker; // 160 bits
    // TokenId[] tokenIds; // ERC-721/1155
    // Tokens[] tokenss; // ERC-1155

    struct Trade {
        OfferKey offerKey;
    }

    IERC20 public weth;
    bool public active;
    mapping(OfferKey => Offer20) public offer20s;
    mapping(OfferKey => Offer721) public offer721s;
    mapping(OfferKey => Offer1155) public offer1155s;
    mapping(Token => TokenType) tokenTypes;

    event OfferAdded(OfferKey indexed offerKey, Token indexed token, OfferLog offer, Unixtime timestamp);
    event Traded(Trade trade, Unixtime timestamp);

    error InvalidOfferKey(OfferKey offerKey);
    error InvalidToken(Token token);
    error CannotOfferWETH();
    error OfferExpired(OfferKey offerKey, Unixtime expiry);

    constructor() {
    }

    function init(IERC20 _weth, address owner) external {
        super.initOwned(owner);
        weth = _weth;
    }

    function addOffers(OfferInput[] calldata _offerInputs) external onlyOwner {
        for (uint i = 0; i < _offerInputs.length; i++) {
            OfferInput memory offerInput = _offerInputs[i];
            TokenType tokenType = _getTokenType(offerInput.token);
            OfferKey offerKey = makeOfferKey(offerInput, tokenType);

            if ((uint(OfferKey.unwrap(offerKey)) % 16) / 2 == 1) {
                console.log("        > ERC-20", Token.unwrap(offerInput.token));
            } else if ((uint(OfferKey.unwrap(offerKey)) % 16) / 2 == 2) {
                console.log("        > ERC-721", Token.unwrap(offerInput.token));
            } else if ((uint(OfferKey.unwrap(offerKey)) % 16) / 2 == 3) {
                console.log("        > ERC-1155", Token.unwrap(offerInput.token));
            }

            if (TokenType.unwrap(tokenType) == TokenType.unwrap(TOKENTYPE_INVALID)) {
                revert InvalidToken(offerInput.token);
            }
            if (Token.unwrap(offerInput.token) == address(weth)) {
                revert CannotOfferWETH();
            }
            if (TokenType.unwrap(tokenType) == 20) {
                // uint startGas = gasleft();
                // 45681 gas
                offer20s[offerKey] = Offer20(offerInput.token, offerInput.buySell, offerInput.expiry, offerInput.price, offerInput.tokens, offerInput.tokens);
                // uint usedGas = startGas - gasleft();
                // console.log("usedGas", usedGas);
                // 4319 gas
                emit OfferAdded(offerKey, offerInput.token, OfferLog(offerInput.buySell, offerInput.expiry, offerInput.price, offerInput.tokens), Unixtime.wrap(uint64(block.timestamp)));
            } else if (TokenType.unwrap(tokenType) == 721) {
                offer721s[offerKey] = Offer721(offerInput.token, offerInput.buySell, offerInput.expiry, offerInput.price, offerInput.tokens, offerInput.tokens);
                emit OfferAdded(offerKey, offerInput.token, OfferLog(offerInput.buySell, offerInput.expiry, offerInput.price, offerInput.tokens), Unixtime.wrap(uint64(block.timestamp)));
            } else if (TokenType.unwrap(tokenType) == 1155) {
                offer1155s[offerKey] = Offer1155(offerInput.token, offerInput.buySell, offerInput.expiry, offerInput.price, offerInput.tokens, offerInput.tokens);
                emit OfferAdded(offerKey, offerInput.token, OfferLog(offerInput.buySell, offerInput.expiry, offerInput.price, offerInput.tokens), Unixtime.wrap(uint64(block.timestamp)));
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
            // console.logBytes32(OfferKey.unwrap(offerKey));

            BuySell buySell = BuySell(uint(OfferKey.unwrap(offerKey)) % 2);

            if ((uint(OfferKey.unwrap(offerKey)) % 16) / 2 == 1) {
                Offer20 memory offer = offer20s[offerKey];
                Token token = offer.token;
                console.log("        > ERC-20", Token.unwrap(token), uint(buySell));
            } else if ((uint(OfferKey.unwrap(offerKey)) % 16) / 2 == 2) {
                Offer721 memory offer = offer721s[offerKey];
                Token token = offer.token;
                console.log("        > ERC-721", Token.unwrap(token), uint(buySell));
            } else if ((uint(OfferKey.unwrap(offerKey)) % 16) / 2 == 3) {
                Offer1155 memory offer = offer1155s[offerKey];
                Token token = offer.token;
                console.log("        > ERC-1155", Token.unwrap(token), uint(buySell));
            }


            // Offer memory offer = offers[offerKey];
            // if (Token.unwrap(offer.token) == address(0)) {
            //     revert InvalidOfferKey(offerKey);
            // }
            // if (Unixtime.unwrap(offer.expiry) != 0 && block.timestamp > Unixtime.unwrap(offer.expiry)) {
            //     revert OfferExpired(offerKey, offer.expiry);
            // }
            // TokenType tokenType = _getTokenType(offer.token);
            // // Transfer from msg.sender first
            // if (offer.buySell == BuySell.BUY) {
            //     // TokenAgent BUY, msg.sender SELL - msg.sender transfers ERC-20/721/1155
            //     if (TokenType.unwrap(tokenType) == 20) {
            //     } else if (TokenType.unwrap(tokenType) == 721) {
            //     } else if (TokenType.unwrap(tokenType) == 1155) {
            //     }
            // } else {
            //     // TokenAgent SELL, msg.sender BUY - msg.sender transfers WETH
            //     if (TokenType.unwrap(tokenType) == 20) {
            //     } else if (TokenType.unwrap(tokenType) == 721) {
            //     } else if (TokenType.unwrap(tokenType) == 1155) {
            //     }
            // }
            // // Transfer to msg.sender last
            // if (offer.buySell == BuySell.BUY) {
            //     // TokenAgent BUY, msg.sender SELL - TokenAgent transfers WETH
            //     if (TokenType.unwrap(tokenType) == 20) {
            //     } else if (TokenType.unwrap(tokenType) == 721) {
            //     } else if (TokenType.unwrap(tokenType) == 1155) {
            //     }
            // } else {
            //     // TokenAgent SELL, msg.sender BUY - TokenAgent transfers ERC-20/721/1155
            //     if (TokenType.unwrap(tokenType) == 20) {
            //     } else if (TokenType.unwrap(tokenType) == 721) {
            //     } else if (TokenType.unwrap(tokenType) == 1155) {
            //     }
            // }
            // emit Traded(_trade, Unixtime.wrap(uint64(block.timestamp)));
        }
    }

    function makeOfferKey(OfferInput memory offerInput, TokenType tokenType) internal pure returns (OfferKey offerKey) {
        // return OfferKey.wrap(keccak256(abi.encodePacked(offer.taker, offer.buySell, offer.tokenType, offer.token, offer.tokenIds, offer.tokenss)));
        // return OfferKey.wrap(keccak256(abi.encodePacked(offerInput.buySell, offerInput.token)));
        bytes32 hash = keccak256(abi.encodePacked(offerInput.buySell, offerInput.token));
        if (TokenType.unwrap(tokenType) == 20) {
            hash = bytes32(((uint(hash) >> 4) << 4) + 2 + uint(offerInput.buySell));
        } else if (TokenType.unwrap(tokenType) == 721) {
            hash = bytes32(((uint(hash) >> 4) << 4) + 4 + uint(offerInput.buySell));
        } else if (TokenType.unwrap(tokenType) == 1155) {
            hash = bytes32(((uint(hash) >> 4) << 4) + 6 + uint(offerInput.buySell));
        }
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

    function _getTokenType(Token token) internal returns (TokenType result) {
        uint startGas = gasleft();
        result = tokenTypes[token];
        if (uint(TokenType.unwrap(result)) == 0) {
            if (Token.unwrap(token).code.length > 0) {
                if (_supportsInterface(token, ERC721_INTERFACE)) {
                    result = TokenType.wrap(721);
                } else if (_supportsInterface(token, ERC1155_INTERFACE)) {
                    result = TokenType.wrap(1155);
                } else {
                    if (_decimals(token) != type(uint8).max) {
                        result = TokenType.wrap(20);
                    } else {
                        result = TOKENTYPE_INVALID;
                    }
                }
            } else {
                result = TOKENTYPE_INVALID;
            }
            tokenTypes[token] = result;
        }
        uint usedGas = startGas - gasleft();
        console.log("        > _getTokenType()", Token.unwrap(token), uint(TokenType.unwrap(result)), usedGas);
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