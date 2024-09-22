// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC1155Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract SFT is ERC1155Upgradeable, OwnableUpgradeable {
	using EnumerableSet for EnumerableSet.UintSet;

	struct SftBalance {
		uint256 nonce;
		uint256 amount;
		bytes attributes;
	}

	uint256 private _nonceCounter;
	string private _name;
	string private _symbol;

	// Mapping from nonce to token attributes as bytes
	mapping(uint256 => bytes) private _tokenAttributes;

	// Mapping from address to list of owned token nonces
	mapping(address => EnumerableSet.UintSet) private _addressToNonces;

	/// @dev Replaces constructor. Initialize the contract with name and symbol.
	/// @param name_ The name of the SFT token.
	/// @param symbol_ The symbol of the SFT token.
	function __SFT_init(
		string memory name_,
		string memory symbol_,
		address initialOwner
	) internal onlyInitializing {
		__ERC1155_init(""); // Initialize ERC1155
		__Ownable_init(initialOwner); // Initialize Ownable
		_name = name_;
		_symbol = symbol_;
	}

	/// @dev Internal function to mint new tokens with attributes and store the nonce.
	function _mint(
		address to,
		uint256 amount,
		bytes memory attributes
	) internal returns (uint256 nonce) {
		nonce = ++_nonceCounter;

		// Store the attributes
		_tokenAttributes[nonce] = attributes;

		// Mint the token with the nonce as its ID
		super._mint(to, nonce, amount, "");

		// Track the nonce for the address
		_addressToNonces[to].add(nonce);
	}

	/// @dev Returns the name of the token.
	function name() public view returns (string memory) {
		return _name;
	}

	/// @dev Returns the symbol of the token.
	function symbol() public view returns (string memory) {
		return _symbol;
	}

	/// @dev Returns the token name and symbol.
	function tokenInfo() public view returns (string memory, string memory) {
		return (_name, _symbol);
	}

	/// @dev Returns raw token attributes by nonce.
	/// @param nonce The nonce of the token.
	/// @return Attributes in bytes.
	function _getRawTokenAttributes(
		uint256 nonce
	) internal view returns (bytes memory) {
		return _tokenAttributes[nonce];
	}

	/// @dev Returns the list of nonces owned by an address.
	/// @param owner The address of the token owner.
	/// @return Array of nonces.
	function getNonces(address owner) public view returns (uint256[] memory) {
		return _addressToNonces[owner].values();
	}

	/// @dev Checks if the address owns a specific nonce.
	/// @param owner The address of the token owner.
	/// @param nonce The nonce to check.
	/// @return True if the address owns the nonce, otherwise false.
	function hasSFT(address owner, uint256 nonce) public view returns (bool) {
		return _addressToNonces[owner].contains(nonce);
	}

	/// @dev Burns the tokens of a specific nonce and mints new tokens with updated attributes.
	/// @param user The address of the token holder.
	/// @param nonce The nonce of the token to update.
	/// @param amount The amount of tokens to mint.
	/// @param attr The new attributes to assign.
	/// @return The new nonce for the minted tokens.
	function update(
		address user,
		uint256 nonce,
		uint256 amount,
		bytes memory attr
	) public onlyOwner returns (uint256) {
		_burn(user, nonce, amount);
		return amount > 0 ? _mint(user, amount, attr) : 0;
	}

	/// @dev Returns the balance of the user with their token attributes.
	/// @param user The address of the user.
	/// @return Array of SftBalance containing nonce, amount, and attributes.
	function _sftBalance(
		address user
	) internal view returns (SftBalance[] memory) {
		uint256[] memory nonces = getNonces(user);
		SftBalance[] memory balance = new SftBalance[](nonces.length);

		for (uint256 i; i < nonces.length; i++) {
			uint256 nonce = nonces[i];
			bytes memory attributes = _tokenAttributes[nonce];
			uint256 amount = balanceOf(user, nonce);

			balance[i] = SftBalance({
				nonce: nonce,
				amount: amount,
				attributes: attributes
			});
		}

		return balance;
	}

	/// @dev Override _update to handle address-to-nonce mapping.
	/// @param from The address sending tokens.
	/// @param to The address receiving tokens.
	/// @param ids The token IDs being transferred.
	/// @param values The values of tokens being transferred.
	function _update(
		address from,
		address to,
		uint256[] memory ids,
		uint256[] memory values
	) internal virtual override {
		super._update(from, to, ids, values);

		for (uint256 i = 0; i < ids.length; i++) {
			uint256 id = ids[i];

			_addressToNonces[from].remove(id);
			_addressToNonces[to].add(id);
		}
	}
}
