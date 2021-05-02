import React, { useState } from 'react';
import { Table, Button, InputNumber, Select } from 'antd';
import GeneralModal from './GeneralModal';
import './components.global.scss';

// images
import vault from '../../assets/icons/vault-logo.png';

const { Option } = Select;

const StakingTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
  };
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
  const columns = [
    { title: 'Validators', dataIndex: 'validators', key: 'validators' },
    { title: 'Uptime', dataIndex: 'uptime', key: 'uptime' },
    {
      title: 'Delegation Return',
      dataIndex: 'delegationReturn',
      key: 'delegationReturn',
    },
    {
      title: 'Validator Commission',
      dataIndex: 'validatorCommission',
      key: 'validatorCommission',
    },
    {
      title: 'Self-delegation',
      dataIndex: 'selfDelegation',
      key: 'selfDelegation',
    },
    { title: 'Voting power', dataIndex: 'votingPower', key: 'votingPower' },
    {
      title: '',
      dataIndex: '',
      key: 'x',
      render: () => (
        <Button type="primary" className="send-button" onClick={showModal}>
          Delegate
        </Button>
      ),
    },
  ];

  const data = [
    {
      key: 1,
      validators: 'Arcadia',
      uptime: '100%',
      delegationReturn: '40.05%',
      validatorCommission: '5%',
      selfDelegation: '0.01%',
      votingPower: '0.05%',
    },
    {
      key: 1,
      validators: 'Arcadia',
      uptime: '100%',
      delegationReturn: '40.05%',
      validatorCommission: '5%',
      selfDelegation: '0.01%',
      votingPower: '0.05%',
    },
    {
      key: 1,
      validators: 'Arcadia',
      uptime: '100%',
      delegationReturn: '40.05%',
      validatorCommission: '5%',
      selfDelegation: '0.01%',
      votingPower: '0.05%',
    },
    {
      key: 1,
      validators: 'Arcadia',
      uptime: '100%',
      delegationReturn: '40.05%',
      validatorCommission: '5%',
      selfDelegation: '0.01%',
      votingPower: '0.05%',
    },
    {
      key: 1,
      validators: 'Arcadia',
      uptime: '100%',
      delegationReturn: '40.05%',
      validatorCommission: '5%',
      selfDelegation: '0.01%',
      votingPower: '0.05%',
    },
  ];
  return (
    <div>
      <Table columns={columns} dataSource={data} pagination={false} />
      <GeneralModal
        visible={isModalVisible}
        changeVisibility={setIsModalVisible}
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
  );
};

export default StakingTable;
