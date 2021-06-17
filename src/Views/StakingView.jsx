import React, { useContext, useEffect, useState } from 'react';
import { InputNumber, Select, Button, Row, Col, notification } from 'antd';
import StakingCard from './../components/StakingCard';
import StakingTable from './../components/StakingTable';
import AddWallet from './../components/AddWallet';

// images
import vault from '../../assets/icons/vault-logo.png';
// styles
import './../App.global.scss';
import { delegate, getAccountBalance, getCasperMarketInformation, getDelegatorRewards, getUserDelegatedAmount, getValidatorRewards, getValidatorWeight } from '../services/casper';
import Datastore from 'nedb-promises';
import { remote } from 'electron';
import WalletContext from '../contexts/WalletContext';
import NetworkContext from '../contexts/NetworkContext';

const { Option } = Select;

const StakingView = () => {
  const [selectedWallet, setContextSelectedWallet] = useContext(WalletContext);
  const [selectedNetwork, setSelectedNetwork] = useContext(NetworkContext);

  const [delegatedAmount, setDelegatedAmount] = useState(0)
  const [casperPrice, setCasperPrice] = useState(0)
  const [accountBalance, setAccountBalance] = useState(0)
  const [wallets, setWallets] = useState()
  const [selectedDelegationWallet, setSelectedDelegationWallet] = useState()
  const [delegationRewards, setDelegationRewards] = useState(0)
  const [validatorWeight, setValidatorWeight] = useState(0)
  const [validatorRewards, setValidatorRewards] = useState(0)
  const [delegationOperations, setDelegationOperations] = useState([])
  const handleSelect = (value) => {
    console.log(`selected ${value}`);
    setSelectedDelegationWallet(value)
  };
  const onChangeAmount = (value) => {
    console.log('changed amount', value);
  };
  useEffect(() => {
    async function getStakingDetails () {
      try {
        const weight = await getValidatorWeight(selectedWallet?.accountHex,selectedNetwork);
        setValidatorWeight(weight)
        const cPrice = (await getCasperMarketInformation()).price;
        setCasperPrice(cPrice);
        let userDelegation = await getUserDelegatedAmount(selectedWallet?.accountHex,selectedNetwork);
        const delegated = userDelegation.stakedAmount;
      setDelegatedAmount(delegated);
      const totalRewards = await getDelegatorRewards(selectedWallet?.accountHex);
      setDelegationRewards(totalRewards)
      setDelegationOperations(userDelegation.stakingOperations)
      const valRewards = await getValidatorRewards(selectedWallet?.accountHex);
      setValidatorRewards(valRewards);
      setAccountBalance(await getAccountBalance(selectedWallet?.accountHex,selectedNetwork))
      } catch (error) {
        console.log(error)
        notification['error']({
          message:'Error',
          description:error.toString()
        })
      }

    }
    async function getWallets(){
      const db = Datastore.create({
        filename:`${remote.app.getPath('userData')}/wallets.db`,
        timestampData:true
      })
      let wallets = await db.find({});
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
      setWallets(wallets)
    }
    getStakingDetails();
    getWallets();
  }, [selectedNetwork])

  const test = async () => {

    // const es = new EventSource('http://18.221.174.26:9999/events',{
    //   withCredentials:true
    // })
    // es.onerror = (e) => {
    //   console.log("An error occurred while attempting to connect.",e);
    // };
    // es.onmessage = function (event) {
    //   console.log('event = ',JSON.parse(event.data));
    // }
    // // es.addEventListener('message',)
    // const tr = await delegate();
    // console.log('delegation = ', tr);
    }


  const earnModalSystem = () => {
    return (
      <div>
        <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Earn with Arcadia</div>
        <div>
          <div>
            <InputNumber
              className="modal-input-amount"
              min={1}
              max={10000000000}
              placeholder="Enter Amount"
              onChange={onChangeAmount}
            />
          </div>
          <div>
            <Select
              className="modal-input-select"
              defaultValue="Source"
              style={{ width: 120 }}
              onChange={handleSelect}
            >
              {wallets && wallets.map((wallet) => {
                console.log('current key = ', wallet.accountHex)
                return(
                  <Option key={wallet._id} value={wallet._id}>{wallet.walletName}</Option>
                )
              })}
            </Select>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
    <Row gutter={16} justify="space-between" align='middle'>
      {/* <Button onClick={test}>ddd</Button> */}
      {validatorWeight > 0 &&
      <>
      <Col span={12}>
      <StakingCard
          tag="Validator Weight"
          amount={validatorWeight.toLocaleString()+" CSPR"}
          amountDollars={(validatorWeight*casperPrice).toLocaleString()+" USD"}
          // validator="Arcadia"
        />
      </Col>
      <Col span={12}>
      <StakingCard
          tag="Total Validator Rewards"
          amount={validatorRewards.toLocaleString()+" CSPR"}
          amountDollars={(validatorRewards*casperPrice).toLocaleString()+" USD"}
          // validator="Arcadia"
        />
      </Col>
</>
      }
      {
        delegatedAmount > 0 &&
        <>
        <Col span={12}>
      <StakingCard
          tag="Delegated"
          amount={delegatedAmount.toLocaleString()+" CSPR"}
          amountDollars={(delegatedAmount*casperPrice).toLocaleString()+" USD"}
          // validator="Arcadia"
        />
      </Col>
      <Col span={12}>
      <StakingCard
          tag="Total Delegator Rewards"
          amount={delegationRewards.toLocaleString()+" CSPR"}
          amountDollars={(delegationRewards*casperPrice).toLocaleString()+" USD"}
          // withdraw
        />
      </Col>
        </>

      }

    </Row>
    <Row gutter={16} justify="space-between" align='middle'>
      <Col span={12}>
      <StakingCard
          tag="Undelegated"
          amount={(accountBalance).toLocaleString()+" CSPR"}
          amountDollars={(accountBalance*casperPrice).toLocaleString()+" USD"}
        />
      </Col>
      <Col span={12}>
      <AddWallet
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
