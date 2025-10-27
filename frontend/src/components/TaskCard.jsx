/* eslint-disable react/prop-types */
import { CalendarMonthRounded, MoreVertRounded } from "@mui/icons-material";
import {
  Icon,
  IconButton,
  Paper,
  Typography,
  useTheme,
  Menu,
  MenuItem,
  Avatar, // 1. Import Avatar and AvatarGroup
  AvatarGroup,
} from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentProject } from "../features/project/projectSlice";
import { useApi } from "../hooks/useApi";

export default function TaskCard({ task, type }) {
  const states = ["todo", "inProgress", "done"].filter((e) => e !== type);
  const currentProject = useSelector((state) => state.project.currentProject);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  // 2. Add state for both the main menu and the new "Assign User" sub-menu
  const [mainMenuAnchorEl, setMainMenuAnchorEl] = useState(null);
  const [assignMenuAnchorEl, setAssignMenuAnchorEl] = useState(null);
  const openMain = Boolean(mainMenuAnchorEl);
  const openAssign = Boolean(assignMenuAnchorEl);

  const { request } = useApi();

  const handleOpenMainMenu = (event) => setMainMenuAnchorEl(event.currentTarget);
  const handleCloseMainMenu = () => setMainMenuAnchorEl(null);
  
  const handleOpenAssignMenu = (event) => {
    setAssignMenuAnchorEl(event.currentTarget);
    handleCloseMainMenu(); // Close the main menu when the sub-menu opens
  };
  const handleCloseAssignMenu = () => setAssignMenuAnchorEl(null);

  const editPermission =
    currentProject.projectTeam.admin._id === user._id ||
    task.assignedTo.some(assignee => assignee._id === user._id);

  const handleCardChange = async (nextState) => {
    handleCloseMainMenu();
    try {
      const data = await request("/task/changeTask", "POST", {
        taskId: task._id,
        projectId: currentProject._id,
        currentState: type,
        nextState: nextState,
      });
      dispatch(setCurrentProject({ project: data.project }));
    } catch (err) {
      console.error("Failed to change task state:", err);
    }
  };

  // 3. Create the logic for assigning a user via an API call
  const handleAssignUser = async (userToAssign) => {
    handleCloseAssignMenu();
    try {
        const data = await request("/task/assignUser", "POST", {
            taskId: task._id,
            projectId: currentProject._id,
            userId: userToAssign._id
        });
        dispatch(setCurrentProject({ project: data.project }));
    } catch (err) {
        console.error("Failed to assign user:", err);
    }
  };

  const allTeamMembers = [currentProject.projectTeam.admin, ...currentProject.projectTeam.teamMembers];

  return (
    <Paper elevation={5} sx={{ backgroundColor: "transparent", width: "100%", p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" component="div" fontWeight={600}>
          {task.taskName}
        </Typography>
        {editPermission && (
          <IconButton onClick={handleOpenMainMenu}>
            <MoreVertRounded />
          </IconButton>
        )}
        {/* Main "..." Menu */}
        <Menu open={openMain} onClose={handleCloseMainMenu} anchorEl={mainMenuAnchorEl}>
          {/* 4. Add the "Assign User" menu item */}
          <MenuItem onClick={handleOpenAssignMenu}>Assign User</MenuItem>
          {states.map((e) => (
            <MenuItem key={e} onClick={() => handleCardChange(e)}>
              <Typography sx={{ textTransform: "capitalize" }}>{`Move to ${e}`}</Typography>
            </MenuItem>
          ))}
        </Menu>
        
        {/* "Assign User" Sub-Menu */}
        <Menu open={openAssign} onClose={handleCloseAssignMenu} anchorEl={assignMenuAnchorEl}>
            {allTeamMembers.map(member => (
                <MenuItem key={member._id} onClick={() => handleAssignUser(member)}>
                    {`${member.firstName} ${member.lastName}`}
                </MenuItem>
            ))}
        </Menu>
      </Box>

      <Typography component="div" variant="subtitle1" color="text.secondary">
        {task.taskDesc}
      </Typography>

      {/* 5. Display the avatars of assigned users at the bottom */}
      <Box sx={{ display: "flex", justifyContent: 'space-between', alignItems: "flex-end", mt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Icon color="text.secondary" sx={{ fontSize: "1rem" }}> <CalendarMonthRounded /> </Icon>
            <Typography variant="caption">{new Date(task.createdAt).toLocaleDateString()}</Typography>
        </Box>
        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
            {task.assignedTo.map(assignee => (
                <Avatar key={assignee._id} title={`${assignee.firstName} ${assignee.lastName}`}>{assignee.firstName[0]}</Avatar>
            ))}
        </AvatarGroup>
      </Box>
    </Paper>
  );
}