import React, { useEffect, useState } from 'react';
import { Table, Button, InputNumber, Select } from 'antd';
import GeneralModal from './GeneralModal';
import './components.global.scss';

// images
import vault from '../../assets/icons/vault-logo.png';

const { Option } = Select;

const StakingTable = ({delegationOperations}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [amountToDelegate, setAmountToDelegate] = useState(0)
  const [data, setData] = useState([])

  useEffect(() => {
    if(delegationOperations.length>0){
      let d = [];
      delegationOperations.forEach((val,i) => {
        d.push({
          key:i,
          ...val,
          delegationRate : val.delegationRate+"%",
          selfStake: val.selfStake.toLocaleString(),
          stakedAmount: val.stakedAmount.toLocaleString(),
        })
      })
      setData(d);
    }
  }, [delegationOperations])
  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleSelect = (value) => {
    console.log(`selected ${value}`);
  };
  const onChangeAmount = (value) => {
    console.log('changed amount', value);
    setAmountToDelegate(value)
  };
  const columns = [
    { title: 'Validators', dataIndex: 'validator', key: 'validator' },
    {
      title: 'Validator Commission',
      dataIndex: 'delegationRate',
      key: 'delegationRate',
      sortDirections: ['ascend', 'descend', 'ascend'],
      sorter: (a, b) => parseFloat(a.delegationRate.replace('%','')) - parseFloat(b.delegationRate.replace('%','')),
    },
    {
      title: 'Self-Stake',
      dataIndex: 'selfStake',
      key: 'selfStake',
      sortDirections: ['ascend', 'descend', 'ascend'],
      sorter: (a, b) => parseFloat(a.selfStake.replace(',','')) - parseFloat(b.selfStake.replace(',','')),
    },
    { title: 'Validator Weight', dataIndex: 'weight', key: 'weight',
    sortDirections: ['ascend', 'descend', 'ascend'],
    // sorter: (a, b) => parseFloat(a.weight.replace('%','')) - parseFloat(b.weight.replace('%','')),
   },
    { title: 'Staked Amount', dataIndex: 'stakedAmount', key: 'stakedAmount',
    sortDirections: ['ascend', 'descend', 'ascend'],
    sorter: (a, b) => parseFloat(a.stakedAmount.replace(',','')) - parseFloat(b.stakedAmount.replace(',','')),
  },
    {
      title: '',
      dataIndex: '',
      key: 'x',
      render: () => (
        <Button type="primary" className="send-button-no-mt" onClick={showModal}>
          Undelegate
        </Button>
      ),
    },
  ];


  return (
    <div>
      <Table columns={columns} dataSource={data} pagination={false} />
      <GeneralModal
        visible={isModalVisible}
        changeVisibility={setIsModalVisible}
        children={'Coming soon...'}
        footer={[
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="primary" className="send-button">
              Undelegate
            </Button>
          </div>,
        ]}
      />
    </div>
  );
};

export default StakingTable;
