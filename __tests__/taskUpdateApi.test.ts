import handler from '../pages/api/tasks/[id]';
import { createMocks } from 'node-mocks-http';
import { getSession } from 'next-auth/react';
import Task from '../models/Task';
import db from '../utils/db';

jest.mock('../models/Task');
jest.mock('../utils/db');

describe('Task Update API', () => {
    beforeAll(() => {
        db.connect = jest.fn();
    });

    it('should return 401 if no session is found', async () => {
        const { req, res } = createMocks({
            method: 'PUT',
            query: { id: 'task-id' },
            body: { status: 'completed' },
        });

        (getSession as jest.Mock).mockReturnValue(null);

        await handler(req, res);

        expect(res._getStatusCode()).toBe(401);
        expect(res._getData()).toEqual(
            JSON.stringify({ message: 'Unauthorized' })
        );
    });

    it('should update task status when session is valid', async () => {
        const { req, res } = createMocks({
            method: 'PUT',
            query: { id: 'task-id' },
            body: { status: 'completed' },
        });

        (getSession as jest.Mock).mockReturnValue({
            user: { id: 'test-user-id' },
        });

        (Task.findOneAndUpdate as jest.Mock).mockResolvedValue({
            _id: 'task-id',
            title: 'Test Task',
            status: 'completed',
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toMatchObject({
            status: 'completed',
        });
    });
});
