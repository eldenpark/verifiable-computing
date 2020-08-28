// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.7.0;

contract Rand {
	struct Pledge {
		uint privKey;
		uint pubKey;
	}
	uint constant MIN_BIDDER_REQUIREMENT = 3;

	string workInfo;
	uint256 roundCreateTime;
	mapping (address => Pledge) pledges;
	address[] bids;
	address[] pledgeSecretIndex;
	mapping (address => uint) worked;
	address[] workedIndex;

	event RoundSetup(string value);
	event VolunteerChoose(address[] volunteers);
	event RandCreate(uint256 rand, uint bidderIdx, address chosen,
									 string workInfo);
	event Log(string topic, address addr, string val);

 	constructor() public {
		roundCreateTime = now;
	}

	function requestDelegate(string memory message)
	public payable
	{
		emit Log('requestDelegate()', msg.sender, message);
		emit RoundSetup(message);
		roundCreateTime = now;
		workInfo = message;
	}

	function bid(string memory pubKey)
	public payable returns (bool a)
	{
		uint timeElapsed = now - roundCreateTime;
		pledges[msg.sender] = Pledge({
			privKey: 0,
			pubKey: stringToUint(pubKey)
		});
		bids.push(msg.sender);

		if (bids.length >= MIN_BIDDER_REQUIREMENT) {
			for (uint i = 0; i < bids.length; i += 1) {
				if (0 < worked[bids[i]] && worked[bids[i]] < 2) {
					delete bids[i];
				}
			}
			emit VolunteerChoose(bids);
		}
		return true;
	}

	function revealSecret(string memory privKey)
	public payable {
		uint _privKey = stringToUint(privKey);

		if (pledges[msg.sender].pubKey + _privKey == 10) {
			pledges[msg.sender].privKey = _privKey;
			pledgeSecretIndex.push(msg.sender);
		}

		if (pledgeSecretIndex.length == bids.length) {
			emit Log('revealSecret()', msg.sender, '11');
			uint sum = 0;
			for (uint i = 0; i < bids.length; i += 1) {
			  sum += pledges[bids[i]].privKey;
			}
			uint bidderIdx = sum % bids.length;
			address chosen = bids[bidderIdx];
			emit RandCreate(sum, bidderIdx, chosen, workInfo);
		}
	}

	function uintToString(uint v)
	private pure returns (string memory str) {
		uint maxlength = 100;
		bytes memory reversed = new bytes(maxlength);
		uint i = 0;
		while (v != 0) {
				uint remainder = v % 10;
				v = v / 10;
				reversed[i++] = byte(uint8(48 + remainder));
		}
		bytes memory s = new bytes(i + 1);
		for (uint j = 0; j <= i; j++) {
				s[j] = reversed[i - j];
		}
		str = string(s);
	}

	function toString(address x)
	private pure returns (string memory)
	{
    bytes memory b = new bytes(20);
    for (uint i = 0; i < 20; i++)
        b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
    return string(b);
	}

	function stringToUint(string memory s)
	private pure returns (uint result)
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
