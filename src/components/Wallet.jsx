import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row, Button, Menu, Dropdown } from 'antd';
import './components.global.scss';

const menu = (
  <Menu>
    <Menu.Item key="0">View mnemonic</Menu.Item>
    <Menu.Item key="1">Edit</Menu.Item>
  </Menu>
);

const Wallet = ({ tag, title, amount, secondaryTitle, secondaryAmount }) => {
  return (
    <div className="site-card-wrapper">
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} className="wallet-card">
            <div className="wallet-card-display-flex">
              <div className="wallet-card-tag">{tag}</div>
              <div className="dropdown-holder">
                <Dropdown overlay={menu} trigger={['click']}>
                  <a
                    className="ant-dropdown-link dropdown-menu"
                    onClick={(e) => e.preventDefault()}
                  >
                    . . .
                  </a>
                </Dropdown>
              </div>
            </div>
            <div className="wallet-card-display-flex">
              <div className="wallet-card-title">{title}</div>
              <Button type="primary" className="send-button">
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
    </div>
  );
};

Wallet.propTypes = {
  tag: PropTypes.string,
  title: PropTypes.string,
  amount: PropTypes.string,
  secondaryTitle: PropTypes.string,
  secondaryAmount: PropTypes.string,
};

export default Wallet;
