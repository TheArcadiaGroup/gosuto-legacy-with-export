const { CasperServiceByJsonRPC, CasperClient, PublicKey } = require("casper-client-sdk");

export const getAccountBalance = async () => {
  const casperService = new CasperServiceByJsonRPC('http://3.14.161.135:7777/rpc');
  // casperService.acco
  const stateRootHash = await casperService.getStateRootHash((await getLatestBlockInfo()).block.hash);
  console.log('stateRootHash = ,',stateRootHash);
  const balanceUref = await casperService.getAccountBalanceUrefByPublicKey(stateRootHash,PublicKey.fromHex('019c19fc275cfae194bd30aa282d8905634abfdadc1d07489719f3cef06ec42ec7'));
  const balance = await casperService.getAccountBalance(stateRootHash,balanceUref);
  // let accountHex = new CasperClient().newHdWallet(Uint8Array.from(await mnemonicToSeed('hola!'))).publicKey().toString('hex');
  // let wallet = PublicKey.fromHex(accountHex).toAccountHash();
  // wallet  = Buffer.from(wallet).toString('hex');

  return parseFloat(parseInt(balance)/10e8).toLocaleString();
}

const getLatestBlockInfo = async () => {
  const casperService = new CasperServiceByJsonRPC('http://3.14.161.135:7777/rpc')
  const latestBlock = await casperService.getLatestBlockInfo();
  return latestBlock;
}
