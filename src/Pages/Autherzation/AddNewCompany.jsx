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
import { useGet } from "@/Hooks/UseGet";
import Select from 'react-select';

const AddNewCompany = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { refetch: refetchSpecialization, loading: loadingSpecialization, data: specializationData } = useGet({
    url: `${apiUrl}/get-specialization-experience`,
  });
  const { refetch: refetchRegion, loading: loadingRegion, data: regionData } = useGet({
    url: `${apiUrl}/city-country`,
  });
  const { refetch: refetchCompanyType, loading: loadingCompanyType, data: companyTypeData } = useGet({
    url: `${apiUrl}/get-company-types`,
  });
  const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/addCompanyNewData` });
  const navigate = useNavigate();
  const location = useLocation();

  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [companyTypeOptions, setCompanyTypeOptions] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCompanyType, setSelectedCompanyType] = useState(null);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);

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
    city_id: "",
    country_id: "",
    company_type_id: "",
    specializations: []
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageBase64, setImageBase64] = useState("");

  useEffect(() => {
    refetchSpecialization();
    refetchRegion();
    refetchCompanyType();
  }, [refetchSpecialization, refetchRegion, refetchCompanyType]);

  useEffect(() => {
    if (specializationData?.data) {
      const formattedSpecialization =
        specializationData.data.specializations?.map((u) => ({
          label: u.name || "—",
          value: u.id.toString(),
        })) || [];
      setSpecializationOptions(formattedSpecialization);
    }
  }, [specializationData]);

  useEffect(() => {
    if (regionData?.countries && regionData?.cities) {
      const formattedCountries = regionData.countries.map((country) => ({
        label: country.name,
        value: country.id.toString(),
      }));
      const formattedCities = regionData.cities.map((city) => ({
        label: city.name,
        value: city.id.toString(),
        countryId: city.country_id?.toString(),
      }));
      setCountries(formattedCountries);
      setCities(formattedCities);
    }
  }, [regionData]);

  useEffect(() => {
    if (companyTypeData?.company_types) {
      const formattedTypes = companyTypeData.company_types.map((type) => ({
        label: type.name,
        value: type.id.toString(),
      }));
      setCompanyTypeOptions(formattedTypes);
    }
  }, [companyTypeData]);

  // Filter cities when country selection changes
  useEffect(() => {
    if (selectedCountry && cities.length > 0) {
      const filtered = cities.filter(city => city.countryId === selectedCountry.value);
      setFilteredCities(filtered);
      setSelectedCity(null);
      setFormData(prev => ({
        ...prev,
        country_id: selectedCountry.value,
        city_id: ""
      }));
    } else {
      setFilteredCities([]);
      setSelectedCity(null);
      setFormData(prev => ({
        ...prev,
        country_id: "",
        city_id: ""
      }));
    }
  }, [selectedCountry, cities]);

  // Update form data when city is selected
  useEffect(() => {
    if (selectedCity) {
      setFormData(prev => ({
        ...prev,
        city_id: selectedCity.value
      }));
    }
  }, [selectedCity]);

  // Update form data when company type is selected
  useEffect(() => {
    if (selectedCompanyType) {
      setFormData(prev => ({
        ...prev,
        company_type_id: selectedCompanyType.value
      }));
    }
  }, [selectedCompanyType]);

  // Update form data when specializations are selected
  useEffect(() => {
    const specializationIds = selectedSpecializations.map(spec => spec.value);
    setFormData(prev => ({
      ...prev,
      specializations: specializationIds
    }));
  }, [selectedSpecializations]);

  useEffect(() => {
    if (!loadingPost && response && response.status === 200) {
      const timer = setTimeout(() => {
        navigate("/register");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [response, loadingPost, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(file);
        setPreviewImage(reader.result);
        // Send the complete data URL with prefix
        setImageBase64(reader.result); // Keep the full data URL including prefix
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

    if (!formData.name || !formData.email || !formData.phone || !formData.description || !imageBase64 || !selectedCompanyType) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Prepare the data to send
    const requestData = {
      ...formData,
      image: imageBase64, // Send as base64 string
    };

    await postData(requestData, "Company added successfully!");
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewImage(null);
    setImageBase64("");
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      border: '1px solid rgba(59, 130, 246, 0.5)',
      borderRadius: '12px',
      padding: '8px 4px',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      '&:hover': {
        borderColor: 'rgba(59, 130, 246, 0.7)',
      },
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      zIndex: 9999, // Increased z-index to appear above other elements
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#dbeafe' : 'white',
      color: state.isSelected ? 'white' : 'black',
      ':active': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#dbeafe',
      }
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#dbeafe',
      borderRadius: '6px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#1e40af',
      fontWeight: '500',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#1e40af',
      ':hover': {
        backgroundColor: '#93c5fd',
        color: '#1e3a8a',
      },
    }),
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
                    {/* Company Type */}
                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label className="text-gray-700">Company Type *</Label>
                      <Select
                        options={companyTypeOptions}
                        value={selectedCompanyType}
                        onChange={setSelectedCompanyType}
                        placeholder="Select Company Type"
                        isDisabled={loadingPost || loadingCompanyType}
                        isLoading={loadingCompanyType}
                        styles={customSelectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Country */}
                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label className="text-gray-700">Country *</Label>
                      <Select
                        options={countries}
                        value={selectedCountry}
                        onChange={setSelectedCountry}
                        placeholder="Select Country"
                        isDisabled={loadingPost || loadingRegion}
                        isLoading={loadingRegion}
                        styles={customSelectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </motion.div>

                    {/* City */}
                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label className="text-gray-700">City *</Label>
                      <Select
                        options={filteredCities}
                        value={selectedCity}
                        onChange={setSelectedCity}
                        placeholder={selectedCountry ? "Select City" : "Select Country First"}
                        isDisabled={loadingPost || loadingRegion || !selectedCountry}
                        isLoading={loadingRegion}
                        styles={customSelectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </motion.div>
                  </div>

                  {/* Specializations */}
                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label className="text-gray-700">Specializations</Label>
                    <Select
                      options={specializationOptions}
                      value={selectedSpecializations}
                      onChange={setSelectedSpecializations}
                      placeholder="Select Specializations"
                      isMulti
                      isDisabled={loadingPost || loadingSpecialization}
                      isLoading={loadingSpecialization}
                      styles={customSelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="location_link" className="text-gray-700">Location Address</Label>
                    <Input
                      id="location_link"
                      name="location_link"
                      type="text"
                      placeholder="Full Address"
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