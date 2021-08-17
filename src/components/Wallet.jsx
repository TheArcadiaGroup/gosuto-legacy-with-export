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
  Spin,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { remote } from 'electron';
import Datastore from 'nedb-promises';
import axios from 'axios';
import GeneralModal from './GeneralModal';

// images
import vault from '../../assets/icons/vault-logo.png';

// styles
import './components.global.scss';
import '../App.global.scss';

import WalletContext from '../contexts/WalletContext';
import { transfer } from '../services/casper';
import NetworkContext from '../contexts/NetworkContext';

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
  setData,
  wallet,
  data,
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
          const wallet = await db.findOne({ _id: id });
          localStorage.setItem('defaultWallet', JSON.stringify(wallet));
          setSelectedWallet(wallet);
          setData({
            ...data,
            shouldUpdateWallet: true,
            shouldUpdateHistory: true,
            shouldUpdateStaking: true,
          });
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
      <Menu.Item key="3" onClick={async () => removeWallet()}>
        Remove
      </Menu.Item>
    </Menu>
  );

  const removeWallet = async () => {
    const defaultWallet = localStorage.getItem('defaultWallet');
    if (defaultWallet) {
      if (JSON.parse(defaultWallet)._id === id) {
        localStorage.removeItem('defaultWallet');
      }
    }
    await db.remove({ _id: id });
    const newWallets = wallets.filter((wallet) => wallet._id != id);
    setWallets(newWallets);
    setData({
      ...data,
      wallets: newWallets,
      walletsLastUpdate: new Date(),
      shouldUpdateWallets: false,
    });
    // setShouldUpdate(!shouldUpdate);
  };
  const showModal = () => {
    setIsModalVisible(true);
  };
  const showWalletDetailsModal = () => {
    setWalletDetailsModalVisible(true);
  };
  const onChangeAmount = (value) => {
    if (parseFloat(value) >= 2.5) setAmountToSend(parseFloat(value));
  };
  const onChangeAddress = (event) => {
    setRecipient(event.target.value);
  };
  const onChangeNote = (event) => {
    console.log('note changed', event.target.value);
    if (event.target.value.indexOf('e') < 0) setNote(event.target.value);
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
        <p style={{ textAlign: 'center' }}>
          {' '}
          min To send is 2.5 caasper and max are {wallet.balance - 0.00001}
        </p>
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
                  max={wallet.balance - 0.00001}
                  placeholder="Enter Amount"
                  onChange={onChangeAmount}
                  value={amountToSend}
                />
                <p>+ fee 0.00001 CSPR</p>
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
                  max={18446744073709551615}
                  min={0}
                  onChange={onChangeNote}
                  value={note}
                  onKeyDown={(evt) =>
                    (evt.key === 'e' ||
                      evt.key === '.' ||
                      evt.key === ',' ||
                      evt.key === '`') &&
                    evt.preventDefault()
                  }
                />
                {note && note > 18446744073709551615 && (
                  <p style={{ color: 'red', fontSize: 13 }}>
                    Transfer ID should be positive number smaller than
                    18446744073709551615
                  </p>
                )}
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
                  disabled={
                    (!(
                      amountToSend < 2.5 ||
                      amountToSend > wallet.balance - 0.00001
                    ) &&
                      !recipient) ||
                    note > 18446744073709551615
                  }
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
              {!result?.toUpperCase().startsWith('ERROR') && (
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
                <>
                  <span className="modal-description">
                    Explorer link{' '}
                    <span style={{ fontSize: 11, color: '#9c9393' }}>
                      (After inclusion in a new block, you can review the{' '}
                      <span
                        role="link"
                        onClick={() => {
                          const url =
                            selectedNetwork === 'casper-test'
                              ? `https://testnet.cspr.live/deploy/${result}`
                              : `https://cspr.live/deploy/${result}`;
                          window.open(url, '_blank');
                        }}
                        style={{
                          cursor: 'pointer',
                          color: 'blue',
                          textDecoration: 'underline',
                        }}
                      >
                        Deploy Details
                      </span>
                      )
                    </span>
                  </span>
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
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const sendConfirmation = () => {};

  const onPrivateKeyExport = async () => {
    const port = parseInt(
      global.location.search.substr(
        global.location.search.indexOf('=') + 1,
        global.location.search.length
      ),
      10
    );
    const wallet = await db.findOne({ _id: id });
    const ret = await axios.post(`http://localhost:${port}/pem`, {
      privateKey: wallet.privateKeyUint8,
    });
    console.log('ret = ', ret.data);
    const { dialog } = remote;
    const options = {
      title: 'Save file',
      defaultPath: wallet?.walletName,
      buttonLabel: 'Save',

      filters: [
        { name: 'pem', extensions: ['pem'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    };
    dialog
      .showSaveDialog(null, options)
      .then(({ filePath }) => {
        const fs = require('fs');
        fs.writeFileSync(filePath, ret.data, 'utf-8');
      })
      .catch((err) => {
        console.log('error =', err);
      });
  };

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
      console.log('selectedNetwork = ', selectedNetwork);
      const transaction = {
        amount: parseFloat(amountToSend) * 1e9,
        deployHash: result?.data?.deploy_hash,
        fromAccount: wallet?.accountHex,
        timestamp: new Date(),
        toAccount: recipient,
        transferId: newNote,
        method: 'Pending',
        network: selectedNetwork,
        wallet: selectedWallet.accountHex,
      };
      console.log('transfer res = ', result);
      const pendingHistoryDB = Datastore.create({
        filename: `${remote.app.getPath('userData')}/pendingHistory.db`,
        timestampData: true,
      });
      if (result?.data?.deploy_hash) {
        await pendingHistoryDB.insert(transaction);
        setData({
          ...data,
          pendingHistory: [...data.pendingHistory, transaction],
          shouldUpdateHistory: true,
        });
        setTimeout(() => {
          console.log('updating wallets');
          setData({
            ...data,
            wallets: 0,
            shouldUpdateWallets: true,
          });
        }, 170000);
      }

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
  const ViewMnemonicModalSystem = () => {
    const [wallet, setWallet] = useState();
    const [newWalletName, setNewWalletName] = useState('');

    useEffect(() => {
      async function getWalletInfo() {
        const walletDb = await db.findOne({ _id: id });
        setWallet(walletDb);
        setNewWalletName(walletDb.walletName);
      }
      getWalletInfo();
    }, [id]);
    const onUpdate = async () => {
      try {
        const walletDb = await db.findOne({ _id: id });
        walletDb.walletName = newWalletName;
        await db.update(
          { _id: id },
          { ...walletDb, walletName: newWalletName }
        );
        setWalletDetailsModalVisible(false);
        notification.success({
          message: 'Success',
          description: 'Wallet name successfully updated',
        });
        setShouldUpdate(!shouldUpdate);
      } catch (error) {
        notification.error({
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
          {selectedOption === 1 && (
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
          {selectedOption === 3 && (
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
                  <>
                    <div style={{ display: 'flex' }}>
                      <Button
                        onClick={() => copyValue(wallet.privateKey)}
                        className="send-button"
                        style={{ margin: 'auto', display: 'block' }}
                      >
                        COPY
                      </Button>
                      <Button
                        onClick={async () => {
                          await onPrivateKeyExport();
                        }}
                        className="send-button"
                        style={{
                          margin: 'auto',
                          display: 'block',
                          marginTop: '10px',
                        }}
                      >
                        EXPORT PEM
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    onClick={() => setShouldRevealPrivateKey(true)}
                    className="send-button"
                    style={{ margin: 'auto', display: 'block' }}
                  >
                    Show private key
                  </Button>
                )}
              </div>
            </>
          )}
          {selectedOption === 0 && (
            <>
              {wallet.hasMnemonic && (
                <>
                  <div className="modal-description">
                    DO NOT share this phrase with anyone! These words can be
                    used to steal all your accounts.
                  </div>
                  <div className="mnemonic-description">
                    {mnemonicWords?.map((word, index) => (
                      <div
                        className="mnemonic-word"
                        key={`mnemonic-word-${index}`}
                      >
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
              // eslint-disable-next-line no-underscore-dangle
              selectedWallet?._id === id
                ? { border: '3px solid #5F24FB', borderRadius: '20px' }
                : { marginBottom: '20px' }
            }
          >
            <div className="wallet-card-display-flex">
              <div className="wallet-card-tag">{tag}</div>
              <div className="dropdown-holder">
                <Dropdown overlay={menu} trigger={['click']}>
                  <div
                    role="menubar"
                    className="ant-dropdown-link dropdown-menu"
                    // onClick={(e) => e.preventDefault()}
                  >
                    . . .
                  </div>
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
        customOnCancelLogic={customOnCancelLogic}
        footer={[
          <div style={{ display: 'flex', justifyContent: 'center' }} key="0">
            <Button type="primary" className="send-button">
              Next
            </Button>
          </div>,
        ]}
      >
        {sendModalSystem()}
      </GeneralModal>
      <GeneralModal
        visible={walletDetailsModalVisible}
        changeVisibility={setWalletDetailsModalVisible}
        customOnCancelLogic={customOnCancelLogic}
        footer={[]}
      >
        {ViewMnemonicModalSystem()}
      </GeneralModal>
    </div>
  );
};

/* Wallet.propTypes = {
  tag: PropTypes.string,
  title: PropTypes.string,
  amount: PropTypes.string,
  secondaryTitle: PropTypes.string,
  secondaryAmount: PropTypes.string,
  id: PropTypes.any,
  db: PropTypes.any,
  setShouldUpdate: PropTypes.any,
  shouldUpdate: PropTypes.any,
  setWallets: PropTypes.any,
  wallets: PropTypes.any,
  setData: PropTypes.any,
  data: PropTypes.any,
}; */

export default Wallet;
