import { useDispatch } from "react-redux";
import { setLogout } from "../features/auth/authSlice";
import { setCurrentProject, setTasks } from "../features/project/projectSlice";

export function useLogout() {
  const dispatch = useDispatch();
  return () => {
    // This dispatch is correct, as setLogout needs no payload
    dispatch(setLogout());
    
    // 1. FIX: Pass a payload object as expected by the reducer
    dispatch(setCurrentProject({ project: null }));
    
    // 2. FIX: Pass a payload object as expected by the reducer
    dispatch(setTasks({ tasks: null }));
  };
}