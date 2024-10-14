import mongoose, { Schema, Document } from 'mongoose';

interface ITask extends Document {
    title: string;
    description: string;
    status: string;
    userId: string;
    createdAt: Date;
}

const TaskSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: Number, default: 3 }, // 1: High, 2: Medium, 3: Low
    status: { type: String, default: 'pending' }, // e.g., pending, completed
    userId: { type: String, required: true }, // reference to the user
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
