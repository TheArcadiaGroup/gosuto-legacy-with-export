import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';

const GeneralModal = ({ visible, changeVisibility, children }) => {
  const handleOk = () => {
    changeVisibility(false);
  };

  const handleCancel = () => {
    changeVisibility(false);
  };

  return (
    <>
      <Modal
        title="Basic Modal"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
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
};

export default GeneralModal;
