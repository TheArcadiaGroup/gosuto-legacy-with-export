import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Col,
  Row,
  Button,
  Menu,
  Dropdown,
  InputNumber,
  Input,
  Select,
  Tag,
  notification,
  message,
} from 'antd';
import GeneralModal from './GeneralModal';

// images
import vault from '../../assets/icons/vault-logo.png';

// styles
import './components.global.scss';
import Datastore from 'nedb-promises';
import { remote } from 'electron';

const { Option } = Select;


const Wallet = ({ tag, title, amount, secondaryTitle, secondaryAmount, id,db,setShouldUpdate,shouldUpdate }) => {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [walletDetailsModalVisible, setWalletDetailsModalVisible] = useState(false)
  const [selectedOption, setSelectedOption] = useState(-1)

const menu = (
  <Menu>
    <Menu.Item key="0" onClick={() => {
      setSelectedOption(0)
      setWalletDetailsModalVisible(true)
    }}>View mnemonic</Menu.Item>
    <Menu.Item key="1" onClick={() => {
      setSelectedOption(1)
      setWalletDetailsModalVisible(true)
    }}>Edit</Menu.Item>
    <Menu.Item key="2" onClick={() => removeWallet()}>Remove</Menu.Item>
  </Menu>
);

const removeWallet = async () => {
  await db.remove({_id:id});
  setShouldUpdate(!shouldUpdate);
}
  const showModal = () => {
    setIsModalVisible(true);
  };
  const showWalletDetailsModal = () => {
    setWalletDetailsModalVisible(true);
  };
  const onChangeAmount = (value) => {
    console.log('changed amount', value);
  };
  const onChangeAddress = (value) => {
    console.log('changed address', value);
  };
  const onChangeNote = (value) => {
    console.log('changed note', value);
  };
  const handleSelect = (value) => {
    console.log(`selected ${value}`);
  };
  const sendModalSystem = () => {
    return (
      <div>
        <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Send CSPR</div>
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
            <Input
              className="modal-input-address"
              placeholder="Recipient Address"
              onChange={onChangeAddress}
            />
          </div>
          <div>
            <Input
              className="modal-input-note"
              placeholder="Note (optional)"
              onChange={onChangeNote}
            />
          </div>
          <div>
            <Select
              className="modal-input-select"
              defaultValue="CSPRNetwork"
              style={{ width: 120 }}
              onChange={handleSelect}
            >
              <Option value="CSPRNetwork">CSPR Network</Option>
              <Option value="CSPR">CSPR</Option>
            </Select>
          </div>
        </div>
      </div>
    );
  };
  const viewMnemonicModalSystem = () => {
    const [wallet, setWallet] = useState()
    const [newWalletName, setNewWalletName] = useState('')
    useEffect(() => {
      async function getWalletInfo() {
        const db = Datastore.create({
          filename:`${remote.app.getPath('userData')}/wallets.db`,
          timestampData:true
        })
        let wallet = await db.findOne({_id:id});
        console.log('found wallet = ', wallet)
        setWallet(wallet);
        setNewWalletName(wallet.walletName)
      }
      getWalletInfo();
    }, [id])
    const onUpdate = async () => {
      try {
        const db = Datastore.create({
          filename:`${remote.app.getPath('userData')}/wallets.db`,
          timestampData:true
        })
        let wallet = await db.findOne({_id:id});
        wallet.walletName = newWalletName;
        await db.update({_id:id},{...wallet,walletName:newWalletName});
        setWalletDetailsModalVisible(false);
        notification['success']({
          message:'Success',
          description:'Wallet name successfully updated'
        }
        )
        setShouldUpdate(!shouldUpdate);
      } catch (error) {
        notification['error']({
          message:'Error',
          description:error
        })
      }

    }

    const mnemonicWords = wallet?.mnemonic?.split(' ');
    return (
      wallet &&
      <div>

        <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">{wallet.walletName}</div>
        {wallet.mnemonic}
        {wallet.accountHash}
        {
          selectedOption == 1 &&
          <>
        <div>
          <span className="modal-content">Wallet name:</span>
          <div style={{display:'flex'}}>
          <Input
          value={newWalletName}
          onChange={(e) => {setNewWalletName(e.target.value)}}
          />
          <Button onClick={onUpdate}>Update</Button>
          </div>

        </div>
          </>
      }
        {selectedOption == 0 &&
          <>
        <div className="modal-description">
        DO NOT share this phrase with anyone!
        These words can be used to steal all your accounts.
        </div>
        <div className="mnemonic-description">
          {mnemonicWords?.map((word, index) => (
            <div className="mnemonic-word" key={index}>
              <span className="mnemonic-number">{index + 1}.</span>{' '}
              <Tag className="mnemonic-tag" color="processing">
                {word}
              </Tag>
            </div>
          ))}
          </div>
        </>
        }

        </div>

    );
  };

  return (
    <div className="site-card-wrapper">
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} className="wallet-card" style={{marginBottom:'20px'}}>
            <div className="wallet-card-display-flex">
              <div className="wallet-card-tag">{tag}</div>
              <div className="dropdown-holder">
                <Dropdown overlay={menu} trigger={['click']}>
                  <a
                    className="ant-dropdown-link dropdown-menu"
                    onClick={(e) => e.preventDefault()}
                  >
                    . . .
                  </a>
                </Dropdown>
              </div>
            </div>
            <div className="wallet-card-display-flex">
              <div className="wallet-card-title">{title}</div>
              <Button
                type="primary"
                className="send-button"
                onClick={showModal}
              >
                Send
              </Button>
            </div>
            <div className="wallet-card-amount">{amount}</div>
            <div className="wallet-card-display-flex">
              <div className="wallet-card-secondary-title">
                {secondaryTitle}
              </div>
            </div>
            <div className="wallet-card-secondary-amount">
              {secondaryAmount}
            </div>
          </Card>
        </Col>
      </Row>
      <GeneralModal
        visible={isModalVisible}
        changeVisibility={setIsModalVisible}
        children={sendModalSystem()}
        footer={[
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="primary" className="send-button">
              Next
            </Button>
          </div>,
        ]}
      />
      <GeneralModal
        visible={walletDetailsModalVisible}
        changeVisibility={setWalletDetailsModalVisible}
        children={viewMnemonicModalSystem()}
        footer={[]}
      />
    </div>
  );
};

Wallet.propTypes = {
  tag: PropTypes.string,
  title: PropTypes.string,
  amount: PropTypes.string,
  secondaryTitle: PropTypes.string,
  secondaryAmount: PropTypes.string,
};

export default Wallet;
