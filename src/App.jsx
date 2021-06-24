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
import { CasperClient, CasperServiceByJsonRPC, PublicKey } from 'casper-client-sdk';
import { mnemonicToSeed } from 'bip39';
import { getAccountBalance } from './services/casper';
import Datastore from 'nedb-promises';
import PasswordView from './Views/PasswordView';
import WalletContext from './contexts/WalletContext';
import NetworkContext from './contexts/NetworkContext';
const { remote } = require('electron');

const { Header, Content, Sider } = Layout;
const { Option } = Select;
function App() {
  const [text, setText] = useState('');
  const getLatestBlockInfo = async () => {
    const casperService = new CasperServiceByJsonRPC('http://3.14.161.135:7777/rpc')
    const latestBlock = await casperService.getLatestBlockInfo();
    setText(latestBlock.block.header.height);
    return latestBlock.block.header.height;
  }

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
  const [selectedWallet, setSelectedWallet] = useState()
  const [selectedNetwork, setSelectedNetwork] = useState('casper')
    useEffect(() => {

    async function getAccountInformation() {
      const defaultWallet = localStorage.getItem('defaultWallet');
      if(defaultWallet){
        console.log('default wallet = ',JSON.parse(defaultWallet) );
        setSelectedWallet(JSON.parse(defaultWallet))
      }else{
        const db = Datastore.create({
          filename:`${remote.app.getPath('userData')}/wallets.db`,
          timestampData:true
        })
        const wallets = await db.find({});
        if(wallets.length>0)
        setSelectedWallet(wallets[0]);
      }
    }

    getAccountInformation();
}, [])
  const [isCopied, setIsCopied] = useState(false);
  const onCopyText =async () => {
    await navigator.clipboard.writeText(selectedWallet?.accountHex);
    openNotification()
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };
  const handleLanguageChange = (value) => {
    console.log(`selected ${value}`);
  };
  const handleNetworkChange = (value) => {
    console.log(`selected ${value}`);
    setSelectedNetwork(value)
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
      onClick: () => {
      },
    });
  };
  return (
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
          {selectedWallet &&
          <CopyToClipboard text={text} onCopy={onCopyText}>
            <div className="wallet-id">
              {text}{' '}
              <Button
                className="copy-button"
                onClick={() => {
                  isCopied && openNotification();
                }}
              >
                {selectedWallet?.accountHex}
                <img src={copyLogo} alt="Logo" />
              </Button>
            </div>
          </CopyToClipboard>
          }
          <div>
            <Select
              defaultValue="casper"
              style={{ width: "10rem", height: 35, marginRight: 30 }}
              onChange={handleNetworkChange}
              className="chart-selector"
            >
              <Option value="casper">Casper Mainnet</Option>
              <Option value="casper-test">Casper Testnet</Option>
            </Select>
            <Select
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
            </Select>
          </div>
        </Header>
        <Layout className="site-layout">
          <Sider className="site-layout-side">
            <Menu theme="dark" mode="vertical-left" defaultSelectedKeys={['1']} style={{width:'90%',marginLeft:'12px',marginTop:'20px'}}>
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
  );
}

export default App;
