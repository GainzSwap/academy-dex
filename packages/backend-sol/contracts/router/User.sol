// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "hardhat/console.sol";

abstract contract UserModule {
	/// @custom:storage-location erc7201:userModule.storage
	struct UserStorage {
		uint256 userCount;
		mapping(address => User) users;
		mapping(uint256 => address) userIdToAddress;
	}

	struct ReferralInfo {
		uint256 id;
		address referralAddress;
	}

	struct User {
		uint256 id;
		address addr;
		uint256 referrerId;
		uint256[] referrals;
	}

	// keccak256(abi.encode(uint256(keccak256("userModule.storage")) - 1)) & ~bytes32(uint256(0xff));
	bytes32 private constant USER_STORAGE_LOCATION =
		0x0038ec5cf8f0d1747ebb72ff0e651cf1b10ea4f74874fe0bde352ae49428c500;

	// Accessor for the namespaced storage slot
	function _getUserStorage() private pure returns (UserStorage storage us) {
		assembly {
			us.slot := USER_STORAGE_LOCATION
		}
	}

	// Event declarations
	event UserRegistered(
		uint256 userId,
		address userAddress,
		uint256 referrerId
	);
	event ReferralAdded(uint256 referrerId, uint256 referralId);

	/// @notice Gets the referrer and referrer ID of a user.
	/// @param userAddress The address of the user.
	/// @return referrerId The ID of the referrer, 0 if none.
	/// @return referrerAddress The address of the referrer, address(0) if none.
	function getReferrer(
		address userAddress
	) public view returns (uint256 referrerId, address referrerAddress) {
		UserStorage storage us = _getUserStorage();
		User storage user = us.users[userAddress];
		referrerId = user.referrerId;
		referrerAddress = us.userIdToAddress[referrerId];
	}

	/// @notice Gets the user ID for a given address.
	/// @param userAddress The address of the user.
	/// @return userId The ID of the user.
	function getUserId(
		address userAddress
	) external view returns (uint256 userId) {
		UserStorage storage us = _getUserStorage();
		return us.users[userAddress].id;
	}

	/// @notice Retrieves the referrals of a user.
	/// @param userAddress The address of the user.
	/// @return referrals An array of `ReferralInfo` structs representing the user's referrals.
	function getReferrals(
		address userAddress
	) external view returns (ReferralInfo[] memory) {
		UserStorage storage us = _getUserStorage();
		uint256[] memory referralIds = us.users[userAddress].referrals;
		ReferralInfo[] memory referrals = new ReferralInfo[](
			referralIds.length
		);

		for (uint256 i = 0; i < referralIds.length; i++) {
			uint256 id = referralIds[i];
			address refAddr = us.userIdToAddress[id];
			referrals[i] = ReferralInfo({ id: id, referralAddress: refAddr });
		}

		return referrals;
	}

	/// @notice Internal function to create or get the user ID.
	/// @param userAddr The address of the user.
	/// @param referrerId The ID of the referrer.
	/// @return The ID of the user.
	function _createOrGetUserId(
		address userAddr,
		uint256 referrerId
	) internal returns (uint256) {
		UserStorage storage us = _getUserStorage();
		User storage user = us.users[userAddr];

		// If user already exists, return the existing ID
		if (user.id != 0) {
			return user.id;
		}

		// Increment user count and assign new user ID
		us.userCount++;
		us.users[userAddr] = User({
			id: us.userCount,
			addr: userAddr,
			referrerId: referrerId,
			referrals: new uint256[](0)
		});
		us.userIdToAddress[us.userCount] = userAddr;

		// Add user to referrer's referrals list, if applicable
		if (
			referrerId != 0 &&
			referrerId != us.userCount &&
			us.userIdToAddress[referrerId] != address(0)
		) {
			us.users[us.userIdToAddress[referrerId]].referrals.push(
				us.userCount
			);
			emit ReferralAdded(referrerId, us.userCount);
		}

		emit UserRegistered(us.userCount, userAddr, referrerId);
		return us.userCount;
	}

	function userIdToAddress(uint256 id) public view returns (address) {
		return _getUserStorage().userIdToAddress[id];
	}
}
