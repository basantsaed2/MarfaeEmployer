import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FiUpload, FiX, FiArrowLeft, FiGlobe, FiTwitter, FiFacebook, FiLinkedin, FiMail, FiPhone, FiUser, FiMapPin } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useGet } from "@/Hooks/UseGet";
import FullPageLoader from "@/components/Loading";
import { useSelector } from "react-redux";
import { FaLocationDot } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { usePost } from "@/Hooks/UsePost";

const CompanyProfile = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const isLoading = useSelector((state) => state.loader.isLoading);
    const { refetch: refetchHomeList, loading: loadingHomeList, data: HomeListData } = useGet({
        url: `${apiUrl}/employeer/homePage`,
    });
    const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/employeer/assign-roles` });
    const [homeData, setHomeData] = useState('');
    const [companyDetails, setCompanyDetails] = useState('');
    const [employerDetails, setEmployerDetails] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');

    useEffect(() => {
        refetchHomeList();
    }, [refetchHomeList]);

    useEffect(() => {
        if (HomeListData) {
            setHomeData(HomeListData);
            setCompanyDetails(HomeListData.company_details || '');
            setEmployerDetails(HomeListData.employeer || '');
        }
    }, [HomeListData]);

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
            const userUrl = `https://mrfae.com/?auth=data&d=${encodedData}`;
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

    // Handle Edit Profile
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

    if (isLoading || loadingHomeList) {
        return <FullPageLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 lg:p-8">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 md:p-8 text-white mb-8">
                {/* Edit Profile Button - Positioned in top right */}
                <div className="absolute top-4 right-4 flex space-x-4">
                    {homeData.is_admin && (
                        <Button
                            className="flex text-xl items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full px-6 py-4 shadow-md transition-all hover:shadow-lg border border-white/30"
                            onClick={handleEditProfile}
                        >
                            <FaEdit className="h-5 w-5" />
                            Edit Profile
                        </Button>
                    )}

                    {/* Become User Button */}
                    <Button
                        className="flex text-xl items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-4 shadow-md transition-all hover:shadow-lg border border-white/30"
                        onClick={handleOpenDialog}
                        disabled={loadingPost}
                    >
                        {loadingPost ? "Processing..." : "Become User"}
                    </Button>
                </div>

                <div className="flex flex-col mt-10 md:flex-row items-center space-x-0 md:space-x-8 space-y-4 md:space-y-0">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
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
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{companyDetails.name}</h1>
                        <p className="mt-2 text-lg opacity-90 max-w-2xl">{companyDetails.description}</p>

                        {/* Location Information */}
                        {(companyDetails.city || companyDetails.country) && (
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-white/90">
                                <FiMapPin className="h-4 w-4" />
                                <span className="text-sm">
                                    {companyDetails.city?.name && companyDetails.country?.name
                                        ? `${companyDetails.city.name}, ${companyDetails.country.name}`
                                        : companyDetails.city?.name || companyDetails.country?.name || ''}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-center md:justify-start space-x-4 mt-4">
                            {companyDetails.site_link && (
                                <a href={companyDetails.site_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors p-2 bg-white/10 rounded-full">
                                    <FiGlobe className="h-5 w-5" />
                                </a>
                            )}
                            {companyDetails.twitter_link && (
                                <a href={companyDetails.twitter_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors p-2 bg-white/10 rounded-full">
                                    <FiTwitter className="h-5 w-5" />
                                </a>
                            )}
                            {companyDetails.facebook_link && (
                                <a href={companyDetails.facebook_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors p-2 bg-white/10 rounded-full">
                                    <FiFacebook className="h-5 w-5" />
                                </a>
                            )}
                            {companyDetails.linkedin_link && (
                                <a href={companyDetails.linkedin_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors p-2 bg-white/10 rounded-full">
                                    <FiLinkedin className="h-5 w-5" />
                                </a>
                            )}
                            {companyDetails.location_link && (
                                <a href={companyDetails.location_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors p-2 bg-white/10 rounded-full">
                                    <FaLocationDot className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Confirm Action</DialogTitle>
                    </DialogHeader>
                    <p>{dialogMessage}</p>
                    <DialogFooter>
                        {dialogMessage === "Are you sure you want to become a user? This will add user role to your account." && (
                            <>
                                <Button variant="outline" onClick={handleCloseDialog}>
                                    Cancel
                                </Button>
                                <Button onClick={handleConfirm} disabled={loadingPost}>
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
                                <Button onClick={handleCloseDialog}>OK</Button>
                            )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Profile Details and Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Company Information */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Company Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-gray-600">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 font-medium">Email</span>
                            <span className="font-semibold">{companyDetails.email || "Not provided"}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 font-medium">Phone</span>
                            <span className="font-semibold">{companyDetails.phone || "Not provided"}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 font-medium">Location</span>
                            <span className="font-semibold">
                                {companyDetails.city?.name && companyDetails.country?.name
                                    ? `${companyDetails.city.name}, ${companyDetails.country.name}`
                                    : companyDetails.location_link || "Not provided"}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 font-medium">Established</span>
                            <span className="font-semibold">{companyDetails.established || "Not provided"}</span>
                        </div>
                        {companyDetails.city && (
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500 font-medium">City</span>
                                <span className="font-semibold">{companyDetails.city.name || "Not provided"}</span>
                            </div>
                        )}
                        {companyDetails.country && (
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500 font-medium">Country</span>
                                <span className="font-semibold">{companyDetails.country.name || "Not provided"}</span>
                            </div>
                        )}
                    </div>

                    {/* Employer Details Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Employer Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-gray-600">
                            <div className="flex items-center gap-3">
                                <FiUser className="h-5 w-5 text-blue-500" />
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 font-medium">Full Name</span>
                                    <span className="font-semibold">{employerDetails.full_name || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiMail className="h-5 w-5 text-green-500" />
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 font-medium">Email</span>
                                    <span className="font-semibold">{employerDetails.email || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiPhone className="h-5 w-5 text-purple-500" />
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 font-medium">Phone</span>
                                    <span className="font-semibold">{employerDetails.phone || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-5 w-5 flex items-center justify-center text-blue-500">
                                    <span className="text-sm font-bold">R</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 font-medium">Role</span>
                                    <span className="font-semibold capitalize">{employerDetails.role || "Not provided"}</span>
                                </div>
                            </div>

                            {/* Employer Location Information */}
                            {(employerDetails.company?.city || employerDetails.company?.country) && (
                                <>
                                    {employerDetails.company?.city && (
                                        <div className="flex items-center gap-3">
                                            <FiMapPin className="h-5 w-5 text-teal-500" />
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500 font-medium">City</span>
                                                <span className="font-semibold">{employerDetails.company?.city?.name || "Not provided"}</span>
                                            </div>
                                        </div>
                                    )}
                                    {employerDetails.company?.country && (
                                        <div className="flex items-center gap-3">
                                            <FiMapPin className="h-5 w-5 text-teal-500" />
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500 font-medium">Country</span>
                                                <span className="font-semibold">{employerDetails.company?.country?.name || "Not provided"}</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Company Stats</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center transition-transform transform hover:scale-105">
                            <h3 className="text-xs text-gray-500 uppercase font-semibold">Total Jobs</h3>
                            <p className="text-3xl font-bold text-blue-600">{homeData.total_jobs}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center transition-transform transform hover:scale-105">
                            <h3 className="text-xs text-gray-500 uppercase font-semibold">Active Jobs</h3>
                            <p className="text-3xl font-bold text-green-600">{homeData.active_jobs}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center transition-transform transform hover:scale-105">
                            <h3 className="text-xs text-gray-500 uppercase font-semibold">Expired Jobs</h3>
                            <p className="text-3xl font-bold text-red-600">{homeData.inactive_jobs}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg text-center transition-transform transform hover:scale-105">
                            <h3 className="text-xs text-gray-500 uppercase font-semibold">Applications</h3>
                            <p className="text-3xl font-bold text-yellow-600">{homeData.total_applications}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;