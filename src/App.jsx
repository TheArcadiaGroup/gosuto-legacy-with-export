// Packages
import React, { useEffect, useState } from 'react';
import { HashRouter, Link, Route, Switch } from 'react-router-dom';
import { Layout, Menu, Select, Button, notification } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  DashboardOutlined,
  WalletOutlined,
  HistoryOutlined,
  AreaChartOutlined,
  SwapOutlined,
} from '@ant-design/icons';

// Pages
import {
  CasperClient,
  CasperServiceByJsonRPC,
  PublicKey,
} from 'casper-client-sdk';
import { mnemonicToSeed } from 'bip39';
import Datastore from 'nedb-promises';
import Home from './Home';
import WalletView from './Views/WalletView';
import HistoryView from './Views/HistoryView';
import StakingView from './Views/StakingView';
import SwapView from './Views/SwapView';

// logo
import logo from '../assets/icons/gosuto-logo.png';
import copyLogo from '../assets/icons/copy.svg';
// styles
import './App.global.scss';
import { getAccountBalance } from './services/casper';
import PasswordView from './Views/PasswordView';
import WalletContext from './contexts/WalletContext';
import NetworkContext from './contexts/NetworkContext';
import DataContext from './contexts/DataContext';
import GeneralModal from './components/GeneralModal';
import SignDeployModal from './components/SignDeployModal';
// import { signDeploy } from 'casper-client-sdk/dist/lib/DeployUtil';
const { ipcRenderer, remote } = require('electron');
// const { autoUpdater } = remote;
// // Auto updater
// const server = 'https://gosuto-rs.herokuapp.com';
// const url = `${server}/update/${process.platform}/${remote.app.getVersion()}`;
// autoUpdater.setFeedURL({ url });
// setInterval(() => {
//   autoUpdater.checkForUpdates();
// }, 60000);

// autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
//   const dialogOpts = {
//     type: 'info',
//     buttons: ['Restart', 'Later'],
//     title: 'Application Update',
//     message: process.platform === 'win32' ? releaseNotes : releaseName,
//     detail:
//       'A new version has been downloaded. Restart the application to apply the updates.',
//   };

//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if (returnValue.response === 0) autoUpdater.quitAndInstall();
//   });
// });
// autoUpdater.on('checking-for-update', (event, releaseNotes, releaseName) => {
//   const dialogOpts = {
//     type: 'info',
//     buttons: ['Restart', 'Later'],
//     title: 'checking-for-update',
//     message: process.platform === 'win32' ? releaseNotes : releaseName,
//     detail: 'checking-for-update',
//   };

//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if (returnValue.response === 0) autoUpdater.quitAndInstall();
//   });
// });

// autoUpdater.on('update-available', (event, releaseNotes, releaseName) => {
//   const dialogOpts = {
//     type: 'info',
//     buttons: ['Restart', 'Later'],
//     title: 'update-available',
//     message: process.platform === 'win32' ? releaseNotes : releaseName,
//     detail: 'update-available',
//   };

//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if (returnValue.response === 0) autoUpdater.quitAndInstall();
//   });
// });

// autoUpdater.on('error', (message) => {
//   console.error('There was a problem updating the application');
//   console.error(message);
// });

