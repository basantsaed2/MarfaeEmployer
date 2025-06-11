import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FiUpload, FiX, FiArrowLeft, FiGlobe, FiTwitter, FiFacebook, FiLinkedin } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const CompanyProfile = () => {
    const navigate = useNavigate();

    const companyDetails = {
        name: "King Fahd Hospital",
        email: "info@kfh.sa",
        phone: "+966 123 456 789",
        location_link: "123 Main St, Riyadh",
        established: "15-01-2023",
        description: "King Fahd Hospital is a leading healthcare provider in Riyadh, dedicated to delivering exceptional medical care.",
        image: "https://via.placeholder.com/150", // Placeholder image URL; replace with actual image data if available
        twitter_link: "https://twitter.com/kfhospital",
        facebook_link: "https://facebook.com/kfhospital",
        linkedin_link: "https://linkedin.com/company/kfhospital",
        site_link: "https://www.kfhospital.sa",
    };

    const handleLogout = () => {
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
        <div className="p-2 md:p-6 w-full space-y-6">
            <div className="flex flex-col lg:flex-row bg-white p-4 rounded-lg shadow-md space-x-6">
                <div className="w-full lg:w-1/3">
                    <div className="bg-gray-200 h-56 lg:h-full flex items-center justify-center rounded-lg overflow-hidden">
                        {companyDetails.image ? (
                            <img
                                src={companyDetails.image}
                                alt="Company Logo"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-400 text-sm">Profile Image</span>
                        )}
                    </div>
                </div>
                <div className="w-full lg:w-2/3 space-y-4 mt-3 lg:mt-0">
                    <h2 className="text-xl font-bold text-gray-900">{companyDetails.name}</h2>
                    <p className="text-gray-500 text-sm">Hospital</p>
                    <p className="text-gray-700">{companyDetails.description}</p>
                    <div className="flex space-x-4">
                        {companyDetails.site_link && (
                            <a href={companyDetails.site_link} target="_blank" rel="noopener noreferrer">
                                <FiGlobe className="h-5 w-5 text-blue-600" />
                            </a>
                        )}
                        {companyDetails.twitter_link && (
                            <a href={companyDetails.twitter_link} target="_blank" rel="noopener noreferrer">
                                <FiTwitter className="h-5 w-5 text-blue-400" />
                            </a>
                        )}
                        {companyDetails.facebook_link && (
                            <a href={companyDetails.facebook_link} target="_blank" rel="noopener noreferrer">
                                <FiFacebook className="h-5 w-5 text-blue-800" />
                            </a>
                        )}
                        {companyDetails.linkedin_link && (
                            <a href={companyDetails.linkedin_link} target="_blank" rel="noopener noreferrer">
                                <FiLinkedin className="h-5 w-5 text-blue-700" />
                            </a>
                        )}
                    </div>
                    <div className="space-x-2 space-y-4">
                        <Button
                            variant="outline"
                            className="border-gray-300 text-gray-700 px-3 py-1 text-sm"
                            onClick={handleEditProfile}
                        >
                            Edit profile
                        </Button>
                        <Button
                            variant="outline"
                            className="border-gray-300 text-gray-700 px-3 py-1 text-sm"
                            onClick={handleChangePassword}
                        >
                            Change password
                        </Button>
                        <Button
                            variant="outline"
                            className="border-gray-300 text-gray-700 px-3 py-1 text-sm"
                            onClick={handleJobManagement}
                        >
                            Job Management
                        </Button>
                        <Button
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm"
                            onClick={handleLogout}
                        >
                            Sign out
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Company details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-y-3 text-sm text-gray-700">
                    <p><strong>Email:</strong> {companyDetails.email}</p>
                    <p><strong>Phone:</strong> {companyDetails.phone}</p>
                    <p><strong>Address:</strong> {companyDetails.location_link}</p>
                    <p><strong>Established:</strong> {companyDetails.established}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white shadow-md p-4 rounded-lg text-center">
                    <h3 className="text-xs text-gray-500 uppercase">Total Jobs</h3>
                    <p className="text-2xl font-bold text-blue-600">150</p>
                </div>
                <div className="bg-white shadow-md p-4 rounded-lg text-center">
                    <h3 className="text-xs text-gray-500 uppercase">Active Jobs</h3>
                    <p className="text-2xl font-bold text-blue-600">120</p>
                </div>
                <div className="bg-white shadow-md p-4 rounded-lg text-center">
                    <h3 className="text-xs text-gray-500 uppercase">Expired Jobs</h3>
                    <p className="text-2xl font-bold text-blue-600">30</p>
                </div>
                <div className="bg-white shadow-md p-4 rounded-lg text-center">
                    <h3 className="text-xs text-gray-500 uppercase">Applications Received</h3>
                    <p className="text-2xl font-bold text-blue-600">500</p>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;