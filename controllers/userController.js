const { User } = require('../models');

const getUser = async (req, res) => {
  try {
    console.log(`Fetching user with ID: ${req.params.id}`);
    const user = await User.findOne({ where: { userId: req.params.id } });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User found',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

module.exports = { getUser };
