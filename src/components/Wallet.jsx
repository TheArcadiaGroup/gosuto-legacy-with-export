import React, { useState } from 'react';
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
  Select,
} from 'antd';
import GeneralModal from './GeneralModal';

// images
import vault from '../../assets/icons/vault-logo.png';

// styles
import './components.global.scss';

const { Option } = Select;

const menu = (
  <Menu>
    <Menu.Item key="0">View mnemonic</Menu.Item>
    <Menu.Item key="1">Edit</Menu.Item>
  </Menu>
);

const Wallet = ({ tag, title, amount, secondaryTitle, secondaryAmount }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
  };
  const onChangeAmount = (value) => {
    console.log('changed amount', value);
  };
  const onChangeAddress = (value) => {
    console.log('changed address', value);
  };
  const onChangeNote = (value) => {
    console.log('changed note', value);
  };
  const handleSelect = (value) => {
    console.log(`selected ${value}`);
  };
  const sendModalSystem = () => {
    return (
      <div>
        <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Send CSPR</div>
        <div>
          <div>
            <InputNumber
              className="modal-input-amount"
              min={1}
              max={10000000000}
              placeholder="Enter Amount"
              onChange={onChangeAmount}
            />
          </div>
          <div>
            <Input
              className="modal-input-address"
              placeholder="Recipient Address"
              onChange={onChangeAddress}
            />
          </div>
          <div>
            <Input
              className="modal-input-note"
              placeholder="Note (optional)"
              onChange={onChangeNote}
            />
          </div>
          <div>
            <Select
              className="modal-input-select"
              defaultValue="CSPRNetwork"
              style={{ width: 120 }}
              onChange={handleSelect}
            >
              <Option value="CSPRNetwork">CSPR Network</Option>
              <Option value="CSPR">CSPR</Option>
            </Select>
          </div>
        </div>
      </div>
    );
  };
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
              <Button
                type="primary"
                className="send-button"
                onClick={showModal}
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
        children={sendModalSystem()}
        footer={[
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="primary" className="send-button">
              Next
            </Button>
          </div>,
        ]}
      />
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
