import { Schema, model } from 'mongoose';

const moodEntrySchema = new Schema({
  childId: { type: Schema.Types.ObjectId, ref: 'Child', required: true },
  mood: { type: String, enum: ['great', 'good', 'okay', 'sad', 'angry'], required: true },
  note: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const MoodEntry = model('MoodEntry', moodEntrySchema);
