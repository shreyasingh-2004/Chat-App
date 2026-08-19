import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const signup = async ({ fullName, username, password, confirmPassword, age }) => {
    // Basic validation (frontend already validates, but double-check)
    if (!fullName || !username || !password || !confirmPassword || !age) {
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fullName, 
          username, 
          password, 
          confirmPassword, 
          age: parseInt(age) 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Store both user and token
      localStorage.setItem("chat-user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      setAuthUser(data);
      
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading };
};

export default useSignup;