import blake from 'blakejs';
import { concat } from '@ethersproject/bytes';
import axios from 'axios';
import { casperDelegationContractHexCode } from '../utils/casper';

const {
  CasperServiceByJsonRPC,
  CasperClient,
  PublicKey,
  DeployUtil,
  Keys,
  RuntimeArgs,
  CLValue,
  BalanceServiceByJsonRPC,
} = require('casper-client-sdk');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const cp = require('child_process');
const CoinGecko = require('coingecko-api');

export const getEndpointByNetwork = (network) => {
  if (network === 'casper') {
    return 'http://18.221.174.26:7777/rpc';
  }
  return 'http://testnet.gosuto.io:7777/rpc';
};

export const getAccountBalance = async (
  publicKey,
  latestBlockHash,
  network
) => {
  try {
    const casperService = new CasperServiceByJsonRPC(
      getEndpointByNetwork(network)
    );
    const balanceService = new BalanceServiceByJsonRPC(casperService);
    const balance = await balanceService.getAccountBalance(
      latestBlockHash,
      PublicKey.fromHex(publicKey)
    );
    // casperService.acco
    // const stateRootHash = await casperService.getStateRootHash(latestBlockHash);
    // const balanceUref = await casperService.getAccountBalanceUrefByPublicKey(stateRootHash,PublicKey.fromHex(publicKey));
    // const balance = await casperService.getAccountBalance(stateRootHash,balanceUref);
    // let accountHex = new CasperClient().newHdWallet(Uint8Array.from(await mnemonicToSeed('hola!'))).publicKey().toString('hex');
    // let wallet = PublicKey.fromHex(accountHex).toAccountHash();
    // wallet  = Buffer.from(wallet).toString('hex');
    if (Number.isNaN(parseFloat(parseInt(balance) / 1e9))) return 0;
    return parseFloat(parseInt(balance) / 1e9);
  } catch (error) {
    return 0;
  }
};

export const getWalletBalancesSum = async (publicKeys, network) => {
  try {
    const latestBlockHash = await getLatestBlockInfo();

    let sum = 0;
    for (let index = 0; index < publicKeys.length; index++) {
      try {
        const element = publicKeys[index];
        sum += await getAccountBalance(
          element,
          latestBlockHash.block.hash,
          network
        );
      } catch (error) {
        // alert('error')
        console.log('ERROR');
      }
    }
    return sum;
  } catch (error) {}
};

export const getTotalStakedSum = async (publicKeys, network) => {
  try {
    let sum = 0;
    for (let index = 0; index < publicKeys.length; index++) {
      try {
        const element = publicKeys[index];
        sum += (await getUserDelegatedAmount(element)).stakedAmount;
      } catch (error) {
        // alert('error')
      }
    }
    return sum;
  } catch (error) {}
};

export const getValidatorWeight = async (publicKey, network) => {
  // publicKey = '01b1126cfaf8f6df4209b5f4a88a5e3bb95f912c0307fa3e1d3e89a3946411b021'
  try {
    const eraValidators = (
      await new CasperServiceByJsonRPC(
        getEndpointByNetwork(network)
      ).getValidatorsInfo()
    ).auction_state.era_validators[0].validator_weights;
    for (let index = 0; index < eraValidators.length; index++) {
      const element = eraValidators[index];
      if (element.public_key == publicKey) {
        return element.weight / 1e9;
      }
    }
    return 0;
  } catch (error) {}
};

export const getValidatorRewards = async (publicKey, network) => {
  // publicKey = '01b1126cfaf8f6df4209b5f4a88a5e3bb95f912c0307fa3e1d3e89a3946411b021'
  network = network == 'casper-test' ? 'testnet' : 'mainnet';

  try {
    let rewardsSum = 0;
    let currentPage = 1;
    let url = `https://event-store-api-clarity-${network}.make.services/validators/${publicKey}/rewards?with_amounts_in_currency_id=1&page=${currentPage}&limit=100`;
    let response = await fetch(url);
    let jsonResponse = await response.json();
    for (let index = 0; index < jsonResponse.data.length; index++) {
      const element = jsonResponse.data[index];
      rewardsSum += element.amount;
    }
    while (jsonResponse.pageCount > currentPage) {
      currentPage++;
      url = `https://event-store-api-clarity-${network}.make.services/validators/${publicKey}/rewards?with_amounts_in_currency_id=1&page=${currentPage}&limit=100`;
      response = await fetch(url);
      jsonResponse = await response.json();
      for (let index = 0; index < jsonResponse.data.length; index++) {
        const element = jsonResponse.data[index];
        rewardsSum += element.amount;
      }
    }
    return rewardsSum / 1e9;
  } catch (error) {}
};
export const getDelegatorRewards = async (publicKey, network) => {
  // publicKey = '01b1126cfaf8f6df4209b5f4a88a5e3bb95f912c0307fa3e1d3e89a3946411b021'

  try {
    network = network == 'casper-test' ? 'testnet' : 'mainnet';
    const startDate = new Date();
    const rewardsSum = 0;
    const currentPage = 1;
    const url = `https://event-store-api-clarity-${network}.make.services/delegators/${publicKey}/total-rewards`;
    const response = await fetch(url);
    const jsonResponse = await response.json();
    return parseFloat(jsonResponse.data) / 1e9;
  } catch (error) {
    console.log('error = ', error);
  }
};

