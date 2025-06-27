import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import "react-toastify/dist/ReactToastify.css";
import { FiArrowLeft } from "react-icons/fi";
import { useChangeState } from "@/Hooks/useChangeState";

const ChangePassword = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { changeState, loadingChange, responseChange } = useChangeState();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingChange && responseChange) {
      toast.success("Password changed successfully!");

      const timer = setTimeout(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
      }, 3000); // 3000ms = 3 seconds

      return () => clearTimeout(timer); // Cleanup in case the component unmounts
    }
  }, [responseChange, loadingChange, navigate]);

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

    await changeState(
      `${apiUrl}/employeer/changePassword`, // API endpoint
      `Password Changed Successfully.`,     // success toast message
      {
        current_password: currentPassword,
        new_password: newPassword,
      }
    );
  };

  return (
    <div
      className="w-full h-screen flex flex-col"
    >
      <Card className="w-full border-none p-6 shadow-none">
        <CardContent className="space-y-6">
          <h2 className="text-2xl font-semibold text-bg-primary flex items-center gap-2"> <FiArrowLeft size={24} className="text-xl cursor-pointer" /> Change Password</h2>
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
                disabled={loadingChange}
              >
                {loadingChange ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                className="w-1/2 bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300"
                onClick={() => navigate(-1)}
                disabled={loadingChange}
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