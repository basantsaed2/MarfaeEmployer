import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
    Search,
    Loader2,
    User,
    FileText,
    Mail,
    Phone,
    Briefcase,
    Star,
    Tag,
    Calendar,
    MapPin,
} from "lucide-react";

// Assuming these are your custom hooks
import { useGet } from "@/Hooks/UseGet";
import { usePost } from "@/Hooks/UsePost";

// Reusable component for displaying a single user
const UserCard = ({ user }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
        <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
                {user.image_link ? (
                    <img
                        src={user.image_link}
                        alt={`${user.full_name}'s profile`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                    />
                ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                        <User size={32} />
                    </div>
                )}
            </div>
            <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">
                    {user.full_name || "Anonymous User"}
                </h3>
                <p className="text-gray-500">{user.role || "N/A"}</p>
                {/* Display location information */}
                {(user.city?.name || user.country?.name) && (
                    <p className="text-gray-500 text-sm mt-1 flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {user.city?.name && user.country?.name
                            ? `${user.city.name}, ${user.country.name}`
                            : user.city?.name || user.country?.name
                        }
                    </p>
                )}
            </div>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-4 text-sm text-gray-600">
            <p className="flex items-center">
                <Mail size={16} className="mr-2 text-blue-500" />
                <span className="font-medium">Email:</span> {user.email || "—"}
            </p>
            <p className="flex items-center">
                <Phone size={16} className="mr-2 text-blue-500" />
                <span className="font-medium">Phone:</span> {user.phone || "—"}
            </p>
            <p className="flex items-center">
                <Calendar size={16} className="mr-2 text-blue-500" />
                <span className="font-medium">Age:</span> {user.age || "—"} years old
            </p>
            <p className="flex items-center">
                <Star size={16} className="mr-2 text-blue-500" />
                <span className="font-medium">Status:</span> {user.status || "—"}
            </p>
        </div>

        {/* Display all specializations */}
        <div className="mt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Specializations:</h4>
            {user.specializations?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {user.specializations.map((spec) => (
                        <span
                            key={spec.id}
                            className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                        >
                            <Briefcase size={12} className="mr-1" />
                            {spec.name}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-sm">No specializations listed.</p>
            )}
        </div>

        {/* Display all CVs */}
        <div className="mt-4">
            <h4 className="font-semibold text-gray-800 mb-2">CVs:</h4>
            {user.usercvs?.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {user.usercvs.map((cv, index) => (
                        <a
                            key={cv.id || index}
                            href={cv.cv_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center transition-colors text-sm"
                        >
                            <FileText className="mr-2" size={16} />
                            View CV #{index + 1}
                        </a>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-sm">No CVs available.</p>
            )}
        </div>
    </div>
);
// Main component
const SearchUsers = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const {
        refetch: refetchList,
        loading: loadingList,
        data: dataList,
    } = useGet({
        url: `${apiUrl}/employeer/get-specialization-experience`,
    });
    const { refetch: refetchRegion, loading: loadingRegion, data: regionData } = useGet({
        url: `${apiUrl}/employeer/city-country`,
    });
    const { postData, loadingPost, response, error: postError } = usePost({
        url: `${apiUrl}/employeer/search-users`,
    });

    const [filters, setFilters] = useState({
        specialization: null,
        experience: null,
        country: null,
        city: null,
    });
    const [users, setUsers] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [specializationOptions, setSpecializationOptions] = useState([]);
    const [experienceOptions, setExperienceOptions] = useState([]);
    const [cities, setCities] = useState([]);
    const [countries, setCountries] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);

    useEffect(() => {
        refetchList();
        refetchRegion();
    }, [refetchList, refetchRegion]);

    useEffect(() => {
        if (dataList?.data) {
            const formattedSpecialization =
                dataList.data.specializations?.map((u) => ({
                    label: u.name || "—",
                    value: u.id.toString(),
                })) || [];

            const formattedExperience =
                [
                    { label: "No Experience", value: null },
                    ...(dataList.data.experince?.map((u) => ({
                        label: u,
                        value: u,
                    })) || []),
                ];

            setSpecializationOptions(formattedSpecialization);
            setExperienceOptions(formattedExperience);
        }
    }, [dataList]);

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

    // Filter cities when country selection changes
    useEffect(() => {
        if (selectedCountry && cities.length > 0) {
            const filtered = cities.filter(city => city.countryId === selectedCountry.value);
            setFilteredCities(filtered);
            setSelectedCity(null);
            setFilters({ ...filters, city: null });
        } else {
            setFilteredCities([]);
            setSelectedCity(null);
            setFilters({ ...filters, city: null });
        }
    }, [selectedCountry, cities]);

    useEffect(() => {
        if (response) {
            const activeUsers = Array.isArray(response.data?.data)
                ? response.data.data.filter(user => user.status !== "deleted")
                : [];
            setUsers(activeUsers);
            setErrorMessage(null);
        }
        if (postError) {
            setErrorMessage("An error occurred while fetching users. Please try again.");
            setUsers([]);
        }
    }, [response, postError]);

    const handleSearch = () => {
        if (filters.specialization || filters.experience || filters.country || filters.city) {
            postData({
                specialization: filters.specialization?.value,
                experience: filters.experience?.value,
                country_id: filters.country?.value,
                city_id: filters.city?.value,
            });
        } else {
            setErrorMessage("Please select at least one filter to search.");
            setUsers([]);
        }
    };

    const handleCountryChange = (selectedOption) => {
        setSelectedCountry(selectedOption);
        setFilters({ ...filters, country: selectedOption, city: null });
    };

    const handleCityChange = (selectedOption) => {
        setSelectedCity(selectedOption);
        setFilters({ ...filters, city: selectedOption });
    };

    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            borderRadius: "8px",
            padding: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            "&:hover": {
                borderColor: "#3b82f6",
            },
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "8px",
            marginTop: "4px",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#3b82f6" : "white",
            color: state.isSelected ? "white" : "black",
            "&:hover": {
                backgroundColor: "#e5e7eb",
                color: "black",
            },
        }),
    };

    return (
        <div className="min-h-screen p-4 md:p-6 font-sans">
            <div className="w-full">
                {/* Header */}
                <div className="mb-6 text-center md:text-left">
                    <h1 className="text-3xl text-bg-primary font-bold leading-tight">
                        Find Users
                    </h1>
                    <p className="text-gray-600 mt-2 text-md">
                        Search for skilled by specialization, experience level, and location.
                    </p>
                </div>

                {/* Search Filters */}
                <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Specialization
                            </label>
                            <Select
                                options={specializationOptions}
                                value={filters.specialization}
                                onChange={(value) =>
                                    setFilters({ ...filters, specialization: value })
                                }
                                placeholder="Select Specialization"
                                styles={customSelectStyles}
                                isLoading={loadingList}
                                isClearable
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Experience Level
                            </label>
                            <Select
                                options={experienceOptions}
                                value={filters.experience}
                                onChange={(value) =>
                                    setFilters({ ...filters, experience: value })
                                }
                                placeholder="Select Experience"
                                styles={customSelectStyles}
                                isLoading={loadingList}
                                isClearable
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country
                            </label>
                            <Select
                                options={countries}
                                value={filters.country}
                                onChange={handleCountryChange}
                                placeholder="Select Country"
                                styles={customSelectStyles}
                                isLoading={loadingRegion}
                                isClearable
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City
                            </label>
                            <Select
                                options={filteredCities}
                                value={filters.city}
                                onChange={handleCityChange}
                                placeholder="Select City"
                                styles={customSelectStyles}
                                isLoading={loadingRegion}
                                isClearable
                                isDisabled={!selectedCountry}
                            />
                        </div>
                        <div className="flex items-end md:col-span-2 xl:col-span-1">
                            <button
                                onClick={handleSearch}
                                disabled={loadingPost}
                                className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                {loadingPost ? (
                                    <Loader2 className="animate-spin mr-2" />
                                ) : (
                                    <Search className="mr-2" />
                                )}
                                Search
                            </button>
                        </div>
                    </div>
                    {errorMessage && (
                        <p className="text-red-500 text-sm mt-4 text-center">
                            {errorMessage}
                        </p>
                    )}
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loadingPost && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 md:col-span-2 xl:col-span-3">
                            <Loader2 className="animate-spin text-blue-600" size={48} />
                            <p className="mt-4">Fetching users...</p>
                        </div>
                    )}
                    {!loadingPost && users.length === 0 && !errorMessage && (
                        <div className="text-center py-12 md:col-span-2 xl:col-span-3">
                            <User className="mx-auto text-gray-400 mb-4" size={64} />
                            <p className="text-gray-600 text-lg">
                                No active users found. Try adjusting your search filters.
                            </p>
                        </div>
                    )}
                    {!loadingPost &&
                        users.map((user) => <UserCard key={user.id} user={user} />)}
                </div>
            </div>
        </div>
    );
};

export default SearchUsers;