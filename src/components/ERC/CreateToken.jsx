/* eslint-disable no-underscore-dangle */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Input,
  Upload,
  message,
  Switch,
  Col,
  Row,
  Button,
  notification,
} from 'antd';
import TextArea from 'rc-textarea';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import fs from 'fs';
import mongoose from 'mongoose';
import { remote } from 'electron';
import Datastore from 'nedb-promises';
import { createToken } from '../../services/casper';
import NetworkContext from '../../contexts/NetworkContext';
import WalletContext from '../../contexts/WalletContext';
import DataContext from '../../contexts/DataContext';
import { getERCTokensModel } from '../../services/mongoDb';

const CreateToken = (props) => {
  const {
    visible,
    changeVisibility,
    customOnCancelLogic,
    width,
    bodyStyle,
    style,
    onAdd,
  } = props;

  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const [selectedNetwork, setSelectedNetwork] = useContext(NetworkContext);
  const [data, setData] = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [image, setImage] = useState(null);
  const [isLimitedSupply, setIsLimitedSupply] = useState(true);
  const [tokenName, setTokenName] = useState(null);
  const [tokenTicker, setTokenTicker] = useState(null);
  const [decimals, setDecimals] = useState(null);
  const [initialSupply, setInitialSupply] = useState(null);
  const [maximumSupply, setMaximumSupply] = useState(null);
  const [isMintable, setIsMintable] = useState(false);
  const [authorizedMinter, setAuthorizedMinter] = useState(null);
  const [apiresponse, setApiresponse] = useState('');

  const updateFromState = () => {
    setAuthorizedMinter(null);
    setIsMintable(null);
    setTokenName(null);
    setTokenTicker(null);
    setImage(null);
    setImageUrl(null);
    setDecimals(null);
    setIsLimitedSupply(true);
  };
  const handleOk = () => {
    changeVisibility(false);
    updateFromState();
  };
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }

    return false;
  };

  const handleCancel = () => {
    if (customOnCancelLogic) {
      customOnCancelLogic();
    }
    changeVisibility(false);
    updateFromState();
    setApiresponse('');
  };

  const handleChange = (info) => {
    // Get this url from response in real world.
    getBase64(info.file, (imageURL) => {
      setIsLoading(false);
      setImage(info.file);
      setImageUrl(imageURL);
    });
  };
  const uploadButton = (
    <div>
      {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8, alignContent: 'center' }}>Upload image</div>
    </div>
  );

  const onSubmit = async () => {
    try {
      if (isLimitedSupply && maximumSupply < initialSupply) {
        message.error('Maximum supply cannot be smaller than initial supply.');
        return;
      }
      if (isMintable && !authorizedMinter) {
        message.error('Please provide an authorized minter.');
        return;
      }
      if (tokenName && tokenTicker && decimals && initialSupply) {
        const db = Datastore.create({
          filename: `${remote.app.getPath('userData')}/wallets.db`,
          timestampData: true,
        });
        const imageName = `${remote.app.getPath('userData')}/${image.uid}.${
          image.name.split('.')[1]
        }`;
        fs.writeFileSync(
          imageName,
          imageUrl.replace(/^data:image\/(jpeg|png);base64,/, ''),
          'base64'
        );
        const wallet = await db.findOne({ _id: selectedWallet?._id });
        let defaultAuthorizedMinter =
          'account-hash-0000000000000000000000000000000000000000000000000000000000000000';
        if (isMintable) {
          defaultAuthorizedMinter = authorizedMinter;
        }
        const response = await createToken(
          wallet?.privateKeyUint8,
          selectedNetwork,
          tokenName,
          tokenTicker,
          imageName,
          decimals,
          initialSupply,
          defaultAuthorizedMinter
        );
        setApiresponse(response.data);
        if (
          response.status === 200 &&
          !response.data?.toUpperCase().includes('ERROR')
        ) {
          if (mongoose.connection.readyState !== 1) {
            getERCTokensModel();
          }
          const ERCTOKEN = mongoose.model('ERCTokens');
          const ercToken = new ERCTOKEN();
          ercToken.selectedNetwork = selectedNetwork;
          ercToken.tokenName = tokenName;
          ercToken.tokenTicker = tokenTicker;
          ercToken.image = imageUrl;
          ercToken.decimals = decimals;
          ercToken.initialSupply = initialSupply;
          ercToken.defaultAuthorizedMinter = defaultAuthorizedMinter;
          ercToken.deployHash = response.data;
          ercToken.activePublicKey = wallet?.accountHex;
          await ercToken.save(async (err, doc) => {
            if (err) console.error(err);
            if (!err) {
              const erc = await ERCTOKEN.findById(`${doc._id}`).lean().exec();
              onAdd(erc);
            }
          });
          const transaction = {
            amount: 90 * 1e9,
            deployHash: response?.data,
            fromAccount: wallet?.accountHex,
            timestamp: new Date(),
            toAccount: null,
            transferId: '',
            type: 'createERCToken',
            method: 'Pending',
            wallet: selectedWallet.accountHex,
            network: selectedNetwork,
          };
          const pendingHistoryDB = Datastore.create({
            filename: `${remote.app.getPath('userData')}/pendingHistory.db`,
            timestampData: true,
          });
          await pendingHistoryDB.insert(transaction);
          setData({
            ...data,
            pendingHistory: [...data.pendingHistory, transaction],
            shouldUpdateHistory: true,
          });
        }
        // onAdd(newRecord);
        // updateFromState();
        // handleCancel();
      } else {
        message.error('Please verify form values.');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error on Submit new ERC Token : ', error);
    }
  };

  const openNotification = () => {
    notification.success({
      message: 'Copied',
      description: 'Text has been copied to clipboard.',
      duration: 3,
      className: 'custom-notification',
      onClick: () => {},
    });
  };

  const afterDeploy = (
    <>
      <div className="modal-subtitle">Your transaction information</div>
      <div>
        {!apiresponse?.toUpperCase().includes('ERROR') && (
          <span className="modal-description">Deploy hash</span>
        )}

        <TextArea
          type="text"
          className="modal-input-amount"
          style={{ padding: '13px' }}
          value={apiresponse}
          disabled
        />
        <div>
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(apiresponse);
              openNotification();
            }}
            className="send-button-no-mt"
            style={{ margin: 'auto', display: 'block' }}
          >
            {/* {path.join(__dirname,'../src/casperService.js')} */}
            Copy
          </Button>
        </div>
        {!apiresponse?.toUpperCase().includes('ERROR') && (
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
                  ? `https://testnet.cspr.live/deploy/${apiresponse}`
                  : `https://cspr.live/deploy/${apiresponse}`
              }
              disabled
            />
            <div style={{ display: 'flex' }}>
              <Button
                onClick={async () => {
                  const url =
                    selectedNetwork === 'casper-test'
                      ? `https://testnet.cspr.live/deploy/${apiresponse}`
                      : `https://cspr.live/deploy/${apiresponse}`;
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
                      ? `https://testnet.cspr.live/deploy/${apiresponse}`
                      : `https://cspr.live/deploy/${apiresponse}`;
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
  );

  return (
    <>
      <Modal
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={width}
        bodyStyle={bodyStyle}
        style={style}
      >
        <div>
          <div className="modal-title">Create a Token</div>
          {apiresponse !== '' && <>{afterDeploy}</>}
          {apiresponse === '' && (
            <>
              <div className="modal-content">
                <Row>
                  <Col span={8} />
                  <Col span={8} justify="space-around" align="middle">
                    <Upload
                      name="avatar"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
                      // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                      beforeUpload={beforeUpload}
                      onChange={handleChange}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="avatar"
                          style={{ width: '100%' }}
                        />
                      ) : (
                        uploadButton
                      )}
                    </Upload>
                  </Col>
                  <Col span={8} />
                </Row>
                <Input
                  type="text"
                  className="modal-input-amount"
                  placeholder="Token name"
                  value={tokenName}
                  onChange={(e) => {
                    setTokenName(e.target.value);
                  }}
                />
                <Input
                  type="text"
                  className="modal-input-amount"
                  placeholder="Token ticker"
                  value={tokenTicker}
                  onChange={(e) => {
                    setTokenTicker(e.target.value);
                  }}
                />
                <Input
                  type="number"
                  className="modal-input-amount"
                  placeholder="Decimals"
                  value={decimals}
                  onChange={(e) => {
                    setDecimals(e.target.value);
                  }}
                />

                <Input
                  type="number"
                  className="modal-input-amount"
                  placeholder="Initial Supply"
                  value={initialSupply}
                  onChange={(e) => {
                    setInitialSupply(e.target.value);
                  }}
                />
                <div>
                  <Row gutter={12}>
                    <Col span={12}>{'Limited Supply '}</Col>
                    <Switch
                      checked={isLimitedSupply}
                      onChange={() => {
                        setIsLimitedSupply(!isLimitedSupply);
                      }}
                    />
                    <Col span={6} />

                    <Input
                      type="number"
                      className="modal-input-amount"
                      placeholder="Maximum Supply"
                      value={maximumSupply}
                      hidden={!isLimitedSupply}
                      onChange={(e) => {
                        setMaximumSupply(e.target.value);
                      }}
                    />
                  </Row>

                  <Row gutter={12}>
                    <Col span={12}>{'Mintable '}</Col>
                    <Switch
                      checked={isMintable}
                      onChange={() => {
                        setIsMintable(!isMintable);
                      }}
                    />
                    <Col span={6} />
                    <Input
                      type="text"
                      className="modal-input-amount"
                      placeholder="Authorized Minter"
                      value={authorizedMinter}
                      hidden={!isMintable}
                      onChange={(e) => {
                        setAuthorizedMinter(e.target.value);
                      }}
                    />
                    <p style={{ marginTop: '2rem' }}>
                      The network fee for this transaction is 90 CSPR.
                    </p>
                  </Row>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Button
                          type="primary"
                          onClick={onSubmit}
                          className="send-button"
                          disabled={!selectedWallet}
                        >
                          Submit
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button
                          type="primary"
                          onClick={handleCancel}
                          className="cancel-button"
                        >
                          Cancel
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

CreateToken.propTypes = {
  visible: PropTypes.bool,
  changeVisibility: PropTypes.func,
  customOnCancelLogic: PropTypes.func,
  onAdd: PropTypes.func,
  width: PropTypes.object,
  bodyStyle: PropTypes.object,
  style: PropTypes.object,
};
CreateToken.defaultProps = {
  onAdd: () => {},
};

export default CreateToken;
