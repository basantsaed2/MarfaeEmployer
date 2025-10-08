import React, { useState, useEffect } from "react";
import { useGet } from '@/Hooks/UseGet';
import { useChangeState } from '@/Hooks/useChangeState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Briefcase,
    MapPin,
    Circle,
    Calendar,
    User,
    Filter,
    Search,
    Download,
    ChevronDown,
    ChevronUp,
    Eye,
    X,
    BarChart3,
    List,
    Mail,
    Phone,
    Clock,
    FileText,
    Building,
    Award,
    DollarSign,
    Map,
    Star,
    CheckCircle,
    XCircle,
    Clock4,
    SlidersHorizontal,
    RefreshCw,
    Grid,
    Check,
    AlertCircle,
    FileSpreadsheet,
    Workflow,
    Stars
} from "lucide-react";

const Cv = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchCV, loading: loadingCV, data: dataCV } = useGet({ url: `${apiUrl}/employeer/get-trackcvs` });
    const { changeState, loadingChange, responseChange } = useChangeState();

    // State management
    const [userSearch, setUserSearch] = useState('');
    const [jobSearch, setJobSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [experienceFilter, setExperienceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [expandedApplication, setExpandedApplication] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isAppDetailsOpen, setIsAppDetailsOpen] = useState(false);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [isStatusChangeOpen, setIsStatusChangeOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [activeTab, setActiveTab] = useState('cvs'); // 'cvs' or 'jobs'

    // Extract unique jobs for filtering
    useEffect(() => {
        if (dataCV?.applications) {
            const jobMap = {};
            dataCV.applications.forEach(app => {
                const jobId = app.job_offer_id;
                if (!jobMap[jobId]) {
                    jobMap[jobId] = { job: app.job_offer, applications: [] };
                }
                jobMap[jobId].applications.push(app);
            });

            // Convert object to array and sort
            const jobsArray = Object.keys(jobMap).map(key => jobMap[key]);
            jobsArray.sort((a, b) => a.job.job_titel.name.localeCompare(b.job.job_titel.name));
            setJobs(jobsArray);
        }
    }, [dataCV]);

    // Filter applications based on criteria
    useEffect(() => {
        if (dataCV?.applications) {
            let filtered = dataCV.applications.filter(app => {
                const matchesUser = app.user.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
                    app.user.email.toLowerCase().includes(userSearch.toLowerCase());

                const matchesJob = app.job_offer.job_titel.name.toLowerCase().includes(jobSearch.toLowerCase()) ||
                    app.job_offer.job_category.name.toLowerCase().includes(jobSearch.toLowerCase());

                const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

                const matchesExperience = experienceFilter === 'all' || app.has_experience === experienceFilter;

                const appDate = new Date(app.created_at);
                const fromDate = dateFrom ? new Date(dateFrom) : null;
                const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null;

                const matchesDate = (!fromDate || appDate >= fromDate) && (!toDate || appDate <= toDate);

                return matchesUser && matchesJob && matchesStatus && matchesExperience && matchesDate;
            });

            // Sort applications
            filtered.sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);

                switch (sortBy) {
                    case 'newest':
                        return dateB - dateA;
                    case 'oldest':
                        return dateA - dateB;
                    case 'name':
                        return a.user.full_name.localeCompare(b.user.full_name);
                    case 'status':
                        return a.status.localeCompare(b.status);
                    default:
                        return dateB - dateA;
                }
            });

            setFilteredApplications(filtered);
        }
    }, [dataCV, userSearch, jobSearch, statusFilter, dateFrom, dateTo, experienceFilter, sortBy]);

    // Status options with counts
    const statusOptions = [
        { value: 'all', label: 'All Statuses', count: dataCV?.applications?.length || 0 },
        { value: 'pending', label: 'Pending', count: dataCV?.applications?.filter(a => a.status === 'pending').length || 0 },
        { value: 'reviewed', label: 'Viewed', count: dataCV?.applications?.filter(a => a.status === 'reviewed').length || 0 },
        { value: 'accepted', label: 'Accepted', count: dataCV?.applications?.filter(a => a.status === 'accepted').length || 0 },
        { value: 'rejected', label: 'Not Shortlisted', count: dataCV?.applications?.filter(a => a.status === 'rejected').length || 0 },
        { value: 'recommended', label: 'Recommended', count: dataCV?.applications?.filter(a => a.status === 'recommended').length || 0 }
    ];

    // Experience options
    const experienceOptions = [
        { value: 'all', label: 'All Experience Levels' },
        { value: 'yes', label: 'With Experience' },
        { value: 'no', label: 'No Experience' }
    ];

    // Sort options
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'name', label: 'By Name' },
        { value: 'status', label: 'By Status' }
    ];

    // Handle status change functions
    const handleStatusChange = async (application, newStatus) => {
        let url, successMessage, data = {};

        switch (newStatus) {
            case 'reviewed':
                url = `${apiUrl}/employeer/viewed-application`;
                successMessage = 'Application marked as viewed';
                data = { application_id: application.id };
                break;
            case 'accepted':
                url = `${apiUrl}/employeer/accept-application`;
                successMessage = 'Application accepted successfully';
                data = { application_id: application.id };
                break;
            case 'rejected':
                url = `${apiUrl}/employeer/reject-application`;
                successMessage = 'Application rejected successfully';
                data = { application_id: application.id };
                break;
            case 'recommended':
                url = `${apiUrl}/employeer/recommended-application`;
                successMessage = 'Application recommended successfully';
                data = { application_id: application.id };
                break;
            default:
                return;
        }

        const success = await changeState(url, successMessage, data);
        if (success) {
            refetchCV();
            setIsStatusChangeOpen(false);
            setPendingAction(null);
        }
    };

    // Open status change dialog
    const openStatusChangeDialog = (application, action) => {
        setSelectedApplication(application);
        setPendingAction(action);
        setIsStatusChangeOpen(true);
    };

    // Get status badge class
    const getStatusClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'reviewed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'accepted':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'recommended':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Open application details
    const openApplicationDetails = (app) => {
        setSelectedApplication(app);
        setIsAppDetailsOpen(true);
    };

    // Get action confirmation message
    const getActionMessage = (action) => {
        switch (action) {
            case 'reviewed':
                return 'Are you sure you want to mark this application as viewed?';
            case 'accepted':
                return 'Are you sure you want to accept this application?';
            case 'rejected':
                return 'Are you sure you want to reject this application?';
            case 'recommended':
                return 'Are you sure you want to recommended this application?';
            default:
                return 'Are you sure you want to perform this action?';
        }
    };

    // Get action button class
    const getActionButtonClass = (action) => {
        switch (action) {
            case 'reviewed':
                return 'bg-blue-600 hover:bg-blue-700';
            case 'accepted':
                return 'bg-green-600 hover:bg-green-700';
            case 'rejected':
                return 'bg-red-600 hover:bg-red-700';
            case 'recommended':
                return 'bg-purple-600 hover:bg-purple-700';
            default:
                return 'bg-gray-600 hover:bg-gray-700';
        }
    };

    // Status dropdown component
    const StatusDropdown = ({ application, size = "default" }) => {
        const [isOpen, setIsOpen] = useState(false);

        const statusOptions = [
            { value: 'pending', label: 'Pending', icon: <Clock4 className="h-4 w-4" /> },
            { value: 'reviewed', label: 'Viewed', icon: <Eye className="h-4 w-4" /> },
            { value: 'accepted', label: 'Accepted', icon: <CheckCircle className="h-4 w-4" /> },
            { value: 'rejected', label: 'Not Shortlisted', icon: <XCircle className="h-4 w-4" /> },
            { value: 'recommended', label: 'Recommended', icon: <Stars className="h-4 w-4" /> }
        ];

        const currentStatus = statusOptions.find(opt => opt.value === application.status);

        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 ${getStatusClass(application.status)} ${size === "small" ? "text-xs" : ""}`}
                >
                    <span className="flex items-center">
                        {currentStatus?.icon}
                        <span className="ml-1">{currentStatus?.label}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                </button>

                {isOpen && (
                    <div className="absolute z-10 mt-1 w-40 rounded-md bg-white shadow-lg border border-gray-200">
                        <div className="py-1">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setIsOpen(false);
                                        openStatusChangeDialog(application, option.value);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                                    disabled={application.status === option.value}
                                >
                                    {option.icon}
                                    <span className="ml-2">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-bg-primary">Job Applications Dashboard</h2>
                        <p className="text-gray-600 mt-1">
                            Manage and review {dataCV?.applications?.length || 0} applications across {jobs.length} job positions
                        </p>
                    </div>
                    <button
                        onClick={refetchCV}
                        disabled={loadingCV}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loadingCV ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('cvs')}
                        className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'cvs' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FileSpreadsheet className="h-5 w-5" />
                        All CVs ({dataCV?.applications?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'jobs' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Briefcase className="h-5 w-5" />
                        Jobs ({jobs.length})
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
                        <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
                        <p className="text-2xl font-bold text-gray-800">{dataCV?.applications?.length || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                        <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                        <p className="text-2xl font-bold text-gray-800">
                            {dataCV?.applications?.filter(a => a.status === 'pending').length || 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                        <h3 className="text-sm font-medium text-gray-500">Viewed</h3>
                        <p className="text-2xl font-bold text-gray-800">
                            {dataCV?.applications?.filter(a => a.status === 'reviewed').length || 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                        <h3 className="text-sm font-medium text-gray-500">Accepted</h3>
                        <p className="text-2xl font-bold text-gray-800">
                            {dataCV?.applications?.filter(a => a.status === 'accepted').length || 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                        <h3 className="text-sm font-medium text-gray-500">Not Shortlisted</h3>
                        <p className="text-2xl font-bold text-gray-800">
                            {dataCV?.applications?.filter(a => a.status === 'rejected').length || 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                        <h3 className="text-sm font-medium text-gray-500">Recommended</h3>
                        <p className="text-2xl font-bold text-gray-800">
                            {dataCV?.applications?.filter(a => a.status === 'recommended').length || 0}
                        </p>
                    </div>
                </div>

                {/* Search and Filter Header */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder={activeTab === 'cvs' ? "Search by applicant name or email..." : "Search by job title or category..."}
                                value={activeTab === 'cvs' ? userSearch : jobSearch}
                                onChange={(e) => activeTab === 'cvs' ? setUserSearch(e.target.value) : setJobSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {activeTab === 'cvs' && (
                            <div className="relative flex-1 w-full">
                                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search by job title or category..."
                                    value={jobSearch}
                                    onChange={(e) => setJobSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors w-full md:w-auto"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Advanced Filters
                            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Application Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label} ({option.count})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                                <select
                                    value={experienceFilter}
                                    onChange={(e) => setExperienceFilter(e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {experienceOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CVs Tab Content */}
                {activeTab === 'cvs' && (
                    <>
                        {/* View Toggle */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {filteredApplications.length} Application{filteredApplications.length !== 1 ? 's' : ''} Found
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 mr-2">View:</span>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Applications List/Grid */}
                        {loadingCV ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading applications...</p>
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters</p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredApplications.map(app => (
                                    <div
                                        key={app.id}
                                        className="w-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
                                    >
                                        <div className="w-full p-4">
                                            <div className="w-full flex justify-between items-start mb-4">
                                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                                    <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-full">
                                                        <User className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                                                            {app.user.full_name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 truncate">{app.user.email}</p>
                                                    </div>
                                                </div>
                                                <StatusDropdown application={app} />
                                            </div>

                                            <div className="mb-4">
                                                <h4 className="text-md font-medium text-gray-700 mb-2 flex items-center gap-2 truncate">
                                                    <Briefcase className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="truncate">{app.job_offer.job_titel.name}</span>
                                                </h4>
                                                <p className="text-sm text-gray-600 truncate">{app.job_offer.job_category.name}</p>
                                            </div>

                                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                                <p className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <span className="font-medium flex-shrink-0">Applied:</span>
                                                    <span className="truncate">{formatDate(app.created_at)}</span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <Award className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <span className="font-medium flex-shrink-0">Experience:</span>
                                                    <span className={app.has_experience === 'yes' ? 'text-green-600' : 'text-gray-600'}>
                                                        {app.has_experience === 'yes' ? 'Yes' : 'No'}
                                                    </span>
                                                </p>
                                                <p className="flex items-center gap-2 truncate">
                                                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <span className="font-medium flex-shrink-0">Phone:</span>
                                                    <span className="truncate">{app.user.phone}</span>
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {/* View Actions */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedJob(app.job_offer);
                                                            setIsDetailsOpen(true);
                                                        }}
                                                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center flex items-center justify-center gap-2 min-w-0"
                                                    >
                                                        <Eye className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate">Job Details</span>
                                                    </button>
                                                    <a
                                                        href={app.cv_file}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-center flex items-center justify-center gap-2 min-w-0"
                                                    >
                                                        <FileText className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate">View CV</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Applicant
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Job Title
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Applied Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Experience
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredApplications.map(app => (
                                                <tr key={app.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                                <User className="h-5 w-5 text-indigo-600" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{app.user.full_name}</div>
                                                                <div className="text-sm text-gray-500">{app.user.email}</div>
                                                                <div className="text-sm text-gray-500">{app.user.phone}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{app.job_offer.job_titel.name}</div>
                                                        <div className="text-sm text-gray-500">{app.job_offer.job_category.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(app.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.has_experience === 'yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {app.has_experience === 'yes' ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <StatusDropdown application={app} size="small" />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => openApplicationDetails(app)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                                title="View Details"
                                                            >
                                                                <User className="h-4 w-4" />
                                                            </button>
                                                            <a
                                                                href={app.cv_file}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-gray-600 hover:text-gray-900"
                                                                title="View CV"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Jobs Tab Content */}
                {activeTab === 'jobs' && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {jobs.map(jobItem => (
                            <div
                                key={jobItem.job.id}
                                className="w-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
                            >
                                <div className="w-full p-4">
                                    <div className="w-full flex justify-between items-start mb-4">
                                        <div className="flex items-start gap-3 min-w-0 flex-1">
                                            <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                                                <Briefcase className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-lg font-semibold text-gray-800 truncate">
                                                    {jobItem.job.job_titel.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate">{jobItem.job.job_category.name}</p>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center flex-shrink-0 ml-2 ${jobItem.job.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                                        >
                                            {jobItem.job.status === 'active' ? (
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                            ) : (
                                                <XCircle className="h-3 w-3 mr-1" />
                                            )}
                                            <span className="ml-1">
                                                {jobItem.job.status.charAt(0).toUpperCase() + jobItem.job.status.slice(1)}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        <p className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <span className="font-medium flex-shrink-0">Experience:</span>
                                            <span>{jobItem.job.experience}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <span className="font-medium flex-shrink-0">Salary:</span>
                                            <span>{jobItem.job.expected_salary}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <span className="font-medium flex-shrink-0">Deadline:</span>
                                            <span>{formatDate(jobItem.job.expire_date)}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <span className="font-medium flex-shrink-0">Applications:</span>
                                            <span>{jobItem.applications.length}</span>
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedJob(jobItem.job);
                                                setIsDetailsOpen(true);
                                            }}
                                            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center flex items-center justify-center gap-2 min-w-0"
                                        >
                                            <Eye className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">Job Details</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedJob(jobItem.job);
                                                setFilteredApplications(jobItem.applications);
                                                setActiveTab('cvs');
                                            }}
                                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-center flex items-center justify-center gap-2 min-w-0"
                                        >
                                            <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">View CVs ({jobItem.applications.length})</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Status Change Confirmation Dialog */}
                <Dialog open={isStatusChangeOpen} onOpenChange={setIsStatusChangeOpen}>
                    <DialogContent className="w-full bg-white rounded-xl shadow-xl p-6 sm:max-w-md">
                        <DialogHeader className="text-center mb-4">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                                <AlertCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <DialogTitle className="text-lg font-semibold text-gray-900">
                                Confirm Action
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 mt-2">
                                {selectedApplication && pendingAction && getActionMessage(pendingAction)}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedApplication && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 p-2 rounded-full">
                                        <User className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedApplication.user.full_name}</p>
                                        <p className="text-sm text-gray-500">{selectedApplication.job_offer.job_titel.name}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsStatusChangeOpen(false);
                                    setPendingAction(null);
                                    setSelectedApplication(null);
                                }}
                                disabled={loadingChange}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => selectedApplication && pendingAction && handleStatusChange(selectedApplication, pendingAction)}
                                disabled={loadingChange}
                                className={`flex-1 text-white ${pendingAction && getActionButtonClass(pendingAction)}`}
                            >
                                {loadingChange ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    `Confirm ${pendingAction && pendingAction.charAt(0).toUpperCase() + pendingAction.slice(1)}`
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Application Details Dialog */}
                <Dialog open={isAppDetailsOpen} onOpenChange={setIsAppDetailsOpen}>
                    <DialogContent className="w-full bg-white rounded-xl shadow-xl p-0 sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Application Details
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-600 mt-1">
                                    Comprehensive information about the selected application
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        {selectedApplication && (
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    {/* Applicant Information */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Applicant Information</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="bg-indigo-100 p-3 rounded-full">
                                                    <User className="h-6 w-6 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-800">{selectedApplication.user.full_name}</h4>
                                                    <p className="text-gray-600">{selectedApplication.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                                    <p className="text-gray-800">{selectedApplication.user.phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Application Date</p>
                                                    <p className="text-gray-800">{formatDate(selectedApplication.created_at)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Experience</p>
                                                    <p className="text-gray-800">{selectedApplication.has_experience === 'yes' ? 'Yes' : 'No'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                                    <StatusDropdown application={selectedApplication} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Job Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Information</h3>
                                        <div className="bg-blue-50 rounded-lg p-4 h-full">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Briefcase className="h-5 w-5 text-blue-600" />
                                                <h4 className="text-md font-bold text-gray-800">{selectedApplication.job_offer.job_titel.name}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{selectedApplication.job_offer.job_category.name}</p>
                                            <div className="space-y-2">
                                                <p className="text-sm">
                                                    <span className="font-medium">Type:</span> {selectedApplication.job_offer.type.replace('_', ' ')}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-medium">Experience:</span> {selectedApplication.job_offer.experience}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-medium">Salary:</span> {selectedApplication.job_offer.expected_salary}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-medium">Deadline:</span> {formatDate(selectedApplication.job_offer.expire_date)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setIsAppDetailsOpen(false);
                                                    setSelectedJob(selectedApplication.job_offer);
                                                    setIsDetailsOpen(true);
                                                }}
                                                className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                View full job details
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Application Message */}
                                {selectedApplication.message && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Applicant Message</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-gray-700">{selectedApplication.message}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">View Documents</h3>
                                    <div className="flex flex-wrap gap-3">
                                        <a
                                            href={selectedApplication.cv_file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            View CV
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <Button
                                variant="outline"
                                onClick={() => setIsAppDetailsOpen(false)}
                                className="rounded-lg border-gray-300"
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Enhanced Job Details Dialog */}
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent className="w-full bg-white rounded-xl shadow-xl p-0 sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                    Job Details
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-600 mt-1">
                                    Comprehensive information about the selected job posting
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        {selectedJob && (
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Header with image and basic info */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-gray-100">
                                    <div className="flex-shrink-0">
                                        <Avatar className="h-20 w-20 rounded-xl border-4 border-white shadow-md">
                                            <AvatarImage
                                                src={selectedJob.image_link}
                                                alt={`${selectedJob.job_titel.name} image`}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 text-lg font-semibold">
                                                {selectedJob.job_titel.name?.charAt(0) || "J"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedJob.job_titel.name}</h2>
                                        <p className="text-lg text-gray-700 font-medium mb-2">{selectedJob.job_category.name}</p>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {selectedJob.location_link}
                                            </span>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {selectedJob.type.replace('_', ' ')}
                                            </span>
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${selectedJob.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                <Circle className="h-2 w-2 mr-1 fill-current" />
                                                {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-6">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Job Information</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Category</p>
                                                    <p className="text-gray-900 font-medium">{selectedJob.job_category.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Experience Level</p>
                                                    <p className="text-gray-900 font-medium">{selectedJob.experience}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Expected Salary</p>
                                                    <p className="text-gray-900 font-medium">{selectedJob.expected_salary}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Timeline</h3>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Application Deadline</p>
                                                <p className="text-gray-900 font-medium flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    {formatDate(selectedJob.expire_date)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Job Description</h3>
                                            <p className="text-gray-700 whitespace-pre-line">{selectedJob.description}</p>
                                        </div>

                                        <div className="p-4 bg-indigo-50 rounded-lg">
                                            <h3 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">Qualifications</h3>
                                            <p className="text-gray-700 whitespace-pre-line">{selectedJob.qualifications}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <Button
                                variant="outline"
                                onClick={() => setIsDetailsOpen(false)}
                                className="rounded-lg border-gray-300"
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Cv;