import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FiUpload, FiX, FiArrowLeft, FiGlobe, FiTwitter, FiFacebook, FiLinkedin } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useGet } from "@/Hooks/UseGet";
import FullPageLoader from "@/components/Loading";
import { useSelector } from "react-redux";
import { FaLocationDot } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa"; // Importing a better edit icon

const CompanyProfile = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const isLoading = useSelector((state) => state.loader.isLoading);
    const { refetch: refetchHomeList, loading: loadingHomeList, data: HomeListData } = useGet({
        url: `${apiUrl}/employeer/homePage`,
    });
    const [homeData, setHomeData] = useState('');
    const [companyDetails, setCompanyDetails] = useState('');

    useEffect(() => {
        refetchHomeList();
    }, [refetchHomeList]);

    useEffect(() => {
        if (HomeListData && HomeListData.company_details) {
            setHomeData(HomeListData);
            setCompanyDetails(HomeListData.company_details);
        }
    }, [HomeListData]);

    if (isLoading || loadingHomeList) {
        return <FullPageLoader />;
    }

    const handleLogout = () => {
        localStorage.removeItem("employer");
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleJobManagement = () => {
        navigate("/jobs");
    };

    const handleChangePassword = () => {
        navigate("/change_password");
    };

    const handleEditProfile = () => {
        navigate("/edit_company", { state: { companyDetails } });
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 md:p-8 text-white mb-8">
                <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-8 space-y-4 md:space-y-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
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
                        <p className="mt-1 text-lg opacity-90">{companyDetails.description}</p>
                        <div className="flex justify-center md:justify-start space-x-4 mt-4">
                            {companyDetails.site_link && (
                                <a href={companyDetails.site_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">
                                    <FiGlobe className="h-6 w-6" />
                                </a>
                            )}
                            {companyDetails.twitter_link && (
                                <a href={companyDetails.twitter_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">
                                    <FiTwitter className="h-6 w-6" />
                                </a>
                            )}
                            {companyDetails.facebook_link && (
                                <a href={companyDetails.facebook_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">
                                    <FiFacebook className="h-6 w-6" />
                                </a>
                            )}
                            {companyDetails.linkedin_link && (
                                <a href={companyDetails.linkedin_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">
                                    <FiLinkedin className="h-6 w-6" />
                                </a>
                            )}
                            {companyDetails.location_link && (
                                <a href={companyDetails.location_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">
                                    <FaLocationDot className="h-6 w-6" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Actions and Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Profile Actions */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6 h-fit">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        {/* Conditional rendering for edit button */}
                        {homeData.is_admin && (
                            <Button
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3 shadow-md transition-transform transform hover:scale-105"
                                onClick={handleEditProfile}
                            >
                                <FaEdit />
                                Edit Profile
                            </Button>
                        )}
                        <Button
                            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-6 py-3 shadow-md transition-transform transform hover:scale-105"
                            onClick={handleJobManagement}
                        >
                            Job Management
                        </Button>
                        <Button
                            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-6 py-3 shadow-md transition-transform transform hover:scale-105"
                            onClick={handleChangePassword}
                        >
                            Change Password
                        </Button>
                        <Button
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-3 shadow-md transition-transform transform hover:scale-105"
                            onClick={handleLogout}
                        >
                            Sign out
                        </Button>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Company Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-gray-600">
                        <p><strong>Email:</strong> {companyDetails.email}</p>
                        <p><strong>Phone:</strong> {companyDetails.phone}</p>
                        <p><strong>Address:</strong> {companyDetails.location_link}</p>
                        <p><strong>Established:</strong> {companyDetails.established}</p>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="md:w-full bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Company Stats</h2>
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