import { Formik } from "formik";
import {
  TextField,
  Typography,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  useTheme,
  Divider,
  Button,
} from "@mui/material";
import { loginInitialValue, loginValidationSchema } from "../auth/login"; // Removed unused 'login' import
import { useState } from "react";
import GoogleIcon from "@mui/icons-material/Google";
import LoginIcon from "@mui/icons-material/Login";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { setLogin } from "../features/auth/authSlice";
import { setCurrentProject } from "../features/project/projectSlice"; // 1. Import setCurrentProject
import { LoadingButton } from "@mui/lab";
import { useApi } from "../hooks/useApi"; // 2. Import our new hook

export default function LoginForm() {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 3. Use the hook to manage loading, errors, and the API call itself.
  const { isLoading, error, request } = useApi();
  
  const handleFormSubmit = async (values) => {
    try {
      // 4. Log the user in.
      const loginData = await request("/auth/login", "POST", values);
      
      // Dispatch login to save the user and token to Redux state.
      dispatch(
        setLogin({
          user: loginData.user,
          token: loginData.token,
        })
      );

      // 5. Check if the user has any projects.
      const hasProjects = loginData.user?.projects?.length > 0;
      if (hasProjects) {
        // 6. If they do, fetch the full details of the very first project.
        const firstProjectId = loginData.user.projects[0];
        const projectData = await request(`/project/get?projectId=${firstProjectId}`);
        
        // 7. Set that project as the current one in Redux.
        dispatch(setCurrentProject({ project: projectData.project }));
      }
      
      // 8. Navigate to the homepage. The router will handle the rest.
      // If no projects, it will correctly redirect to /createProject.
      // If a project was loaded, it will show the dashboard.
      navigate("/");

    } catch (err) {
      // The hook automatically sets the error state, so we just log it.
      console.error("Login failed:", err);
    }
  };
  
  // The user check is now handled by the router, so we can remove it from here.
  // if (user) return <Navigate to="/" />;

  return (
    <Formik
      initialValues={loginInitialValue}
      validationSchema={loginValidationSchema}
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
        <>
          <LoginIcon />
          <Typography sx={{ fontSize: "2rem", fontWeight: 700 }}>
            Login
          </Typography>
          <Typography>You need to Login before using the app</Typography>
          <form
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: "1rem",
              width: "20rem",
            }}
            onSubmit={handleSubmit}
          >
            <InputLabel sx={{ width: "100%", textAlign: "start" }}>
              Email
            </InputLabel>
            <TextField
              name="email"
              type="email"
              fullWidth
              size="small"
              value={values.email}
              error={Boolean(touched.email) && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <InputLabel
              htmlFor="outlined-adornment-password"
              sx={{ width: "100%", textAlign: "start" }}
            >
              Password
            </InputLabel>
            <OutlinedInput
              name="password"
              value={values.password}
              onBlur={handleBlur}
              onChange={handleChange}
              // This is a small bug fix: Formik doesn't provide helperText to OutlinedInput
              // So we show the error message in the general error area below.
              error={Boolean(touched.password) && Boolean(errors.password)}
              size="small"
              fullWidth
              type={showPassword ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((state) => !state)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
            {/* 9. Use the error state from our hook to display API errors */}
            <Typography sx={{ color: theme.palette.error.main }}>
              {error}
            </Typography>
            <LoadingButton
              fullWidth
              variant="contained"
              type="submit"
              loading={isLoading} // 10. Use the isLoading state from our hook
            >
              Login
            </LoadingButton>
            <div style={{ width: "100%" }}>
              <Divider> or </Divider>
            </div>
            <Button startIcon={<GoogleIcon />} fullWidth variant="outlined">
              Login With Google
            </Button>

            <Typography>
              Dont have an account ?
              <span
                style={{
                  textDecoration: "underline",
                  color: theme.palette.secondary.main, // Fix for theme path
                  cursor: "pointer",
                }}
                onClick={() => navigate("/register")}
              >
                {" "}
                Signup Here
              </span>
            </Typography>
          </form>
        </>
      )}
    </Formik>
  );
}