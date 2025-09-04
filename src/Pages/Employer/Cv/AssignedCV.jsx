import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useGet } from "@/Hooks/UseGet";
import { usePost } from "@/Hooks/UsePost";
import { Button } from "@/components/ui/button";
import { RefreshCw, User, FileText, Calendar, Download } from "lucide-react";
import FullPageLoader from "@/components/Loading";

const AssignedCV = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchList, loading: loadingList, data: dataList } = useGet({ 
        url: `${apiUrl}/employeer/my-assigned-cvs` 
    });
    const { postData, loadingPost, response } = usePost({ 
        url: `${apiUrl}/employeer/assign-cv-to-employeer` 
    });

    const [assignedCVs, setAssignedCVs] = useState([]);
    const [hasMoreCVs, setHasMoreCVs] = useState(true);
    const [isRefetching, setIsRefetching] = useState(false);

    useEffect(() => {
        refetchList();
    }, [refetchList]);

    useEffect(() => {
        if (dataList && dataList.data) {
            setAssignedCVs(dataList.data);
            setHasMoreCVs(dataList.has_more || false);
        }
    }, [dataList]);

    const handleFetchMoreCVs = async () => {
        setIsRefetching(true);
        try {
            const result = await postData({}, "Fetching more CVs...");
            if (result && result.assigned_cvs) {
                setAssignedCVs(prev => [...prev, ...result.assigned_cvs]);
                setHasMoreCVs(result.has_more || false);
            }
        } catch (error) {
            console.error("Error fetching more CVs:", error);
        } finally {
            setIsRefetching(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleDownloadCV = (cv) => {
        if (cv.cv && cv.cv.cv_file_url) {
            window.open(cv.cv.cv_file_url, '_blank');
        }
    };

    if (loadingList && assignedCVs.length === 0) {
        return <FullPageLoader />;
    }

    return (
        <div className="min-h-screen p-4 md:p-6 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl text-bg-primary font-bold mb-2">Assigned CVs</h1>
                    <p className="text-gray-600">
                        View and manage the CVs assigned to you for review
                    </p>
                </div>

                {/* CVs List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">CV List</h2>
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
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                                {cv.cv?.user?.first_name && cv.cv.user.last_name 
                                                    ? `${cv.cv.user.first_name} ${cv.cv.user.last_name}`
                                                    : `CV ${index + 1}`
                                                }
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                {cv.cv?.user?.email && (
                                                    <span>Email: {cv.cv.user.email}</span>
                                                )}
                                                {cv.cv?.user?.phone && (
                                                    <span>Phone: {cv.cv.user.phone}</span>
                                                )}
                                                {cv.assigned_at && (
                                                    <span>Assigned: {formatDate(cv.assigned_at)}</span>
                                                )}
                                                <span className={`px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800`}>
                                                    New
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleDownloadCV(cv)}
                                                className="flex text-white items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Download className="w-4 h-4" />
                                                View CV
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Fetch More Button */}
                    {hasMoreCVs && (
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
                                {isRefetching ? 'Fetching...' : 'Fetch More CVs'}
                            </Button>
                        </div>
                    )}

                    {/* No More CVs Message */}
                    {!hasMoreCVs && assignedCVs.length > 0 && (
                        <div className="p-6 border-t border-gray-200 text-center">
                            <p className="text-gray-500 italic">
                                You've viewed all available CVs assigned to you.
                            </p>
                        </div>
                    )}
                </div>

                {(loadingPost || isRefetching) && (
                   <FullPageLoader/>
                )}
            </div>
        </div>
    );
};

export default AssignedCV;