
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Star, CheckCircle } from "lucide-react"; // Import CheckCircle for the 'Your Plan' badge
import { Link, useNavigate } from "react-router-dom";
import { useGet } from "@/Hooks/UseGet";
import { useDelete } from "@/Hooks/useDelete";
import { usePost } from "@/Hooks/UsePost";
import DeleteDialog from "@/components/DeleteDialog";
import FullPageLoader from "@/components/Loading";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

const Plans = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    // Use optional chaining for safer access to nested properties
    const userPlanId = userData?.subscription?.plan_id;
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const { refetch: refetchPlans, loading: loadingPlans, data: dataPlans } = useGet({
        url: `${apiUrl}/employeer/getPlans`,
    });
    const { refetch: refetchPaymentMethod, loading: loadingPaymentMethod, data: dataPaymentMethod } = useGet({
        url: `${apiUrl}/employeer/getPaymentMethods`,
    });
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/employeer/makePlanPyament`,
    });

    const [plans, setPlans] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("monthly"); // Default to monthly tab
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [selectedReceiptImage, setSelectedReceiptImage] = useState(null);
    const [receiptImageBase64, setReceiptImageBase64] = useState(null);

    useEffect(() => {
        refetchPlans();
        refetchPaymentMethod();
    }, [refetchPlans, refetchPaymentMethod]);

    useEffect(() => {
        if (dataPlans?.plans) {
            const formatted = dataPlans.plans.map((plan) => ({
                id: plan.id,
                name: plan.name,
                description: plan.description,
                price: plan.price,
                price_after_discount: plan.price_after_discount || plan.price,
                status: plan.status,
                type: plan.type,
                features: plan.features,
                created_at: plan.created_at,
                updated_at: plan.updated_at,
                top_picked: plan.top_picked,
                job_categories: Array.isArray(plan.job_categories)
                    ? plan.job_categories.map((s) => ({
                        id: s?.id,
                        name: s?.name || "—",
                    }))
                    : [],
            }));
            setPlans(formatted);
        }
    }, [dataPlans]);

    useEffect(() => {
        if (dataPaymentMethod?.active_payment_method) {
            const formatted = dataPaymentMethod.active_payment_method.map((method) => ({
                id: method.id,
                name: method.name,
                account: method.account,
                image: method.image_link,
            }));
            setPaymentMethods(formatted);
        }
    }, [dataPaymentMethod]);

    // Convert file to base64
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    useEffect(() => {
        if (response && response.status === 200) { // Assuming a 200 status code for success
            toast.success("Plan Buy successfully!");
            setIsModalOpen(false);
            setSelectedPaymentMethod(null);
            setSelectedReceiptImage(null);
            setReceiptImageBase64(null);
            refetchPlans();
        }
        if (response && response.status !== 200) {
            toast.error(response.message || "Failed to submit payment. Please try again.");
        }
    }, [response, refetchPlans]); // Add refetchPlans to the dependency array


    const handleSubmit = async (planId, paymentMethodId) => {
        const body = new FormData();
        body.append("plan_id", planId);
        body.append("payment_method_id", paymentMethodId);
        if (receiptImageBase64) {
            // Sending as base64
            body.append("receipt_image", receiptImageBase64);
        }

        postData(body);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedReceiptImage(file);
            const base64String = await convertToBase64(file);
            setReceiptImageBase64(base64String);
        }
    };

    const PlanCard = ({ plan }) => {
        // Check if the current plan is the user's active plan
        const isCurrentPlan = userPlanId === plan.id;

        return (
            <div
                className={`flex flex-col justify-between bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-300 ${isCurrentPlan ? "border-blue-600 shadow-blue-200 scale-105" : "border-gray-200 hover:border-blue-300 hover:shadow-xl"
                    } w-full max-w-sm mx-auto`}
            >
                <div className="flex flex-col">
                    {/* Top badges */}
                    <div className="flex justify-end space-x-2 mb-4">
                        {isCurrentPlan && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white flex items-center shadow-md">
                                <CheckCircle className="w-4 h-4 mr-1" /> Your Plan
                            </span>
                        )}
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${plan.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                        </span>
                        {plan.top_picked === 1 && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                                <Star className="w-4 h-4 mr-1" /> Top Picked
                            </span>
                        )}
                    </div>

                    {/* Plan Name and Price */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{plan.name}</h3>
                    <div className="text-center mb-4">
                        <p className="text-3xl font-bold text-blue-600 flex items-center justify-center">
                            {/* Display original price with strikethrough if there's a discount */}
                            {plan.price_after_discount} EGP
                            {plan.price_after_discount < plan.price && (
                                <span className="text-sm text-gray-400 line-through ml-2">{plan.price} EGP</span>
                            )}
                        </p>
                        <p className="text-sm text-gray-500">per {plan.type}</p>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2 mb-6 text-sm text-gray-600 min-h-[150px]"> {/* Added min-height for consistent card size */}
                        {Object.entries(plan.features).map(([key, feature], index) => (
                            <li key={index} className="flex items-start">
                                <svg className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{typeof feature === "object" ? feature.value || "—" : feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Buy Now Button */}
                <div className="mt-6 text-center">
                    <Button
                        className={`w-full py-3 rounded-lg text-white font-semibold transition-colors duration-200 ${isCurrentPlan
                            ? "bg-gray-400 cursor-not-allowed border border-gray-500" // Disabled state for current plan
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        onClick={() => {
                            if (!isCurrentPlan) {
                                setSelectedPlan(plan);
                                setIsModalOpen(true);
                            }
                        }}
                        disabled={isCurrentPlan} // Disable button for the current plan
                    >
                        {isCurrentPlan ? "Current Plan" : "Choose Plan"}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <h2 className="text-4xl font-extrabold text-bg-primary mb-4 md:mb-0">Our Plans</h2>
                {/* Enhanced Yearly/Monthly Tabs */}
                <div className="flex bg-white p-1 rounded-full shadow-inner">
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab("monthly")}
                        className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${activeTab === "monthly" ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Monthly
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab("yearly")}
                        className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 relative ${activeTab === "yearly" ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Yearly
                        <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full rotate-6 transform origin-top-right">
                            Save 20%
                        </span>
                    </Button>
                </div>
            </div>

            {loadingPlans ? (
                <FullPageLoader />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-8">
                    {plans
                        .filter((plan) => plan.type === activeTab)
                        .map((plan) => (
                            <PlanCard key={plan.id} plan={plan} />
                        ))}
                </div>
            )}

            <div className="mt-12 p-8 bg-white rounded-2xl shadow-xl">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Packages?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-700">
                    <div className="flex flex-col items-center text-center p-4">
                        <CheckCircle className="w-10 h-10 text-blue-600 mb-3" />
                        <h4 className="font-semibold text-lg mb-2">Quality Candidates</h4>
                        <p className="text-sm">Access a curated pool of top-tier professionals and experienced candidates.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4">
                        <CheckCircle className="w-10 h-10 text-blue-600 mb-3" />
                        <h4 className="font-semibold text-lg mb-2">Advanced Search</h4>
                        <p className="text-sm">Use our powerful filters and search tools to find the perfect match quickly.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4">
                        <CheckCircle className="w-10 h-10 text-blue-600 mb-3" />
                        <h4 className="font-semibold text-lg mb-2">Direct Contact</h4>
                        <p className="text-sm">Communicate directly with candidates and manage your recruitment process seamlessly.</p>
                    </div>
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-2xl transform transition-all duration-300">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900 text-center mb-4">
                            Select Payment Method
                        </DialogTitle>
                        <p className="text-center text-gray-600">for {selectedPlan?.name} plan</p>
                    </DialogHeader>
                    {!selectedPaymentMethod ? (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className="flex items-center p-5 bg-white rounded-xl transition-all duration-200 cursor-pointer border-2 border-gray-200 hover:border-blue-500 shadow-sm hover:shadow-lg"
                                    onClick={() => setSelectedPaymentMethod(method)}
                                >
                                    {method.image && <img src={method.image} alt={method.name} className="w-16 h-16 rounded-lg mr-5 object-cover shadow-md" />}
                                    <div className="flex-1">
                                        <p className="text-xl font-semibold text-gray-800">{method.name}</p>
                                        <p className="text-sm text-gray-500 mt-1">{method.account}</p>
                                    </div>
                                    <Button
                                        className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition-colors shrink-0"
                                    >
                                        Select
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Selected Payment Method Display */}
                            <div className="flex items-center p-5 bg-blue-50 rounded-xl border-2 border-blue-500 shadow-inner">
                                {selectedPaymentMethod.image && <img src={selectedPaymentMethod.image} alt={selectedPaymentMethod.name} className="w-16 h-16 rounded-lg mr-5 object-cover" />}
                                <div className="flex-1">
                                    <p className="text-xl font-semibold text-gray-800">{selectedPaymentMethod.name}</p>
                                    <p className="text-sm text-gray-600 mt-1">{selectedPaymentMethod.account}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                                    onClick={() => setSelectedPaymentMethod(null)}
                                >
                                    Change
                                </Button>
                            </div>
                            {/* Upload Receipt Section */}
                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-3">
                                    Upload Receipt Image
                                </label>
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                />
                                {selectedReceiptImage && (
                                    <p className="text-sm text-green-600 mt-2 flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Image selected: {selectedReceiptImage.name}
                                    </p>
                                )}
                            </div>
                            {/* Confirm Payment Button */}
                            <Button
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
                                onClick={() => handleSubmit(selectedPlan.id, selectedPaymentMethod.id)}
                                disabled={!selectedReceiptImage}
                            >
                                Confirm Payment
                            </Button>
                        </div>
                    )}
                    <DialogFooter className="mt-8">
                        <Button
                            variant="outline"
                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => {
                                setIsModalOpen(false);
                                setSelectedPaymentMethod(null);
                                setSelectedReceiptImage(null);
                                setReceiptImageBase64(null);
                            }}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Plans;
