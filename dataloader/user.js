const User = require('../database/models/user');

module.exports.batchUsers = async (userIds) => {
  console.log('Keys===', userIds);
  const users = await User.find({_id: {$in: userIds}});

  return userIds.map((userid) => users.find((user) => user.id === userid));
};
