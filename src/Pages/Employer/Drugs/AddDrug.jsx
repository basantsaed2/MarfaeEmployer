import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Add from '@/components/AddFieldSection';
import { ArrowLeft } from 'lucide-react';
import { usePost } from '@/Hooks/UsePost';
import { useChangeState } from '@/Hooks/useChangeState';
import { useGet } from '@/Hooks/UseGet';
import { toast } from 'react-toastify';
import FullPageLoader from '@/components/Loading';
import { useSelector } from "react-redux";

const AddDrug = ({ lang = 'en' }) => {
    const { employer } = useSelector((state) => state.auth); // Get employer from Redux store
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { postData, loadingPost, response: postResponse } = usePost({ url: `${apiUrl}/employeer/add-drug` });
    const { changeState, loadingChange, responseChange } = useChangeState();
    const { refetch: refetchDrugCategory, loading: loadingDrugCategory, data: dataDrugCategory } = useGet({ url: `${apiUrl}/employeer/get-drug-categories` });

    const [Categories, setCategories] = useState([]);
    const [imageChanged, setImageChanged] = useState(false); // New state to track image changes

    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;
    const initialItemData = state?.itemData || null;

    const isEditMode = !!initialItemData;
    const title = isEditMode ? 'Edit Drug' : 'Add Drug';

    useEffect(() => {
        refetchDrugCategory();
    }, [refetchDrugCategory]);

    useEffect(() => {
        if (dataDrugCategory && dataDrugCategory.drug_categories) {
            const formatted = dataDrugCategory.drug_categories.map((u) => ({
                label: u.name || "—",
                value: u.id.toString() || "",
            }));
            setCategories(formatted);
        }
    }, [dataDrugCategory]);

    const fields = [
        { name: 'name', type: 'input', placeholder: 'Drug Name *' },
        { name: 'description', type: 'input', placeholder: 'Drug Description' },
        {
            name: 'price',
            type: 'input',
            placeholder: 'Price *',
            inputType: 'number',
        },
        {
            name: 'drug_category_id',
            type: 'select',
            placeholder: 'Choose the category *',
            options: Categories,
        },
        { type: 'file', placeholder: 'Image', name: 'image', accept: 'image/*' },
    ];

    const [values, setValues] = useState({
        id: '',
        name: '',
        description: '',
        price: '',
        drug_category_id: '',
        image: null,
    });

    useEffect(() => {
        if (initialItemData) {
            setValues({
                id: initialItemData.id || '',
                name: initialItemData.name || '',
                description: initialItemData.description || '',
                price: initialItemData.price || '',
                drug_category_id: initialItemData.drug_category_id?.toString() || '',
                image: initialItemData.image || null, // Keep as URL/path or null
            });
            setImageChanged(false); // Reset imageChanged when loading initial data
        }
    }, [initialItemData]);

    const handleChange = (lang, name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        if (name === 'image' && value !== null) {
            setImageChanged(true); // Mark image as changed when a new file is selected
        }
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!values.name || !values.price || !values.drug_category_id) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (isEditMode) {
                const data = {
                    id: values.id,
                    name: values.name,
                    description: values.description,
                    price: values.price,
                    company_id: parseInt(employer.user?.company_id),
                    drug_category_id: parseInt(values.drug_category_id),
                };
                // Only include image if it was changed
                if (imageChanged && values.image) {
                    data.image = values.image;
                }
                await changeState(
                    `${apiUrl}/employeer/edit-drug/${values.id}`,
                    'Drug Updated Successfully!',
                    data
                );
            } else {
                const body = new FormData();
                body.append('name', values.name);
                body.append('description', values.description);
                body.append('price', values.price);
                body.append('company_id', employer.user?.company_id);
                body.append('drug_category_id', values.drug_category_id);
                if (values.image) {
                    body.append('image', values.image);
                }
                await postData(body, 'Drug Added Successfully!');
            }
        } catch (error) {
            toast.error('Failed to submit drug: ' + error.message);
        }
    };

    useEffect(() => {
        if ((!loadingChange && responseChange) || (!loadingPost && postResponse)) {
            navigate(-1);
        }
    }, [responseChange, postResponse, navigate]);

    const handleReset = () => {
        setValues(initialItemData ? {
            id: initialItemData.id || '',
            name: initialItemData.name || '',
            description: initialItemData.description || '',
            price: initialItemData.price || '',
            drug_category_id: initialItemData.drug_category_id?.toString() || '',
            image: initialItemData.image || null,
        } : {
            id: '',
            name: '',
            description: '',
            price: '',
            drug_category_id: '',
            image: null,
        });
        setImageChanged(false); // Reset imageChanged on reset
    };

    const handleBack = () => {
        navigate(-1);
    };

    if(loadingDrugCategory){
        return <FullPageLoader />;
    }

    return (
        <div className="p-4">
            <div className="flex items-center mb-4">
                <button
                    type="button"
                    onClick={handleBack}
                    className="p-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 mr-3"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-2xl text-bg-primary font-bold">{title}</h2>
            </div>

            <div className="py-10 px-4 bg-white rounded-lg shadow-md">
                <Add
                    fields={fields}
                    lang={lang}
                    values={values}
                    onChange={handleChange}
                />
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                    disabled={loadingPost || loadingChange}
                >
                    Reset
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-bg-secondary text-white rounded-md hover:bg-bg-secondary/90"
                    disabled={loadingPost || loadingChange}
                >
                    {loadingPost || loadingChange ? 'Submitting...' : isEditMode ? 'Update' : 'Submit'}
                </button>
            </div>
        </div>
    );
};

export default AddDrug;