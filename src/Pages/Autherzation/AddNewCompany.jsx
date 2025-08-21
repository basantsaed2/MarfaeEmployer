import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FiUpload, FiX, FiArrowLeft, FiGlobe, FiTwitter, FiFacebook, FiLinkedin } from "react-icons/fi";
import { FaStethoscope, FaHeartbeat, FaUserMd, FaSyringe } from "react-icons/fa";
import image from "../../assets/Login.png";
import "react-toastify/dist/ReactToastify.css";
import { usePost } from "@/Hooks/UsePost";
import { motion, AnimatePresence } from "framer-motion";

const AddNewCompany = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/addCompanyNewData` });
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location_link: "",
    phone: "",
    description: "",
    twitter_link: "",
    facebook_link: "",
    linkedin_link: "",
    site_link: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!loadingPost && response) {
      toast.success("Company added successfully!");
      const timer = setTimeout(() => {
        navigate("/register");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [response, loadingPost, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(file);
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.description || !imageFile) {
      toast.error("Please fill in all required fields");
      return;
    }

    const body = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      body.append(key, value);
    });
    body.append("image", imageFile);

    await postData(body, "Company added successfully!");
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewImage(null);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-bg-primary/40 to-white bg-cover bg-center relative overflow-hidden py-4">
      {/* Background image */}
      <div className="absolute inset-0 bg-[url('path_to_your_image')] bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${image})` }}></div>

      {/* Decorative medical elements */}
      <div className="absolute top-4 left-4 text-bg-primary opacity-30 text-5xl">
        <FaStethoscope />
      </div>
      <div className="absolute bottom-4 right-4 text-bg-primary opacity-30 text-5xl">
        <FaHeartbeat />
      </div>
      <div className="absolute top-1/4 right-8 text-bg-primary opacity-25 text-4xl">
        <FaUserMd />
      </div>
      <div className="absolute bottom-1/4 left-8 text-bg-primary opacity-25 text-4xl">
        <FaSyringe />
      </div>

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white text-bg-primary hover:bg-bg-primary hover:text-white transition-colors"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl p-4"
      >
        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-bg-primary/50 overflow-hidden ring-1 ring-bg-primary/30">
          <div className="md:flex">
            {/* Left Side - Image Upload */}
            <div className="md:w-1/3 bg-white p-6 flex flex-col items-center justify-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-center mb-6"
              >
                <h2 className="text-2xl font-bold text-bg-primary bg-clip-text text-transparent bg-gradient-to-r from-bg-primary to-blue-300">
                  Company Profile
                </h2>
                <p className="text-gray-500 text-sm mt-2">Add your company details and logo</p>
              </motion.div>

              <motion.div
                className="relative w-full aspect-square max-w-xs"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                {previewImage ? (
                  <div className="relative h-full w-full rounded-lg overflow-hidden border-2 border-bg-primary/50">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center h-full w-full border-2 border-bg-primary/50 border-dashed rounded-lg cursor-pointer bg-white/70 hover:bg-blue-100/30 transition-colors"
                  >
                    <FiUpload className="h-8 w-8 text-bg-primary mb-2" />
                    <span className="text-bg-primary font-medium">Upload Logo</span>
                    <span className="text-bg-primary text-xs mt-1">PNG, JPG (max. 5MB)</span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={loadingPost}
                    />
                  </label>
                )}
              </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="md:w-2/3 p-4 md:p-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-bg-primary bg-clip-text text-transparent bg-gradient-to-r from-bg-primary to-blue-300">
                  Company Information
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  Fill in your company details below
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label htmlFor="name" className="text-gray-700">Company Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter Company Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                        disabled={loadingPost}
                      />
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label htmlFor="email" className="text-gray-700">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter Company Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                        disabled={loadingPost}
                      />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label htmlFor="location_link" className="text-gray-700">Location</Label>
                      <Input
                        id="location_link"
                        name="location_link"
                        type="text"
                        placeholder="Address, City, Country"
                        value={formData.location_link}
                        onChange={handleChange}
                        className="w-full p-3 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                        disabled={loadingPost}
                      />
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label htmlFor="phone" className="text-gray-700">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter Company Phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-3 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                        disabled={loadingPost}
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="description" className="text-gray-700">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Tell us about your company..."
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full min-h-[80px] p-3 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                      disabled={loadingPost}
                    />
                  </motion.div>

                  <div className="space-y-3">
                    <Label className="text-gray-700">Social Media Links</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-bg-primary">
                          <FiTwitter className="h-5 w-5" />
                        </div>
                        <Input
                          name="twitter_link"
                          type="text"
                          placeholder="Twitter"
                          value={formData.twitter_link}
                          onChange={handleChange}
                          className="w-full p-3 pl-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                          disabled={loadingPost}
                        />
                      </motion.div>

                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-bg-primary">
                          <FiFacebook className="h-5 w-5" />
                        </div>
                        <Input
                          name="facebook_link"
                          type="text"
                          placeholder="Facebook"
                          value={formData.facebook_link}
                          onChange={handleChange}
                          className="w-full p-3 pl-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                          disabled={loadingPost}
                        />
                      </motion.div>

                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-bg-primary">
                          <FiLinkedin className="h-5 w-5" />
                        </div>
                        <Input
                          name="linkedin_link"
                          type="text"
                          placeholder="LinkedIn"
                          value={formData.linkedin_link}
                          onChange={handleChange}
                          className="w-full p-3 pl-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                          disabled={loadingPost}
                        />
                      </motion.div>

                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-bg-primary">
                          <FiGlobe className="h-5 w-5" />
                        </div>
                        <Input
                          name="site_link"
                          type="text"
                          placeholder="Website"
                          value={formData.site_link}
                          onChange={handleChange}
                          className="w-full p-3 pl-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                          disabled={loadingPost}
                        />
                      </motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 pt-2">
                    <motion.div
                      className="w-full md:w-1/2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        type="submit"
                        className="w-full p-3 text-base bg-gradient-to-r from-bg-primary to-blue-300 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 shadow-lg"
                        disabled={loadingPost}
                      >
                        {loadingPost ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          "Submit Company"
                        )}
                      </Button>
                    </motion.div>

                    <motion.div
                      className="w-full md:w-1/2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full p-3 text-base border-bg-primary/50 text-bg-primary rounded-xl hover:bg-blue-50/50 transition-all duration-300"
                        onClick={() => navigate(-1)}
                        disabled={loadingPost}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </CardContent>
            </div>
          </div>
        </Card>
      </motion.div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default AddNewCompany;