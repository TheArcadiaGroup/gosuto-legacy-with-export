import mongoose from 'mongoose';
import ERCToken from './ERCToken';

const connectToDb = async () => {
  console.log(mongoose.connection.readyState);
  if (mongoose.connection.readyState === 1) {
    console.log(mongoose.connection);
    return mongoose.connection;
  }
  const cnx = await mongoose.connect(
    'mongodb+srv://altasAdmin:9k5r4Duj00lU5BdW@cluster0.5zxmc.mongodb.net/tokens?authSource=admin&replicaSet=atlas-lralit-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true'
  );
  console.log(cnx);
  return cnx;
};

const getERCTokensModel = async () => {
  await connectToDb();
  mongoose.model('ERCTokens', ERCToken);
};

export { connectToDb, getERCTokensModel };
