/* eslint-disable react/prop-types */
import {
  Avatar,
  AvatarGroup,
  Box,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
  useTheme,
  CircularProgress // For loading
} from "@mui/material";
import {
  LightModeRounded,
  DarkModeRounded,
  SearchRounded,
} from "@mui/icons-material";
import DashBoardLayout from "../layout/DashboardLayout";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { useDispatch, useSelector } from "react-redux";
import { toggleMode } from "../features/theme/themeSlice";
import { useEffect } from "react";
import { setCurrentProject } from "../features/project/projectSlice";
import CreateProjectButton from "../components/CreateProjectButton";
import { useApi } from "../hooks/useApi"; // 1. IMPORT THE HOOK

// ... (SearchBox, UserAvatar, TopBar components remain the same) ...
const SearchBox = () => { /* ... */ };
const UserAvatar = ({ user }) => { /* ... */ };
function TopBar() { /* ... */ };


// 2. DELETE the old `fetchProject` function.

const ProjectInfo = () => {
  const currentProject = useSelector((state) => state.project.currentProject);
  const user = useSelector((state) => state.auth.user);
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // 3. Use the hook to fetch the initial project
  const { isLoading, request: fetchProject } = useApi();

  useEffect(() => {
    const getInitialProject = async () => {
      try {
        const data = await fetchProject(`/project/get?projectId=${user.projects[0]}`);
        dispatch(setCurrentProject({ project: data.project }));
      } catch (err) {
        console.error("Failed to fetch initial project", err);
      }
    };
    
    // Only fetch if a project isn't already set and the user has projects
    if (!currentProject && user?.projects?.length > 0) {
      getInitialProject();
    }
  }, [user, currentProject, dispatch, fetchProject]); // 4. Correct dependencies

  if (isLoading) {
    return <Box sx={{gridColumn: "1/4", gridRow: "1/2"}}><CircularProgress /></Box>
  }

  return (
    currentProject && (
      <Box
        sx={{
          gridColumn: "1/4",
          gridRow: "1/2",
          border: `1px solid ${theme.palette.text.disabled}`,
          borderRadius: 2,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {currentProject.projectName}
          </Typography>
          <Typography
            sx={{
              fontStyle: "italic",
              fontSize: "0.9rem",
              color: theme.palette.text.secondary,
            }}
          >
            {`admin - ${currentProject.projectTeam.admin.firstName} ${currentProject.projectTeam.admin.lastName} `}
          </Typography>
        </Box>
        <Box>
          <AvatarGroup max={4}>
             {/* Map through team members to show avatars */}
             {[currentProject.projectTeam.admin, ...currentProject.projectTeam.teamMembers].map(member => (
                <Avatar key={member._id}>{member.firstName[0]}</Avatar>
             ))}
          </AvatarGroup>
        </Box>
      </Box>
    )
  );
};

// ... (ProjectProgress and RecentActivity are the same) ...
function ProjectProgress() { /* ... */ };
function RecentActivity() { /* ... */ };


export default function DashBoardScene() {
  return (
    <DashBoardLayout topbar={<TopBar />}>
      <ProjectInfo />
      <RecentActivity />
      <ProjectProgress />
    </DashBoardLayout>
  );
}