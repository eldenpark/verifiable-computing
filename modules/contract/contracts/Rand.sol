// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.7.0;

contract Rand {
	address work;
	address[] worked;
	address[] bids;
	mapping (address => uint) pledges;

	event RoundSetup(uint256 value);
	event RandCreate(uint256 value);
	event Transfer(address indexed from, address indexed to, uint256 value); /* This is an event */

	function requestDelegate(address receiver, uint amount)
	public payable
	{
		emit RoundSetup(123);
		// emit Transfer(msg.sender, receiver, amount);
		// save _work => work
		// emit event RoundSetup
		// return true;
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

}
