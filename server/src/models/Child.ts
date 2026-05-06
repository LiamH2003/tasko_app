import { Schema, model } from 'mongoose';

const monsterSchema = new Schema({
  name: { type: String, required: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpToNextLevel: { type: Number, default: 100 },
  stage: { type: String, enum: ['egg', 'baby', 'child', 'teen', 'adult'], default: 'egg' },
});

const childSchema = new Schema({
  name: { type: String, required: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  monster: { type: monsterSchema, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Child = model('Child', childSchema);
