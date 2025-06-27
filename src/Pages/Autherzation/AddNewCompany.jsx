import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FiUpload, FiX, FiArrowLeft, FiGlobe, FiTwitter, FiFacebook, FiLinkedin } from "react-icons/fi";
import image from "../../assets/Login.png";
import "react-toastify/dist/ReactToastify.css";
import { usePost } from "@/Hooks/UsePost";

const AddNewCompany = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/addCompanyNewData` });
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    site_link: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!loadingPost && response) {
      const timer = setTimeout(() => {
        navigate("/register");
      }, 2000); // 3000ms = 3 seconds

      return () => clearTimeout(timer); // Cleanup in case the component unmounts
    }
  }, [response, loadingPost, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result);
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.description || !imageFile) {
      toast.error("Please fill in all required fields");
      return;
    }

    const body = {
      ...formData,
      image: imageFile,
    };

    await postData(body, "Company added successfully!");
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewImage(null);
  };

  return (
    <div
      className="w-full py-16 px-6 xl:py-0 min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${image})` }}
    >      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:bg-blue-50 hover:text-bgBabyBlue"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="w-full py-0 max-w-6xl shadow-xl rounded-xl overflow-hidden border-0">
        <div className="md:flex">
          {/* Left Side - Image Upload */}
          <div className="md:w-1/3 bg-white p-6 flex flex-col items-center justify-center">
            <div className="text-center text-white mb-6">
              <h2 className="text-2xl text-bg-primary font-bold mb-2">Company Profile</h2>
              <p className="text-bgBabyBlue">Add your company details and logo</p>
            </div>

            <div className="relative w-full aspect-square max-w-xs">
              {previewImage ? (
                <div className="relative h-full w-full rounded-lg overflow-hidden border-2 border-white border-dashed">
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
                  className="flex flex-col items-center justify-center h-full w-full border-2 border-bg-primary border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-400/30 transition-colors"
                >
                  <FiUpload className="h-10 w-10 text-bgBabyBlue mb-3" />
                  <span className="text-bgBabyBlue font-medium">Upload Logo</span>
                  <span className="text-bgBabyBlue text-sm mt-1">PNG, JPG (max. 5MB)</span>
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
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-2/3 p-2 md:p-6 xl:p-8 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-bg-primary">Company Information</CardTitle>
              {/* <CardDescription className="text-gray-600">
                Fill in your company details below
              </CardDescription> */}
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Company Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter Company Name."
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full py-2"
                      disabled={loadingPost}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter Company Email."
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full py-2"
                      disabled={loadingPost}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location_link" className="text-gray-700">Location</Label>
                    <Input
                      id="location_link"
                      name="location_link"
                      type="text"
                      placeholder="Address, City, Country"
                      value={formData.location_link}
                      onChange={handleChange}
                      className="w-full py-2"
                      disabled={loadingPost}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter Company Phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full py-2"
                      disabled={loadingPost}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Tell us about your company..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full min-h-[100px] py-2"
                    disabled={loadingPost}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-700">Social Media Links</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <FiTwitter className="h-5 w-5" />
                      </div>
                      <Input
                        name="twitter_link"
                        type="text"
                        placeholder="Twitter"
                        value={formData.twitter_link}
                        onChange={handleChange}
                        className="pl-10 py-2"
                        disabled={loadingPost}
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <FiFacebook className="h-5 w-5" />
                      </div>
                      <Input
                        name="facebook_link"
                        type="text"
                        placeholder="Facebook"
                        value={formData.facebook_link}
                        onChange={handleChange}
                        className="pl-10 py-2"
                        disabled={loadingPost}
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <FiLinkedin className="h-5 w-5" />
                      </div>
                      <Input
                        name="linkedin_link"
                        type="text"
                        placeholder="LinkedIn"
                        value={formData.linkedin_link}
                        onChange={handleChange}
                        className="pl-10 py-2"
                        disabled={loadingPost}
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <FiGlobe className="h-5 w-5" />
                      </div>
                      <Input
                        name="site_link"
                        type="text"
                        placeholder="Website"
                        value={formData.site_link}
                        onChange={handleChange}
                        className="pl-10 py-2"
                        disabled={loadingPost}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full md:w-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg shadow-md transition-all"
                    disabled={loadingPost}
                  >
                    {loadingPost ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : "Submit Company"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full md:w-1/2  py-3 rounded-lg border-gray-300 hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(-1)}
                    disabled={loadingPost}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </div>
        </div>
      </Card>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default AddNewCompany;