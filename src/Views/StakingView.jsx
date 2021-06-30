import React, { useContext, useEffect, useState } from 'react';
import {
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  notification,
  Spin,
} from 'antd';
import StakingCard from '../components/StakingCard';
import StakingTable from '../components/StakingTable';
import AddWallet from '../components/AddWallet';
import TextArea from 'antd/lib/input/TextArea';

// images
import vault from '../../assets/icons/vault-logo.png';
// styles
import '../App.global.scss';
import {
  delegate,
  getAccountBalance,
  getCasperMarketInformation,
  getDelegatorRewards,
  getLatestBlockInfo,
  getUserDelegatedAmount,
  getValidatorRewards,
  getValidatorWeight,
} from '../services/casper';
import Datastore from 'nedb-promises';
import { remote } from 'electron';
import WalletContext from '../contexts/WalletContext';
import NetworkContext from '../contexts/NetworkContext';
import DataContext from '../contexts/DataContext';

const { Option } = Select;

const StakingView = () => {
  const [selectedWallet, setContextSelectedWallet] = useContext(WalletContext);
  const [selectedNetwork, setSelectedNetwork] = useContext(NetworkContext);

  const [delegatedAmount, setDelegatedAmount] = useState(0);
  const [casperPrice, setCasperPrice] = useState(0);
  const [accountBalance, setAccountBalance] = useState(0);
  const [wallets, setWallets] = useState();
  const [selectedDelegationWallet, setSelectedDelegationWallet] = useState();
  const [delegationRewards, setDelegationRewards] = useState(0);
  const [validatorWeight, setValidatorWeight] = useState(0);
  const [validatorRewards, setValidatorRewards] = useState(0);
  const [delegationOperations, setDelegationOperations] = useState([]);
  const [amountToDelegate, setAmountToDelegate] = useState(1);
  const [stakeSuccessful, setStakeSuccessful] = useState(false);
  const [isStakePending, setIsStakePending] = useState(false);
  const [data, setData] = useContext(DataContext);
  const [pageLoading, setPageLoading] = useState(true);

  const [result, setResult] = useState('');
  const handleSelect = (value) => {
    console.log(`selected ${value}`);
    setSelectedDelegationWallet(value);
  };
  const onChangeAmount = (value) => {
    setAmountToDelegate(parseFloat(value));
  };
  useEffect(() => {
    async function getStakingDetails() {
      try {
        const weight = await getValidatorWeight(
          selectedWallet?.accountHex,
          selectedNetwork
        );
        setValidatorWeight(weight);
        const cPrice = (await getCasperMarketInformation()).price;
        setCasperPrice(cPrice);
        const userDelegation = await getUserDelegatedAmount(
          selectedWallet?.accountHex,
          selectedNetwork
        );
        const delegated = userDelegation.stakedAmount;
        setDelegatedAmount(delegated);
        const totalRewards = await getDelegatorRewards(
          selectedWallet?.accountHex,
          selectedNetwork
        );
        setDelegationRewards(totalRewards);
        setDelegationOperations(userDelegation.stakingOperations);
        const valRewards = await getValidatorRewards(
          selectedWallet?.accountHex,
          selectedNetwork
        );
        const latestBlockHash = await getLatestBlockInfo();

        setValidatorRewards(valRewards);
        const accBalance = await getAccountBalance(
          selectedWallet?.accountHex,
          latestBlockHash.block.hash,
          selectedNetwork
        );
        setAccountBalance(accBalance);
        setData({
          ...data,
          validatorWeight: weight,
          delegatedAmount: delegated,
          delegationRewards: totalRewards,
          stakingOperations: userDelegation.stakingOperations,
          validatorRewards: valRewards,
          stakingLastUpdate: new Date(),
          cPrice,
          accountBalance: accBalance,
          shouldUpdateStaking: false,
        });
        setPageLoading(false);
      } catch (error) {
        console.log(error);
        notification.error({
          message: 'Error',
          description: error.toString(),
        });
      }
    }
    async function getWallets() {
      const db = Datastore.create({
        filename: `${remote.app.getPath('userData')}/wallets.db`,
        timestampData: true,
      });
      const wallets = await db.find({});
      // for (let index  = 0; index < wallets.length; index++) {
      //   let balance;
      //   let amount = '';
      //   const element = wallets[index];
      //   try {
      //     balance = await getAccountBalance(wallet.accountHex)
      //     amount = balance*(await getCasperMarketInformation()).price
      //   } catch (error) {
      //   balance = 'Inactive account.'
      //   }
      //   wallets[index] = {...element,balance,amount}
      // }
      setWallets(wallets);
    }
    if (
      data.cPrice == 0 ||
      (new Date() - data.stakingLastUpdate) / 1000 > 180 ||
      data.shouldUpdateStaking
    ) {
      console.log('STAKING fetching new dta');
      console.log(
        'STAKING duration = ',
        (new Date() - data.stakingLastUpdate) / 1000
      );
      getStakingDetails();
      getWallets();
      setPageLoading(false);
    } else {
      console.log(
        'STAKING duration = ',
        (new Date() - data.stakingLastUpdate) / 1000
      );
      console.log('STAKING not fetching new data');
      setValidatorWeight(data.weight);
      setCasperPrice(data.cPrice);
      setDelegatedAmount(data.delegatedAmount);

      setDelegationRewards(data.delegationRewards);
      setDelegationOperations(data.stakingOperations);
      setValidatorRewards(data.valRewards);
      setAccountBalance(data.accountBalance);
      setWallets(data.wallets);
      setPageLoading(false);
    }
  }, [selectedNetwork]);

  const earnModalSystem = () => {
    return (
      <div>
        <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        {!stakeSuccessful && (
          <>
            <div className="modal-title">Earn with Arcadia</div>
            <div>
              <div>
                <InputNumber
                  className="modal-input-amount"
                  min={1}
                  max={10000000000}
                  placeholder="Enter Amount"
                  onChange={onChangeAmount}
                  value={amountToDelegate}
                />
              </div>
              <div>
                <Select
                  className="modal-input-select"
                  defaultValue="Source"
                  style={{ width: 120 }}
                  onChange={handleSelect}
                >
                  {wallets &&
                    wallets.map((wallet) => {
                      return (
                        <Option key={wallet._id} value={wallet._id}>
                          {wallet.walletName}
                        </Option>
                      );
                    })}
                </Select>
              </div>
              <div>
                <Button
                  onClick={onEarnConfirm}
                  className="send-button-no-mt"
                  style={{ margin: 'auto', display: 'block' }}
                >
                  {/* {path.join(__dirname,'../src/casperService.js')} */}
                  Delegate
                </Button>
              </div>
            </div>
          </>
        )}
        {stakeSuccessful && (
          <>
            <div className="modal-title">Your transaction information</div>
            <div>
              <span className="modal-description">Deploy hash</span>
              <TextArea
                type="text"
                className="modal-input-amount"
                style={{ padding: '13px' }}
                value={result}
                disabled
              />
              <div>
                <Button
                  onClick={async () => {
                    await navigator.clipboard.writeText(result);
                    openNotification();
                  }}
                  className="send-button-no-mt"
                  style={{ margin: 'auto', display: 'block' }}
                >
                  {/* {path.join(__dirname,'../src/casperService.js')} */}
                  Copy
                </Button>
              </div>
            </div>
          </>
        )}
        {isStakePending && (
          <>
            <Spin
              style={{ margin: 'auto', display: 'block', marginTop: '20px' }}
            />
          </>
        )}
      </div>
    );
  };

  const openNotification = () => {
    notification.success({
      message: 'Copied',
      description: 'Deploy hash copied.',
      duration: 3,
      className: 'custom-notification',
      onClick: () => {},
    });
  };

  const onEarnConfirm = async () => {
    setIsStakePending(true);

    let validatorPublicKey =
      '017d96b9a63abcb61c870a4f55187a0a7ac24096bdb5fc585c12a686a4d892009e';
    if (selectedNetwork === 'casper') {
      validatorPublicKey =
        '01b1126cfaf8f6df4209b5f4a88a5e3bb95f912c0307fa3e1d3e89a3946411b021';
    }
    try {
      const db = Datastore.create({
        filename: `${remote.app.getPath('userData')}/wallets.db`,
        timestampData: true,
      });
      const wallet = await db.findOne({ _id: selectedDelegationWallet });
      console.log('wallet = ', wallet);
      console.log('selectedDelegationWallet = ', selectedDelegationWallet);
      const result = await delegate(
        wallet?.privateKeyUint8,
        validatorPublicKey,
        parseFloat(amountToDelegate) * 1e9,
        selectedNetwork
      );
      result?.data?.deploy_hash
        ? setResult(result?.data?.deploy_hash)
        : setResult(result.data);
      setStakeSuccessful(true);
      setIsStakePending(false);
      console.log('transfer res = ', result);
    } catch (error) {
      alert('error');
      alert(error);
    }
  };

  const customOnCancelLogic = () => {
    setStakeSuccessful(false);
    setResult('');
    setIsStakePending(false);
  };
  return (
    <>
      {(pageLoading || data.shouldUpdateStaking) && (
        <>
          <Spin
            style={{
              margin: 'auto',
              display: 'block',
              marginBottom: '20px',
            }}
          />
        </>
      )}
      <Row gutter={16} justify="space-between" align="middle">
        {/* <Button onClick={test}>ddd</Button> */}

        {validatorWeight > 0 && (
          <>
            <Col span={12}>
              <StakingCard
                tag="Validator Weight"
                amount={`${validatorWeight?.toLocaleString()} CSPR`}
                amountDollars={`${(
                  validatorWeight * casperPrice
                )?.toLocaleString()} USD`}
                // validator="Arcadia"
              />
            </Col>
            <Col span={12}>
              <StakingCard
                tag="Total Validator Rewards"
                amount={`${validatorRewards?.toLocaleString()} CSPR`}
                amountDollars={`${(
                  validatorRewards * casperPrice
                )?.toLocaleString()} USD`}
                // validator="Arcadia"
              />
            </Col>
          </>
        )}

        {delegatedAmount > 0 && !pageLoading && (
          <>
            <Col span={12}>
              <StakingCard
                tag="Delegated"
                amount={`${delegatedAmount?.toLocaleString()} CSPR`}
                amountDollars={`${(
                  delegatedAmount * casperPrice
                )?.toLocaleString()} USD`}
                // validator="Arcadia"
              />
            </Col>
            <Col span={12}>
              <StakingCard
                tag="Total Delegator Rewards"
                amount={`${delegationRewards?.toLocaleString()} CSPR`}
                amountDollars={`${(
                  delegationRewards * casperPrice
                )?.toLocaleString()} USD`}
                // withdraw
              />
            </Col>
          </>
        )}
      </Row>

      <Row gutter={16} justify="space-between" align="middle">
        <Col span={12}>
          <StakingCard
            tag="Undelegated"
            amount={`${accountBalance?.toLocaleString()} CSPR`}
            amountDollars={`${(
              accountBalance * casperPrice
            )?.toLocaleString()} USD`}
          />
        </Col>
        <Col span={12}>
          <AddWallet
            customOnCancelLogic={customOnCancelLogic}
            title="Earn with Arcadia"
            children={earnModalSystem()}
            footer={[
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button type="primary" className="send-button">
                  Delegate
                </Button>
              </div>,
            ]}
          />
        </Col>
      </Row>
      <StakingTable delegationOperations={delegationOperations} />
    </>
  );
};

export default StakingView;