import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = Schema;

const ERCToken = new Schema({
  id: ObjectId,
  selectedNetwork: String,
  tokenName: String,
  tokenTicker: String,
  image: String,
  decimals: String,
  initialSupply: String,
  defaultAuthorizedMinter: String,
  deployHash: String,
  activePublicKey: String,
});
export default ERCToken;
