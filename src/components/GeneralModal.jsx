import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';

const GeneralModal = ({ visible, changeVisibility, children, footer }) => {
  const handleOk = () => {
    changeVisibility(false);
  };

  const handleCancel = () => {
    changeVisibility(false);
  };

  return (
    <>
      <Modal
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={footer && footer}
      >
        {children}
      </Modal>
    </>
  );
};

GeneralModal.propTypes = {
  visible: PropTypes.bool,
  changeVisibility: PropTypes.func,
  children: PropTypes.any,
  footer: PropTypes.any,
};

export default GeneralModal;
