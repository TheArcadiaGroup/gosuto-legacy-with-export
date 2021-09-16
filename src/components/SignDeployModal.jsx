import { Button, Col, Row, Divider } from 'antd';
import React, { useContext } from 'react';
import vault from '../../assets/icons/vault-logo.png';
import './components.global.scss';
import '../App.global.scss';
import WalletContext from '../contexts/WalletContext';
import axios from 'axios';
import tinydate from 'tinydate';
// import { data } from '../../data';
import { session } from 'electron';

const SignDeployModal = ({
  deploy,
  callbackURL,
  setIsModalVisible,
  method,
}) => {
  // const deploy = data.deploy;
  console.log('callbackURL from sign = ', callbackURL);
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const port = parseInt(
    global.location.search.substr(
      global.location.search.indexOf('=') + 1,
      global.location.search.length
    ),
    10
  );
  const hexToDecimal = (bytes) => {
    return parseInt(bytes, 16);
  };
  const bytesToString = (bytes) => {
    const textBuffer = Buffer.from(bytes, 'hex');
    return textBuffer.toString();
  };
  const convertData = (obj) => {
    console.log('CONVERTING == ', obj);
    if (obj.cl_type === 'String') {
      return bytesToString(obj.bytes);
    }
    if (obj.cl_type.ByteArray) {
      return formatLongStrings(obj.bytes);
    }
    if (obj.cl_type.Option) {
      if (obj.cl_type.Option?.startsWith('U')) return hexToDecimal(obj.bytes);
    }
    if (typeof obj.cl_type.startsWith === 'function') {
      if (obj.cl_type?.startsWith('U')) return hexToDecimal(obj.bytes);
    }
    if (typeof obj.cl_type.substr === 'function') {
      return formatLongStrings(obj.bytes);
    }
    return 'Object';
  };
  const resolveTransferType = (data) => {
    if (data.session.StoredContractByHash) return 'Contract Interaction';
    return 'Transfer';
  };
  // console.log('json parse = ', JSON.stringify(deploy));
  const onSignDeploy = async () => {
    try {
      console.log('signing...');
      console.log('callbackURL from = ', callbackURL);
      const response = await axios.post(`http://localhost:${port}/sign`, {
        deploy,
        privateKey: selectedWallet?.privateKeyUint8,
        callbackURL,
      });
      console.log('response.data = ', response.data);
      setIsModalVisible(false);
    } catch (error) {}
  };

  const onSharePublicKey = async () => {
    try {
      console.log('sharing public key...');
      console.log('callbackURL from = ', callbackURL);
      const publicKey = selectedWallet?.accountHex;
      const response = await axios.post(
        callbackURL,
        {
          publicKey,
        },
        {
          timeout: 2000,
        }
      );
      console.log('response.data = ', response.data);
      setIsModalVisible(false);
    } catch (error) {
      console.log('error = ', error);
    }
  };

  const formatLongStrings = (text) => {
    return text.substr(0, 6) + '...' + text.substr(text.length - 6);
  };
  const stamp = tinydate('{DD}/{MM}/{YYYY}, {HH}:{mm}:{ss}');
  const formatDate = (timestamp) => {
    return stamp(new Date(timestamp));
  };

  const RenderRow = ({ title, data }) => {
    return (
      <div className="modal-row">
        <div>
          <b
            className="font-12"
            style={{ fontWeight: 'bolder', textTransform: 'capitalize' }}
          >
            {title ? title : 'error'}
          </b>
        </div>
        <div className="font-12" style={{ color: '#292a2c' }}>
          {data ? data : 'error'}
        </div>
      </div>
    );
  };

  if (method === 'sign_deploy') {
    return (
      <>
        {/* <div className="modal-vault-logo">
        <img src={vault} alt="vault" className="image-modal" />
      </div> */}
        <p className="title">Signature Request</p>
        {/* <div className="modal-subtitle">Warning message here..</div> */}
        {/* <p>{callbackURL}</p> */}

        <RenderRow
          title="Signing Key"
          data={formatLongStrings(deploy?.header?.account)}
        />
        <Divider className="divider-style" />
        <RenderRow
          title="Account"
          data={formatLongStrings(deploy?.header?.account)}
        />
        <Divider className="divider-style" />
        <RenderRow title="Deploy Hash" data={formatLongStrings(deploy?.hash)} />
        <Divider className="divider-style" />
        <RenderRow
          title="Timestamp"
          data={formatDate(deploy?.header?.timestamp)}
        />
        <Divider className="divider-style" />
        <RenderRow title="Chain Name" data={deploy?.header?.chain_name} />
        <Divider className="divider-style" />
        <RenderRow
          title="Transaction Fee"
          data={
            hexToDecimal(deploy?.payment?.ModuleBytes?.args[0][1]?.bytes) +
            ' motes'
          }
        />
        <Divider className="divider-style" />
        <RenderRow title="Deploy Type" data={resolveTransferType(deploy)} />
        <Divider className="divider-style" />
        <p className="title font-12 " style={{ marginTop: 0, marginBottom: 0 }}>
          Deploy Data
        </p>
        <Divider className="divider-style" />
        {Object.values(deploy?.session)[0].args.map((row) => (
          <>
            <RenderRow
              title={row[0]}
              data={
                row[0] === 'amount'
                  ? convertData(row[1]) + ' motes'
                  : convertData(row[1])
              }
            />
            <Divider className="divider-style" />
          </>
        ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: '24px',
          }}
        >
          <Button
            type="primary"
            className="cancel-button-no-mt"
            style={{
              background: 'gray',
              fontSize: '12px',
            }}
            onClick={() => setIsModalVisible(false)}
          >
            {/* {path.join(__dirname,'../src/casperService.js')} */}
            CANCEL
          </Button>
          <Button
            type="primary"
            style={{
              background: '#000852',
              borderRadius: '5px',
              borderColor: '#1b1d3f',
              fontSize: '12px',
            }}
            className="send-button-no-mt"
            onClick={async () => {
              await onSignDeploy();
            }}
          >
            {/* {path.join(__dirname,'../src/casperService.js')} */}
            SIGN
          </Button>
        </div>
      </>
    );
  }

  if (method === 'get_active_public_key') {
    return (
      <>
        {/* <div className="modal-vault-logo">
        <img src={vault} alt="vault" className="image-modal" />
      </div> */}
        <p className="title">Request to Share Public Key</p>
        <p style={{ textAlign: 'center' }}>
          You are about to share your active public key.
        </p>
        {/* <p>{callbackURL}</p> */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: '24px',
          }}
        >
          <Button
            type="primary"
            className="cancel-button-no-mt"
            style={{
              background: 'gray',
              fontSize: '12px',
            }}
            onClick={() => setIsModalVisible(false)}
          >
            {/* {path.join(__dirname,'../src/casperService.js')} */}
            CANCEL
          </Button>
          <Button
            type="primary"
            style={{
              background: '#000852',
              borderRadius: '5px',
              borderColor: '#1b1d3f',
              fontSize: '12px',
            }}
            className="send-button-no-mt"
            onClick={async () => {
              await onSharePublicKey();
            }}
          >
            {/* {path.join(__dirname,'../src/casperService.js')} */}
            SHARE
          </Button>
        </div>
      </>
    );
  }
};

export default SignDeployModal;
