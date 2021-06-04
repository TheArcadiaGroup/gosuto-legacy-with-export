import React, { useState } from 'react';
import { InputNumber, Select, Button, Card, Input } from 'antd';
import StakingCard from '../components/StakingCard';
import StakingTable from '../components/StakingTable';
import AddWallet from '../components/AddWallet';

// images
import vault from '../../assets/icons/vault-logo.png';
// styles
import './../App.global.scss';

const { Option } = Select;

const PasswordView = () => {
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
  const [password, setPassword] = useState()
  const onPasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const onConnect = (e) => {
  }

  return (
    <>
      <Card>
        Password:
       <Input
       onChange={(e) => {onPasswordChange(e)}}
       />
       <Button
       onClick={onConnect}
       >
         Connect
       </Button>
      </Card>
    </>
  );
};

export default PasswordView;
