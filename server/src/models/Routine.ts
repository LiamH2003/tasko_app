import { Schema, model } from 'mongoose';

const taskSchema = new Schema({
  title: { type: String, required: true },
  emoji: { type: String, default: '✅' },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const routineSchema = new Schema({
  name: { type: String, required: true },
  childId: { type: Schema.Types.ObjectId, ref: 'Child', required: true },
  tasks: [taskSchema],
  scheduledTime: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Routine = model('Routine', routineSchema);
