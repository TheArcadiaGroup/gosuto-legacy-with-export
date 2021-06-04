import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import GeneralModal from './GeneralModal';
import './components.global.scss';

const AddWallet = ({ title, children, footer ,customOnCancelLogic}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
  };

  return (
    <div className="site-card-wrapper">
      <Row gutter={16}>
        <Col span={8}>
          <Card
            hoverable
            bordered={false}
            className="wallet-card add-wallet-card"
            onClick={showModal}
          >
            <div className="add-wallet-card-text">
              <PlusOutlined /> {title}
            </div>
          </Card>
        </Col>
      </Row>
      <GeneralModal
      customOnCancelLogic={customOnCancelLogic}
        visible={isModalVisible}
        changeVisibility={setIsModalVisible}
        children={children}
        footer={footer}
      />
    </div>
  );
};
AddWallet.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  footer: PropTypes.any,
};

export default AddWallet;
