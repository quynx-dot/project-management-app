const Project = require("../models/Project");
const User = require("../models/User");

// Create Project
const createProject = async (req, res) => {
  try {
    const { userId, projectName, projectDesc, teamMates = [] } = req.body;
    
    const newProject = new Project({
      projectName,
      projectDesc,
      projectTeam: {
        admin: userId,
        teamMembers: teamMates,
      },
    });

    const savedProject = await newProject.save();

    // We still populate the project to send back the full details to the frontend
    const project = await Project.findById(savedProject._id)
      .populate("projectTeam.admin", ["firstName", "lastName", "email", "_id"])
      .populate("projectTeam.teamMembers", [
        "firstName",
        "lastName",
        "email",
        "_id",
      ]);

    // --- START OF THE FIX ---
    // Create an array of update promises for all team members
    const teamMemberUpdatePromises = teamMates.map((teamMateId) =>
      User.findByIdAndUpdate(teamMateId, {
        $addToSet: { projects: savedProject._id },
      })
    );

    // Create a separate update promise for the project admin
    const adminUpdatePromise = User.findByIdAndUpdate(userId, {
      $addToSet: { projects: savedProject._id },
    });
    
    // Combine all promises and wait for them all to finish
    await Promise.all([...teamMemberUpdatePromises, adminUpdatePromise]);
    // --- END OF THE FIX ---

    // Now we can safely send the response, knowing the database is updated.
    res.status(200).json(project);

  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: "INVALID PROJECT ID" }); // Use 400 for bad request
    }
    const project = await Project.findById(projectId)
      .populate("projectTeam.admin", ["firstName", "lastName", "email", "_id"])
      .populate("projectTeam.teamMembers", [
        "firstName",
        "lastName",
        "email",
        "_id",
      ])
      .populate([
        "projectTasks.todo",
        "projectTasks.inProgress",
        "projectTasks.done",
      ]);

    if (!project) {
        return res.status(404).json({ message: "Project Not Found" });
    }

    return res.status(200).json({ project: project });
  } catch (err) {
    console.error("Error fetching project details:", err);
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

module.exports = { getProjectDetails, createProject };