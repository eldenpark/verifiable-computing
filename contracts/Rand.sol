// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.7.0;

contract Rand {
	address work;
	address[] worked;
	address[] bids;
	mapping (address => uint) pledges;
	event RoundSetup(uint256 value);
	event RandCreate(uint256 value);

	constructor() public {
		// balances[tx.origin] = 10000;
	}

	function requestDelegate(address _work)
	public pure returns (bool a)
	{
		// save _work => work
		// emit event RoundSetup
		return true;
	}

	function bid(uint pledge)
	public pure returns (bool a)
	{
		// store pledge
		return true;
	}

	function confirmBid(uint proof)
	public pure returns (bool a)
	{
		// calculate rand if necessary using bids
		// emit event RandCreate
		return true;
	}

	// function sendCoin(address receiver, uint amount) public returns(bool sufficient) {
	// 	if (balances[msg.sender] < amount) return false;
	// 	balances[msg.sender] -= amount;
	// 	balances[receiver] += amount;
	// 	emit Transfer(msg.sender, receiver, amount);
	// 	return true;
	// }
}
