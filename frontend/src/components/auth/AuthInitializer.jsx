import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getCurrentUser } from "../../services/auth.service";
import {
  setCredentials,
  finishInitialization,
} from "../../store/slices/authSlice";

function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    async function initializeAuth() {
      try {
        const response = await getCurrentUser();

        dispatch(
          setCredentials({
            user: response.data.user,
          }),
        );
      } catch {
        dispatch(finishInitialization());
      }
    }

    initializeAuth();
  }, [dispatch]);

  return children;
}

export default AuthInitializer;
