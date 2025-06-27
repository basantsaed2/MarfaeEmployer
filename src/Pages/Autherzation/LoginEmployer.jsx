import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { setUser } from "../../Store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; // Import Dialog components
import image from "../../assets/Login.png";
import "react-toastify/dist/ReactToastify.css";
import { usePost } from "@/Hooks/UsePost";
import { FaIdCard } from "react-icons/fa6";
import { PiBagFill } from "react-icons/pi";

const LoginEmployer = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/login`,
  });
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Employer");

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      toast.info("You are already logged in");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      toast.error("Email/Username and password are required");
      return;
    }
    const body = new FormData();
    body.append("email", emailOrUsername);
    body.append("password", password);
    postData(body, "Login successful!");
  };

  useEffect(() => {
    if (!loadingPost && response) {
      if (response.data.message === "Employeer account is not active yet") {
        setIsModalOpen(true); // Open modal if account is not active
      } else if (response.status === 200) {
        dispatch(setUser(response?.data));
        localStorage.setItem("user", JSON.stringify(response?.data));
        localStorage.setItem("token", response?.data.token);
        const redirectTo = new URLSearchParams(location.search).get("redirect");
        navigate(redirectTo || "/");
      }
    }
  }, [response, loadingPost, navigate, dispatch]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Optionally redirect to a specific page, e.g., home or account activation page
    // navigate("/account-activation");
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      <Card className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-0">
        <CardContent className="p-0">
          <div className="w-full flex justify-center mb-6">
            <button
              className={`w-full flex justify-center items-center gap-2 rounded-tl-lg px-4 py-2 font-semibold ${
                activeTab === "Candidate"
                  ? "text-white bg-blue-600"
                  : "text-bg-primary bg-gray-100"
              }`}
              onClick={() => setActiveTab("Candidate")}
            >
              <FaIdCard /> Candidate
            </button>
            <button
              className={`w-full flex justify-center items-center gap-2 rounded-tr-lg px-4 py-2 font-semibold ${
                activeTab === "Employer"
                  ? "text-white bg-blue-600"
                  : "text-bg-primary bg-gray-100"
              }`}
              onClick={() => setActiveTab("Employer")}
            >
              <PiBagFill /> Employer
            </button>
          </div>
          <div className="p-6">
            <h2 className="text-3xl text-bg-primary underline font-bold text-center mb-3">
              Log in
            </h2>
            <p className="text-center text-blue-600 mb-6">
              <Link className="underline font-semibold" to="/register">
                Register a new account
              </Link>
            </p>
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                type="text"
                placeholder="Email or Username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full p-3 border rounded"
                disabled={loadingPost}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded"
                disabled={loadingPost}
              />
              <Button
                type="submit"
                className="w-full p-4 text-base bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-300"
                disabled={loadingPost}
              >
                {loadingPost ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Modal for inactive account */}
      <Dialog className="bg-white" open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Account Not Active</DialogTitle>
            <DialogDescription>
              Your employer account is not active yet. 
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleModalClose} variant="default">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default LoginEmployer;