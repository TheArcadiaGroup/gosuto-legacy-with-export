import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';

const GeneralModal = ({
  visible,
  changeVisibility,
  children,
  footer,
  customOnCancelLogic,
}) => {
  const handleOk = () => {
    changeVisibility(false);
  };

  const handleCancel = () => {
    if (customOnCancelLogic) {
      customOnCancelLogic();
    }
    changeVisibility(false);
  };

  return (
    <>
      <Modal
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
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
  customOnCancelLogic: PropTypes.func,
};

export default GeneralModal;
