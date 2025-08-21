import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "./Layout/AdminLayout";
import { SidebarProvider } from "./components/ui/sidebar";
import ProtAuth from "./Auth/ProtAuth";
import LoginEmployer from "./Pages/Autherzation/LoginEmployer";
import NotFound from "./Pages/NotFound";
import ProtectedRoute from "./Auth/ProtectedRoute";
import AuthLayout from "./Layout/AuthLayout";
import CompanyProfile from "./Pages/Employer/CompanyProfile/CompanyProfile";
import RegisterEmployer from "./Pages/Autherzation/RegisterEmployer";
import AddNewCompany from "./Pages/Autherzation/AddNewCompany";
import EditCompanyProfile from "./Pages/Employer/CompanyProfile/EditCompanyProfile";
import ChangePassword from "./Pages/Employer/CompanyProfile/ChangePassword";
import JobsManagment from "./Pages/Employer/JobsManagment/JobsManagment";
import AddJob from "./Pages/Employer/JobsManagment/AddJob";
import Plans from "./Pages/Employer/Plans/Plans";
import Cv from "./Pages/Employer/Cv/Cv";

const router = createBrowserRouter([
  // ✅ صفحات تسجيل الدخول و auth layout
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <ProtAuth>
            <LoginEmployer />
          </ProtAuth>
        ),
      },
      {
        path: "register",
        element: (
          <ProtAuth>
            <RegisterEmployer />
          </ProtAuth>
        ),
      },
      {
        path: "add_company",
        element: (
          <ProtAuth>
            <AddNewCompany />
          </ProtAuth>
        ),
      },
      {
        path: "plans_list",
        element: (
          <ProtAuth>
            <Plans />
          </ProtAuth>
        ),
      },
    ],
  },

  // ✅ الصفحات المحمية داخل MainLayout
  {
    element: (
        <ProtectedRoute>  
        <SidebarProvider>
          <AdminLayout />
        </SidebarProvider>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <CompanyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "edit_company",
        element: <EditCompanyProfile />,
      },
      {
        path: "change_password",
        element: <ChangePassword />,
      },
      {
        path: "jobs",
        children: [
          { index: true, element: <JobsManagment /> },
          { path: "add", element: <AddJob /> },
        ],
      },
      {
        path: "search_cv",
        element: <Cv/>
      },
      {
        path: "plans",
        children: [
          { index: true, element: <Plans /> },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
