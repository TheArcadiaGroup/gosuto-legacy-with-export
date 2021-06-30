import React, { useContext, useEffect, useState } from 'react';
import { Table, Button, InputNumber, Select, Spin, notification } from 'antd';
import GeneralModal from './GeneralModal';
import './components.global.scss';
import TextArea from 'antd/lib/input/TextArea';

// images
import vault from '../../assets/icons/vault-logo.png';
import { undelegate } from '../services/casper';
import { remote } from 'electron';
import Datastore from 'nedb-promises';
import WalletContext from '../contexts/WalletContext';
import NetworkContext from '../contexts/NetworkContext';

const { Option } = Select;

const StakingTable = ({ delegationOperations }) => {
  const [selectedWallet, setContextSelectedWallet] = useContext(WalletContext);
  const [selectedNetwork, setSelectedNetwork] = useContext(NetworkContext);

  const [isPendingUndelegation, setIsPendingUndelegation] = useState(false);
  const [amountToUndelegate, setAmountToUndelegate] = useState(1);
  const [undelegationComplete, setUndelegationComplete] = useState(false);
  const [result, setResult] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [validatorPublicKey, setValidatorPublicKey] = useState('');

  useEffect(() => {
    if (delegationOperations.length > 0) {
      let d = [];
      delegationOperations.forEach((val, i) => {
        d.push({
          key: i,
          ...val,
          delegationRate: val.delegationRate + '%',
          selfStake: val.selfStake.toLocaleString(),
          stakedAmount: val.stakedAmount.toLocaleString(),
        });
      });
      setData(d);
    }
  }, [delegationOperations]);
  const showModal = (publicKey) => {
    // alert(validatorPublicKey)
    setValidatorPublicKey(publicKey);
    setIsModalVisible(true);
  };
  const handleSelect = (value) => {
    console.log(`selected ${value}`);
  };
  const onChangeAmount = (value) => {
    console.log('changed amount', value);
    setAmountToUndelegate(parseFloat(value));
  };
  const columns = [
    { title: 'Validators', dataIndex: 'validator', key: 'validator' },
    {
      title: 'Validator Commission',
      dataIndex: 'delegationRate',
      key: 'delegationRate',
      sortDirections: ['ascend', 'descend', 'ascend'],
      sorter: (a, b) =>
        parseFloat(a.delegationRate.replace('%', '')) -
        parseFloat(b.delegationRate.replace('%', '')),
    },
    {
      title: 'Self-Stake',
      dataIndex: 'selfStake',
      key: 'selfStake',
      sortDirections: ['ascend', 'descend', 'ascend'],
      sorter: (a, b) =>
        parseFloat(a.selfStake.replace(',', '')) -
        parseFloat(b.selfStake.replace(',', '')),
    },
    {
      title: 'Validator Weight',
      dataIndex: 'validatorWeight',
      key: 'validatorWeight',
      sortDirections: ['ascend', 'descend', 'ascend'],
      // sorter: (a, b) => parseFloat(a.weight.replace('%','')) - parseFloat(b.weight.replace('%','')),
    },
    {
      title: 'Staked Amount',
      dataIndex: 'stakedAmount',
      key: 'stakedAmount',
      sortDirections: ['ascend', 'descend', 'ascend'],
      sorter: (a, b) =>
        parseFloat(a.stakedAmount.replace(',', '')) -
        parseFloat(b.stakedAmount.replace(',', '')),
    },
    {
      title: '',
      dataIndex: '',
      key: 'x',
      render: (text, record, index) => (
        <Button
          type="primary"
          className="send-button-no-mt"
          onClick={() => {
            showModal(record.validator);
          }}
        >
          Undelegate
        </Button>
      ),
    },
  ];

  const openNotification = () => {
    notification.success({
      message: 'Copied',
      description: 'Text has been copied to clipboard.',
      duration: 3,
      className: 'custom-notification',
      onClick: () => {},
    });
  };
  const customOnCancelLogic = async () => {
    setIsPendingUndelegation(false);
    setUndelegationComplete(false);
  };
  const onUndelegateConfirm = async () => {
    try {
      setIsPendingUndelegation(true);
      const db = Datastore.create({
        filename: `${remote.app.getPath('userData')}/wallets.db`,
        timestampData: true,
      });
      let wallet = await db.findOne({ _id: selectedWallet?._id });
      const output = await undelegate(
        // selectedWallet?.publicKeyUint8,
        wallet?.privateKeyUint8,
        validatorPublicKey,
        parseFloat(amountToUndelegate) * 1e9,
        selectedNetwork
      );
      output?.data?.deploy_hash
        ? setResult(output?.data?.deploy_hash)
        : setResult(output.data);
      console.log('transfer res = ', result);
      setIsPendingUndelegation(false);
      setUndelegationComplete(true);
    } catch (error) {
      alert('error');
      alert(error);
    }
  };
  const undelegateModal = () => {
    return (
      <div>
        <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Undelegate</div>
        {isPendingUndelegation && (
          <>
            <Spin style={{ margin: 'auto', display: 'block' }} />
          </>
        )}
        {!isPendingUndelegation && !undelegationComplete && (
          <>
            <div>
              <div>
                <InputNumber
                  className="modal-input-amount"
                  min={1}
                  max={10000000000}
                  placeholder="Enter Amount"
                  onChange={onChangeAmount}
                  value={amountToUndelegate}
                />
              </div>
              <div>
                <Button
                  onClick={onUndelegateConfirm}
                  className="send-button-no-mt"
                  style={{ margin: 'auto', display: 'block' }}
                >
                  {/* {path.join(__dirname,'../src/casperService.js')} */}
                  Undelegate
                </Button>
              </div>
            </div>
          </>
        )}
        {undelegationComplete && (
          <>
            <div className="modal-subtitle">Your transaction information</div>
            <div>
              {!result.toUpperCase().startsWith('ERROR') && (
                <span className="modal-description">Deploy hash</span>
              )}

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
      </div>
    );
  };

  return (
    <div>
      <Table columns={columns} dataSource={data} pagination={false} />
      <GeneralModal
        visible={isModalVisible}
        changeVisibility={setIsModalVisible}
        customOnCancelLogic={customOnCancelLogic}
        children={undelegateModal()}
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
