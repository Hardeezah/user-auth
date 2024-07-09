const jwt = require('jsonwebtoken');
const supertest = require('supertest');
const { sequelize, User, Organisation, UserOrganisation } = require('../models');
require('dotenv').config();

const app = require('../index');  // Ensure your app is correctly exported

const request = supertest(app);

describe('Authentication and Organisation Tests', function() {
  let expect;

  before(async function() {
    this.timeout(10000);  // Increase timeout to 10 seconds
    const chai = await import('chai');
    expect = chai.expect;
    await sequelize.sync({ force: true });
  });

  afterEach(async function() {
    await User.destroy({ where: {} });
    await Organisation.destroy({ where: {} });
    await UserOrganisation.destroy({ where: {} });
  });

  describe('Token Generation', function() {
    it('should generate a token with correct user details and expiration time', function(done) {
      const payload = { userId: 'testUser', email: 'test@example.com' };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded).to.have.property('userId', 'testUser');
      expect(decoded).to.have.property('email', 'test@example.com');
      expect(decoded.exp).to.be.a('number');
      done();
    });
  });

  describe('Organisation Access', function() {
    it('should ensure users can’t see data from organisations they don’t have access to', async function() {
      const user1 = await User.create({
        userId: 'user1_123',
        firstName: 'User',
        lastName: 'One',
        email: 'user1@example.com',
        password: 'password123',
        phone: '1234567890',
      });

      const user2 = await User.create({
        userId: 'user2_123',
        firstName: 'User',
        lastName: 'Two',
        email: 'user2@example.com',
        password: 'password123',
        phone: '0987654321',
      });

      const organisation = await Organisation.create({
        orgId: 'org_123',
        name: "User One's Organisation",
        description: 'Organisation for User One',
      });

      await UserOrganisation.create({
        userId: user1.userId,
        orgId: organisation.orgId,
        UserId: user1.id,
        OrganisationId: organisation.id,
      });

      const token = jwt.sign({ userId: user2.userId, email: user2.email, id: user2.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const res = await request
        .get(`/api/organisations/${organisation.orgId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('message', 'Organisation not found');
    });
  });

  describe('User Registration', function() {
    it('should register user successfully with default organisation', async function() {
      const res = await request
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('status', 'success');
      expect(res.body.data).to.have.property('accessToken');
      expect(res.body.data.user).to.include({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });
      const orgName = "John's Organisation";
      const organisation = await Organisation.findOne({ where: { name: orgName } });
      expect(organisation).to.not.be.null;
      expect(organisation.name).to.equal(orgName);
    });

    it('should log the user in successfully', async function() {
      await request
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      const res = await request
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123',
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'success');
      expect(res.body.data).to.have.property('accessToken');
      expect(res.body.data.user).to.include({
        email: 'john.doe@example.com',
      });
    });

    it('should fail if required fields are missing', async function() {
      const res = await request
        .post('/auth/register')
        .send({
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
        });

      expect(res.status).to.equal(422);
      expect(res.body.errors).to.be.an('array');
      expect(res.body.errors[0]).to.have.property('field', 'firstName');
    });

    it('should fail if there’s duplicate email or userId', async function() {
      await request
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      const res = await request
        .post('/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '0987654321',
        });

      expect(res.status).to.equal(422);
      expect(res.body.errors).to.be.an('array');
      expect(res.body.errors[0]).to.have.property('field', 'email');
    });
  });
});
