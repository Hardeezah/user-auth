const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Organisation, UserOrganisation } = require('../models');

const register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `${firstName}_${Date.now()}`;

    const user = await User.create({
      userId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    });

    const orgId = `${firstName}_org_${Date.now()}`;
    const organisation = await Organisation.create({
      orgId,
      name: `${firstName}'s Organisation`,
      description: '',
    });

    await UserOrganisation.create({
      userId: user.userId,
      orgId: organisation.orgId,
      UserId: user.id,
      OrganisationId: organisation.id,
    });

    const token = jwt.sign({ userId: user.userId, email: user.email, id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      status: 'Bad request',
      message: 'Registration unsuccessful',
      statusCode: 400,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401,
      });
    }

    const token = jwt.sign({ userId: user.userId, email: user.email, id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      status: 'Bad request',
      message: 'Authentication failed',
      statusCode: 401,
    });
  }
};

module.exports = { register, login };