const { Header, Content, Sider } = Layout;
const { Option } = Select;
function App() {
  const [walletsData, setWalletsData] = useState([]);

  const [text, setText] = useState('');
  const [deepLinkRet, setDeepLinkRet] = useState('');
  const [signatureRequestData, setSignatureRequestData] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const getLatestBlockInfo = async () => {
    const casperService = new CasperServiceByJsonRPC(
      'http://3.14.161.135:7777/rpc'
    );
    const latestBlock = await casperService.getLatestBlockInfo();
    setText(latestBlock.block.header.height);
    return latestBlock.block.header.height;
  };

  useEffect(() => {
    ipcRenderer.on('deep-link', (event, args) => {
      const URIComponent = decodeURIComponent(args);
      //URIComponet=".....gosuto://jsonString\?callbackURL=callbackURL"
      //extracting the stringified json object from URIComponent
      const jsonString = URIComponent.slice(
        URIComponent.indexOf('gosuto://'),
        URIComponent.indexOf('?callbackURL=')
      )
        .replace('gosuto://', '')
        .trim()
        .slice(0, URIComponent.lastIndexOf('\\'));

      const callbackURL = URIComponent.slice(
        URIComponent.indexOf('?callbackURL=')
      )
        .replace('?callbackURL=', '')
        .trim();

      let jsonData;
      try {
        jsonData = JSON.parse(jsonString);
        setSignatureRequestData({ deploy: jsonData.deploy, callbackURL });
      } catch (error) {
        console.log(error);
      }

      setIsModalVisible(true);
      //old Code
      // const data = decodeURIComponent(args);
      // const deploy = data
      //   .substr(0, data.indexOf('?callback'))
      //   .replace('gosuto://', '');
      // console.log('deploy = ', deploy);
      // const callbackURL = data
      //   .substr(data.indexOf('?callback') + 10, data.length)
      //   .trim();
      // console.log('callbackURL = ', callbackURL);
    });
    return () => {
      ipcRenderer.removeAllListeners('deep-link');
    };
  }, []);

  // const getAccountBalance = async () => {
  //   const casperService = new CasperServiceByJsonRPC('http://3.14.161.135:7777/rpc');
  //   // casperService.acco
  //   const balance = await casperService.getAccountBalance('185c1e21cd0198ae676ea103c74871368b6ec5d28570a0df435fffdbc9146723','uref-d87deb992bb04abf149fb68bf42735f16db7ea0360ff9e9abde9eb4917b52a2c-007');
  //   let accountHex = new CasperClient().newHdWallet(Uint8Array.from(await mnemonicToSeed('hola!'))).publicKey().toString('hex');
  //   let wallet = PublicKey.fromHex(accountHex).toAccountHash();
  //   wallet  = Buffer.from(wallet).toString('hex');
  //   setText(wallet);

  //   return parseInt(balance);
  // }
  const [data, setData] = useState({
    walletsLastUpdate: new Date(),
    historyLastUpdate: new Date(),
    history: 0,
    pendingHistory: [],
    wallets: 0,
    lastNetwork: 0,
    validatorWeight: 0,
    delegatedAmount: 0,
    delegationRewards: 0,
    stakingOperations: 0,
    validatorRewards: 0,
    stakingLastUpdate: new Date(),
    cPrice: 0,
    accountBalance: 0,
    shouldUpdateWallet: false,
    shouldUpdateHistory: false,
    shouldUpdateStaking: false,
  });
  const [selectedWallet, setSelectedWallet] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState('casper');
  useEffect(() => {
    async function getAccountInformation() {
      const defaultWallet = localStorage.getItem('defaultWallet');
      if (defaultWallet) {
        setSelectedWallet(JSON.parse(defaultWallet));
      } else {
        const db = Datastore.create({
          filename: `${remote.app.getPath('userData')}/wallets.db`,
          timestampData: true,
        });
        const wallets = await db.find({});
        setWalletsData(wallets);

        if (wallets.length > 0) setSelectedWallet(wallets[0]);
      }
    }

    getAccountInformation();
  }, []);
  const [isCopied, setIsCopied] = useState(false);
  const onCopyText = async () => {
    await navigator.clipboard.writeText(selectedWallet?.accountHex);
    openNotification();
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };
  const handleLanguageChange = (value) => {
    console.log(`selected ${value}`);
  };
  const handleNetworkChange = (value) => {
    setSelectedNetwork(value);
    setData({
      ...data,
      shouldUpdateWallets: true,
      shouldUpdateHistory: true,
      shouldUpdateStaking: true,
    });
  };
  const handleCurrencyChange = (value) => {
    console.log(`selected ${value}`);
  };
  const openNotification = () => {
    notification.success({
      message: 'Copied',
      description: 'Your address was copied',
      duration: 3,
      className: 'custom-notification',
      onClick: () => {},
    });
  };
  return (
    <DataContext.Provider value={[data, setData]}>
      <NetworkContext.Provider value={[selectedNetwork, setSelectedNetwork]}>
        <WalletContext.Provider value={[selectedWallet, setSelectedWallet]}>
          <HashRouter>
            <Layout className="layout">
              <Header className="site-header">
                <div className="link-holder">
                  <Link to="/" className="logo-header-holder">
                    <img src={logo} alt="Logo" className="logo-header" />
                  </Link>
                </div>
                {selectedWallet && (
                  <CopyToClipboard text={text} onCopy={onCopyText}>
                    <div className="wallet-id">
                      <span style={{ marginRight: '20px' }}>
                        {selectedWallet?.accountHex}
                        {/* {url} */}
                      </span>
                      <Button
                        className="copy-button"
                        onClick={() => {
                          isCopied && openNotification();
                        }}
                      >
                        <img src={copyLogo} alt="Logo" />
                      </Button>
                    </div>
                  </CopyToClipboard>
                )}
                <div>
                  <Select
                    defaultValue="casper"
                    style={{ width: '10rem', height: 35, marginRight: 30 }}
                    onChange={handleNetworkChange}
                    className="chart-selector"
                  >
                    <Option value="casper">Casper Mainnet</Option>
                    <Option value="casper-test">Casper Testnet</Option>
                  </Select>
                  {/* <Select
                    defaultValue="English"
                    style={{ width: 120, height: 35, marginRight: 30 }}
                    onChange={handleLanguageChange}
                    className="chart-selector"
                  >
                    <Option value="English">English</Option>
                    <Option value="French">French</Option>
                  </Select>
                  <Select
                    defaultValue="USD"
                    style={{ width: 120, height: 35, marginRight: 30 }}
                    onChange={handleCurrencyChange}
                    className="chart-selector"
                  >
                    <Option value="USD">USD</Option>
                    <Option value="EUR">EUR</Option>
                  </Select> */}
                </div>
              </Header>
              <Layout className="site-layout">
                <Sider className="site-layout-side">
                  <Menu
                    theme="dark"
                    mode="vertical-left"
                    defaultSelectedKeys={['1']}
                    style={{
                      width: '90%',
                      marginLeft: '12px',
                      marginTop: '20px',
                    }}
                  >
                    <Menu.Item key="1" icon={<DashboardOutlined />}>
                      <Link to="/">Dashboard</Link>
                    </Menu.Item>
                    <Menu.Item key="2" icon={<WalletOutlined />}>
                      <Link to="/wallet">Wallet</Link>
                    </Menu.Item>
                    <Menu.Item key="3" icon={<HistoryOutlined />}>
                      <Link to="/history">History</Link>
                    </Menu.Item>
                    <Menu.Item key="4" icon={<AreaChartOutlined />}>
                      <Link to="/staking">Staking</Link>
                    </Menu.Item>
                    {/* <Menu.Item key="5" icon={<SwapOutlined />}>
                <Link to="/swap">Swap</Link>
              </Menu.Item> */}
                  </Menu>
                </Sider>
                <Content className="site-layout-background">
                  <GeneralModal
                    bodyStyle={{
                      background: '#f2f3f5',
                      overflow: 'scroll',
                      maxHeight: '95vh',
                    }}
                    style={{ top: 10 }}
                    width={350}
                    visible={
                      isModalVisible &&
                      walletsData.some(
                        (w) =>
                          w.accountHex ===
                          signatureRequestData.deploy.header.account
                      )
                    }
                    changeVisibility={setIsModalVisible}
                    // children={signDeploySystem()}
                    // customOnCancelLogic={customOnCancelLogic}
                    // footer={[
                    //   <div
                    //     style={{ display: 'flex', justifyContent: 'center' }}
                    //   >
                    //     <Button type="primary" className="send-button">
                    //       Next
                    //     </Button>
                    //   </div>,
                    // ]}
                  >
                    <SignDeployModal
                      deploy={signatureRequestData.deploy}
                      callbackURL={signatureRequestData.callbackURL}
                      setIsModalVisible={setIsModalVisible}
                    />
                  </GeneralModal>
                  ;
                  <Switch>
                    {/* <Route path="/swap" component={SwapView} /> */}
                    <Route path="/staking" component={StakingView} />
                    <Route path="/history" component={HistoryView} />
                    <Route path="/wallet" component={WalletView} />
                    {/* <Route path="/" component={PasswordView} /> */}
                    <Route path="/" component={Home} />
                  </Switch>
                </Content>
              </Layout>
            </Layout>
          </HashRouter>
        </WalletContext.Provider>
      </NetworkContext.Provider>
    </DataContext.Provider>
  );
}

export default App;
