const mongoose = require('mongoose');

module.exports.connection = async () => {
  console.log(process.env.MONGO_DB_URL);
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connect Success');
  } catch (e) {
    console.log('Fali Connect', e);
    throw e;
  }
};