export const getLatestBlockInfo = async (network) => {
  try {
    const casperService = new CasperServiceByJsonRPC(
      getEndpointByNetwork(network)
    );
    const latestBlock = await casperService.getLatestBlockInfo();
    return latestBlock;
  } catch (error) {
    console.log(`ERROR ${error}`);
  }
};

export const getTotalStaked = async (network) => {
  try {
    const casperService = new CasperServiceByJsonRPC(
      getEndpointByNetwork(network)
    );
    const validatorsInfo = await casperService.getValidatorsInfo();
    const validatorWeights =
      validatorsInfo.auction_state.era_validators[0].validator_weights;
    const sumOfWeights = validatorWeights.reduce((accumVariable, current) => {
      return accumVariable + parseInt(current.weight);
    }, 0);
    return sumOfWeights / 1e9;
  } catch (error) {}
};

export const getCasperMarketInformation = async () => {
  try {
    const casperInformation = await new CoinGecko().coins.fetch(
      'casper-network',
      {}
    );
    const price = casperInformation.data.market_data.current_price.usd;
    const casperTotalSupply = casperInformation.data.market_data.total_supply;
    const casperCirculatingSupply =
      casperInformation.data.market_data.circulating_supply;
    const casperPriceChangePercentage24h =
      casperInformation.data.market_data
        .price_change_percentage_24h_in_currency;
    return {
      price,
      casperTotalSupply,
      casperCirculatingSupply,
      casperPriceChangePercentage24h,
    };
  } catch (error) {
    console.log('getCasperMarketInformation Error : ', error);
  }
};

export const getUserDelegatedAmount = async (publicKey, network) => {
  // publicKey = '01b1126cfaf8f6df4209b5f4a88a5e3bb95f912c0307fa3e1d3e89a3946411b021'

  try {
    const casperService = new CasperServiceByJsonRPC(
      getEndpointByNetwork(network)
    );
    const validatorsInfo = await casperService.getValidatorsInfo();
    const stakingOperations = [];
    const eraValidators = validatorsInfo.auction_state.era_validators[0];
    const { bids } = validatorsInfo.auction_state;
    let stakedAmount = 0;

    bids.forEach((bid) => {
      const { delegators } = bid.bid;
      for (let index = 0; index < delegators.length; index++) {
        const delegator = delegators[index];
        if (delegator.public_key == publicKey) {
          console.log('beofre');
          const validatorWeight =
            eraValidators.validator_weights.filter(
              (validator) => validator.public_key === bid.public_key
            )[0].weight / 1e9;
          console.log('this is it = ', validatorWeight);
          stakingOperations.push({
            validator: bid.public_key,
            delegationRate: bid.bid.delegation_rate,
            selfStake: bid.bid.staked_amount / 1e9,
            stakedAmount: delegator.staked_amount / 1e9,
            validatorWeight,
          });
          stakedAmount += delegator.staked_amount / 1e9;
        }
      }
      // delegators.forEach((delegator) => {

      // });
    });
    return { stakedAmount, stakingOperations };
  } catch (error) {
    console.log('error =', error);
  }
};

export const getValidatorByDeploy = async (deployHash, network) => {
  try {
    const casperService = new CasperServiceByJsonRPC(
      getEndpointByNetwork(network)
    );
    console.log('in deployHash =', deployHash);
    const { session } = (await casperService.getDeployInfo(deployHash)).deploy;

    return session.ModuleBytes
      ? session.ModuleBytes?.args[2][1]?.parsed
      : session.StoredContractByHash
      ? session.StoredContractByHash?.args[1][1]?.parsed
      : '';
  } catch (error) {
    console.log('error in get validator = ', error);
    return '';
  }
};

export const getAccountHistory = async (accountHash, page, limit, network) => {
  try {
    // accountHash = '993399c97855cec203c3b789d2996e950063e7b420090382ca2ac0ead0ce5cd4';
    network = network == 'casper-test' ? 'testnet' : 'mainnet';
    const url = `https://event-store-api-clarity-${network}.make.services/accounts/${accountHash}/transfers?page=${page}&limit=${limit}`;
    const response = await fetch(url);
    const jsonResponse = await response.json();
    console.log('json respone = ', jsonResponse);
    const newData = jsonResponse.data.map(async (transfer) => {
      if (transfer.toAccount == null) {
        console.log('transfer to == null', transfer.deployHash);
        const validator = await getValidatorByDeploy(
          transfer.deployHash,
          network
        );
        console.log('validator = ', validator);
        const newTransfer = {
          ...transfer,
          category: 'Staking',
          toAccount: validator,
        };
        return {
          ...newTransfer,
          method: 'Staking',
        };
      }
      return {
        ...transfer,
        method: transfer.fromAccount === accountHash ? 'Sent' : 'Received',
      };
    });
    return await Promise.all(newData);
  } catch (error) {
    console.log('error = ', error);
  }
};

