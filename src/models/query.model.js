import mongoose from "mongoose"
const querySchema = new mongoose.Schema({
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
      "Internships",
      "Company Details",
      "Technical Questions",
      "Eligibility",
      "Resume Help",
      "Job Openings",
      "Application",
      "Interview Tips",
      "Placement Process",
      "General Queries",
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
    type: Boolean,
    default: false
  },
},{timestamps : true})

export const Query = mongoose.model(
  'Query',
  querySchema
);