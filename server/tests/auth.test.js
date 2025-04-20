import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('POST /api/auth/register', () => {
  it('Should register a new user and return a token', async () => {
    const userData = {
      name: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
    expect(res.body).toHaveProperty('message', 'Registered successfully');

    const user = await User.findOne({ email: userData.email });
    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    const isPasswordMatch = await bcrypt.compare(userData.password, user.password);
    expect(isPasswordMatch).toBe(true);
  });

  it('Should return an error for invalid registration', async () => {
    const invalidUserData = { email: 'invalid', password: 'short' };
    const res = await request(app)
      .post('/api/auth/register')
      .send(invalidUserData)
      .expect(500);
    expect(res.body).toHaveProperty('message', 'Server error during registration');
  });

  it('Should return an error for duplicate email', async () => {
    const existingUser = { name: 'old', email: 'duplicate@example.com', password: 'password' };
    await User.create(existingUser);

    const userData = { name: 'new', email: 'duplicate@example.com', password: 'another' };
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400); 
    expect(res.body).toHaveProperty('message', 'User already exists');
  });
});

describe('POST /api/auth/login', () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({ name: 'test', email: 'login@example.com', password: await bcrypt.hash('password', 10) });
    await testUser.save();
  });

  it('Should log in a user with correct credentials and return a token', async () => {
    const loginData = { email: 'login@example.com', password: 'password' };
    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
  });

  it('should return an error for incorrect password', async () => {
    const loginData = { email: 'login@example.com', password: 'wrongpassword' };
    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should return an error if the user is not found', async () => {
    const loginData = { email: 'nonexistent@example.com', password: 'anypassword' };
    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});

describe('GET /api/auth/me', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    testUser = new User({ name: 'current', email: 'current@example.com', password: await bcrypt.hash('password', 10) });
    await testUser.save();
    authToken = jwt.sign({ userId: testUser._id, email: testUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  it('should return the current user email if authenticated via cookie', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `auth_token=${authToken}`)
      .expect(200);
    expect(res.body).toHaveProperty('email');
    expect(res.body.email).toBe(testUser.email);
  });

  it('should return "Not logged in" if no token is present', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .expect(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Not logged in');
  });

  it('should return "Invalid token" if the token is invalid', async () => {
    const invalidToken = 'invalid.token.signature';
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `auth_token=${invalidToken}`)
      .expect(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Invalid token');
  });
});

describe('GET /api/auth/logout', () => {
  it('should clear the auth_token cookie and return "Logged out" message', async () => {
    const res = await request(app)
      .get('/api/auth/logout')
      .expect(200);
    expect(res.headers['set-cookie']).toBeDefined();
    const clearCookieHeader = res.headers['set-cookie'].find(cookie => cookie.startsWith('auth_token='));
    expect(clearCookieHeader).toContain('auth_token=;');
    expect(clearCookieHeader).toContain('HttpOnly');
    expect(clearCookieHeader).toContain('SameSite=Lax');
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Logged out');
  });
});