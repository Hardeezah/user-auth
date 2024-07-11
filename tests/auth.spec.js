import request from 'supertest';
import { app } from '../index.js';
import { User, Organisation, UserOrganisation, sequelize } from '../models/index.js';
import bcrypt from 'bcryptjs';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('Authentication and Organisation Tests', () => {
  let token;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      userId: 'testuser1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: hashedPassword,
      phone: '1234567890',
    });

    // Login the test user to get a token
    const res = await request(app).post('/auth/login').send({
      email: 'john.doe@example.com',
      password: 'password123',
    });

    token = res.body.data.accessToken;
  });

  it('should register a user successfully', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        phone: '0987654321',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message', 'Registration successful');
  });

  it('should login a user successfully', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message', 'Login successful');
  });

  it('should get a user by ID', async () => {
    const res = await request(app)
      .get(`/api/users/testuser1`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.data).toHaveProperty('userId', 'testuser1');
  });

  it('should get all organizations the user belongs to', async () => {
    const res = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.data).toHaveProperty('organisations');
  });

  it('should get a single organization by ID', async () => {
    const org = await Organisation.create({
      orgId: 'testorg1',
      name: 'Test Organisation',
      description: 'This is a test organisation.',
    });

    const res = await request(app)
      .get(`/api/organisations/${org.orgId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.data).toHaveProperty('orgId', 'testorg1');
  });

  it('should add a user to an organization', async () => {
    const org = await Organisation.create({
      orgId: 'testorg2',
      name: 'Test Organisation 2',
      description: 'This is another test organisation.',
    });

    const res = await request(app)
      .post(`/api/organisations/${org.orgId}/users`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: 'testuser1' });

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toHaveProperty('message', 'User added to organisation successfully');
  });

  it('should fail to register a user with duplicate email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    expect(res.status).toBe(422);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toHaveProperty('status', 'Bad request');
    expect(res.body).toHaveProperty('message', 'Registration unsuccessful');
  });

  it('should fail to register a user with missing fields', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
      });

    expect(res.status).toBe(422);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toHaveProperty('status', 'Bad request');
    expect(res.body).toHaveProperty('message', 'Validation error');
  });
});
