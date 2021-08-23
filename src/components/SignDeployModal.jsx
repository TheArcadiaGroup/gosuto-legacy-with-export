import { Button, Col, Row, Divider } from 'antd';
import React, { useContext } from 'react';
import vault from '../../assets/icons/vault-logo.png';
import './components.global.scss';
import '../App.global.scss';
import WalletContext from '../contexts/WalletContext';
import axios from 'axios';
import tinydate from 'tinydate';

const SignDeployModal = ({ deploy, callbackURL, setIsModalVisible }) => {
  
  console.log('callbackURL from sign = ', callbackURL);
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const port = parseInt(
    global.location.search.substr(
      global.location.search.indexOf('=') + 1,
      global.location.search.length
    ),
    10
  );

  // console.log('json parse = ', JSON.stringify(deploy));
  const onSignDeploy = async () => {
    console.log('signing...');
    console.log('callbackURL from = ', callbackURL);
    const response = await axios.post(`http://localhost:${port}/sign`, {
      deploy,
      privateKey: selectedWallet?.privateKeyUint8,
      callbackURL,
    });
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
          <b className="font-12" style={{ fontWeight: 'bolder' }}>
            {title}
          </b>
        </div>
        <div className="font-12" style={{ color: '#292a2c' }}>
          {data}
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
        data={formatLongStrings(testData?.header?.account)}
      />
      <Divider className="divider-style" />
      <RenderRow
        title="Account"
        data={formatLongStrings(testData?.header?.account)}
      />
      <Divider className="divider-style" />
      <RenderRow title="Deploy Hash" data={formatLongStrings(testData?.hash)} />
      <Divider className="divider-style" />
      <RenderRow
        title="Timestamp"
        data={formatDate(testData?.header?.timestamp)}
      />
      <Divider className="divider-style" />
      <RenderRow title="Chain Name" data={testData?.header?.chain_name} />
      <Divider className="divider-style" />
      <RenderRow
        title="Transaction Fee"
        data={testData?.header?.gas_price + ' motes'}
      />
      <Divider className="divider-style" />
      <RenderRow title="Deploy Type" data="Transfer" />
      <Divider className="divider-style" />
      <p className="title font-12 " style={{ marginTop: 0, marginBottom: 0 }}>
        Transfer Data
      </p>
      <Divider className="divider-style" />
      <RenderRow
        title="Recepient (Hash)"
        data={formatLongStrings(deploy?.session?.StoredContractByHash?.hash)}
      />
      <Divider className="divider-style" />
      <RenderRow title="Recepient (Key)" data={'todo'} />
      <Divider className="divider-style" />
      <RenderRow title="Amount" data={'todo'} />
      <Divider className="divider-style" />
      <RenderRow title="Transfer Id" data={'todo'} />
      <Divider className="divider-style" />
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
