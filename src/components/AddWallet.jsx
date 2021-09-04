import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import GeneralModal from './GeneralModal';
import './components.global.scss';

const AddWallet = ({
  title,
  children,
  footer,
  customOnCancelLogic,
  isModalVisible,
  setIsModalVisible,
  disabled,
}) => {
  const showModal = () => {
    if (!disabled) setIsModalVisible(true);
  };
  const [backupIsModalVisible, setBackupIsModalVisible] = useState(false);
  isModalVisible = isModalVisible || backupIsModalVisible;
  setIsModalVisible = setIsModalVisible || setBackupIsModalVisible;
  return (
    <div className="site-card-wrapper">
      <Row>
        <Col span={24}>
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
        footer={footer}
      >
        {children}
      </GeneralModal>
    </div>
  );
};
AddWallet.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  footer: PropTypes.any,
};

export default AddWallet;
