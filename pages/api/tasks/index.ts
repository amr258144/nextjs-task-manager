import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import Task from '../../../models/Task';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    await db.connect();

    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                // @ts-ignore
                const tasks = await Task.find({ userId: session.user.id });
                res.status(200).json(tasks);
            } catch (error) {
                res.status(500).json({ message: 'Error fetching tasks' });
            }
            break;

        case 'POST':
            try {
                console.log('session.user.id', session.user)
                const task = await Task.create({
                    ...req.body,
                    // @ts-ignore
                    userId: session.user.id,
                });
                res.status(201).json(task);
            } catch (error) {
                console.log(error)
                res.status(500).json({ message: 'Error creating task' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
