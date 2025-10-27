import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Chip, CircularProgress, Menu, MenuItem } from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { setCurrentProject } from "../features/project/projectSlice";
import { useApi } from "../hooks/useApi"; // 1. IMPORT THE HOOK

export default function SwitchProject() {
  const user = useSelector((state) => state.auth.user);
  const currentProject = useSelector((state) => state.project.currentProject);
  const dispatch = useDispatch();

  const [userProjects, setUserProjects] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // 2. Create two named instances of the hook for clarity
  const { isLoading: isListLoading, request: fetchProjectList } = useApi();
  const { isLoading: isDetailLoading, request: fetchProjectDetails } = useApi();

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleChangeProject = async (project) => {
    handleClose();
    try {
      const data = await fetchProjectDetails(`/project/get?projectId=${project._id}`);
      dispatch(setCurrentProject({ project: data.project }));
    } catch (err) {
      console.error("Failed to fetch project details:", err);
    }
  };

  useEffect(() => {
    const getProjects = async () => {
      try {
        const data = await fetchProjectList(`/user/getProjects?userId=${user._id}`);
        setUserProjects(data.projects);
      } catch (err) {
        console.error("Failed to fetch project list:", err);
      }
    };

    if (user?._id) {
      getProjects();
    }
  }, [user]); // 3. Correct dependency array

  if (isListLoading || !currentProject) {
    return <CircularProgress size={24} />;
  }

  return (
    <>
      <Chip
        label={isDetailLoading ? "Loading..." : currentProject.projectName}
        icon={<KeyboardArrowDownRounded />}
        variant="outlined"
        size="small"
        sx={{ cursor: "pointer" }}
        onClick={handleClick}
      />
      <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
        {userProjects.map((e) => (
          <MenuItem key={e._id} onClick={() => handleChangeProject(e)}>
            {e.projectName}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}