const { default: mongoose } = require("mongoose");
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    taskName: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskDesc: {
      type: String,
      required: true,
      trim: true,
    },
    taskType: { type: String, required: true, trim: true },
    
    // --- START OF THE FIX ---
    // Correctly define 'assignedTo' as an array of User references.
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // --- END OF THE FIX ---
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;