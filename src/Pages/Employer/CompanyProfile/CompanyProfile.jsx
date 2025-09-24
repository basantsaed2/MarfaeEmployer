import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FiUpload, FiX, FiArrowLeft, FiGlobe, FiTwitter, FiFacebook, FiLinkedin } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useGet } from "@/Hooks/UseGet";
import FullPageLoader from "@/components/Loading";
import { useSelector } from "react-redux";
import { FaLocationDot } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

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

    const handleEditProfile = () => {
        navigate("/edit_company", { state: { companyDetails } });
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 md:p-8 text-white mb-8">
                {/* Edit Profile Button - Positioned in top right */}
                {homeData.is_admin && (
                    <div className="absolute top-4 right-4">
                        <Button
                            className="flex text-xl items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full px-6 py-4 shadow-md transition-all hover:shadow-lg border border-white/30"
                            onClick={handleEditProfile}
                        >
                            <FaEdit className="h-5 w-5" />
                            Edit Profile
                        </Button>
                    </div>
                )}
                
                <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-8 space-y-4 md:space-y-0">
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
                            <span className="text-sm text-gray-500 font-medium">Address</span>
                            <span className="font-semibold">{companyDetails.location_link || "Not provided"}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 font-medium">Established</span>
                            <span className="font-semibold">{companyDetails.established || "Not provided"}</span>
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