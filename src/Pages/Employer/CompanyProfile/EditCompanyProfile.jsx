import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FiUpload, FiX, FiArrowLeft, FiGlobe, FiTwitter, FiFacebook, FiLinkedin } from "react-icons/fi";
import { FaStethoscope, FaHeartbeat, FaUserMd, FaSyringe } from "react-icons/fa";
import image from "../../../assets/Login.png";
import "react-toastify/dist/ReactToastify.css";
import { useChangeState } from "@/Hooks/useChangeState";
import { useGet } from "@/Hooks/UseGet";
import Select from 'react-select';

const EditCompanyProfile = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { employer } = useSelector((state) => state.auth);
    const { refetch: refetchEmployerData, loading: loadingEmployerData, data: employerData } = useGet({
        url: `${apiUrl}/employeer/get-company-data/${employer?.user?.company_id}`,
    });
    const { refetch: refetchSpecialization, loading: loadingSpecialization, data: specializationData } = useGet({
        url: `${apiUrl}/get-specialization-experience`,
    });
    const { refetch: refetchRegion, loading: loadingRegion, data: regionData } = useGet({
        url: `${apiUrl}/city-country`,
    });
    const { refetch: refetchCompanyType, loading: loadingCompanyType, data: companyTypeData } = useGet({
        url: `${apiUrl}/get-company-types`,
    });
    const { changeState, loadingChange, responseChange } = useChangeState();
    const navigate = useNavigate();
    const location = useLocation();

    const [specializationOptions, setSpecializationOptions] = useState([]);
    const [companyTypeOptions, setCompanyTypeOptions] = useState([]);
    const [cities, setCities] = useState([]);
    const [countries, setCountries] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedCompanyType, setSelectedCompanyType] = useState(null);
    const [selectedSpecializations, setSelectedSpecializations] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [hasSetInitialSpecializations, setHasSetInitialSpecializations] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        email: "",
        location_link: "",
        phone: "",
        description: "",
        twitter_link: "",
        facebook_link: "",
        linkedin_link: "",
        site_link: "",
        city_id: "",
        country_id: "",
        company_type_id: "",
        specializations: []
    });

    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageBase64, setImageBase64] = useState("");

    useEffect(() => {
        refetchSpecialization();
        refetchRegion();
        refetchCompanyType();
        refetchEmployerData();
    }, [refetchSpecialization, refetchRegion, refetchCompanyType, refetchEmployerData]);

    // Set initial data when employerData is loaded - ONLY ONCE
    useEffect(() => {
        if (employerData?.company && isInitialLoad) {
            const company = employerData.company;

            const specializationIds = company.company_specializations?.map(cs =>
                cs.specialization_id?.toString()
            ).filter(Boolean) || [];

            setFormData({
                id: company.id || "",
                name: company.name || "",
                email: company.email || "",
                location_link: company.location_link || "",
                phone: company.phone || "",
                description: company.description || "",
                twitter_link: company.twitter_link || "",
                facebook_link: company.facebook_link || "",
                linkedin_link: company.linkedin_link || "",
                site_link: company.site_link || "",
                city_id: company.city_id?.toString() || "",
                country_id: company.country_id?.toString() || "",
                company_type_id: company.company_type_id?.toString() || "",
                specializations: specializationIds
            });

            if (company.image_link && company.image_link !== "Invalid base64 image string") {
                setPreviewImage(company.image_link);
            }

            setIsInitialLoad(false);
        }
    }, [employerData, isInitialLoad]); // REMOVED specializationOptions from dependencies

    useEffect(() => {
        if (specializationData?.data) {
            const formattedSpecialization =
                specializationData.data.specializations?.map((u) => ({
                    label: u.name || "—",
                    value: u.id.toString(),
                })) || [];
            setSpecializationOptions(formattedSpecialization);
        }
    }, [specializationData]);

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

    useEffect(() => {
        if (companyTypeData?.company_types) {
            const formattedTypes = companyTypeData.company_types.map((type) => ({
                label: type.name,
                value: type.id.toString(),
            }));
            setCompanyTypeOptions(formattedTypes);
        }
    }, [companyTypeData]);

    // Set initial selected values when data is loaded - ONLY ONCE
    useEffect(() => {
        if (!isInitialLoad && formData.country_id && countries.length > 0) {
            const country = countries.find(c => c.value === formData.country_id);
            setSelectedCountry(country || null);
        }
    }, [formData.country_id, countries, isInitialLoad]);

    useEffect(() => {
        if (!isInitialLoad && formData.city_id && cities.length > 0) {
            const city = cities.find(c => c.value === formData.city_id);
            setSelectedCity(city || null);
        }
    }, [formData.city_id, cities, isInitialLoad]);

    useEffect(() => {
        if (!isInitialLoad && formData.company_type_id && companyTypeOptions.length > 0) {
            const companyType = companyTypeOptions.find(ct => ct.value === formData.company_type_id);
            setSelectedCompanyType(companyType || null);
        }
    }, [formData.company_type_id, companyTypeOptions, isInitialLoad]);

    // FIXED: Set initial specializations only once when both data and options are available
    useEffect(() => {
        if (!hasSetInitialSpecializations &&
            formData.specializations?.length > 0 &&
            specializationOptions.length > 0) {

            const matched = specializationOptions.filter(opt =>
                formData.specializations.includes(opt.value)
            );

            if (matched.length > 0) {
                setSelectedSpecializations(matched);
                setHasSetInitialSpecializations(true);
            }
        }
    }, [formData.specializations, specializationOptions, hasSetInitialSpecializations]);

    // Filter cities when country selection changes
    useEffect(() => {
        if (selectedCountry && cities.length > 0) {
            const filtered = cities.filter(city => city.countryId === selectedCountry.value);
            setFilteredCities(filtered);
            setFormData(prev => ({
                ...prev,
                country_id: selectedCountry.value,
            }));
        } else {
            setFilteredCities([]);
        }
    }, [selectedCountry, cities]);

    // Update form data when city is selected
    useEffect(() => {
        if (selectedCity && !isInitialLoad) {
            setFormData(prev => ({
                ...prev,
                city_id: selectedCity.value
            }));
        }
    }, [selectedCity, isInitialLoad]);

    // Update form data when company type is selected
    useEffect(() => {
        if (selectedCompanyType && !isInitialLoad) {
            setFormData(prev => ({
                ...prev,
                company_type_id: selectedCompanyType.value
            }));
        }
    }, [selectedCompanyType, isInitialLoad]);

    // FIXED: Update form data when specializations are selected - only when not initial load
    useEffect(() => {
        if (!isInitialLoad && hasSetInitialSpecializations) {
            const specializationIds = selectedSpecializations.map(spec => spec.value);
            setFormData(prev => ({
                ...prev,
                specializations: specializationIds
            }));
        }
    }, [selectedSpecializations, isInitialLoad, hasSetInitialSpecializations]);

    useEffect(() => {
        if (!loadingChange && responseChange) {
            toast.success("Company updated successfully!");
            navigate("/");
        }
    }, [responseChange, loadingChange, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error("Please select a valid image file");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImageFile(file);
                setPreviewImage(reader.result);
                setImageBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phone || !formData.description || !selectedCompanyType) {
            toast.error("Please fill in all required fields");
            return;
        }

        const updateData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            description: formData.description,
            location_link: formData.location_link,
            facebook_link: formData.facebook_link,
            twitter_link: formData.twitter_link,
            linkedin_link: formData.linkedin_link,
            site_link: formData.site_link,
            city_id: formData.city_id,
            country_id: formData.country_id,
            company_type_id: formData.company_type_id,
            specializations: formData.specializations || []
        };

        if (imageBase64) {
            updateData.image = imageBase64;
        }

        const url = `${apiUrl}/employeer/update-company-data/${formData.id}`;
        await changeState(url, "Company updated successfully!", updateData);
    };

    const removeImage = () => {
        setImageFile(null);
        setPreviewImage(null);
        setImageBase64("");
    };

    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '12px',
            padding: '8px 4px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
                borderColor: 'rgba(59, 130, 246, 0.7)',
            },
            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
        }),
        menu: (base) => ({
            ...base,
            borderRadius: '12px',
            zIndex: 9999,
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#dbeafe' : 'white',
            color: state.isSelected ? 'white' : 'black',
            ':active': {
                backgroundColor: state.isSelected ? '#3b82f6' : '#dbeafe',
            }
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: '#dbeafe',
            borderRadius: '6px',
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: '#1e40af',
            fontWeight: '500',
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: '#1e40af',
            ':hover': {
                backgroundColor: '#93c5fd',
                color: '#1e3a8a',
            },
        }),
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-bg-primary/40 to-white bg-cover bg-center relative overflow-hidden py-4">
            {/* Background image */}
            <div className="absolute inset-0 bg-[url('path_to_your_image')] bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${image})` }}></div>

            {/* Decorative medical elements */}
            <div className="absolute top-4 left-4 text-bg-primary opacity-30 text-5xl">
                <FaStethoscope />
            </div>
            <div className="absolute bottom-4 right-4 text-bg-primary opacity-30 text-5xl">
                <FaHeartbeat />
            </div>
            <div className="absolute top-1/4 right-8 text-bg-primary opacity-25 text-4xl">
                <FaUserMd />
            </div>
            <div className="absolute bottom-1/4 left-8 text-bg-primary opacity-25 text-4xl">
                <FaSyringe />
            </div>

            {/* Back Button */}
            <div className="absolute top-4 left-4 z-20">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 bg-white text-bg-primary hover:bg-bg-primary hover:text-white transition-colors"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            <div className="relative z-10 w-full max-w-5xl p-4">
                <Card className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-bg-primary/50 overflow-hidden ring-1 ring-bg-primary/30">
                    <div className="md:flex">
                        {/* Left Side - Image Upload */}
                        <div className="md:w-1/3 bg-white p-6 flex flex-col items-center justify-center">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-bg-primary bg-clip-text text-transparent bg-gradient-to-r from-bg-primary to-blue-300">
                                    Company Profile
                                </h2>
                                <p className="text-gray-500 text-sm mt-2">Edit your company details and logo</p>
                            </div>

                            <div className="relative w-full aspect-square max-w-xs">
                                {previewImage ? (
                                    <div className="relative h-full w-full rounded-lg overflow-hidden border-2 border-bg-primary/50">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        >
                                            <FiX className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="image-upload"
                                        className="flex flex-col items-center justify-center h-full w-full border-2 border-bg-primary/50 border-dashed rounded-lg cursor-pointer bg-white/70 hover:bg-blue-100/30 transition-colors"
                                    >
                                        <FiUpload className="h-8 w-8 text-bg-primary mb-2" />
                                        <span className="text-bg-primary font-medium">Upload Logo</span>
                                        <span className="text-bg-primary text-xs mt-1">PNG, JPG (max. 5MB)</span>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            disabled={loadingChange}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="md:w-2/3 p-4 md:p-6">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-bg-primary bg-clip-text text-transparent bg-gradient-to-r from-bg-primary to-blue-300">
                                    Edit Company Information
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* ... rest of your form JSX remains the same ... */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-gray-700">Company Name *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                type="text"
                                                placeholder="Enter Company Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full p-3 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                                                disabled={loadingChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-gray-700">Email *</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter Company Email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full p-3 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                                                disabled={loadingChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Company Type */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Company Type *</Label>
                                            <Select
                                                options={companyTypeOptions}
                                                value={selectedCompanyType}
                                                onChange={setSelectedCompanyType}
                                                placeholder="Select Company Type"
                                                isDisabled={loadingChange || loadingCompanyType}
                                                isLoading={loadingCompanyType}
                                                styles={customSelectStyles}
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-gray-700">Phone *</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="Enter Company Phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full p-3 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                                                disabled={loadingChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Country */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Country *</Label>
                                            <Select
                                                options={countries}
                                                value={selectedCountry}
                                                onChange={setSelectedCountry}
                                                placeholder="Select Country"
                                                isDisabled={loadingChange || loadingRegion}
                                                isLoading={loadingRegion}
                                                styles={customSelectStyles}
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                            />
                                        </div>

                                        {/* City */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">City *</Label>
                                            <Select
                                                options={filteredCities}
                                                value={selectedCity}
                                                onChange={setSelectedCity}
                                                placeholder={selectedCountry ? "Select City" : "Select Country First"}
                                                isDisabled={loadingChange || loadingRegion || !selectedCountry}
                                                isLoading={loadingRegion}
                                                styles={customSelectStyles}
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                            />
                                        </div>
                                    </div>

                                    {/* Specializations */}
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Specializations</Label>
                                        <Select
                                            options={specializationOptions}
                                            value={selectedSpecializations}
                                            onChange={setSelectedSpecializations}
                                            placeholder="Select Specializations"
                                            isMulti
                                            isDisabled={loadingChange || loadingSpecialization}
                                            isLoading={loadingSpecialization}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location_link" className="text-gray-700">Location Address</Label>
                                        <Input
                                            id="location_link"
                                            name="location_link"
                                            type="text"
                                            placeholder="Full Address"
                                            value={formData.location_link}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                                            disabled={loadingChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-gray-700">Description *</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Tell us about your company..."
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full min-h-[80px] p-3 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                                            disabled={loadingChange}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-gray-700">Social Media Links</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-bg-primary">
                                                    <FiTwitter className="h-5 w-5" />
                                                </div>
                                                <Input
                                                    name="twitter_link"
                                                    type="text"
                                                    placeholder="Twitter"
                                                    value={formData.twitter_link}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pl-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                                                    disabled={loadingChange}
                                                />
                                            </div>

                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-bg-primary">
                                                    <FiFacebook className="h-5 w-5" />
                                                </div>
                                                <Input
                                                    name="facebook_link"
                                                    type="text"
                                                    placeholder="Facebook"
                                                    value={formData.facebook_link}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pl-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                                                    disabled={loadingChange}
                                                />
                                            </div>

                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-bg-primary">
                                                    <FiLinkedin className="h-5 w-5" />
                                                </div>
                                                <Input
                                                    name="linkedin_link"
                                                    type="text"
                                                    placeholder="LinkedIn"
                                                    value={formData.linkedin_link}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pl-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                                                    disabled={loadingChange}
                                                />
                                            </div>

                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-bg-primary">
                                                    <FiGlobe className="h-5 w-5" />
                                                </div>
                                                <Input
                                                    name="site_link"
                                                    type="text"
                                                    placeholder="Website"
                                                    value={formData.site_link}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pl-10 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent bg-white/70 placeholder-bg-primary/70"
                                                    disabled={loadingChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-3 pt-2">
                                        <div className="w-full md:w-1/2">
                                            <Button
                                                type="submit"
                                                className="w-full p-3 text-base bg-gradient-to-r from-bg-primary to-blue-300 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 shadow-lg"
                                                disabled={loadingChange}
                                            >
                                                {loadingChange ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg
                                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        Processing...
                                                    </span>
                                                ) : "Update Company"}
                                            </Button>
                                        </div>

                                        <div className="w-full md:w-1/2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full p-3 text-base border-bg-primary/50 text-bg-primary rounded-xl hover:bg-blue-50/50 transition-all duration-300"
                                                onClick={() => navigate(-1)}
                                                disabled={loadingChange}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>                                </form>
                            </CardContent>
                        </div>
                    </div>
                </Card>
            </div>

            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
};

export default EditCompanyProfile;