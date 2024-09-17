pragma solidity ^0.8.27;

// ----------------------------------------------------------------------------
// TokenAgent with factory v0.8.4 testing
//
// https://github.com/bokkypoobah/TokenAgent
//
// Deployed to Sepolia
// - WETH 0x07391dbE03e7a0DEa0fce6699500da081537B6c3
// - TokenAgent template
// - TokenAgentFactory
//
// TODO:
// - FILL for ERC-721/1155?
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
        require(msg.sender == Account.unwrap(owner), NotOwner());
        _;
    }
    modifier notOwner {
        require(msg.sender != Account.unwrap(owner), Owner());
        _;
    }

    function initOwned(Account _owner) internal {
        require(Account.unwrap(owner) == address(0), AlreadyInitialised());
        owner = _owner;
    }
    function transferOwnership(Account _pendingOwner) public onlyOwner {
        pendingOwner = _pendingOwner;
        emit OwnershipTransferStarted(owner, _pendingOwner, Unixtime.wrap(uint40(block.timestamp)));
    }
    function acceptOwnership() public {
        require(msg.sender == Account.unwrap(pendingOwner), NotNewOwner());
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

    bytes4 constant InvalidID = 0xffffffff;
    bytes4 constant ERC165ID = 0x01ffc9a7;

    function doesContractImplementInterface(address _contract, bytes4 _interfaceId) internal view returns (bool) {
        uint success;
        uint result;
        (success, result) = _noThrowCall(_contract, ERC165ID);
        if ((success == 0) || (result == 0)) {
            return false;
        }
        (success, result) = _noThrowCall(_contract, InvalidID);
        if ((success == 0) || (result !=0 )) {
            return false;
        }
        (success, result) = _noThrowCall(_contract, _interfaceId);
        if ((success == 1) && (result == 1)) {
            return true;
        }
        return false;
    }
    function _noThrowCall(address _contract, bytes4 _interfaceId) view internal returns (uint success, uint result) {
        bytes4 erc165ID = ERC165ID;
        assembly {
                let x := mload(0x40)               // Find empty storage location using "free memory pointer"
                mstore(x, erc165ID)                // Place signature at beginning of empty storage
                mstore(add(x, 0x04), _interfaceId) // Place first argument directly next to signature
                success := staticcall(
                                    30000,         // 30k gas
                                    _contract,     // To addr
                                    x,             // Inputs are stored at location x
                                    0x24,          // Inputs are 36 bytes long
                                    x,             // Store output over input (saves space)
                                    0x20)          // Outputs are 32 bytes long
                result := mload(x)                 // Load the result
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
            if (doesContractImplementInterface(Token.unwrap(token), ERC721_INTERFACE)) {
                _tokenType = TokenType.ERC721;
            } else if (doesContractImplementInterface(Token.unwrap(token), ERC1155_INTERFACE)) {
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
}

/// @notice User owned TokenAgent
contract TokenAgent is TokenInfo, Owned, NonReentrancy {

    struct AddOffer {
        Token token;             // 160 bits
        BuySell buySell;         // 8 bits
        Unixtime expiry;         // 40 bits
        Price[] prices;          // token/WETH 18dp
        TokenId[] tokenIds;      // ERC-721/1155
        Tokens[] tokenss;        // ERC-20/721/1155
    }
    struct UpdateOffer {
        Index index;             // 160 bits
        Unixtime expiry;         // 40 bits
        Price[] prices;          // token/WETH 18dp
        TokenId[] tokenIds;      // ERC-721/1155
        Tokens[] tokenss;        // ERC-20/721/1155
    }
    struct Offer {
        Token token;             // 160 bits
        BuySell buySell;         // 8 bits
        Unixtime expiry;         // 40 bits
        Nonce nonce;             // 24 bits
        TokenIdType tokenIdType; // 8 bits
        Price[] prices;          // token/WETH 18dp
        TokenId16[] tokenId16s;  // ERC-721/1155, when max[tokenIds...] < 2 ** 16
        TokenId[] tokenIds;      // ERC-721/1155, when max[tokenIds...] >= 2 ** 16
        Tokens[] tokenss;        // ERC-20/721/1155
    }
    struct OfferInfo {
        uint index;
        Token token;
        TokenType tokenType;
        BuySell buySell;
        Unixtime expiry;
        Nonce nonce;
        Price[] prices;
        TokenId[] tokenIds;
        Tokens[] tokenss;
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
    mapping(Token => TokenType) tokenTypes;
    Offer[] public offers;

    event InternalTransfer(address indexed from, address indexed to, uint ethers, Unixtime timestamp);
    event Offered(Index index, Token indexed token, TokenType tokenType, Account indexed maker, BuySell buySell, Unixtime expiry, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
    event OfferUpdated(Index index, Token indexed token, TokenType tokenType, Account indexed maker, BuySell buySell, Unixtime expiry, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
    event OffersInvalidated(Nonce newNonce, Unixtime timestamp);
    event Traded(Index index, Token indexed token, TokenType tokenType, Account indexed maker, Account indexed taker, BuySell makerBuySell, uint[] prices, uint[] tokenIds, uint[] tokenss, Tokens[] remainingTokenss, Price price, Unixtime timestamp);

    error CannotOfferWETH();
    error ExecutedAveragePriceGreaterThanSpecified(Price executedAveragePrice, Price tradeAveragePrice);
    error ExecutedAveragePriceLessThanSpecified(Price executedAveragePrice, Price tradeAveragePrice);
    error ExecutedTotalPriceGreaterThanSpecified(Price executedTotalPrice, Price tradeTotalPrice);
    error ExecutedTotalPriceLessThanSpecified(Price executedTotalPrice, Price tradeTotalPrice);
    error InsufficentEthersRemaining(uint ethersRequested, uint ethersRemaining);
    error InsufficentTokensRemaining(Tokens tokensRequested, Tokens tokensRemaining);
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
    function invalidateOffers() external onlyOwner {
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
            require(Token.unwrap(input.token) != address(weth), CannotOfferWETH());
            TokenType tokenType = tokenTypes[input.token];
            if (tokenType == TokenType.UNKNOWN) {
                tokenType = _getTokenType(input.token);
                require(tokenType != TokenType.INVALID, InvalidToken(input.token));
                tokenTypes[input.token] = tokenType;
            }
            Offer storage offer = offers.push();
            offer.token = input.token;
            offer.buySell = input.buySell;
            offer.expiry = input.expiry;
            offer.nonce = nonce;
            if (input.prices.length == 0) {
                revert InvalidInputData("all: prices array must contain at least one price");

            } else if (tokenType == TokenType.ERC20 && input.prices.length != 1 && input.tokenss.length != input.prices.length) {
                revert InvalidInputData("ERC-20: tokenss array length must match prices array length");

            } else if (tokenType == TokenType.ERC721 && input.tokenss.length != 1) {
                revert InvalidInputData("ERC-721: tokenss array length must contain exactly one number");
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
                        require(TokenId.unwrap(input.tokenIds[j - 1]) < TokenId.unwrap(input.tokenIds[j]), TokenIdsMustBeSortedWithNoDuplicates());
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
            offer.tokenss = input.tokenss;
            emit Offered(Index.wrap(uint32(offers.length - 1)), offer.token, tokenType, Account.wrap(msg.sender), offer.buySell, offer.expiry, nonce, input.prices, input.tokenIds, input.tokenss, Unixtime.wrap(uint40(block.timestamp)));
        }
    }

    // Cannot update token and buySell
    function updateOffers(UpdateOffer[] calldata inputs) external onlyOwner {
        for (uint i = 0; i < inputs.length; i++) {
            UpdateOffer memory input = inputs[i];
            uint index = Index.unwrap(input.index);
            Offer storage offer = offers[index];
            offer.expiry = input.expiry;
            offer.nonce = nonce;
            TokenType tokenType = tokenTypes[offer.token];
            if (input.prices.length == 0) {
                revert InvalidInputData("all: prices array must contain at least one price");

            } else if (tokenType == TokenType.ERC20 && input.prices.length != 1 && input.tokenss.length != input.prices.length) {
                revert InvalidInputData("ERC-20: tokenss array length must match prices array length");

            } else if (tokenType == TokenType.ERC721 && input.tokenss.length != 1) {
                revert InvalidInputData("ERC-721: tokenss array length must contain exactly one number");
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
                        require(TokenId.unwrap(input.tokenIds[j - 1]) < TokenId.unwrap(input.tokenIds[j]), TokenIdsMustBeSortedWithNoDuplicates());
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
            offer.tokenss = input.tokenss;
            emit OfferUpdated(Index.wrap(uint32(index)), offer.token, tokenType, Account.wrap(msg.sender), offer.buySell, offer.expiry, nonce, input.prices, input.tokenIds, input.tokenss, Unixtime.wrap(uint40(block.timestamp)));
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
            require(Index.unwrap(input.index) < offers.length, InvalidIndex(input.index));
            Offer storage offer = offers[Index.unwrap(input.index)];
            TokenType tokenType = tokenTypes[offer.token];
            require(Nonce.unwrap(offer.nonce) == Nonce.unwrap(nonce), InvalidOffer(offer.nonce, nonce));
            require(Unixtime.unwrap(offer.expiry) == 0 || block.timestamp <= Unixtime.unwrap(offer.expiry), OfferExpired(input.index, offer.expiry));
            uint price;
            uint[] memory prices_;
            uint[] memory tokenIds_;
            uint[] memory tokenss_; // TODO Delete
            if (tokenType == TokenType.ERC20) {
                require(input.tokenss.length == 1, InvalidInputData("Expecting single tokens input"));
                uint tokens = uint(Tokens.unwrap(input.tokenss[0]));
                uint totalTokens;
                uint totalWETHTokens;
                prices_ = new uint[](offer.prices.length);
                tokenIds_ = new uint[](0);
                tokenss_ = new uint[](offer.tokenss.length);
                uint k;
                for (uint j = 0; j < offer.prices.length && tokens > 0; j++) {
                    uint _price = Price.unwrap(offer.prices[j]);
                    if (Tokens.unwrap(offer.tokenss[j]) > 0) {
                        if (tokens >= Tokens.unwrap(offer.tokenss[j])) {
                            tokenss_[k] = Tokens.unwrap(offer.tokenss[j]);
                            totalTokens += Tokens.unwrap(offer.tokenss[j]);
                            totalWETHTokens += uint(Tokens.unwrap(offer.tokenss[j])) * _price / 10**18;
                            prices_[k] = _price;
                            tokens -= Tokens.unwrap(offer.tokenss[j]);
                            offer.tokenss[j] = Tokens.wrap(0);
                        } else {
                            tokenss_[k] = tokens;
                            totalTokens += tokens;
                            totalWETHTokens += tokens * _price / 10**18;
                            prices_[k] = _price;
                            offer.tokenss[j] = Tokens.wrap(uint128(uint(Tokens.unwrap(offer.tokenss[j])) - tokens));
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
                        require(price >= Price.unwrap(input.price), ExecutedAveragePriceLessThanSpecified(Price.wrap(uint128(price)), input.price));
                        IERC20(Token.unwrap(offer.token)).transferFrom(msg.sender, Account.unwrap(owner), totalTokens);
                        ownerToTakerTotal += totalWETHTokens;
                    } else {
                        require(price <= Price.unwrap(input.price), ExecutedAveragePriceGreaterThanSpecified(Price.wrap(uint128(price)), input.price));
                        takerToOwnerTotal += totalWETHTokens;
                        IERC20(Token.unwrap(offer.token)).transferFrom(Account.unwrap(owner), msg.sender, totalTokens);
                    }
                }
            } else if (tokenType == TokenType.ERC721) {
                require(Tokens.unwrap(offer.tokenss[0]) >= input.tokenIds.length, InsufficentTokensRemaining(Tokens.wrap(uint128(input.tokenIds.length)), offer.tokenss[0]));
                offer.tokenss[0] = Tokens.wrap(uint128(Tokens.unwrap(offer.tokenss[0]) - input.tokenIds.length));
                prices_ = new uint[](input.tokenIds.length);
                tokenIds_ = new uint[](input.tokenIds.length);
                tokenss_ = new uint[](1);
                tokenss_[0] = input.tokenIds.length;
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
                        require(k != type(uint).max, InvalidTokenId(input.tokenIds[j]));
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
                    require(price >= Price.unwrap(input.price), ExecutedTotalPriceLessThanSpecified(Price.wrap(uint128(price)), input.price));
                    ownerToTakerTotal += price;
                } else {
                    require(price <= Price.unwrap(input.price), ExecutedTotalPriceGreaterThanSpecified(Price.wrap(uint128(price)), input.price));
                    takerToOwnerTotal += price;
                }
            } else if (tokenType == TokenType.ERC1155) {
                require(input.tokenIds.length == input.tokenss.length, InvalidInputData("tokenIds must have the same length as tokenss"));
                // uint totalCount;
                // for (uint j = 0; j < input.tokenss.length; j++) {
                //     totalCount += Tokens.unwrap(input.tokenss[j]);
                // }
                // if (Count.unwrap(offer.count) != type(uint16).max) {
                //     require(Count.unwrap(offer.count) >= totalCount, InsufficentCountRemaining(Count.wrap(uint16(totalCount)), offer.count));
                //     offer.count = Count.wrap(Count.unwrap(offer.count) - uint16(totalCount));
                // }
                prices_ = new uint[](input.tokenIds.length);
                tokenIds_ = new uint[](input.tokenIds.length);
                tokenss_ = new uint[](input.tokenIds.length);
                for (uint j = 0; j < input.tokenIds.length; j++) {
                    uint p;
                    if (offer.tokenId16s.length + offer.tokenIds.length > 0) {
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
                        require(k != type(uint).max, InvalidTokenId(input.tokenIds[j]));
                        require(Tokens.unwrap(input.tokenss[j]) <= Tokens.unwrap(offer.tokenss[k]), InsufficentTokensRemaining(input.tokenss[j], offer.tokenss[k]));
                        offer.tokenss[k] = Tokens.wrap(uint128(Tokens.unwrap(offer.tokenss[k]) - Tokens.unwrap(input.tokenss[j])));
                        if (offer.prices.length == offer.tokenIds.length) {
                            p = Price.unwrap(offer.prices[k]);
                        } else {
                            p = Price.unwrap(offer.prices[0]);
                        }
                    } else {
                        p = Price.unwrap(offer.prices[0]);
                        // TODO: Check count in tokenss[0]
                        // uint totalCount;
                        // for (uint j = 0; j < input.tokenss.length; j++) {
                        //     totalCount += Tokens.unwrap(input.tokenss[j]);
                        // }
                        // require(Tokens.unwrap(input.tokenss[j]) <= Tokens.unwrap(offer.tokenss[k]), InsufficentTokensRemaining(input.tokenss[j], offer.tokenss[k]));
                        // offer.tokenss[k] = Tokens.wrap(uint128(Tokens.unwrap(offer.tokenss[k]) - Tokens.unwrap(input.tokenss[j])));
                    }
                    prices_[j] = p;
                    tokenIds_[j] = uint(TokenId.unwrap(input.tokenIds[j]));
                    tokenss_[j] = uint(Tokens.unwrap(input.tokenss[j])); // TODO: Delete
                    price += p * uint(Tokens.unwrap(input.tokenss[j]));
                    if (offer.buySell == BuySell.BUY) {
                        IERC1155Partial(Token.unwrap(offer.token)).safeTransferFrom(msg.sender, Account.unwrap(owner), TokenId.unwrap(input.tokenIds[j]), Tokens.unwrap(input.tokenss[j]), "");
                    } else {
                        IERC1155Partial(Token.unwrap(offer.token)).safeTransferFrom(Account.unwrap(owner), msg.sender, TokenId.unwrap(input.tokenIds[j]), Tokens.unwrap(input.tokenss[j]), "");
                    }
                }
                if (offer.buySell == BuySell.BUY) {
                    require(price >= Price.unwrap(input.price), ExecutedTotalPriceLessThanSpecified(Price.wrap(uint128(price)), input.price));
                    ownerToTakerTotal += price;
                } else {
                    require(price <= Price.unwrap(input.price), ExecutedTotalPriceGreaterThanSpecified(Price.wrap(uint128(price)), input.price));
                    takerToOwnerTotal += price;
                }
            }
            emit Traded(input.index, offer.token, tokenType, owner, Account.wrap(msg.sender), offer.buySell, prices_, tokenIds_, tokenss_, offer.tokenss, Price.wrap(uint128(price)), Unixtime.wrap(uint40(block.timestamp)));
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
                require(diff <= totalEth, InsufficentEthersRemaining(diff, totalEth));
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
                results[k++] = OfferInfo(i, offer.token, tokenTypes[offer.token], offer.buySell, offer.expiry, offer.nonce, offer.prices, tokenIds, offer.tokenss);
            }
        }
    }
}

/// @notice TokenAgent factory
contract TokenAgentFactory is CloneFactory, TokenInfo {

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
        require(address(weth) == address(0), GoAway());
        weth = _weth;
        tokenAgentTemplate = _tokenAgentTemplate;
    }

    function newTokenAgent() public {
        require(address(weth) != address(0), NotInitialised());
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
    function getTokenTypes(Token[] memory tokens) public view returns (TokenType[] memory _tokenTypes) {
        _tokenTypes = new TokenType[](tokens.length);
        for (uint i = 0; i < tokens.length; i++) {
            _tokenTypes[i] = _getTokenType(tokens[i]);
        }
    }
}
