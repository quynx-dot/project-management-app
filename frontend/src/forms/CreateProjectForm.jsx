/* eslint-disable react/prop-types */
import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import TeamMateCard from "../components/TeamMateCard";
import { ArrowBackRounded, ArrowForwardRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import * as yup from "yup";
import { Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import refreshUser from "../auth/refreshUser";
import { TopBar } from "../scene/NoProject";
import InvitePeople from "./InvitePeople";
import { useApi } from "../hooks/useApi"; // 1. IMPORT THE HOOK

const projectValidationSchema = yup.object().shape({
  projectName: yup.string().required("A project name is required"),
  projectDisc: yup.string(),
});

export default function CreateProjectForm({ setPageType }) {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [TeamMembers, setTeamMembers] = useState([]);

  // 2. Create two instances of the hook for two different API calls.
  const { isLoading: isCreating, error: createError, request: createProject } = useApi();
  const { isLoading: isSearching, error: searchError, request: findUser } = useApi();
  
  const handleAddTeamMate = (userToAdd) => {
    if (TeamMembers.length >= 4) return;
    if (TeamMembers.some((member) => member.email === userToAdd.email)) return;
    setTeamMembers((state) => [...state, userToAdd]);
  };

  const findUserByEmail = async (email) => {
    if (!email) return;
    try {
      const data = await findUser(`/user/find?email=${email}`);
      handleAddTeamMate(data.user);
    } catch (err) {
      console.error("Failed to find user:", err);
      // The searchError state is now automatically set by the hook!
    }
  };

  const handleFormSubmit = async (values) => {
    const teamMates = TeamMembers.map((e) => e._id);
    try {
      await createProject(
        "/project/create",
        "POST",
        {
          projectName: values.projectName,
          projectDesc: values.projectDisc,
          teamMates,
          userId: user._id,
        }
      );
      await refreshUser(token, user, dispatch); // This fetch call is outside a component, so it's okay.
      navigate("/");
    } catch (err) {
      console.error("Failed to create project:", err);
      // The createError state is now automatically set!
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        pt: 10,
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <TopBar />
      <Button
        startIcon={<ArrowBackRounded />}
        variant="outlined"
        sx={{ position: "absolute", left: 10, top: 80 }} // Adjusted position
        onClick={() => setPageType(0)}
      >
        Back
      </Button>
      <Typography sx={{ fontSize: "2rem", fontWeight: 700 }} variant="h1">
        Create Project
      </Typography>

      <Formik
        initialValues={{ projectName: "", projectDisc: "" }}
        validationSchema={projectValidationSchema}
        onSubmit={handleFormSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form
            style={{
              width: "40%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
              gap: "2rem",
            }}
            onSubmit={handleSubmit}
          >
            <TextField
              fullWidth
              size="small"
              label="Project Title"
              name="projectName"
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(touched.projectName) && Boolean(errors.projectName)}
              helperText={touched.projectName && errors.projectName}
              value={values.projectName}
            />
            <TextField
              fullWidth
              size="small"
              name="projectDisc"
              label="Description"
              multiline
              rows={4}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(touched.projectDisc) && Boolean(errors.projectDisc)}
              helperText={touched.projectDisc && errors.projectDisc}
              value={values.projectDisc}
            />
            
            {/* Display the project creation error here */}
            {createError && <Typography color="error">{createError}</Typography>}

            <LoadingButton
              sx={{ position: "fixed", bottom: 20, right: 20 }}
              variant="contained"
              endIcon={<ArrowForwardRounded />}
              color="secondary"
              type="submit"
              loading={isCreating} // Use the correct loading state
            >
              Continue
            </LoadingButton>
          </form>
        )}
      </Formik>
      <Box sx={{ width: "40%", px: "2rem" }}>
        {/* 3. Pass the user search logic and state down to the child component */}
        <InvitePeople
          TeamMembers={TeamMembers}
          setTeamMembers={setTeamMembers}
          fetchUser={findUserByEmail}
          isLoading={isSearching}
          error={searchError}
        />
      </Box>
    </Box>
  );
}