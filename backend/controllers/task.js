const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

const createTask = async (req, res) => {
  const types = ["todo", "inProgress", "done"];
  try {
    const { taskName, taskDesc, userId, assigned, projectId, type } = req.body;
    const taskType = types.includes(type) ? type : "todo";

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project Not Found" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Creator User Not Found" });

    const newTask = new Task({
      taskName,
      taskDesc,
      createdBy: user._id,
      taskType: taskType, // Use the sanitized taskType
      assignedTo: assigned || [],
    });
    const savedTask = await newTask.save();

    await Project.findByIdAndUpdate(projectId, {
      $push: { [`projectTasks.${taskType}`]: savedTask._id },
    });

    const savedProject = await Project.findById(projectId)
      .populate("projectTeam.admin", ["firstName", "lastName", "email", "_id"])
      .populate("projectTeam.teamMembers", ["firstName", "lastName", "email", "_id"])
      .populate(["projectTasks.todo", "projectTasks.inProgress", "projectTasks.done"]);
      
    res.status(200).json({ project: savedProject });
  } catch (err) {
    console.error("Error creating task:", err);
    return res.status(500).json({ message: "An internal server error occurred." });
  }
};

const changeTaskType = async (req, res) => {
  try {
    const { taskId, projectId, currentState, nextState } = req.body;
    
    // Combine two separate project updates into one for better performance
    await Project.findByIdAndUpdate(projectId, {
      $pull: { [`projectTasks.${currentState}`]: taskId },
      $addToSet: { [`projectTasks.${nextState}`]: taskId },
    });

    await Task.findByIdAndUpdate(taskId, { taskType: nextState });

    const savedProject = await Project.findById(projectId)
      .populate("projectTeam.admin", ["firstName", "lastName", "email", "_id"])
      .populate("projectTeam.teamMembers", ["firstName", "lastName", "email", "_id"])
      .populate(["projectTasks.todo", "projectTasks.inProgress", "projectTasks.done"]);
      
    res.status(200).json({ project: savedProject });
  } catch (err) {
    console.error("Error changing task type:", err);
    return res.status(500).json({ message: "An internal server error occurred." });
  }
};

const fetchTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const project = await Project.findById(projectId).populate([
      "projectTasks.todo",
      "projectTasks.inProgress",
      "projectTasks.done",
    ]);

    if (!project) return res.status(404).json({ message: "Project Not Found" });
    res.status(200).json({ project });
  } catch(err) {
    console.error("Error fetching tasks:", err);
    return res.status(500).json({ message: "An internal server error occurred." });
  }
};

const assignUser = async (req, res) => {
  try {
    const { taskId, userId, projectId } = req.body;
    
    // --- START OF THE FIX ---
    // The $addToSet operator should be the top-level key in the update object.
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $addToSet: { assignedTo: userId } },
      { new: true } // Return the updated document
    );
    // --- END OF THE FIX ---

    if (!updatedTask) return res.status(404).json({ message: "Task not found." });

    // Since we only updated a task, we don't need to re-fetch the whole project
    // unless the frontend absolutely requires it. For now, let's just send a
    // success message. This is more efficient.
    res.status(200).json({ message: "User assigned successfully.", task: updatedTask });

  } catch (err) {
    console.error("Error assigning user:", err);
    return res.status(500).json({ message: "An internal server error occurred." });
  }
};

module.exports = { createTask, changeTaskType, fetchTasks, assignUser };