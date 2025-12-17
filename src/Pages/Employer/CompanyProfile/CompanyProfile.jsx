import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FiUpload, FiX, FiArrowLeft, FiGlobe, FiTwitter, FiFacebook, FiLinkedin, FiMail, FiPhone, FiUser, FiMapPin, FiBook, FiBriefcase, FiCalendar } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useGet } from "@/Hooks/UseGet";
import FullPageLoader from "@/components/Loading";
import { useSelector } from "react-redux";
import { FaLocationDot } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { usePost } from "@/Hooks/UsePost";
import { useChangeState } from "@/Hooks/useChangeState";
import Select from 'react-select';

const CompanyProfile = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const isLoading = useSelector((state) => state.loader.isLoading);
    const { refetch: refetchHomeList, loading: loadingHomeList, data: HomeListData } = useGet({
        url: `${apiUrl}/employeer/homePage`,
    });
    const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/employeer/assign-roles` });
    const { changeState, loadingChange } = useChangeState();

    // Region data for countries and cities
    const { refetch: refetchRegionData, loading: loadingRegionData, data: regionData } = useGet({
        url: `${apiUrl}/city-country`,
    });

    const [homeData, setHomeData] = useState('');
    const [companyDetails, setCompanyDetails] = useState('');
    const [employerDetails, setEmployerDetails] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');

    // States for edit profile form
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [editFormData, setEditFormData] = useState({
        country_id: '',
        city_id: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        age: '',
        image: null,
        title: '',
        qualification: ''
    });
    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState(null);

    // Get employer's city and country names
    const getEmployerCityName = () => {
        if (!employerDetails.city_id || !regionData?.cities) return null;
        const city = regionData.cities.find(c => c.id.toString() === employerDetails.city_id.toString());
        return city?.name || null;
    };

    const getEmployerCountryName = () => {
        if (!employerDetails.country_id || !regionData?.countries) return null;
        const country = regionData.countries.find(c => c.id.toString() === employerDetails.country_id.toString());
        return country?.name || null;
    };

    useEffect(() => {
        refetchHomeList();
        refetchRegionData();
    }, [refetchHomeList, refetchRegionData]);

    useEffect(() => {
        if (HomeListData) {
            setHomeData(HomeListData);
            setCompanyDetails(HomeListData.company_details || '');
            setEmployerDetails(HomeListData.employeer || '');

            // Initialize edit form data with current employer details
            if (HomeListData.employeer) {
                const employer = HomeListData.employeer;
                setEditFormData({
                    country_id: employer.country_id?.toString() || '',
                    city_id: employer.city_id?.toString() || '',
                    email: employer.email || '',
                    phone: employer.phone || '',
                    password: '',
                    password_confirmation: '',
                    age: employer.age?.toString() || '',
                    image: null,
                    title: employer.title || '',
                    qualification: employer.qualification || ''
                });
                setImagePreview(employer.image_link || '');
            }
        }
    }, [HomeListData]);

    // Set countries and cities from region data
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

    // Filter cities based on selected country
    useEffect(() => {
        if (editFormData.country_id && cities.length > 0) {
            const filtered = cities.filter(city => city.countryId === editFormData.country_id);
            setFilteredCities(filtered);
        } else {
            setFilteredCities([]);
        }
    }, [editFormData.country_id, cities]);

    // Handle button click to open dialog
    const handleOpenDialog = () => {
        if (homeData?.roles?.includes("user")) {
            setDialogMessage("You are already a user! Redirecting to user dashboard...");
            setIsDialogOpen(true);
        } else {
            setDialogMessage("Are you sure you want to become a user? This will add user role to your account.");
            setIsDialogOpen(true);
        }
    };

    // Handle Edit Profile Dialog Open
    const handleOpenEditProfileDialog = () => {
        setIsEditProfileDialogOpen(true);
    };

    // Handle Edit Profile Form Change
    const handleEditFormChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle File Upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Convert image to base64 for JSON submission
    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // Handle Edit Profile Submit with JSON data
    const handleEditProfileSubmit = async () => {
        // Validate required fields
        if (!editFormData.email || !editFormData.phone) {
            setDialogMessage("Email and phone are required fields.");
            setIsDialogOpen(true);
            return;
        }

        // Validate password confirmation
        if (editFormData.password && editFormData.password !== editFormData.password_confirmation) {
            setDialogMessage("Password and confirmation do not match.");
            setIsDialogOpen(true);
            return;
        }

        try {
            let imageBase64 = null;

            // Convert image to base64 if a new image is selected
            if (imageFile) {
                imageBase64 = await convertImageToBase64(imageFile);
            }

            // Prepare JSON data
            const jsonData = {
                ...(editFormData.country_id && { country_id: parseInt(editFormData.country_id) }),
                ...(editFormData.city_id && { city_id: parseInt(editFormData.city_id) }),
                email: editFormData.email,
                phone: editFormData.phone,
                ...(editFormData.password && { password: editFormData.password }),
                ...(editFormData.password_confirmation && { password_confirmation: editFormData.password_confirmation }),
                ...(editFormData.age && { age: parseInt(editFormData.age) }),
                ...(editFormData.title && { title: editFormData.title }),
                ...(editFormData.qualification && { qualification: editFormData.qualification }),
                ...(imageBase64 && { image: imageBase64 })
            };

            await changeState(
                `${apiUrl}/employeer/edit-employeer-data/${employerDetails.id}`,
                'Profile updated successfully!',
                jsonData
            );

            setIsEditProfileDialogOpen(false);
            refetchHomeList(); // Refresh data
        } catch (error) {
            console.error('Error updating profile:', error);
            setDialogMessage("Failed to update profile. Please try again.");
            setIsDialogOpen(true);
        }
    };

    // Handle confirmation in dialog
    const handleConfirm = async () => {
        if (!homeData?.roles?.includes("user")) {
            try {
                await postData({ roles: ["user", "employeer"] });
                setDialogMessage("User role assigned successfully! Preparing your user account...");
                refetchHomeList();
            } catch (error) {
                setDialogMessage("Failed to assign user role. Please try again.");
            }
        } else {
            // If already has user role, prepare and redirect
            prepareAndRedirectToUser();
        }
    };

    // Simple base64 encoding
    const encodeData = (data) => {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    };

    // Prepare auth data and redirect to user domain
    const prepareAndRedirectToUser = () => {
        try {
            const token = localStorage.getItem("token");
            const employerData = localStorage.getItem("employer");

            if (!token || !employerData) {
                setDialogMessage("Authentication data not found. Please login again.");
                return;
            }

            // Parse employer data - this is the exact structure you want to send
            const parsedData = JSON.parse(employerData);

            // Create the exact data structure you specified
            const userAuthData = {
                token: token,
                user: {
                    ...parsedData.user, // This contains id, country_id, city_id, first_name, etc.
                    token: token,
                    roles_array: ["employeer", "user"],
                    role: "employeer,user"
                }
            };

            console.log("Sending auth data:", userAuthData);

            // Encode the data for URL
            const encodedData = encodeData(userAuthData);

            // Redirect to user domain with encoded data
            const userUrl = `https://medilinky.com/?auth=data&d=${encodedData}`;
            window.open(userUrl, '_blank');
            setIsDialogOpen(false);

        } catch (error) {
            console.error('Error preparing user auth:', error);
            setDialogMessage("Error preparing authentication data. Please try again.");
        }
    };

    // Handle dialog close
    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setDialogMessage('');
    };

    // Handle Edit Profile (old navigation method)
    const handleEditProfile = () => {
        navigate("/edit_company", { state: { companyDetails } });
    };

    // Handle successful role assignment response
    useEffect(() => {
        if (!loadingPost && response && response.status === 200) {
            console.log("Role assignment response:", response);

            // Update local storage with new roles
            const currentEmployerData = localStorage.getItem("employer");
            if (currentEmployerData) {
                try {
                    const employerData = JSON.parse(currentEmployerData);
                    const updatedData = {
                        ...employerData,
                        user: {
                            ...employerData.user,
                            roles_array: ["employeer", "user"],
                            role: "employeer,user"
                        }
                    };
                    localStorage.setItem("employer", JSON.stringify(updatedData));

                    // Prepare and redirect after role assignment
                    setTimeout(() => {
                        prepareAndRedirectToUser();
                    }, 1500);
                } catch (error) {
                    console.error("Error updating local storage:", error);
                }
            }
        }
    }, [response, loadingPost]);

    if (isLoading || loadingHomeList || loadingRegionData) {
        return <FullPageLoader />;
    }

    const employerCityName = getEmployerCityName();
    const employerCountryName = getEmployerCountryName();

    return (
        <div className="min-h-screen p-4 lg:p-6">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-4 md:p-6 lg:p-8 text-white mb-6 md:mb-8 overflow-hidden">
                {/* Edit Profile Button - Positioned in top right with responsive design */}
                <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-wrap gap-2 justify-end max-w-full">
                    {/* Edit Profile Button */}
                    <Button
                        className="flex items-center gap-1 md:gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full px-3 py-2 text-sm md:text-base lg:text-lg md:px-4 lg:px-6 md:py-3 lg:py-4 shadow-md transition-all hover:shadow-lg border border-white/30 whitespace-nowrap flex-shrink-0"
                        onClick={handleOpenEditProfileDialog}
                    >
                        <FaEdit className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                        <span className="hidden sm:inline">Edit Profile</span>
                        <span className="sm:hidden">Profile</span>
                    </Button>

                    {homeData.is_admin && (
                        <Button
                            className="flex items-center gap-1 md:gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full px-3 py-2 text-sm md:text-base lg:text-lg md:px-4 lg:px-6 md:py-3 lg:py-4 shadow-md transition-all hover:shadow-lg border border-white/30 whitespace-nowrap flex-shrink-0"
                            onClick={handleEditProfile}
                        >
                            <FaEdit className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                            <span className="hidden sm:inline">Edit Company</span>
                            <span className="sm:hidden">Company</span>
                        </Button>
                    )}

                    {/* Become User Button */}
                    <Button
                        className="flex items-center gap-1 md:gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-2 text-sm md:text-base lg:text-lg md:px-4 lg:px-6 md:py-3 lg:py-4 shadow-md transition-all hover:shadow-lg border border-white/30 whitespace-nowrap flex-shrink-0"
                        onClick={handleOpenDialog}
                        disabled={loadingPost}
                    >
                        {loadingPost ? "Processing..." : (
                            <>
                                <span className="hidden sm:inline">Become User</span>
                                <span className="sm:hidden">User</span>
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex flex-col mt-20 md:mt-16 lg:mt-10 md:flex-row items-center space-x-0 md:space-x-6 lg:space-x-8 space-y-4 md:space-y-0">
                    <div className="relative w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                        {companyDetails.image_link ? (
                            <img
                                src={companyDetails.image_link}
                                alt="Company Logo"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left min-w-0">
                        <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight break-words overflow-hidden">
                            {companyDetails.name}
                        </h1>
                        <p className="mt-2 text-sm md:text-base lg:text-lg opacity-90 max-w-full break-words overflow-hidden">
                            {companyDetails.description}
                        </p>

                        {/* Location Information */}
                        {(companyDetails.city_id || companyDetails.country_id) && (
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 md:mt-3 text-white/90">
                                <FiMapPin className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-xs md:text-sm break-words">
                                    {employerDetails?.company.city.name && employerDetails.company?.country.name
                                        ? `${employerDetails?.company.city.name}, ${employerDetails.company?.country.name}`
                                        : employerDetails?.company.city.name || employerDetails.company?.country.name || ''}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-center md:justify-start space-x-1 md:space-x-2 lg:space-x-4 mt-3 md:mt-4 flex-wrap gap-1 md:gap-2">
                            {companyDetails.site_link && (
                                <a href={companyDetails.site_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors p-1 md:p-2 bg-white/10 rounded-full">
                                    <FiGlobe className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                                </a>
                            )}
                            {companyDetails.twitter_link && (
                                <a href={companyDetails.twitter_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors p-1 md:p-2 bg-white/10 rounded-full">
                                    <FiTwitter className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                                </a>
                            )}
                            {companyDetails.facebook_link && (
                                <a href={companyDetails.facebook_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors p-1 md:p-2 bg-white/10 rounded-full">
                                    <FiFacebook className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                                </a>
                            )}
                            {companyDetails.linkedin_link && (
                                <a href={companyDetails.linkedin_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors p-1 md:p-2 bg-white/10 rounded-full">
                                    <FiLinkedin className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                                </a>
                            )}
                            {companyDetails.location_link && (
                                <a href={companyDetails.location_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors p-1 md:p-2 bg-white/10 rounded-full">
                                    <FaLocationDot className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditProfileDialogOpen} onOpenChange={setIsEditProfileDialogOpen}>
                <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Image Upload */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-300">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Profile Preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors text-sm md:text-base">
                                <FiUpload className="h-4 w-4" />
                                Upload Image
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Country */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Country</label>
                                <Select
                                    options={countries}
                                    value={countries.find(country => country.value === editFormData.country_id)}
                                    onChange={(selected) => handleEditFormChange('country_id', selected?.value || '')}
                                    placeholder="Select Country"
                                    isClearable
                                    className="text-sm"
                                />
                            </div>

                            {/* City */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">City</label>
                                <Select
                                    options={filteredCities}
                                    value={filteredCities.find(city => city.value === editFormData.city_id)}
                                    onChange={(selected) => handleEditFormChange('city_id', selected?.value || '')}
                                    placeholder="Select City"
                                    isClearable
                                    isDisabled={!editFormData.country_id}
                                    className="text-sm"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email *</label>
                                <input
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => handleEditFormChange('email', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Enter email"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone *</label>
                                <input
                                    type="text"
                                    value={editFormData.phone}
                                    onChange={(e) => handleEditFormChange('phone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            {/* Age */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Age</label>
                                <input
                                    type="number"
                                    value={editFormData.age}
                                    onChange={(e) => handleEditFormChange('age', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Enter age"
                                />
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={editFormData.title}
                                    onChange={(e) => handleEditFormChange('title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Enter title"
                                />
                            </div>

                            {/* Qualification */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Qualification</label>
                                <textarea
                                    value={editFormData.qualification}
                                    onChange={(e) => handleEditFormChange('qualification', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Enter qualification"
                                    rows="3"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    value={editFormData.password}
                                    onChange={(e) => handleEditFormChange('password', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Enter new password"
                                />
                            </div>

                            {/* Password Confirmation */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                                <input
                                    type="password"
                                    value={editFormData.password_confirmation}
                                    onChange={(e) => handleEditFormChange('password_confirmation', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditProfileDialogOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditProfileSubmit}
                            disabled={loadingChange}
                            className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                        >
                            {loadingChange ? "Updating..." : "Update Profile"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white max-w-sm md:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg md:text-xl">Confirm Action</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm md:text-base">{dialogMessage}</p>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                        {dialogMessage === "Are you sure you want to become a user? This will add user role to your account." && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleCloseDialog}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    disabled={loadingPost}
                                    className="w-full sm:w-auto"
                                >
                                    {loadingPost ? "Processing..." : "Yes, Become User"}
                                </Button>
                            </>
                        )}
                        {(dialogMessage.includes("Redirecting to user dashboard") ||
                            dialogMessage.includes("User role assigned successfully") ||
                            dialogMessage.includes("Preparing your user account") ||
                            dialogMessage === "Failed to assign user role. Please try again." ||
                            dialogMessage === "Authentication data not found. Please login again." ||
                            dialogMessage === "Error preparing authentication data. Please try again.") && (
                                <Button
                                    onClick={handleCloseDialog}
                                    className="w-full sm:w-auto"
                                >
                                    OK
                                </Button>
                            )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Profile Details and Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {/* Company Information */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-md p-4 md:p-6 overflow-hidden">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">Company Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 lg:gap-y-4 lg:gap-x-8 text-gray-600">
                        <div className="flex flex-col break-words">
                            <span className="text-xs md:text-sm text-gray-500 font-medium">Email</span>
                            <span className="font-semibold text-sm md:text-base">{companyDetails.email || "Not provided"}</span>
                        </div>
                        <div className="flex flex-col break-words">
                            <span className="text-xs md:text-sm text-gray-500 font-medium">Phone</span>
                            <span className="font-semibold text-sm md:text-base">{companyDetails.phone || "Not provided"}</span>
                        </div>
                        <div className="flex flex-col break-words">
                            <span className="text-xs md:text-sm text-gray-500 font-medium">Location</span>
                            <span className="font-semibold text-sm md:text-base">
                                {companyDetails.city?.name && companyDetails.country?.name
                                    ? `${companyDetails.city.name}, ${companyDetails.country.name}`
                                    : companyDetails.location_link || "Not provided"}
                            </span>
                        </div>
                        <div className="flex flex-col break-words">
                            <span className="text-xs md:text-sm text-gray-500 font-medium">Start Date</span>
                            <span className="font-semibold text-sm md:text-base">{companyDetails.start_date || "Not provided"}</span>
                        </div>
                        {companyDetails.city_id && (
                            <div className="flex flex-col break-words">
                                <span className="text-xs md:text-sm text-gray-500 font-medium">City</span>
                                <span className="font-semibold text-sm md:text-base">{employerDetails.company?.city?.name || "Not provided"}</span>
                            </div>
                        )}
                        {companyDetails.country_id && (
                            <div className="flex flex-col break-words">
                                <span className="text-xs md:text-sm text-gray-500 font-medium">Country</span>
                                <span className="font-semibold text-sm md:text-base">{employerDetails.company?.country?.name || "Not provided"}</span>
                            </div>
                        )}
                    </div>

                    {/* Employer Details Section */}
                    <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">Employer Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 lg:gap-y-4 lg:gap-x-8 text-gray-600">
                            <div className="flex items-center gap-2 md:gap-3 break-words">
                                <FiUser className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs md:text-sm text-gray-500 font-medium">Full Name</span>
                                    <span className="font-semibold text-sm md:text-base truncate">{employerDetails.full_name || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 break-words">
                                <FiMail className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs md:text-sm text-gray-500 font-medium">Email</span>
                                    <span className="font-semibold text-sm md:text-base truncate">{employerDetails.email || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 break-words">
                                <FiPhone className="h-4 w-4 md:h-5 md:w-5 text-purple-500 flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs md:text-sm text-gray-500 font-medium">Phone</span>
                                    <span className="font-semibold text-sm md:text-base truncate">{employerDetails.phone || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 break-words">
                                <FiUser className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs md:text-sm text-gray-500 font-medium">Role</span>
                                    <span className="font-semibold text-sm md:text-base capitalize truncate">{employerDetails.role || "Not provided"}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="flex items-center gap-2 md:gap-3 break-words">
                                <FiBriefcase className="h-4 w-4 md:h-5 md:w-5 text-orange-500 flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs md:text-sm text-gray-500 font-medium">Title</span>
                                    <span className="font-semibold text-sm md:text-base truncate">{employerDetails.title || "Not provided"}</span>
                                </div>
                            </div>

                            {/* Qualification */}
                            <div className="flex items-center gap-2 md:gap-3 break-words">
                                <FiBook className="h-4 w-4 md:h-5 md:w-5 text-indigo-500 flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs md:text-sm text-gray-500 font-medium">Qualification</span>
                                    <span className="font-semibold text-sm md:text-base truncate">{employerDetails.qualification || "Not provided"}</span>
                                </div>
                            </div>

                            {/* Age */}
                            {employerDetails.age && (
                                <div className="flex items-center gap-2 md:gap-3 break-words">
                                    <FiCalendar className="h-4 w-4 md:h-5 md:w-5 text-pink-500 flex-shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs md:text-sm text-gray-500 font-medium">Age</span>
                                        <span className="font-semibold text-sm md:text-base truncate">{employerDetails.age}</span>
                                    </div>
                                </div>
                            )}

                            {/* Employer Location Information */}
                            {(employerCityName || employerCountryName) && (
                                <>
                                    {employerCityName && (
                                        <div className="flex items-center gap-2 md:gap-3 break-words">
                                            <FiMapPin className="h-4 w-4 md:h-5 md:w-5 text-teal-500 flex-shrink-0" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs md:text-sm text-gray-500 font-medium">City</span>
                                                <span className="font-semibold text-sm md:text-base truncate">{employerCityName}</span>
                                            </div>
                                        </div>
                                    )}
                                    {employerCountryName && (
                                        <div className="flex items-center gap-2 md:gap-3 break-words">
                                            <FiMapPin className="h-4 w-4 md:h-5 md:w-5 text-teal-500 flex-shrink-0" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs md:text-sm text-gray-500 font-medium">Country</span>
                                                <span className="font-semibold text-sm md:text-base truncate">{employerCountryName}</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics Section - FIXED: Text won't overflow */}
                <div className="bg-white rounded-xl shadow-md p-4 md:p-6 overflow-hidden">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 break-words">Company Stats</h2>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div className="bg-blue-50 p-3 md:p-4 rounded-lg text-center transition-transform transform hover:scale-105 break-words min-w-0">
                            <h3 className="text-xs text-gray-500 uppercase font-semibold break-words">Total Jobs</h3>
                            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 break-words">{homeData.total_jobs || 0}</p>
                        </div>
                        <div className="bg-green-50 p-3 md:p-4 rounded-lg text-center transition-transform transform hover:scale-105 break-words min-w-0">
                            <h3 className="text-xs text-gray-500 uppercase font-semibold break-words">Active Jobs</h3>
                            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-green-600 break-words">{homeData.active_jobs || 0}</p>
                        </div>
                        <div className="bg-red-50 p-3 md:p-4 rounded-lg text-center transition-transform transform hover:scale-105 break-words min-w-0">
                            <h3 className="text-xs text-gray-500 uppercase font-semibold break-words">Expired Jobs</h3>
                            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-red-600 break-words">{homeData.inactive_jobs || 0}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 md:p-4 rounded-lg text-center transition-transform transform hover:scale-105 break-words min-w-0">
                            <h3 className="text-xs text-gray-500 uppercase font-semibold break-words">Applications</h3>
                            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-600 break-words">{homeData.total_applications || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;