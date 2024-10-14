import handler from '../pages/api/tasks/index';
import { createMocks } from 'node-mocks-http';
import { getSession } from 'next-auth/react';
import Task from '../models/Task';
import db from '../utils/db';

// Mock MongoDB connection and Task model
jest.mock('../models/Task');
jest.mock('../utils/db');

describe('Task API', () => {
    beforeAll(() => {
        // Mock the MongoDB connection
        db.connect = jest.fn();
    });

    it('should return 401 if no session is found', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                title: 'Test Task',
                description: 'Task description',
                priority: 1,
            },
        });

        // Mock session to be null
        (getSession as jest.Mock).mockReturnValue(null);

        await handler(req, res);
        expect(res._getStatusCode()).toBe(401);
        expect(res._getData()).toEqual(
            JSON.stringify({ message: 'Unauthorized' })
        );
    });

    it('should create a task when session is valid', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                title: 'Test Task',
                description: 'Task description',
                priority: 1,
            },
        });

        // Mock valid session
        (getSession as jest.Mock).mockReturnValue({
            user: { id: 'test-user-id' },
        });

        // Mock Task creation
        (Task.create as jest.Mock).mockResolvedValue({
            _id: 'task-id',
            title: 'Test Task',
            description: 'Task description',
            priority: 1,
            userId: 'test-user-id',
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(201);
        expect(JSON.parse(res._getData())).toMatchObject({
            title: 'Test Task',
        });
    });
});
