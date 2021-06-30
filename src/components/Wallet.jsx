import React, { useContext, useEffect, useState } from 'react';
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
  Space,
  Spin,
} from 'antd';
import GeneralModal from './GeneralModal';
const path = require('path');
import TextArea from 'antd/lib/input/TextArea';

// images
import vault from '../../assets/icons/vault-logo.png';

// styles
import './components.global.scss';
import '../App.global.scss';

import Datastore from 'nedb-promises';
import { remote } from 'electron';
import WalletContext from '../contexts/WalletContext';
import { transfer } from '../services/casper';
import NetworkContext from '../contexts/NetworkContext';

const { Option } = Select;

const Wallet = ({
  tag,
  title,
  amount,
  secondaryTitle,
  secondaryAmount,
  id,
  db,
  setShouldUpdate,
  shouldUpdate,
  setWallets,
  wallets,
}) => {
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const [selectedNetwork, setSelectedNetwork] = useContext(NetworkContext);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [walletDetailsModalVisible, setWalletDetailsModalVisible] =
    useState(false);
  const [result, setResult] = useState('Nothing yet');
  const [selectedOption, setSelectedOption] = useState(-1);
  const [amountToSend, setAmountToSend] = useState('2.5');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [network, setNetwork] = useState('');
  const [isPendingTransfer, setIsPendingTransfer] = useState(false);
  const [sendComplete, setSendComplete] = useState(false);
  const [shouldRevealPrivateKey, setShouldRevealPrivateKey] = useState(false);

  const openNotification = () => {
    notification.success({
      message: 'Copied',
      description: 'Text has been copied to clipboard.',
      duration: 3,
      className: 'custom-notification',
      onClick: () => {},
    });
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="-1"
        onClick={async () => {
          const db = Datastore.create({
            filename: `${remote.app.getPath('userData')}/wallets.db`,
            timestampData: true,
          });
          let wallet = await db.findOne({ _id: id });
          localStorage.setItem('defaultWallet', JSON.stringify(wallet));
          setSelectedWallet(wallet);
        }}
      >
        Set default wallet
      </Menu.Item>
      <Menu.Item
        key="0"
        onClick={() => {
          setSelectedOption(0);
          setWalletDetailsModalVisible(true);
        }}
      >
        View mnemonic
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={() => {
          setSelectedOption(3);
          setWalletDetailsModalVisible(true);
        }}
      >
        View keys
      </Menu.Item>
      <Menu.Item
        key="1"
        onClick={() => {
          setSelectedOption(1);
          setWalletDetailsModalVisible(true);
        }}
      >
        Edit
      </Menu.Item>
      <Menu.Item key="3" onClick={async () => await removeWallet()}>
        Remove
      </Menu.Item>
    </Menu>
  );

  const removeWallet = async () => {
    const defaultWallet = localStorage.getItem('defaultWallet');
    if (defaultWallet) {
      if (JSON.parse(defaultWallet)._id == id) {
        localStorage.removeItem('defaultWallet');
      }
    }
    await db.remove({ _id: id });
    const newWallets = wallets.filter((wallet) => wallet._id != id);
    setWallets(newWallets);
    // setShouldUpdate(!shouldUpdate);
  };
  const showModal = () => {
    setIsModalVisible(true);
  };
  const showWalletDetailsModal = () => {
    setWalletDetailsModalVisible(true);
  };
  const onChangeAmount = (value) => {
    setAmountToSend(parseFloat(value));
  };
  const onChangeAddress = (event) => {
    setRecipient(event.target.value);
  };
  const onChangeNote = (event) => {
    setNote(event.target.value);
  };
  const handleSelect = (value) => {
    setNetwork(value);
  };
  const sendModalSystem = () => {
    return (
      <div>
        <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Send CSPR</div>
        {isPendingTransfer && (
          <>
            <Spin style={{ margin: 'auto', display: 'block' }} />
          </>
        )}
        {!isPendingTransfer && !sendComplete && (
          <>
            <div>
              <div>
                <InputNumber
                  className="modal-input-amount"
                  min={2.5}
                  max={10000000000}
                  placeholder="Enter Amount"
                  onChange={onChangeAmount}
                  value={amountToSend}
                />
              </div>
              <div>
                <Input
                  className="modal-input-address"
                  placeholder="Recipient Address"
                  onChange={onChangeAddress}
                  value={recipient}
                />
              </div>
              <div>
                <Input
                  type="number"
                  className="modal-input-note"
                  placeholder="Transfer ID (optional)"
                  onChange={onChangeNote}
                  value={note}
                />
              </div>
              {/* <div>
            <Select
              className="modal-input-select"
              defaultValue="CSPRNetwork"
              style={{ width: 120 }}
              onChange={handleSelect}
              value={network}
            >
              <Option value="CSPRNetwork">CSPR Network</Option>
              <Option value="CSPR">CSPR</Option>
            </Select>
          </div> */}
              <div>
                <Button
                  onClick={onSendConfirm}
                  className="send-button-no-mt"
                  style={{ margin: 'auto', display: 'block' }}
                >
                  {/* {path.join(__dirname,'../src/casperService.js')} */}
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
        {sendComplete && (
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
              {!result.toUpperCase().startsWith('ERROR') && (
                <span className="modal-description">Explorer link</span>
              )}
              <TextArea
                type="text"
                className="modal-input-amount"
                style={{ padding: '13px', cursor: 'pointer' }}
                value={
                  selectedNetwork === 'casper-test'
                    ? `https://testnet.cspr.live/deploy/${result}`
                    : `https://cspr.live/deploy/${result}`
                }
                disabled
              />
              <div style={{ display: 'flex' }}>
                <Button
                  onClick={async () => {
                    const url =
                      selectedNetwork === 'casper-test'
                        ? `https://testnet.cspr.live/deploy/${result}`
                        : `https://cspr.live/deploy/${result}`;
                    await navigator.clipboard.writeText(url);
                    openNotification();
                  }}
                  className="send-button-no-mt"
                  style={{ margin: 'auto', display: 'block' }}
                >
                  {/* {path.join(__dirname,'../src/casperService.js')} */}
                  Copy
                </Button>
                <Button
                  onClick={() => {
                    const url =
                      selectedNetwork === 'casper-test'
                        ? `https://testnet.cspr.live/deploy/${result}`
                        : `https://cspr.live/deploy/${result}`;
                    window.open(url, '_blank');
                  }}
                  className="send-button-no-mt"
                  style={{ margin: 'auto', display: 'block' }}
                >
                  {/* {path.join(__dirname,'../src/casperService.js')} */}
                  Open in browser
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const sendConfirmation = () => {};

  const onSendConfirm = async () => {
    try {
      setIsPendingTransfer(true);
      const wallet = await db.findOne({ _id: id });
      let newNote;
      if (Number.isNaN(parseInt(note, 10))) {
        newNote = new Date().getTime();
      } else {
        newNote = note;
      }
      const result = await transfer(
        // selectedWallet?.publicKeyUint8,
        wallet?.privateKeyUint8,
        recipient,
        parseFloat(amountToSend) * 1e9,
        selectedNetwork,
        newNote
      );
      result?.data?.deploy_hash
        ? setResult(result?.data?.deploy_hash)
        : setResult(result.data);
      console.log('transfer res = ', result);
      setIsPendingTransfer(false);
      setSendComplete(true);
    } catch (error) {
      alert('error');
      alert(error);
    }
  };

  const customOnCancelLogic = () => {
    setSendComplete(false);
    setResult('');
    setShouldRevealPrivateKey(false);
  };

  const copyValue = async (valueToCopy) => {
    await navigator.clipboard.writeText(valueToCopy);
    openNotification();
  };
  const viewMnemonicModalSystem = () => {
    const [wallet, setWallet] = useState();
    const [newWalletName, setNewWalletName] = useState('');
    useEffect(() => {
      async function getWalletInfo() {
        const db = Datastore.create({
          filename: `${remote.app.getPath('userData')}/wallets.db`,
          timestampData: true,
        });
        let wallet = await db.findOne({ _id: id });
        console.log('found wallet = ', wallet);
        setWallet(wallet);
        setNewWalletName(wallet.walletName);
      }
      getWalletInfo();
    }, [id]);
    const onUpdate = async () => {
      try {
        const db = Datastore.create({
          filename: `${remote.app.getPath('userData')}/wallets.db`,
          timestampData: true,
        });
        let wallet = await db.findOne({ _id: id });
        wallet.walletName = newWalletName;
        await db.update({ _id: id }, { ...wallet, walletName: newWalletName });
        setWalletDetailsModalVisible(false);
        notification['success']({
          message: 'Success',
          description: 'Wallet name successfully updated',
        });
        setShouldUpdate(!shouldUpdate);
      } catch (error) {
        notification['error']({
          message: 'Error',
          description: error,
        });
      }
    };

    const mnemonicWords = wallet?.mnemonic?.split(' ');
    return (
      wallet && (
        <div>
          <div className="modal-vault-logo">
            <img src={vault} alt="vault" className="image-modal" />
          </div>
          <div className="modal-title">{wallet.walletName}</div>
          {selectedOption == 1 && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <span className="modal-content">Wallet name:</span>
                <div style={{ display: 'flex' }}>
                  <Input
                    value={newWalletName}
                    onChange={(e) => {
                      setNewWalletName(e.target.value);
                    }}
                  />
                  <Button onClick={onUpdate}>Update</Button>
                </div>
              </div>
            </>
          )}
          {selectedOption == 3 && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <span className="modal-description">Public key</span>
                <TextArea
                  value={wallet.accountHex}
                  type="text"
                  className="modal-input-amount"
                  style={{ padding: '13px' }}
                />
                <Button
                  onClick={() => copyValue(wallet.accountHex)}
                  className="send-button-no-mt"
                  style={{ margin: 'auto', display: 'block' }}
                >
                  COPY
                </Button>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <span className="modal-description">Account hash</span>
                <TextArea
                  value={wallet.accountHash}
                  type="text"
                  className="modal-input-amount"
                  style={{ padding: '13px' }}
                />
                <Button
                  onClick={() => copyValue(wallet.accountHash)}
                  className="send-button-no-mt"
                  style={{ margin: 'auto', display: 'block' }}
                >
                  COPY
                </Button>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <span className="modal-description">Private key</span>

                <TextArea
                  value={wallet.privateKey}
                  type="text"
                  rows={3}
                  hidden={!shouldRevealPrivateKey}
                  className="modal-input-amount"
                  style={{ padding: '13px' }}
                />

                {shouldRevealPrivateKey ? (
                  <Button
                    onClick={() => copyValue(wallet.privateKey)}
                    className="send-button-no-mt"
                    style={{ margin: 'auto', display: 'block' }}
                  >
                    COPY
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShouldRevealPrivateKey(true)}
                    className="send-button-no-mt"
                    style={{ margin: 'auto', display: 'block' }}
                  >
                    Show private key
                  </Button>
                )}
              </div>
            </>
          )}
          {selectedOption == 0 && (
            <>
              {wallet.hasMnemonic && (
                <>
                  <div className="modal-description">
                    DO NOT share this phrase with anyone! These words can be
                    used to steal all your accounts.
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
              )}
              {!wallet.hasMnemonic && (
                <div className="modal-description">
                  Unable to get mnemonic for this wallet.
                </div>
              )}
            </>
          )}
        </div>
      )
    );
  };

  return (
    <div className="site-card-wrapper">
      <Row gutter={16}>
        <Col span={24}>
          <Card
            bordered={false}
            className="wallet-card"
            style={
              selectedWallet?._id == id
                ? { border: '3px solid #5F24FB', borderRadius: '20px' }
                : { marginBottom: '20px' }
            }
          >
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
        customOnCancelLogic={customOnCancelLogic}
        footer={[
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="primary" className="send-button">
              {}
              Next
            </Button>
          </div>,
        ]}
      />
      <GeneralModal
        visible={walletDetailsModalVisible}
        changeVisibility={setWalletDetailsModalVisible}
        children={viewMnemonicModalSystem()}
        customOnCancelLogic={customOnCancelLogic}
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
