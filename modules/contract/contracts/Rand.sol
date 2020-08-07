// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.7.0;

contract Rand {
	bool isOpen;
	address[] worked; // record of who has worked before
	address[] bids;
	string workInfo;
	mapping (address => string) pledges;

	event RoundSetup(string value);
	event RandCreate(uint256 rand, uint bidderIdx, address chosen,
									 string workInfo);
	event Log(address addr, string val);

	constructor()
	public
	{
		isOpen = false;
	}

	function requestDelegate(string memory message)
	public payable
	{
		emit Log(msg.sender, message);
		emit RoundSetup(message);
		workInfo = message;
	}

	function bid(string memory pubKey)
	public payable returns (bool a)
	{
		emit Log(msg.sender, pubKey);
		pledges[msg.sender] = pubKey;
		bids.push(msg.sender);

		if (bids.length > 2) {
			uint rand = stringToUint(pubKey);
			uint bidderIdx = rand % 3;
			address chosen = bids[bidderIdx];
			emit RandCreate(rand, bidderIdx, chosen, workInfo);
		}
		return true;
	}

	function confirmBid(uint proof)
	public pure returns (bool a)
	{
		return true;
	}

	function toString(address x)
	private returns (string memory)
	{
    bytes memory b = new bytes(20);
    for (uint i = 0; i < 20; i++)
        b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
    return string(b);
	}

	function stringToUint(string memory s)
	private returns (uint result)
	{
		bytes memory b = bytes(s);
		uint i;
		result = 0;
		for (i = 0; i < b.length; i++) {
			uint c = uint(uint8(b[i]));
			if (c >= 48 && c <= 57) {
					result = result * 10 + (c - 48);
			}
		}
}
}
