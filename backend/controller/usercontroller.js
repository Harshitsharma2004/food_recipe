
// const bcrypt = require('bcryptjs');
// const User = require('../models/User');

// exports.changePassword = async (req, res) => {
//   const { currentPassword, newPassword } = req.body;

//   try {
//     const user = await User.findById(req.user.id); // user ID from token

//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Current password is incorrect' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     await user.save();
//     res.json({ message: 'Password changed successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
