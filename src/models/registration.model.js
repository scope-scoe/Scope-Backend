import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
  },
  { timestamps: true }
);

export const EventRegistration = mongoose.model(
  'EventRegistration',
  eventRegistrationSchema
);
