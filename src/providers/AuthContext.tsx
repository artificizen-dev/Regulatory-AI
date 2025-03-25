import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendURL } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import ROUTES from "../routes";

interface User {
  id: string;
  user_id: string;
  username: string;
  email: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ status_code: number; message: string }>;
  logout: () => void;
  handleSuccess: (message: string) => void;
  handleError: (message: string) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserId = localStorage.getItem("user_id");

    if (storedUser && storedUserId) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid stored user data
        localStorage.removeItem("user");
        localStorage.removeItem("user_id");
      }
    }
  }, []);

  const handleSuccess = (message: string) => {
    toast.success(message);
  };

  const handleError = (message: string) => {
    toast.error(message);
  };

  // Login function
  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${backendURL}/api/login`, {
        username,
        password,
      });

      // Based on your sample response
      const {
        message,
        user_id,
        username: responseUsername,
        email,
      } = response.data;

      // If response contains status_code field
      if (response.data?.status_code === 401) {
        handleError(response.data?.message || "Authentication failed");
        return;
      }

      // Create user object
      const userData: User = {
        id: user_id.toString(),
        user_id: user_id.toString(),
        username: responseUsername,
        email: email,
      };

      // Update state
      setIsAuthenticated(true);
      setUser(userData);

      // Store in localStorage
      localStorage.setItem("user_id", user_id.toString());
      localStorage.setItem("user", JSON.stringify(userData));

      // Handle success case
      handleSuccess(message || "Login successful");
      navigate(ROUTES.chat);
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Login failed";

      handleError(errorMessage);
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${backendURL}/api/signup`, {
        username,
        email,
        password,
      });

      handleSuccess(response.data.message || "Account created successfully!");
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Signup failed";

      handleError(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);

    // Clear all user-related data from localStorage
    localStorage.removeItem("user_id");
    localStorage.removeItem("user");

    handleSuccess("Logged out successfully");

    // Navigate to login page instead of reloading
    navigate(ROUTES.login);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        logout,
        handleSuccess,
        handleError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
