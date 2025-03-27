import mongoose from "mongoose"
const placement_querySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  queryText: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      "Internship",
      "Job Placement",
      "Aptitude Preparation",
      "Technical Preparation",
      "Resume Review",
      "Other"
    ],
    default: "Other"
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved", "Escalated"],
    default: "Pending"
  },
  
  assignedToTPC: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TPC",
    default: null
  },
  escalatedToTPO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TPO",
    default: null
  },
},{timestamps : true})

export const placement_query = mongoose.model(
  'placement_query',
  placement_querySchema
);