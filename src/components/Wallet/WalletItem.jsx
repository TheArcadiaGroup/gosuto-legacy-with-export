/* eslint-disable no-underscore-dangle */
import React, { useContext, useState } from 'react';
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
  Tag,
  notification,
  Spin,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { remote } from 'electron';
import Datastore from 'nedb-promises';
import axios from 'axios';
import { MoreOutlined } from '@ant-design/icons';
import GeneralModal from '../GeneralModal';

// images
import vault from '../../../assets/icons/vault-logo.png';

// styles
import '../components.global.scss';
import '../../App.global.scss';

import WalletContext from '../../contexts/WalletContext';
import { transfer } from '../../services/casper';
import NetworkContext from '../../contexts/NetworkContext';
import DataContext from '../../contexts/DataContext';

const fs = require('fs');

const WalletItem = (props) => {
  const {
    title,
    amount,
    secondaryTitle,
    secondaryAmount,
    wallet,
    casperPrice,
  } = props;
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const [selectedNetwork] = useContext(NetworkContext);
  const [data, setData] = useContext(DataContext);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [walletDetailsModalVisible, setWalletDetailsModalVisible] =
    useState(false);
  const [result, setResult] = useState('Nothing yet');
  const [selectedOption, setSelectedOption] = useState(-1);
  const [amountToSend, setAmountToSend] = useState(2.5);
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [isPendingTransfer, setIsPendingTransfer] = useState(false);
  const [sendComplete, setSendComplete] = useState(false);
  const [shouldRevealPrivateKey, setShouldRevealPrivateKey] = useState(false);
  const db = Datastore.create({
    filename: `${remote.app.getPath('userData')}/wallets.db`,
    timestampData: true,
  });
  const openNotification = () => {
    notification.success({
      message: 'Copied',
      description: 'Text has been copied to clipboard.',
      duration: 3,
      className: 'custom-notification',
      onClick: () => {},
    });
  };

  const removeWallet = async () => {
    await db.remove({ _id: wallet._id });
    notification.success({
      message: 'Success',
      description: 'Wallet successfully removed',
    });
    const newWallets = data.wallets.filter(
      (walletLocal) => walletLocal._id !== wallet._id
    );
    const defaultWallet = localStorage.getItem('defaultWallet');
    if (JSON.parse(defaultWallet)._id === wallet._id) {
      if (newWallets.length > 0) {
        localStorage.setItem('defaultWallet', JSON.stringify(newWallets[0]));
        setSelectedWallet(newWallets[0]);
        notification.success({
          message: 'Info',
          description: 'New default Wallet Is Seted For You',
        });
      } else {
        localStorage.removeItem('defaultWallet');
        setSelectedWallet(null);
      }
    }
    setData({
      ...data,
      wallets: newWallets,
      shouldUpdateWallets: true,
    });
  };
  const menu = (
    <Menu>
      <Menu.Item
        key="-1"
        onClick={async () => {
          const defaultwallet = await db.findOne({ _id: selectedWallet._id });
          localStorage.setItem('defaultWallet', JSON.stringify(wallet));
          await db.update(
            { _id: wallet._id },
            { ...wallet, isDefaultWallet: true }
          );
          await db.update(
            { _id: defaultwallet._id },
            { ...defaultwallet, isDefaultWallet: false }
          );
          setSelectedWallet(wallet);
          setData({
            ...data,
            shouldUpdateWallet: true,
            shouldUpdateWallets: true,
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

  const showModal = () => {
    setIsModalVisible(true);
  };
  const onChangeAmount = (value) => {
    if (parseFloat(value) >= 2.5) setAmountToSend(parseFloat(value));
  };
  const onChangeAddress = (event) => {
    setRecipient(event.target.value);
  };
  const onChangeNote = (event) => {
    if (event.target.value.indexOf('-') >= 0) return;
    if (Number.isNaN(event.target.value)) return;
    if (event.target.value.indexOf('e') < 0) setNote(event.target.value);
  };
  const onSendConfirm = async () => {
    try {
      setIsPendingTransfer(true);
      // const wallet = await db.findOne({ _id: id });
      let newNote;
      if (Number.isNaN(parseInt(note, 10))) {
        newNote = new Date().getTime();
      } else {
        newNote = note;
      }
      const res = await transfer(
        // selectedWallet?.publicKeyUint8,
        wallet?.privateKeyUint8,
        recipient,
        parseFloat(amountToSend) * 1e9,
        selectedNetwork,
        newNote
      );
      if (res?.data?.deploy_hash) {
        setResult(res?.data?.deploy_hash);
      } else {
        setResult(res.data);
      }
      const transaction = {
        amount: parseFloat(amountToSend) * 1e9,
        deployHash: res?.data?.deploy_hash,
        fromAccount: wallet?.accountHex,
        timestamp: new Date(),
        toAccount: recipient,
        transferId: newNote,
        type: 'transfer',
        method: 'Pending',
        network: selectedNetwork,
        wallet: selectedWallet.accountHex,
      };
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
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };
  const sendModalSystem = () => {
    return (
      <div>
        <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Send CSPR</div>
        <p style={{ textAlign: 'center' }}>
          {/* Minimum transfer amount is 2.5 CSPR and max are {wallet.balance - 0.00001} */}
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'end',
                  }}
                >
                  <Button
                    style={{
                      marginTop: '-10px',
                      textAlign: 'right',
                      fontSize: '10px',
                    }}
                    className="send-button-no-mt"
                    onClick={() => setAmountToSend(wallet.balance - 0.00001)}
                  >
                    MAX
                  </Button>
                </div>
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
                      evt.key === '-' ||
                      evt.key === '`') &&
                    evt.preventDefault()
                  }
                />
                {note && note > 18446744073709551615 && (
                  <p style={{ color: 'red', fontSize: 13 }}>
                    Transfer ID should be a positive number smaller than
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
              <p>
                Transaction fee: 0.00001 CSPR ($
                {(casperPrice * 0.00001).toPrecision(3)})
              </p>
              <div>
                <Button
                  onClick={onSendConfirm}
                  className="send-button-no-mt"
                  style={{ margin: 'auto', display: 'block' }}
                  disabled={
                    amountToSend < 2.5 ||
                    amountToSend > wallet.balance - 0.00001 ||
                    !recipient ||
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
                      (After inclusion in a new block )
                    </span>
                  </span>
                  <TextArea
                    type="text"
                    className="modal-input-amount"
                    style={{ padding: '13px', cursor: 'pointer' }}
                    value={
                      selectedNetwork === 'casper-test'
                        ? `https://testnet.cspr.live/deploy/${result}`
                        : `https://casperstats.io/tx/${result}`
                    }
                    disabled
                  />
                  <div style={{ display: 'flex' }}>
                    <Button
                      onClick={async () => {
                        const url =
                          selectedNetwork === 'casper-test'
                            ? `https://testnet.cspr.live/deploy/${result}`
                            : `https://casperstats.io/tx/${result}`;
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
                            : `https://casperstats.io/tx/${result}`;
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

  const onPrivateKeyExport = async () => {
    const port = parseInt(
      global.location.search.substr(
        global.location.search.indexOf('=') + 1,
        global.location.search.length
      ),
      10
    );
    // const wallet = await db.findOne({ _id: id });
    const ret = await axios.post(`http://localhost:${port}/pem`, {
      privateKey: wallet.privateKeyUint8,
    });
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
        fs.writeFileSync(filePath, ret.data, 'utf-8');
        return '';
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log('error =', err);
      });
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
    // const [wallet, setWallet] = useState();
    const [newWalletName, setNewWalletName] = useState('');

    const onUpdate = async () => {
      try {
        await db.update(
          { _id: wallet._id },
          { ...wallet, walletName: newWalletName }
        );
        setWalletDetailsModalVisible(false);

        if (selectedWallet._id === wallet._id) {
          setSelectedWallet({ ...selectedWallet, walletName: newWalletName });
          const selectedW = { ...selectedWallet, walletName: newWalletName };
          localStorage.setItem('defaultWallet', JSON.stringify(selectedW));
        }
        const newWallets = await db.find({});
        setData({ ...data, wallets: newWallets, shouldUpdateWallets: true });
        notification.success({
          message: 'Success',
          description: 'Wallet name successfully updated',
        });
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
                    maxLength={30}
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
                        key={`mnemonic-word-${word}`}
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
              selectedWallet?._id === wallet._id
                ? { border: '3px solid #5F24FB', borderRadius: '20px' }
                : { marginBottom: '20px' }
            }
          >
            <div className="wallet-card-display-flex">
              <div className="wallet-card-tag">{wallet.walletName}</div>
              <div className="dropdown-holder">
                <Dropdown overlay={menu} trigger={['click']}>
                  <div
                    role="menubar"
                    className="ant-dropdown-link dropdown-menu"
                    // onClick={(e) => e.preventDefault()}
                    style={{ cursor: 'pointer' }}
                  >
                    <MoreOutlined />
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
                // disabled={wallet.balance < 2.5 - 0.00001}
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

WalletItem.propTypes = {
  wallet: PropTypes.objectOf({ isDefaultWallet: PropTypes.bool }).isRequired,
  title: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired,
  secondaryTitle: PropTypes.string,
  secondaryAmount: PropTypes.string,
  casperPrice: PropTypes.string,
};
WalletItem.defaultProps = {
  secondaryTitle: '',
  secondaryAmount: '',
  casperPrice: 0,
};

export default WalletItem;
