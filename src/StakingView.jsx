import React from 'react';
import { InputNumber, Select, Button } from 'antd';
import StakingCard from './components/StakingCard';
import StakingTable from './components/StakingTable';
import AddWallet from './components/AddWallet';

// images
import vault from '../assets/icons/vault-logo.png';
// styles
import './App.global.scss';

const { Option } = Select;

const StakingView = () => {
  const handleSelect = (value) => {
    console.log(`selected ${value}`);
  };
  const onChangeAmount = (value) => {
    console.log('changed amount', value);
  };
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
              defaultValue="source"
              style={{ width: 120 }}
              onChange={handleSelect}
            >
              <Option value="source">Source</Option>
              <Option value="CSPR">CSPR</Option>
            </Select>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      <div className="spacing-wallets-index">
        <StakingCard
          tag="Delegated"
          amount="85.0150 CSPR"
          amountDollars="851.01 USD"
          validator="Arcadia"
        />
        <StakingCard
          tag="Rewards"
          amount="0.5050 CSPR"
          amountDollars="5.05 USD"
          withdraw
        />
      </div>
      <div className="spacing-wallets-index">
        <StakingCard
          tag="Undelegated"
          amount="165.4860 CSPR"
          amountDollars="1656.53 USD"
        />
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
      </div>
      <StakingTable />
    </>
  );
};

export default StakingView;
