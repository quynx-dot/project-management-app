import { CalendarMonthRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box } from "@mui/system";
import { Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { setCurrentProject } from "../features/project/projectSlice";
import { useApi } from "../hooks/useApi";

// --- START OF FIX ---
// Combined the two '@mui/material' imports into a single line
import { Paper, TextField, useTheme, Typography } from "@mui/material";
// --- END OF FIX ---

const createTaskValidation = yup.object().shape({
  taskName: yup.string().required("This Field is required"),
  taskDesc: yup.string().required("This Field is required"),
});

const createTaskInitialValues = {
  taskName: "",
  taskDesc: "",
};

export default function CreateTaskCard({ setCreateTaskOpen, type }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const currentProject = useSelector((state) => state.project.currentProject);
  const { isLoading, error, request } = useApi();

  const handleFormSubmit = async (values) => {
    try {
      const data = await request(
        "/task/createTask",
        "POST",
        { ...values, userId: user._id, projectId: currentProject._id, type }
      );
      dispatch(setCurrentProject({ project: data.project }));
      setCreateTaskOpen(false);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  return (
    <Paper
      elevation={5}
      sx={{
        backgroundColor: "transparent",
        width: "100%",
        p: 2,
        display: "flex",
        gap: 2,
        flexDirection: "column",
      }}
      variant="outlined"
    >
      <Formik
        initialValues={createTaskInitialValues}
        validationSchema={createTaskValidation}
        onSubmit={handleFormSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleSubmit,
          handleChange,
        }) => (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: "1rem", flexDirection: "column" }}
          >
            <TextField
              label="Task Name"
              fullWidth
              size="small"
              name="taskName"
              value={values.taskName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(touched.taskName) && Boolean(errors.taskName)}
              helperText={touched.taskName && errors.taskName}
            />
            <TextField
              label="Description"
              fullWidth
              name="taskDesc"
              size="small"
              multiline
              rows={2}
              value={values.taskDesc}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(touched.taskDesc) && Boolean(errors.taskDesc)}
              helperText={touched.taskDesc && errors.taskDesc}
            />
            <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", gap: 1 }}>
              <LoadingButton
                variant="outlined"
                type="submit"
                loading={isLoading}
                fullWidth
              >
                Create
              </LoadingButton>
              {error && <Typography color="error" variant="caption">{error}</Typography>}
            </Box>
          </form>
        )}
      </Formik>
    </Paper>
  );
}