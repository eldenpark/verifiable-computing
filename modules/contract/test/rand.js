const Rand = artifacts.require('Rand');

contract('Rand', (accounts) => {
  it('t1', async () => {
    const RandInstance = await Rand.deployed();
    // const evs = RandInstance.Deposit();

    // RandInstance.contract.events.Transfer({ fromBlock: 0 })
    //   .on('data', () => {
    //     console.log(44);
    //   })
    // const a = await RandInstance.requestDelegate.call(accounts[0]);

    const p = new Promise(async (resolve) => {
      console.log(11111);
      RandInstance.Transfer()
        .on('changed', () => {
          console.log(44);
        });
      const b = await RandInstance.requestDelegate(accounts[1], 10, {from: accounts[0]})
      console.log(1, b);
    });

    await p;
    // const aa = await RandInstance.getPastEvents();
    // console.log(33, aa);

    //   .on('data' , () => {
    //     console.log(4);
    //   });
    // const ev = await RandInstance.getPastEvents('allEvents', {
    //   fromBlock: 0, toBlock: 'latest'
    // });
    // console.log(1, a, ev);

    // var event = RandInstance.Deposit();

    // console.log(1, event);

    // // watch for changes
    // event.watch(function(error, result){
    //   // result contains non-indexed arguments and topics
    //   // given to the `Deposit` call.
    //   if (!error)
    //       console.log(result);
  // });

    // event.watch(function(error, result){
    //   if (error) { return console.log(error) }
    //   if (!error) {
    //     // DO ALL YOUR WORK HERE!
    //     let { args: { from, to, value }, blockNumber } = result
    //     console.log(`----BlockNumber (${blockNumber})----`)
    //     console.log(`from = ${from}`)
    //     console.log(`to = ${to}`)
    //     console.log(`value = ${value}`)
    //     console.log(`----BlockNumber (${blockNumber})----`)
    //   }
    // })
    // const balance = await metaCoinInstance.getBalance.call(accounts[0]);

    // assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
  });

  // it('should call a function that depends on a linked library', async () => {
  //   const metaCoinInstance = await MetaCoin.deployed();
  //   const metaCoinBalance = (await metaCoinInstance.getBalance.call(accounts[0])).toNumber();
  //   const metaCoinEthBalance = (await metaCoinInstance.getBalanceInEth.call(accounts[0])).toNumber();

  //   assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, 'Library function returned unexpected function, linkage may be broken');
  // });

  // it('should send coin correctly', async () => {
  //   const metaCoinInstance = await MetaCoin.deployed();

  //   // Setup 2 accounts.
  //   const accountOne = accounts[0];
  //   const accountTwo = accounts[1];

  //   // Get initial balances of first and second account.
  //   const accountOneStartingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
  //   const accountTwoStartingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();

  //   // Make transaction from first account to second.
  //   const amount = 10;
  //   await metaCoinInstance.sendCoin(accountTwo, amount, { from: accountOne });

  //   // Get balances of first and second account after the transactions.
  //   const accountOneEndingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
  //   const accountTwoEndingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();


  //   assert.equal(accountOneEndingBalance, accountOneStartingBalance - amount, "Amount wasn't correctly taken from the sender");
  //   assert.equal(accountTwoEndingBalance, accountTwoStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  // });
});
