const mongoose = require('mongoose');

module.exports.connection = async () => {
  console.log(process.env.MONGO_DB_URL);
  try {
    mongoose.set('debug', true);

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

module.exports.isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};
