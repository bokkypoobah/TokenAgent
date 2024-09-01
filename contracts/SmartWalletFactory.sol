pragma solidity ^0.8.24;

// ----------------------------------------------------------------------------
// SmartWallet
//
// https://github.com/bokkypoobah/SmartWallet
//
// Deployed to Sepolia
//
// SPDX-License-Identifier: MIT
//
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2024. The MIT Licence.
// ----------------------------------------------------------------------------

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

type Account is address;
type OfferKey is bytes32;
type Price is uint128;
type Token is address;
type TokenId is uint128;
type Tokens is uint128;
type Unixtime is uint64;

enum BuySell { BUY, SELL }
enum TokenType { ERC20, ERC721, ERC1155 }

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

/// @notice User owned SmartWallet
contract SmartWallet is Owned {

    struct Offer {
        Account taker;
        BuySell buySell;
        TokenType tokenType;
        Token token;
        Tokens tokens; // ERC-20
        TokenId[] tokenIds; // ERC-721/1155
        Tokens[] tokenss; // ERC-1155
        Price price; // token/WETH 18dp
        Unixtime expiry;
    }

    struct Trade {
        OfferKey offerKey;
    }

    IERC20 public weth;
    bool public active;
    mapping(OfferKey => Offer) public offers;

    event OfferAdded(OfferKey indexed offerKey, Offer offer, Unixtime timestamp);
    event Traded(Trade trade, Unixtime timestamp);

    error InvalidOfferKey(OfferKey offerKey);

    constructor() {
    }

    function init(IERC20 _weth, address owner) external {
        super.initOwned(owner);
        weth = _weth;
    }

    function makeOfferKey(Offer memory offer) internal pure returns (OfferKey offerKey) {
        return OfferKey.wrap(keccak256(abi.encodePacked(offer.taker, offer.buySell, offer.tokenType, offer.token, offer.tokenIds, offer.tokenss)));
    }

    function addOffers(Offer[] calldata _offers) external onlyOwner {
        for (uint i = 0; i < _offers.length; i++) {
            Offer memory offer = _offers[i];
            OfferKey offerKey = makeOfferKey(offer);
            // Check ERC-20/721/1155
            offers[offerKey] = offer;
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
            // Transfer from msg.sender first
            if (offer.buySell == BuySell.BUY) {
                // SmartWallet BUY, msg.sender SELL - msg.sender transfers ERC-20/721/1155
                if (offer.tokenType == TokenType.ERC20) {
                } else if (offer.tokenType == TokenType.ERC721) {
                } else if (offer.tokenType == TokenType.ERC1155) {
                }
            } else {
                // SmartWallet SELL, msg.sender BUY - msg.sender transfers WETH
                if (offer.tokenType == TokenType.ERC20) {
                } else if (offer.tokenType == TokenType.ERC721) {
                } else if (offer.tokenType == TokenType.ERC1155) {
                }
            }
            // Transfer to msg.sender last
            if (offer.buySell == BuySell.BUY) {
                // SmartWallet BUY, msg.sender SELL - SmartWallet transfers WETH
                if (offer.tokenType == TokenType.ERC20) {
                } else if (offer.tokenType == TokenType.ERC721) {
                } else if (offer.tokenType == TokenType.ERC1155) {
                }
            } else {
                // SmartWallet SELL, msg.sender BUY - SmartWallet transfers ERC-20/721/1155
                if (offer.tokenType == TokenType.ERC20) {
                } else if (offer.tokenType == TokenType.ERC721) {
                } else if (offer.tokenType == TokenType.ERC1155) {
                }
            }
            emit Traded(_trade, Unixtime.wrap(uint64(block.timestamp)));
        }
    }
}

/// @notice SmartWallet factory
contract SmartWalletFactory is CloneFactory {
    SmartWallet public smartWalletTemplate;

    IERC20 public weth;
    SmartWallet[] public smartWallets;
    mapping(address => SmartWallet[]) public smartWalletsByOwners;

    event NewSmartWallet(SmartWallet indexed smartWallet, address indexed owner, uint indexed index, Unixtime timestamp);

    constructor(IERC20 _weth) {
        smartWalletTemplate = new SmartWallet();
        weth = _weth;
    }

    function newSmartWallet() public {
        SmartWallet smartWallet = SmartWallet(createClone(address(smartWalletTemplate)));
        smartWallet.init(weth, msg.sender);
        smartWallets.push(smartWallet);
        smartWalletsByOwners[msg.sender].push(smartWallet);
        emit NewSmartWallet(smartWallet, msg.sender, smartWalletsByOwners[msg.sender].length - 1, Unixtime.wrap(uint64(block.timestamp)));
    }

}