export const transfer = async (privateKey, to, amount, network, note) => {
  try {
    // // to = '01e6c56c86ca97d7387d0c989c061ceeb205eeb04adf9ec41569292120ed9ae4a5';
    // // amount = 5697999990000;
    // // const ll = JSON.stringify(privateKey)
    // //   .replace('{', '')
    // //   .replace('}', '')
    // //   .split(',');
    // // const newll = ll.map((val) => {
    //   //   return parseInt(val.substr(val.indexOf(':') + 1, val.length));
    //   // });
    //   // privateKey = Uint8Array.from(newll);
    //   // publicKey = Keys.Ed25519.privateToPublicKey(privateKey);
    //   // const keyPair = Keys.Ed25519.parseKeyPair(publicKey, privateKey);
    //   const client = new CasperClient(getEndpointByNetwork(network));
    // const keyPair = Keys.Ed25519.new();

    // // for native-transfers payment price is fixed
    // const paymentAmount = 10000000000;
    // // transfer_id field in the request to tag the transaction and to correlate it to your back-end storage
    // const id = 187821;
    // // gas price for native transfers can be set to 1
    // const gasPrice = 10;
    // // time that the Deploy will remain valid for, in milliseconds, the default value is 1800000, which is 30 minutes
    // const ttl = 18000000;

    // const deployParams = new DeployUtil.DeployParams(
    //   keyPair.publicKey,
    //   'casper-test',
    //   gasPrice,
    //   ttl
    // );

    // const toPublicKey = PublicKey.fromHex(to);

    // const session = DeployUtil.ExecutableDeployItem.newTransfer(
    //   amount,
    //   toPublicKey,
    //   null,
    //   id
    // );

    // const payment = DeployUtil.standardPayment(paymentAmount);
    // const deploy = DeployUtil.makeDeploy(deployParams, session, payment);
    // const signedDeploy = DeployUtil.signDeploy(deploy, keyPair);
    // const jsonDeploy = DeployUtil.deployToJson(signedDeploy);
    // DeployUtil.deployFromJson(jsonDeploy);
    // // we are sending the signed deploy
    // const res = await new CasperServiceByJsonRPC(
    //   getEndpointByNetwork(network)
    // ).deploy(signedDeploy);
    const port = parseInt(
      global.location.search.substr(
        global.location.search.indexOf('=') + 1,
        global.location.search.length
      ),
      10
    );
    return await axios.post(`http://localhost:${port}/transfer`, {
      privateKey,
      to,
      amount,
      network,
      note,
    });
    // return await new Promise((resolve) => {
    //   resolve({ stdout: res.deploy_hash, stderr: '' });
    // });
    // return res;
    // const path = require('path');

    // console.log('privateKey =', privateKey);
    // let stderr = '';
    // let stdout = cp.execFileSync('node', [path.join(__dirname,'../src/casperService.js'),
    // JSON.stringify(privateKey),
    //   to,
    //   amount,
    //   network,
    // ]);
    // let { stdout, stderr } = await exec(
    //   `node src/casperService.js ${[
    //     JSON.stringify(privateKey),
    //   ]} ${to} ${amount} ${network}`
    // );

    // return { stdout, stderr };
    // exec('node src/test.js',(err,data,getter) => {
    //   console.log('data =', data)
    // })
  } catch (error) {
    return new Promise((resolve) => {
      resolve({ stdout: 'nope', stderr: error });
    });
  }
};
export const delegate = async (
  privateKey,
  validatorPublicKey,
  amountToDelegate,
  network
) => {
  const port = parseInt(
    global.location.search.substr(
      global.location.search.indexOf('=') + 1,
      global.location.search.length
    ),
    10
  );
  return axios.post(`http://localhost:${port}/delegate`, {
    privateKey,
    validatorPublicKey,
    amountToDelegate,
    network,
  });
};
export const undelegate = async (
  privateKey,
  validatorPublicKey,
  amountToUndelegate,
  network
) => {
  const port = parseInt(
    global.location.search.substr(
      global.location.search.indexOf('=') + 1,
      global.location.search.length
    ),
    10
  );
  console.log('privateKey = ', privateKey);
  return axios.post(`http://localhost:${port}/undelegate`, {
    privateKey,
    validatorPublicKey,
    amountToUndelegate,
    network,
  });
};
