import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import habitLog from '../models/habitLog.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

let authToken;
let testUser;

beforeAll(async () => {
  testUser = new User({ name: 'habitTester', email: 'habit@example.com', password: await bcrypt.hash('password', 10) });
  await testUser.save();
  authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

beforeEach(async () => {
  await Habit.deleteMany({});
});

describe('GET /api/habits', () => {
  it('should return an empty array of habits for a new user', async () => {
    const res = await request(app)
      .get('/api/habits')
      .set('Cookie', `auth_token=${authToken}`)
      .expect(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(0);
  });

  it('should return an array of habits for the authenticated user', async () => {
    const habit1 = await Habit.create({ user: testUser._id, name: 'Read a book', description: '30 minutes', frequency: 'Daily' });
    const habit2 = await Habit.create({ user: testUser._id, name: 'Exercise', description: '3 times a week', frequency: 'Weekly' });

    const res = await request(app)
      .get('/api/habits')
      .set('Cookie', `auth_token=${authToken}`)
      .expect(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(2);
    expect(res.body.some(habit => habit.name === 'Read a book')).toBe(true);
    expect(res.body.some(habit => habit.name === 'Exercise')).toBe(true);
  });
});

describe('POST /api/habits', () => {
  const newHabit = { name: 'Drink water', description: '8 glasses', frequency: 'Daily' };

  it('should create a new habit', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set('Cookie', `auth_token=${authToken}`)
      .send(newHabit)
      .expect(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe(newHabit.name);

    const habitInDb = await Habit.findOne({ user: testUser._id, name: newHabit.name });
    expect(habitInDb).toBeDefined();
  });

  it('should return 500 for invalid habit data', async () => {
    await request(app)
      .post('/api/habits')
      .set('Cookie', `auth_token=${authToken}`)
      .send({})
      .expect(500);
  });

  it('should return 401 if not authenticated', async () => {
    await request(app)
      .post('/api/habits')
      .send(newHabit)
      .expect(401);
  });
});

describe('GET /api/habits/:id', () => {
  let testHabit;

  beforeEach(async () => {
    testHabit = await Habit.create({ user: testUser._id, name: 'Test Habit', description: 'Test 1 desc', frequency: 'Daily' });
  });

  it('should return 401 if not authenticated', async () => {
    await request(app)
      .get(`/api/habits/${testHabit._id}`)
      .expect(401);
  });
});

describe('PUT /api/habits/:id', () => {
  let testHabit;
  const updatedHabitData = { name: 'Updated Habit', description: 'Twice', frequency: 'Weekly' };

  beforeEach(async () => {
    testHabit = await Habit.create({ user: testUser._id, name: 'Old Habit', description: 'Old Habit edit', frequency: 'Weekly' });
  });

  it('should update a specific habit by ID', async () => {
    const res = await request(app)
      .put(`/api/habits/${testHabit._id}`)
      .set('Cookie', `auth_token=${authToken}`)
      .send(updatedHabitData)
      .expect(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe(updatedHabitData.name);

    const habitInDb = await Habit.findById(testHabit._id);
    expect(habitInDb).toBeDefined();
    expect(habitInDb.name).toBe(updatedHabitData.name);
  });

  it('should return 404 if habit not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await request(app)
      .put(`/api/habits/${nonExistentId}`)
      .set('Cookie', `auth_token=${authToken}`)
      .send(updatedHabitData)
      .expect(404);
  });

  it('should return 403 if the habit belongs to another user', async () => {
    const anotherUser = await User.create({ name: 'other', email: 'other@example.com', password: 'password' });
    const anotherHabit = await Habit.create({ user: anotherUser._id, name: 'Other Habit', description: 'Daily', frequency: 'Daily' });

    await request(app)
      .put(`/api/habits/${anotherHabit._id}`)
      .set('Cookie', `auth_token=${authToken}`)
      .send(updatedHabitData)
      .expect(404);
  });

  it('should return 401 if not authenticated', async () => {
    await request(app)
      .put(`/api/habits/${testHabit._id}`)
      .send(updatedHabitData)
      .expect(401);
  });
});

describe('DELETE /api/habits/:id', () => {
  let testHabit;

  beforeEach(async () => {
    testHabit = await Habit.create({ user: testUser._id, name: 'Deletable Habit', description: 'Weekly', frequency: 'Weekly' });
  });

  it('should delete a specific habit by ID', async () => {
    await request(app)
      .delete(`/api/habits/${testHabit._id}`)
      .set('Cookie', `auth_token=${authToken}`)
      .expect(200);

    const habitInDb = await Habit.findById(testHabit._id);
    expect(habitInDb).toBeNull();
  });

  it('should return 404 if habit not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await request(app)
      .delete(`/api/habits/${nonExistentId}`)
      .set('Cookie', `auth_token=${authToken}`)
      .expect(404);
  });

  it('should return 403 if the habit belongs to another user', async () => {
    const anotherUser = await User.create({ name: 'other', email: 'other@example.com', password: 'password' });
    const anotherHabit = await Habit.create({ user: anotherUser._id, name: 'Other Habit', description: 'Daily', frequency: 'Daily' });

    await request(app)
      .delete(`/api/habits/${anotherHabit._id}`)
      .set('Cookie', `auth_token=${authToken}`)
      .expect(404);
  });

  it('should return 401 if not authenticated', async () => {
    await request(app)
      .delete(`/api/habits/${testHabit._id}`)
      .expect(401);
  });
});

// describe('GET /api/habits/summary', () => {
//   it('should return an empty array if the user has no habits', async () => {
//       await Habit.deleteMany({});
//       await Habit.deleteMany({ user: testUser._id }); // Ensure no habits for the user

//       const res = await request(app)
//           .get('/api/habits/summary')
//           .set('Cookie', `auth_token=${authToken}`)
//           .expect(200);

//       expect(res.body).toBeInstanceOf(Array);
//       expect(res.body.length).toBe(0);
//   });

//   it('should return a summary with counts for done and missed habits', async () => {
//     const habit1 = await Habit.create({ user: testUser._id, name: 'Read Book', frequency: 'Daily' });
//     const habit2 = await Habit.create({ user: testUser._id, name: 'Exercise', frequency: 'Weekly' });

//     await habitLog.create({ user: testUser._id, habit: habit1._id, status: 'Completed' });
//     await habitLog.create({ user: testUser._id, habit: habit1._id, status: 'Completed' });
//     await habitLog.create({ user: testUser._id, habit: habit1._id, status: 'Missed' });
//     await habitLog.create({ user: testUser._id, habit: habit2._id, status: 'Completed' });
//     await habitLog.create({ user: testUser._id, habit: habit2._id, status: 'Missed' });
//     await habitLog.create({ user: testUser._id, habit: habit2._id, status: 'Missed' });

//     const res = await request(app)
//         .get('/api/habits/summary')
//         .set('Cookie', `auth_token=${authToken}`)
//         .expect(200);

//     expect(res.body).toBeInstanceOf(Array);
//     expect(res.body.length).toBe(2);

//     const summaryHabit1 = res.body.find(item => item.habitName === 'Read Book');
//     expect(summaryHabit1).toBeDefined();
//     expect(summaryHabit1).toHaveProperty('doneCount', 2);
//     expect(summaryHabit1).toHaveProperty('missedCount', 1);

//     const summaryHabit2 = res.body.find(item => item.habitName === 'Exercise');
//     expect(summaryHabit2).toBeDefined();
//     expect(summaryHabit2).toHaveProperty('doneCount', 1);
//     expect(summaryHabit2).toHaveProperty('missedCount', 2);
//   });

//   // it('should return a summary with zero counts if no logs exist for a habit', async () => {
//   //     const res = await request(app)
//   //         .get('/api/habit-logs/summary')
//   //         .set('Cookie', `auth_token=${authToken}`)
//   //         .expect(200);

//   //     expect(res.body).toBeInstanceOf(Array);
//   //     expect(res.body.length).toBe(2);

//   //     const summaryHabit1 = res.body.find(item => item.habitName === 'Read Book');
//   //     expect(summaryHabit1).toBeDefined();
//   //     expect(summaryHabit1).toHaveProperty('doneCount', 0);
//   //     expect(summaryHabit1).toHaveProperty('missedCount', 0);

//   //     const summaryHabit2 = res.body.find(item => item.habitName === 'Exercise');
//   //     expect(summaryHabit2).toBeDefined();
//   //     expect(summaryHabit2).toHaveProperty('doneCount', 0);
//   //     expect(summaryHabit2).toHaveProperty('missedCount', 0);
//   // });

//   // it('should return 401 if not authenticated', async () => {
//   //     const res = await request(app)
//   //         .get('/api/habit-logs/summary')
//   //         .expect(401);

//   //     expect(res.body).toHaveProperty('message', 'Not authenticated'); // Or your actual error message
//   // });

//   // it('should return 500 for server error during summary retrieval', async () => {
//   //     const originalHabitAggregate = Habit.aggregate;
//   //     Habit.aggregate = jest.fn().mockRejectedValue(new Error('Aggregation error'));

//   //     const res = await request(app)
//   //         .get('/api/habit-logs/summary')
//   //         .set('Cookie', `auth_token=${authToken}`)
//   //         .expect(500);

//   //     expect(res.body).toHaveProperty('message', 'Error retrieving habit summary');

//   //     Habit.aggregate = originalHabitAggregate; // Restore original function
//   // });
// });