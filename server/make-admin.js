require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const EMAIL = process.argv[2];

if (!EMAIL) {
  console.error('Usage: node make-admin.js <email>');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email: EMAIL },
      { role: 'admin' },
      { new: true }
    );
    if (!user) {
      console.error(`❌ No user found with email: ${EMAIL}`);
    } else {
      console.log(`✅ ${user.name} (${user.email}) is now an admin!`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ DB error:', err.message);
    process.exit(1);
  });
