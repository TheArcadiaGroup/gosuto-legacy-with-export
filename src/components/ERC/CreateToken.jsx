/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Input, Upload, message, Switch, Col, Row, Button } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import fs from 'fs';
import { remote } from 'electron';
import Datastore from 'nedb-promises';

const CreateToken = (props) => {
  const {
    visible,
    changeVisibility,
    customOnCancelLogic,
    width,
    bodyStyle,
    style,
    onAdd,
  } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [image, setImage] = useState(null);
  const [isLimitedSupply, setIsLimitedSupply] = useState(true);
  const [tokenName, setTokenName] = useState(null);
  const [tokenTicker, setTokenTicker] = useState(null);
  const [contractString, setContractString] = useState(null);
  const [price, setPrice] = useState(null);
  const updateFromState = () => {
    setPrice(null);
    setTokenName(null);
    setTokenTicker(null);
    setImage(null);
    setImageUrl(null);
    setContractString(null);
    setIsLimitedSupply(true);
  };
  const handleOk = () => {
    changeVisibility(false);
    updateFromState();
  };
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }

    return false;
  };

  const handleCancel = () => {
    if (customOnCancelLogic) {
      customOnCancelLogic();
    }
    changeVisibility(false);
    updateFromState();
  };

  const handleChange = (info) => {
    // Get this url from response in real world.
    getBase64(info.file, (imageURL) => {
      setIsLoading(false);
      setImage(info.file);
      setImageUrl(imageURL);
    });
  };
  const uploadButton = (
    <div>
      {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8, alignContent: 'center' }}>Upload image</div>
    </div>
  );

  const onSubmit = async () => {
    try {
      if (tokenName && tokenTicker && contractString && price && imageUrl) {
        const ercDb = Datastore.create({
          filename: `${remote.app.getPath('userData')}/ERC.db`,
          timestampData: true,
        });
        const imageName = `${remote.app.getPath('userData')}/${image.uid}.${
          image.name.split('.')[1]
        }`;
        fs.writeFileSync(
          imageName,
          imageUrl.replace(/^data:image\/(jpeg|png);base64,/, ''),
          'base64'
        );
        const transaction = {
          image: imageName,
          name: tokenName,
          ticker: tokenTicker,
          timestamp: new Date(),
          contractString,
          price,
          isLimitedSupply,
        };
        const newRecord = await ercDb.insert(transaction);
        onAdd(newRecord);
        updateFromState();
        handleCancel();
      } else {
        message.error('please fill all the form');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error on Submit new ERC Token : ', error);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={width}
        bodyStyle={bodyStyle}
        style={style}
      >
        <div>
          <div className="modal-title">Create a Token</div>
          <div className="modal-content">
            <Row>
              <Col span={8} />
              <Col span={8} justify="space-around" align="middle">
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="avatar"
                      style={{ width: '100%' }}
                    />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </Col>
              <Col span={8} />
            </Row>
            <Input
              type="text"
              className="modal-input-amount"
              placeholder="Token Name"
              value={tokenName}
              onChange={(e) => {
                setTokenName(e.target.value);
              }}
            />
            <Input
              type="text"
              className="modal-input-amount"
              placeholder="Token ticker"
              value={tokenTicker}
              onChange={(e) => {
                setTokenTicker(e.target.value);
              }}
            />
            <Input
              type="text"
              className="modal-input-amount"
              placeholder="Contract ticker"
              value={contractString}
              onChange={(e) => {
                setContractString(e.target.value);
              }}
            />
            <Input
              type="number"
              className="modal-input-amount"
              placeholder="price"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
              }}
            />
            <div>
              <Row gutter={12}>
                <Col span={12}>{'Limited Suply '}</Col>
                <Switch
                  checked={isLimitedSupply}
                  onChange={() => {
                    setIsLimitedSupply(!isLimitedSupply);
                  }}
                />
                <Col span={6} />
              </Row>
              <Row gutter={12}>
                <Col span={12}>{'Maintable Suply '}</Col>
                <Switch
                  checked={!isLimitedSupply}
                  onChange={() => {
                    setIsLimitedSupply(!isLimitedSupply);
                  }}
                />
                <Col span={6} />
              </Row>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Row gutter={12}>
                  <Col span={12}>
                    <Button
                      type="primary"
                      onClick={onSubmit}
                      className="send-button"
                    >
                      Submit
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      type="primary"
                      onClick={handleCancel}
                      className="cancel-button"
                    >
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

CreateToken.propTypes = {
  visible: PropTypes.bool,
  changeVisibility: PropTypes.func,
  customOnCancelLogic: PropTypes.func,
  onAdd: PropTypes.func,
  width: PropTypes.object,
  bodyStyle: PropTypes.object,
  style: PropTypes.object,
};
CreateToken.defaultProps = {
  onAdd: () => {},
};

export default CreateToken;
