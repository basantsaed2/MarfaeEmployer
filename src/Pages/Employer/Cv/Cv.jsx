import React, { useState, useEffect } from "react";
import { useGet } from '@/Hooks/UseGet';

const Cv = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchCV, loading: loadingCV, data: dataCV } = useGet({ url: `${apiUrl}/employeer/get-trackcvs` });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [filteredApplications, setFilteredApplications] = useState([]);

    useEffect(() => {
        if (dataCV?.applications) {
            const filtered = dataCV.applications.filter(app => {
                const matchesSearch = app.user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
                return matchesSearch && matchesStatus;
            });
            setFilteredApplications(filtered);
        }
    }, [dataCV, searchTerm, statusFilter]);

    const statusOptions = ['all', 'pending', 'accepted', 'rejected'];

    return (
        <div className="min-h-screen p-6">
            <div className="w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl text-bg-primary font-bold">Applied Applications</h2>
                    <button 
                        onClick={refetchCV}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Refresh
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Applications List */}
                {loadingCV ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading applications...</p>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No applications found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredApplications.map(app => (
                            <div 
                                key={app.id}
                                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {app.user.full_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{app.user.email}</p>
                                    </div>
                                    <span 
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <p className="text-gray-600">
                                        <span className="font-medium">Job Title:</span> {app.job_offer.job_titel.name}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Category:</span> {app.job_offer.job_category.name}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Type:</span> {app.job_offer.type.replace('_', ' ')}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Applied:</span> {new Date(app.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <a 
                                        href={app.cv_file} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        View CV
                                    </a>
                                    <a 
                                        href={app.job_offer.location_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        View Location
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cv;