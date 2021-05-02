// Packages
import React, { useState } from 'react';
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
import WalletView from './WalletView';
import HistoryView from './HistoryView';
import StakingView from './StakingView';
import SwapView from './SwapView';

// logo
import logo from '../assets/icons/gosuto-logo.png';
import copyLogo from '../assets/icons/copy.svg';
// styles
import './App.global.scss';

const { Header, Content, Sider } = Layout;
const { Option } = Select;
function App() {
  const [text, setText] = useState('3BHGBdM55JUR3ba4rRSYF8AispEAbJaDrS');
  const [isCopied, setIsCopied] = useState(false);
  const onCopyText = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };
  const handleLanguageChange = (value) => {
    console.log(`selected ${value}`);
  };
  const handleCurrencyChange = (value) => {
    console.log(`selected ${value}`);
  };
  const openNotification = () => {
    notification.success({
      message: 'Copied',
      description: 'Your ID was copied',
      duration: 3,
      className: 'custom-notification',
      onClick: () => {
        console.log('Notification Clicked!');
      },
    });
  };
  return (
    <HashRouter>
      <Layout className="layout">
        <Header className="site-header">
          <div className="link-holder">
            <Link to="/" className="logo-header-holder">
              <img src={logo} alt="Logo" className="logo-header" />
            </Link>
          </div>
          <CopyToClipboard text={text} onCopy={onCopyText}>
            <div className="wallet-id">
              3BHGBdM55JUR3ba4rRSYF8AispEAbJaDrS{' '}
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
          <div>
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
              <Option value="TND">TND</Option>
            </Select>
          </div>
        </Header>
        <Layout className="site-layout">
          <Sider className="site-layout-side">
            <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
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
                <Link to="/staking">Staking (Validator)</Link>
              </Menu.Item>
              <Menu.Item key="5" icon={<SwapOutlined />}>
                <Link to="/swap">Swap</Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Content className="site-layout-background">
            <Switch>
              <Route path="/swap" component={SwapView} />
              <Route path="/staking" component={StakingView} />
              <Route path="/history" component={HistoryView} />
              <Route path="/wallet" component={WalletView} />
              <Route path="/" component={Home} />
            </Switch>
          </Content>
        </Layout>
      </Layout>
    </HashRouter>
  );
}

export default App;
