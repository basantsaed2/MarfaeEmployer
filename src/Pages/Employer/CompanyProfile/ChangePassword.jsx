import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { setUser } from "../../../Store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import image from "../../../assets/Login.png";
import "react-toastify/dist/ReactToastify.css";
import { usePost } from "@/Hooks/UsePost";
import { FaIdCard } from "react-icons/fa6";
import { PiBagFill } from "react-icons/pi";
import { FiArrowLeft } from "react-icons/fi";

const ChangePassword = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/change_password` });
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Employer"); // Default tab

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      toast.info("You are already logged in");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!loadingPost && response) {
      toast.success("Password changed successfully!");
      navigate("/"); // Redirect after successful password change
    }
  }, [response, loadingPost, navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    const body = {
      emailOrUsername,
      currentPassword,
      newPassword,
    };

    await postData(body, "Changing Password...");
  };

  return (
    <div
      className="w-full h-screen flex flex-col"
    >
      <Card className="w-full border-none p-6 shadow-none">
        <CardContent className="space-y-6">
          <h2 className="text-2xl font-semibold text-bg-primary flex items-center gap-2"> <FiArrowLeft  size={24} className="text-xl cursor-pointer"/> Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-6 w-full lg:max-w-xl">
            <div className="space-y-3">
              <label htmlFor="currentPassword" className="text-md font-medium text-black">
                Current Password
              </label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border rounded-md bg-white"
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="newPassword" className="text-md font-medium text-black">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded-md bg-white"
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="confirmPassword" className="text-md font-medium text-black">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border rounded-md bg-white"
              />
            </div>
            <div className="flex gap-5 justify-between">
              <Button
                type="submit"
                className="w-1/2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                disabled={loadingPost}
              >
                {loadingPost ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                className="w-1/2 bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300"
                onClick={() => navigate(-1)}
                disabled={loadingPost}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default ChangePassword;