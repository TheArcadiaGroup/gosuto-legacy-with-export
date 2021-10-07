import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import GeneralModal from '../GeneralModal';
import '../components.global.scss';

const Modal = (props) => {
  const {
    title,
    children,
    customOnCancelLogic,
    isModalVisible,
    setIsModalVisible,
    disabled,
  } = props;
  const showModal = () => {
    if (!disabled) setIsModalVisible(true);
  };

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
      >
        {children}
      </GeneralModal>
    </div>
  );
};
Modal.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  customOnCancelLogic: PropTypes.func,
  isModalVisible: PropTypes.bool,
  setIsModalVisible: PropTypes.func,
  disabled: PropTypes.bool,
};
Modal.defaultProps = {
  title: '',
  children: <></>,
  customOnCancelLogic: () => {},
  isModalVisible: false,
  setIsModalVisible: () => {},
  disabled: false,
};
export default Modal;
