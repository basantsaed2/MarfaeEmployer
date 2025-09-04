
import React, { useState, useEffect } from "react";
import { useGet } from "@/Hooks/UseGet";
import { usePost } from "@/Hooks/UsePost";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, Download, User, Mail, Phone, Calendar, MapPin, Home } from "lucide-react";
import FullPageLoader from "@/components/Loading";

const AssignedCV = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchList, loading: loadingList, data: dataList } = useGet({
        url: `${apiUrl}/employeer/my-assigned-cvs`,
    });
    const { postData, loading: loadingPost } = usePost({
        url: `${apiUrl}/employeer/assign-cv-to-employeer`,
    });
    const [assignedCVs, setAssignedCVs] = useState([]);
    const [hasMoreCVs, setHasMoreCVs] = useState(true);
    const [isRefetching, setIsRefetching] = useState(false);

    // Initial data fetch
    useEffect(() => {
        refetchList();
    }, [refetchList]);

    // Update state when data is received
    useEffect(() => {
        if (dataList?.data) {
            setAssignedCVs(dataList.data);
            setHasMoreCVs(dataList.has_more !== undefined ? dataList.has_more : true);
        }
    }, [dataList]);

    const handleFetchMoreCVs = async () => {
        setIsRefetching(true);
        try {
            const result = await postData({});
            if (result?.assignments) {
                setAssignedCVs((prev) => [...prev, ...result.assignments]);
                setHasMoreCVs(result.has_more || false);
            }
        } catch (error) {
            console.error("Error fetching more CVs:", error);
        } finally {
            setIsRefetching(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleDownloadCV = (cv) => {
        if (cv?.cv?.cv_file_url) {
            const link = document.createElement("a");
            link.href = cv.cv.cv_file_url;
            link.download = `CV_${cv.cv.user?.full_name || cv.cv_id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.error("CV file URL not available");
            alert("CV file is not available for download.");
        }
    };

    if (loadingList && assignedCVs.length === 0) {
        return <FullPageLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-bg-primary mb-2">Assigned CVs</h1>
                    <p className="text-gray-600">View and manage the CVs assigned to you for review</p>
                </div>
                {/* CVs List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">CV List</h2>
                        <div className="text-sm text-gray-500">Total: {assignedCVs.length} CVs</div>
                    </div>
                    {assignedCVs.length === 0 ? (
                        <div className="p-8 text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">No CVs Assigned</h3>
                            <p className="text-gray-500">You don't have any CVs assigned to you at the moment.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {assignedCVs.map((cv, index) => (
                                <div key={cv.id || index} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-blue-100 p-2 rounded-full">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {cv.cv?.user?.full_name || `CV #${cv.cv_id || index + 1}`}
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span>
                                                        Name: {cv.cv?.user?.first_name || "N/A"} {cv.cv?.user?.last_name || "N/A"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    <span>Email: {cv.cv?.user?.email || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    <span>Phone: {cv.cv?.user?.phone || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Age: {cv.cv?.user?.age || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>City: {cv.cv?.user?.city?.name || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Home className="w-4 h-4" />
                                                    <span>Country: {cv.cv?.user?.country?.name || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    <span>CV ID: {cv.cv_id || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Assigned: {formatDate(cv.assigned_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span>Employer ID: {cv.employer_id || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    <span>Plan ID: {cv.plan_id || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Created: {formatDate(cv.created_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Updated: {formatDate(cv.updated_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleDownloadCV(cv)}
                                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                                disabled={!cv?.cv?.cv_file_url}
                                            >
                                                <Download className="w-4 h-4" />
                                                Download CV
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Fetch More Button */}
                    {/* {hasMoreCVs && ( */}
                        <div className="p-6 border-t border-gray-200 text-center">
                            <Button
                                onClick={handleFetchMoreCVs}
                                disabled={loadingPost || isRefetching}
                                className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isRefetching ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                                {isRefetching ? "Fetching..." : "Fetch More CVs"}
                            </Button>
                        </div>
                    {/* )} */}
                    {/* No More CVs Message */}
                    {!hasMoreCVs && assignedCVs.length > 0 && (
                        <div className="p-6 border-t border-gray-200 text-center">
                            <p className="text-gray-500 italic">
                                You've viewed all available CVs assigned to you.
                            </p>
                        </div>
                    )}
                </div>
                {(loadingPost || isRefetching) && <FullPageLoader />}
            </div>
        </div>
    );
};

export default AssignedCV;