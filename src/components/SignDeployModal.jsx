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

const SignDeployModal = ({ deploy, callbackURL, setIsModalVisible }) => {
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
  //obj {bytes,cl_type}
  const convertData = (obj) => {
    if (obj.cl_type === 'String') {
      return bytesToString(obj.bytes);
    }
    if (obj.cl_type.startsWith('U')) return hexToDecimal(obj.bytes);

    return formatLongStrings(obj.bytes);
  };
  const resolveTransferType = (data) => {
    if (data.session.StoredContractByHash) return 'Contract Interaction';
    return 'Transfer';
  };
  // console.log('json parse = ', JSON.stringify(deploy));
  const onSignDeploy = async () => {
    console.log('signing...');
    console.log('callbackURL from = ', callbackURL);
    const response = await axios.post(`http://localhost:${port}/sign`, {
      deploy,
      privateKey: selectedWallet?.privateKeyUint8,
      callbackURL,
    });
    alert(response.data);
    console.log('response.data = ', response.data);
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
      {Object.values(deploy.session)[0].args.map((row) => (
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
          style={{
            background: '#d5084f',
            borderRadius: '5px',
            borderColor: '#d5084f',
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
            background: '#1b1d3f',
            borderRadius: '5px',
            borderColor: '#1b1d3f',
            fontSize: '12px',
          }}
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
};

export default SignDeployModal;
