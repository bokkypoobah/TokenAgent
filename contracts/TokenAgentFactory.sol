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
type Unixtime is uint64;

enum BuySell { BUY, SELL }
enum TokenType { UNKNOWN, ERC20, ERC721, ERC1155, NOTTOKEN }

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

    struct Offer {
        // Account taker; // 160 bits
        BuySell buySell; // 8 bits
        Unixtime expiry; // 64 bits
        Token token; // 160 bits
        Tokens tokens; // 128 bits // ERC-20
        // TokenId[] tokenIds; // ERC-721/1155
        // Tokens[] tokenss; // ERC-1155
        Price price; // 128 bits // token/WETH 18dp
    }

    struct Trade {
        OfferKey offerKey;
    }

    bytes4 constant ERC721_INTERFACE = 0x80ac58cd;
    bytes4 constant ERC1155_INTERFACE = 0xd9b67a26;

    IERC20 public weth;
    bool public active;
    mapping(Token => TokenType) public tokenTypes;
    mapping(OfferKey => Offer) public offers;

    event OfferAdded(OfferKey indexed offerKey, Offer offer, Unixtime timestamp);
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

    function addOffers(Offer[] calldata _offers) external onlyOwner {
        for (uint i = 0; i < _offers.length; i++) {
            Offer memory offer = _offers[i];
            OfferKey offerKey = makeOfferKey(offer);

            TokenType tokenType = _getTokenType(offer.token);
            if (tokenType == TokenType.NOTTOKEN) {
                revert InvalidToken(offer.token);
            }
            if (Token.unwrap(offer.token) == address(weth)) {
                revert CannotOfferWETH();
            }

            // uint startGas = gasleft();
            // 45481 gas
            offers[offerKey] = offer;
            // uint usedGas = startGas - gasleft();
            // console.log("usedGas", usedGas);
            // 4343 gas
            emit OfferAdded(offerKey, offer, Unixtime.wrap(uint64(block.timestamp)));
        }
    }

    function updateOffer(/*OfferUpdate[] calldata _offerOpdates*/) external onlyOwner {
        // TODO: Update offer.tokenIds, offer.tokenss, price, expiry?
    }

    function trade(Trade[] calldata _trades) external {
        for (uint i = 0; i < _trades.length; i++) {
            Trade memory _trade = _trades[i];
            OfferKey offerKey = _trade.offerKey;
            Offer memory offer = offers[offerKey];
            if (Token.unwrap(offer.token) == address(0)) {
                revert InvalidOfferKey(offerKey);
            }
            if (Unixtime.unwrap(offer.expiry) != 0 && block.timestamp > Unixtime.unwrap(offer.expiry)) {
                revert OfferExpired(offerKey, offer.expiry);
            }
            TokenType tokenType = _getTokenType(offer.token);
            // Transfer from msg.sender first
            if (offer.buySell == BuySell.BUY) {
                // TokenAgent BUY, msg.sender SELL - msg.sender transfers ERC-20/721/1155
                if (tokenType == TokenType.ERC20) {
                } else if (tokenType == TokenType.ERC721) {
                } else if (tokenType == TokenType.ERC1155) {
                }
            } else {
                // TokenAgent SELL, msg.sender BUY - msg.sender transfers WETH
                if (tokenType == TokenType.ERC20) {
                } else if (tokenType == TokenType.ERC721) {
                } else if (tokenType == TokenType.ERC1155) {
                }
            }
            // Transfer to msg.sender last
            if (offer.buySell == BuySell.BUY) {
                // TokenAgent BUY, msg.sender SELL - TokenAgent transfers WETH
                if (tokenType == TokenType.ERC20) {
                } else if (tokenType == TokenType.ERC721) {
                } else if (tokenType == TokenType.ERC1155) {
                }
            } else {
                // TokenAgent SELL, msg.sender BUY - TokenAgent transfers ERC-20/721/1155
                if (tokenType == TokenType.ERC20) {
                } else if (tokenType == TokenType.ERC721) {
                } else if (tokenType == TokenType.ERC1155) {
                }
            }
            emit Traded(_trade, Unixtime.wrap(uint64(block.timestamp)));
        }
    }

    function makeOfferKey(Offer memory offer) internal pure returns (OfferKey offerKey) {
        // return OfferKey.wrap(keccak256(abi.encodePacked(offer.taker, offer.buySell, offer.tokenType, offer.token, offer.tokenIds, offer.tokenss)));
        return OfferKey.wrap(keccak256(abi.encodePacked(offer.buySell, offer.token)));
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
            __d = type(uint8).max;
        }
    }

    function _getTokenType(Token token) internal returns (TokenType result) {
        uint startGas = gasleft();
        result = tokenTypes[token];
        if (result == TokenType.UNKNOWN) {
            if (Token.unwrap(token).code.length > 0) {
                if (_supportsInterface(token, ERC721_INTERFACE)) {
                    result = TokenType.ERC721;
                } else if (_supportsInterface(token, ERC1155_INTERFACE)) {
                    result = TokenType.ERC1155;
                } else {
                    if (_decimals(token) != type(uint8).max) {
                        result = TokenType.ERC20;
                    } else {
                        result = TokenType.NOTTOKEN;
                    }
                }
            } else {
                result = TokenType.NOTTOKEN;
            }
            tokenTypes[token] = result;
        }
        uint usedGas = startGas - gasleft();
        console.log("        > getTokenType()", Token.unwrap(token), uint(result), usedGas);
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
