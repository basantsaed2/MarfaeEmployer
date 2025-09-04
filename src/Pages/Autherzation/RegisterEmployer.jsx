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
import Select from "react-select";
import "react-toastify/dist/ReactToastify.css";
import { usePost } from "@/Hooks/UsePost";
import { useGet } from "@/Hooks/UseGet";
import { FaStethoscope, FaHeartbeat, FaUserMd, FaSyringe, FaEye, FaEyeSlash, FaBriefcase, FaUsers } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const RegisterEmployer = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { refetch, loading, data } = useGet({ url: `${apiUrl}/getCompanies` });
  const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/registerEmployeer` });
  // const { postData: postOTP, loadingPost: loadingOTP, response: responseOTP } = usePost({
  //   url: `${apiUrl}/verifyOtp`,
  // });
  // Tab state
  const [activeTab, setActiveTab] = useState("employer");
  const [companies, setCompanies] = useState([]);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (data && data.companies) {
      const formattedCompanies = data.companies.map((company) => ({
        value: company.id,
        label: company.name,
      }));
      setCompanies(formattedCompanies);
    }
  }, [data]);

  useEffect(() => {
    if (!loadingPost && response) {
      console.log("response",response)
      if (response.status === 200 ||  response.status === 201) {
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.message || "Registration failed");
      }
    }
  }, [response, loadingPost]);

  // useEffect(() => {
  //   if (!loadingOTP && responseOTP) {
  //     if (responseOTP.status === 200) {
  //       navigate("/login");
  //       setIsOtpModalOpen(false);
  //       toast.success("OTP verified successfully!");
  //     }
  //   }
  // }, [responseOTP, loadingOTP, navigate, dispatch]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password || !firstName || !lastName || !phone || !selectedCompany) {
      toast.error("All fields are required");
      return;
    }
    const body = new FormData();
    body.append("first_name", firstName);
    body.append("last_name", lastName);
    body.append("email", emailOrUsername);
    body.append("phone", phone);
    body.append("password", password);
    body.append("company_id", selectedCompany.value);
    await postData(body);
  };

  // const handleOtpChange = (e, index) => {
  //   const value = e.target.value;
  //   if (/^[0-9]$/.test(value) || value === "") {
  //     const newOtp = [...otp];
  //     newOtp[index] = value;
  //     setOtp(newOtp);
  //     if (value && index < 5) {
  //       otpInputs.current[index + 1].focus();
  //     }
  //   }
  // };

  // const handleOtpKeyDown = (e, index) => {
  //   if (e.key === "Backspace" && !otp[index] && index > 0) {
  //     otpInputs.current[index - 1].focus();
  //   }
  // };

  // const handleOtpSubmit = async (e) => {
  //   e.preventDefault();
  //   const otpCode = otp.join("");
  //   if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
  //     toast.error("Please enter a valid 6-digit OTP");
  //     return;
  //   }
  //   const body = new FormData();
  //   body.append("email", emailOrUsername);
  //   body.append("code", otpCode);
  //   await postOTP(body, "OTP verification successful!");
  // };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

    const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.75rem",
      borderColor: '#161D6F',
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      padding: "0.30rem",
      minHeight: "56px",
      boxShadow: state.isFocused
        ? "0 0 0 2px #161D6F"
        : "none",
      "&:hover": {
        borderColor: '#161D6F',
      },
      transition: "all 0.3s ease",
    }),
    placeholder: (base) => ({
      ...base,
      color:'#161D6F',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: "0.75rem",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "rgba(59, 130, 246, 0.1)"
        : state.isFocused
          ? "rgba(59, 130, 246, 0.05)"
          : "transparent",
      color: "black",
      "&:hover": {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
    }),
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-bg-primary/40 to-white bg-cover bg-center relative overflow-hidden py-4">
      {/* Doctor-themed background image */}
      <div className="absolute inset-0 bg-[url('https://i.pinimg.com/1200x/0e/82/d4/0e82d4cbbfd783d3d7245fcb927dd358.jpg')] bg-cover bg-center opacity-40"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-lg w-full p-2"
      >
        <Card className="bg-white/90 backdrop-blur-xl gap-0 shadow-2xl rounded-3xl border border-bg-primary/50 ring-1 ring-bg-primary/30 overflow-hidden">
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
                <FaUserMd className="text-md md:text-lg" />
                Medical Professional
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
                <FaBriefcase className="text-md md:text-lg" />
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
                    Join the medical job platform
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          type="text"
                          placeholder="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full p-4 pr-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
                          disabled={loadingPost}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-bg-primary">
                          <FaUserMd />
                        </span>
                      </motion.div>
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          type="text"
                          placeholder="Last Name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full p-4 pr-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
                          disabled={loadingPost}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-bg-primary">
                          <FaUserMd />
                        </span>
                      </motion.div>
                    </div>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        type="email"
                        placeholder="Email"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        className="w-full p-4 pr-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
                        disabled={loadingPost}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-bg-primary">
                        <FaStethoscope />
                      </span>
                    </motion.div>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        type="text"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-4 pr-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
                        disabled={loadingPost}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-bg-primary">
                        <FaSyringe />
                      </span>
                    </motion.div>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >

                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 pr-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
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
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-bg-primary">
                        <FaHeartbeat />
                      </span>
                    </motion.div>
                    <motion.div
                      style={{ zIndex: 20 }}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Select
                        options={companies}
                        value={selectedCompany}
                        onChange={setSelectedCompany}
                        placeholder="Select a company"
                        isLoading={loading}
                        isDisabled={loadingPost}
                        className="w-full"
                        classNamePrefix="select"
                        menuPortalTarget={document.body}
                        styles={selectStyles}
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        type="submit"
                        className="w-full p-3 text-base bg-gradient-to-r from-bg-primary to-blue-300 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 shadow-lg"
                        disabled={loadingPost}
                      >
                        {loadingPost ? "Registering..." : "Register Mrfae"}
                      </Button>
                    </motion.div>
                    <Link
                      to="/add_company"
                      className="w-full flex justify-end text-bg-primary text-sm font-semibold underline hover:text-blue-500 transition-colors duration-200"
                      disabled={loadingPost}
                    >
                      Add A New Company...
                    </Link>
                  </form>
                  <p className="text-center text-gray-500 mt-4 text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-bg-primary font-semibold hover:underline hover:text-blue-500 transition-colors duration-200"
                    >
                      Log In
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
                      href="https://mrfae.com/register"
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-bg-primary to-blue-600 text-white text-lg font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl group"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaBriefcase className="mr-3 text-xl group-hover:rotate-12 transition-transform duration-300" />
                      Register as User
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

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Easy Job Posting</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Qualified Candidates</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* <AnimatePresence>
        {isOtpModalOpen && (
          <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen} className="bg-transparent">
            <DialogContent className="bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl p-6 max-w-sm border border-bg-primary/50">
              <DialogHeader>
                <DialogTitle className="text-bg-primary text-xl font-bold">
                  Verify OTP
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-sm">
                  Enter the 6-digit OTP sent to your email ({emailOrUsername}).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      ref={(el) => (otpInputs.current[index] = el)}
                      className="w-10 h-10 text-center text-base border border-bg-primary/50 rounded-md focus:ring-2 focus:ring-bg-primary text-bg-primary"
                      disabled={loadingOTP}
                    />
                  ))}
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-bg-primary to-blue-300 text-white hover:from-blue-700 hover:to-blue-500 rounded-lg transition-all duration-200"
                    disabled={loadingOTP}
                  >
                    {loadingOTP ? "Verifying..." : "Verify OTP"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence> */}

      <ToastContainer />
    </div>
  );
};

export default RegisterEmployer;