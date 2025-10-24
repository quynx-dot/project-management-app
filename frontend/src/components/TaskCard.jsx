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
} from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentProject } from "../features/project/projectSlice";
import { useApi } from "../hooks/useApi"; // 1. IMPORT THE HOOK

export default function TaskCard({ task, type }) {
  const states = ["todo", "inProgress", "done"].filter((e) => e !== type);
  const currentProject = useSelector((state) => state.project.currentProject);
  const user = useSelector((state) => state.auth.user);
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { request: changeTask } = useApi(); // 2. GET THE REQUEST FUNCTION

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const editPermission =
    currentProject.projectTeam.admin._id === user._id ||
    task.assignedTo.includes(user._id);

  const handleCardChange = async (nextState) => {
    handleClose(); // Close menu immediately for better UX
    try {
      // 3. REPLACE THE FETCH CALL
      const data = await changeTask(
        "/task/changeTask",
        "POST",
        {
          taskId: task._id,
          projectId: currentProject._id,
          currentState: type,
          nextState: nextState,
        }
      );
      dispatch(setCurrentProject({ project: data.project }));
    } catch (err) {
      console.error("Failed to change task state:", err);
    }
  };

  return (
    <Paper
      elevation={5}
      sx={{ backgroundColor: "transparent", width: "100%", p: 2 }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" component="div" fontWeight={600}>
          {task.taskName}
        </Typography>
        {editPermission && (
          <IconButton onClick={handleClick}>
            <MoreVertRounded />
          </IconButton>
        )}
        <Menu
          open={open}
          onClose={handleClose}
          anchorEl={anchorEl}
          // ... (rest of Menu props are the same)
        >
          {states.map((e) => (
            <MenuItem key={e} onClick={() => handleCardChange(e)}>
              <Typography sx={{ textTransform: "capitalize" }}>
                {`Move to ${e}`}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Typography component="div" variant="subtitle1" color="text.secondary">
        {task.taskDesc}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "end", gap: 1, mt: 1 }}>
        <Icon color="text.secondary" sx={{ fontSize: "1rem" }}>
          <CalendarMonthRounded />
        </Icon>
        <Typography variant="caption">
          {new Date(task.createdAt).toLocaleDateString()}
        </Typography>
      </Box>
    </Paper>
  );
}