import React, { useState, useEffect, useRef } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Shadcn/UI Dialog components
import Select from "react-select";
import image from "../../assets/Login.png";
import "react-toastify/dist/ReactToastify.css";
import { usePost } from "@/Hooks/UsePost";
import { FaIdCard } from "react-icons/fa6";
import { PiBagFill } from "react-icons/pi";
import { useGet } from "@/Hooks/UseGet";

const RegisterEmployer = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { refetch, loading, data } = useGet({ url: `${apiUrl}/getCompanies` });
  const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/registerEmployeer` });
  const { postData: postOTP, loadingPost: loadingOTP, response: responseOTP } = usePost({
    url: `${apiUrl}/verifyOtp`,
  });
  const [companies, setCompanies] = useState([]);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false); // State for OTP modal
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6-digit OTP state
  const otpInputs = useRef([]); // Refs for OTP input fields
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Employer");

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
    const localUser = localStorage.getItem("user");
    if (localUser) {
      toast.info("You are already logged in");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!loadingPost && response) {
      // Open OTP modal on successful registration
      setIsOtpModalOpen(true);
    }
  }, [response, loadingPost]);

  useEffect(() => {
    if (!loadingOTP && responseOTP) {
      // Handle successful OTP verification
      dispatch(setUser(responseOTP?.data));
      localStorage.setItem("user", JSON.stringify(responseOTP?.data));
      localStorage.setItem("token", responseOTP?.data.token);
      const redirectTo = new URLSearchParams(location.search).get("redirect");
      navigate(redirectTo || "/login");
      setIsOtpModalOpen(false); // Close modal
      toast.success("OTP verified successfully!");
    }
  }, [responseOTP, loadingOTP, navigate, dispatch]);

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

    await postData(body, "Please check your email for OTP");
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if a digit is entered
      if (value && index < 5) {
        otpInputs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    const body = new FormData();
    body.append("email", emailOrUsername);
    body.append("code", otpCode);

    await postOTP(body, "OTP verification successful!");
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      <Card className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-0">
        <CardContent className="p-0">
          <div className="w-full flex justify-center">
            <button
              className={`w-full flex justify-center items-center gap-2 rounded-tl-lg px-4 py-2 font-semibold ${
                activeTab === "Candidate" ? "text-white bg-blue-600" : "text-bg-primary bg-gray-100"
              }`}
              onClick={() => setActiveTab("Candidate")}
            >
              <FaIdCard /> Candidate
            </button>
            <button
              className={`w-full flex justify-center items-center gap-2 rounded-tr-lg px-4 py-2 font-semibold ${
                activeTab === "Employer" ? "text-white bg-blue-600" : "text-bg-primary bg-gray-100"
              }`}
              onClick={() => setActiveTab("Employer")}
            >
              <PiBagFill /> Employer
            </button>
          </div>
          <div className="p-6">
            <h2 className="text-3xl text-bg-primary underline font-bold text-center mb-3">
              Register a new account
            </h2>
            <p className="text-center text-blue-600 mb-6">
              <Link className="underline font-semibold" to="/login">
                Log In
              </Link>
            </p>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 border rounded"
                  disabled={loadingPost}
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 border rounded"
                  disabled={loadingPost}
                />
              </div>
              <Input
                type="email"
                placeholder="Email"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full p-3 border rounded"
                disabled={loadingPost}
              />
              <Input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
              <Select
                options={companies}
                value={selectedCompany}
                onChange={setSelectedCompany}
                placeholder="Select a company"
                isLoading={loading}
                isDisabled={loadingPost}
                className="w-full"
                classNamePrefix="select"
              />
              <Button
                type="submit"
                className="w-full p-4 text-base bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-300"
                disabled={loadingPost}
              >
                {loadingPost ? "Registering..." : "Register"}
              </Button>
               <Link to="/add_company"
                className="w-full flex justify-end text-xl underline text-bgBabyBlue font-bold hover:text-blue-500 transition-colors duration-300"
                disabled={loadingPost}
              >
                Add A New Company...
              </Link>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      <Dialog className="bg-white" open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to your email ({emailOrUsername}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOtpSubmit} className="space-y-6">
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
                  className="w-12 h-12 text-center text-lg border rounded-md focus:ring-2 focus:ring-blue-600"
                  disabled={loadingOTP}
                />
              ))}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={loadingOTP}
              >
                {loadingOTP ? "Verifying..." : "Verify OTP"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default RegisterEmployer;