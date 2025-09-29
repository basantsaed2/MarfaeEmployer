import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { setEmployer } from "../../Store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import "react-toastify/dist/ReactToastify.css";
import { usePost } from "@/Hooks/UsePost";
import { FaStethoscope, FaHeartbeat, FaUserMd, FaSyringe, FaEye, FaEyeSlash, FaBriefcase, FaUsers } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const LoginEmployer = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/login`,
  });
  // Tab state
  const [activeTab, setActiveTab] = useState("employer");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const localUser = localStorage.getItem("employer");
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
    postData(body);
  };

  // useEffect(() => {
  //   if (!loadingPost && response) {
  //     if (response.data.message === "Employeer account is not active yet") {
  //       setIsModalOpen(true);
  //     } else if (response.status === 200 && response.data?.user?.role === "employeer") {
  //       toast.success("Login successfully");
  //       dispatch(setEmployer(response?.data));
  //       localStorage.setItem("employer", JSON.stringify(response?.data));
  //       localStorage.setItem("token", response?.data.token);
  //       const redirectTo = new URLSearchParams(location.search).get("redirect");
  //       navigate(redirectTo || "/");
  //     } else if (response.status === 200 && response.data?.user?.role !== "employeer") {
  //       toast.error("You do not have employer role");
  //     }
  //   }
  // }, [response, loadingPost, navigate, dispatch]);

  useEffect(() => {
    if (!loadingPost && response) {
      if (response.data.message === "Employeer account is not active yet") {
        setIsModalOpen(true);
      } else if (response.status === 200) {
        // normalize roles
        let roles = response.data?.user?.roles_array
          || response.data?.user?.role?.split(",")
          || [];

        if (roles.includes("employeer")) {
          toast.success("Login successfully");
          dispatch(setEmployer(response?.data));
          localStorage.setItem("employer", JSON.stringify(response?.data));
          localStorage.setItem("token", response?.data.token);
          const redirectTo = new URLSearchParams(location.search).get("redirect");
          navigate(redirectTo || "/");
        } else {
          toast.error("You do not have employer role");
        }
      }
    }
  }, [response, loadingPost, navigate, dispatch]);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-bg-primary/40 to-white bg-cover bg-center relative overflow-hidden py-4">
      {/* Doctor-themed background image */}
      <div className="absolute inset-0 bg-[url('https://i.pinimg.com/1200x/0e/82/d4/0e82d4cbbfd783d3d7245fcb927dd358.jpg')] bg-cover bg-center opacity-40"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-lg w-full p-2"
      >
        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-bg-primary/50 overflow-hidden ring-1 ring-bg-primary/30">
          {/* Tab Header */}
          <div className="relative p-1">
            <div className="flex rounded-2xl bg-white/50 backdrop-blur-sm p-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("employer")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 md:px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === "employer"
                  ? "bg-gradient-to-r from-bg-primary to-blue-600 text-white shadow-lg"
                  : "text-bg-primary hover:bg-white/70"
                  }`}
              >
                <FaBriefcase className="text-md md:text-lg" />
                Employer
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("user")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 md:px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === "user"
                  ? "bg-gradient-to-r from-bg-primary to-blue-600 text-white shadow-lg"
                  : "text-bg-primary hover:bg-white/70"
                  }`}
              >
                <FaUserMd className="text-md md:text-lg" />
                User
              </motion.button>
            </div>
          </div>

          <CardContent className="p-4 md:p-6">
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-center mb-5"
            >
              <h2 className="text-4xl font-extrabold text-bg-primary tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-bg-primary to-blue-300">
                Mrfae
              </h2>

              <AnimatePresence mode="wait">
                {activeTab === "employer" ? (
                  <motion.p
                    key="employer-subtitle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-500 mt-2 text-base font-medium"
                  >
                    Seamless access for medical jobs
                  </motion.p>
                ) : (
                  <motion.p
                    key="user-subtitle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-500 mt-2 text-base font-medium"
                  >
                    Find qualified medical professionals
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
            <AnimatePresence mode="wait">
              {activeTab === "employer" ? (
                <motion.div
                  key="employer-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Email or Username"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        className="w-full p-4 pr-12 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
                        disabled={loadingPost}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bg-primary">
                        <FaUserMd />
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 pr-12 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
                        disabled={loadingPost}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-12 top-1/2 -translate-y-1/2 text-bg-primary hover:text-blue-700 transition-colors duration-200 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bg-primary">
                        <FaHeartbeat />
                      </span>
                    </div>
                    <div>
                      <Button
                        type="submit"
                        className="w-full p-4 text-lg bg-gradient-to-r from-bg-primary to-blue-300 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 shadow-lg"
                        disabled={loadingPost}
                      >
                        {loadingPost ? "Logging in..." : "Login Mrfae"}
                      </Button>
                    </div>
                  </form>
                  <p className="text-center text-gray-500 mt-6 text-sm">
                    New to Mrfae?{" "}
                    <Link
                      to="/register"
                      className="text-bg-primary font-semibold hover:underline hover:text-blue-500 transition-colors duration-200"
                    >
                      Register Now
                    </Link>
                  </p>

                </motion.div>
              ) : (
                <motion.div
                  key="user-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-2"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 bg-gradient-to-br from-bg-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  >
                    <FaUsers className="text-white text-3xl" />
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-bg-primary mb-4"
                  >
                    Looking to Hire Medical Professionals?
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 mb-4 text-lg leading-relaxed"
                  >
                    Post jobs, find qualified medical staff, and build your healthcare team with ease.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <a
                      href="https://mrfae.com/login"
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-bg-primary to-blue-600 text-white text-lg font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl group"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaBriefcase className="mr-3 text-xl group-hover:rotate-12 transition-transform duration-300" />
                      Login as User
                      <svg
                        className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>


      {/* Modal for inactive account */}
      <Dialog className="bg-white" open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white/90 backdrop-blur-xl rounded-xl border border-bg-primary/50">
          <DialogHeader>
            <DialogTitle className="text-bg-primary text-2xl">Account Not Active</DialogTitle>
            <DialogDescription className="text-bg-primary/70">
              Your account is not active yet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleModalClose}
              className="bg-gradient-to-r from-bg-primary to-blue-300 text-white rounded-xl hover:from-blue-700 hover:to-blue-500"
            >
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