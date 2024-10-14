import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import axios from 'axios';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '' });

    const fetchTasks = async () => {
        const session = await getSession();
        if (session) {
            const res = await axios.get('/api/tasks');
            setTasks(res.data);
        }
    };

    const createTask = async (e: React.FormEvent) => {
        e.preventDefault();
        await axios.post('/api/tasks', newTask);
        setNewTask({ title: '', description: '' });
        fetchTasks();
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
        <div>
            <h1>Task Manager</h1>
            <form onSubmit={createTask}>
                <input
                    type="text"
                    placeholder="Title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <textarea
                    placeholder="Description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                ></textarea>
                <button type="submit">Add Task</button>
            </form>

            <ul>
                {tasks.map((task) => (
                    // @ts-ignore
                    <li key={task._id}><h3>{task.title}</h3><p>{task.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
