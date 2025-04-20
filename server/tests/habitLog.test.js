import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/habitLog.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import habitLog from '../models/habitLog.js';

let authToken;
let testUser;
let testHabit;

beforeAll(async () => {
    testUser = new User({ name: 'logTester', email: 'log@example.com', password: await bcrypt.hash('password', 10) });
    await testUser.save();
    authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    testHabit = await Habit.create({ user: testUser._id, name: 'Loggable Habit', description: 'Log Habit 1', frequency: 'Daily' });

});

beforeEach(async () => {
    await HabitLog.deleteMany({});
});

describe('POST /api/habit-logs', () => {
    it('should create a new habit log', async () => {
      const logData = { habitId: testHabit._id, status: "Completed" };
      const res = await request(app)
          .post('/api/habit-logs')
          .set('Cookie', `auth_token=${authToken}`)
          .send(logData)
          .expect(201);
      console.log(res.body);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.status).toBe(logData.status);      
  
      const logInDb = await HabitLog.findOne({ user: testUser._id, habit: testHabit._id, date: logData.date });
      expect(logInDb).toBeDefined();
  });

    it('should return 400 if habitId, date, or completed is missing', async () => {
        await request(app)
            .post('/api/habit-logs')
            .set('Cookie', `auth_token=${authToken}`)
            .send({})
            .expect(500);

        await request(app)
            .post('/api/habit-logs')
            .set('Cookie', `auth_token=${authToken}`)
            .send({ habitId: testHabit._id, date: Date.now() })
            .expect(201);

        await request(app)
            .post('/api/habit-logs')
            .set('Cookie', `auth_token=${authToken}`)
            .send({ habitId: testHabit._id, completed: true })
            .expect(201);
    });

    it('should return 401 if not authenticated', async () => {
      const logData = { habitId: testHabit._id, status: "Completed" };
        await request(app)
            .post('/api/habit-logs')
            .send(logData)
            .expect(401);
    });
});

describe('GET /api/habit-logs', () => {
  let log1, log2;

  beforeEach(async () => {
      log1 = await HabitLog.create({ user: testUser._id, habit: testHabit._id, date: Date.now(), status: "Completed" });
      log2 = await HabitLog.create({ user: testUser._id, habit: testHabit._id, date: Date.now(), status: "Missed" });
  });

  it('should return an array of habit logs for the authenticated user with populated habit data', async () => {
      const res = await request(app)
          .get('/api/habit-logs')
          .set('Cookie', `auth_token=${authToken}`)
          .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(2);

      const logOne = res.body.find(log => log._id.toString() === log1._id.toString());
      expect(logOne).toBeDefined();
      expect(logOne.user).toBe(testUser._id.toString());

  });

  it('should return an empty array if the user has no habit logs', async () => {
      await HabitLog.deleteMany({}); // Ensure no logs exist

      const res = await request(app)
          .get('/api/habit-logs')
          .set('Cookie', `auth_token=${authToken}`)
          .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(0);
  });

  it('should return 401 if not authenticated', async () => {
      const res = await request(app)
          .get('/api/habit-logs/user')
          .expect(401);

      expect(res.body).toHaveProperty('message', 'Not authorized'); // Or your actual error message
  });
});
