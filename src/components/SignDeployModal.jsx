import { Button } from 'antd';
import React, { useContext } from 'react';
import vault from '../../assets/icons/vault-logo.png';
import './components.global.scss';
import '../App.global.scss';
import WalletContext from '../contexts/WalletContext';
import axios from 'axios';

const SignDeployModal = ({ deploy, callbackURL }) => {
  console.log('callbackURL from sign = ', callbackURL)
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
    console.log('callbackURL from = ', callbackURL)
    const response = await axios.post(`http://localhost:${port}/sign`, {
      deploy,
      privateKey: selectedWallet?.privateKeyUint8,
      callbackURL,
    });
    console.log('response.data = ', response.data);
  };
  return (
    <>
      <div className="modal-vault-logo">
        <img src={vault} alt="vault" className="image-modal" />
      </div>
      <div className="modal-title">Signature Request</div>
      <div className="modal-subtitle">Warning message here..</div>
      <p>{deploy}</p>
      <div>
        <Button
          onClick={async () => {
            await onSignDeploy();
          }}
          className="send-button-no-mt"
          style={{ margin: 'auto', display: 'block' }}
        >
          {/* {path.join(__dirname,'../src/casperService.js')} */}
          Sign
        </Button>
      </div>
    </>
  );
};

export default SignDeployModal;
