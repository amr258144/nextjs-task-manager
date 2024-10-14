import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import Task from '../../../models/Task';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    await db.connect();

    switch (req.method) {
        case 'PUT':
            try {
                // @ts-ignore
                const task = await Task.findOneAndUpdate({ _id: id, userId: session.user.id }, req.body, { new: true });
                if (!task) {
                    return res.status(404).json({ message: 'Task not found' });
                }
                res.status(200).json(task);
            } catch (error) {
                res.status(500).json({ message: 'Error updating task' });
            }
            break;

        case 'DELETE':
            try {
                // @ts-ignore
                const task = await Task.findOneAndDelete({ _id: id, userId: session.user.id });
                if (!task) {
                    return res.status(404).json({ message: 'Task not found' });
                }
                res.status(200).json({ message: 'Task deleted' });
            } catch (error) {
                res.status(500).json({ message: 'Error deleting task' });
            }
            break;

        default:
            res.setHeader('Allow', ['PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
