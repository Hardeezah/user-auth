const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Organisation, UserOrganisation } = require('../models');
require('dotenv').config();

const register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      userId: `${firstName}_${Date.now()}`,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    });

    const organisation = await Organisation.create({
      orgId: `${firstName}_org_${Date.now()}`,
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
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      const value = error.errors[0].value;
      return res.status(422).json({
        errors: [{
          field,
          message: `${field} must be unique. ${value} already exists.`,
        }]
      });
    }
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
    if (!user) {
      return res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401,
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
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
    res.status(400).json({
      status: 'Bad request',
      message: 'Authentication failed',
      statusCode: 401,
    });
  }
};

module.exports = { register, login };
