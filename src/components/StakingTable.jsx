import React from 'react';
import { Table, Button } from 'antd';
import './components.global.scss';

const StakingTable = () => {
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
        <Button type="primary" className="send-button">
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
    </div>
  );
};

export default StakingTable;
