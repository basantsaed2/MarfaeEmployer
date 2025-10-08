import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";

export const useChangeState = () => {
  const { employer } = useSelector((state) => state.auth); // Get employer from Redux store
  const [loadingChange, setLoadingChange] = useState(false);
  const [responseChange, setResponseChange] = useState(null);

  const changeState = async (url, name, data) => { // Accepting a single "data" object
    setLoadingChange(true);
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${employer?.token || ''}`,
        },
      };
      const response = await axios.put(url, data || {}, config);

      if (response.status === 200) {
        setResponseChange(response);
        toast.success(name);
        return true; // Return true on success
      }
    } catch (error) {
      console.error('Error put JSON:', error);
      if (error?.response?.data?.errors) {
        if (typeof error.response.data.errors === "object") {
          Object.entries(error.response.data.errors).forEach(
            ([field, messages]) => {
              if (Array.isArray(messages)) {
                messages.forEach((message) => {
                  toast.error(message);
                });
              } else {
                toast.error(messages);
              }
            }
          );
        } else {
          toast.error(error.response.data.errors);
        }
      } else if (error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An unknown error occurred.");
      }

      // Still set the response for error cases to allow component to handle it
      setResponseChange(error.response);
      return error.response;
    } finally {
      setLoadingChange(false);
    }
  };

  return { changeState, loadingChange, responseChange };
};
