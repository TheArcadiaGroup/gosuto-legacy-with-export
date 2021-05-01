import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import GeneralModal from './GeneralModal';
import './components.global.scss';

const AddWallet = ({ title }) => {
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
        visible={isModalVisible}
        changeVisibility={setIsModalVisible}
        children={
          <div>
            {' '}
            <p>Some contents...</p>
            <p>Some contents...</p>
          </div>
        }
      />
    </div>
  );
};
AddWallet.propTypes = {
  title: PropTypes.string,
};

export default AddWallet;
