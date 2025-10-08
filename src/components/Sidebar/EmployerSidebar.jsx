import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { BriefcaseBusiness, SquareChartGantt ,FileUser} from "lucide-react";
import { PiSignOutBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"; // Adjust the import path based on your project structure
import { RiAlarmWarningLine } from "react-icons/ri";
import { RiLockPasswordLine } from "react-icons/ri";
import { TbReportSearch } from "react-icons/tb";
import logo from "@/assets/Logo.jpeg"
import { MdOutlineAddToQueue, MdOutlinePersonSearch } from "react-icons/md";
import { GiPill } from "react-icons/gi";
const navItems = [
    { label: "Company Profile", to: "/", icon: <CgProfile size={20} /> },
    { label: "Jobs", to: "/jobs", icon: <BriefcaseBusiness className="stroke-2" size={20} /> },
    { label: "Add Job", to: "/add_job", icon: <MdOutlineAddToQueue size={20} /> },
    { label: "Drugs", to: "/drugs", icon: <GiPill className="stroke-1" size={20} /> },
    { label: "Plans", to: "/plans", icon: <SquareChartGantt className="stroke-2" size={20} /> },
    { label: "Applied Applications", to: "/applied_applications", icon: <FileUser size={20} /> },
    { label: "Assign CV", to: "/my_cv", icon: <TbReportSearch size={20} /> },
    { label: "Search User", to: "/search_user", icon: <MdOutlinePersonSearch size={20} /> },
    { label: "Change Password", to: "/change_password", icon: <RiLockPasswordLine size={20} /> },
    { label: "Sign Out", to: "/login", icon: <PiSignOutBold className="text-red-600" size={20} /> },
];

export function EmployerSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";
    const employer = useSelector((state) => state.auth.employer);

    const [expandedItems, setExpandedItems] = useState({});
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const initialExpanded = {};
        navItems.forEach((item) => {
            if (item.subItems) {
                const isParentActive = item.subItems.some((sub) =>
                    location.pathname.startsWith(sub.to)
                );
                if (isParentActive) {
                    initialExpanded[item.label] = true;
                }
            }
        });
        setExpandedItems(initialExpanded);
    }, [location.pathname]);

    const toggleExpand = (label) => {
        setExpandedItems((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const handleSignOutClick = () => {
        setShowModal(true);
    };

    const handleConfirmSignOut = () => {
        // Add sign-out logic here (e.g., clear employer from Redux store or localStorage)
        navigate("/login");
        setShowModal(false);
    };

    const handleCancelSignOut = () => {
        setShowModal(false);
    };

    return (
        <Sidebar
            side={isRTL ? "right" : "left"}
            className="bg-white border-none sm:border-none overflow-x-hidden h-full shadow-lg transition-all duration-300 font-cairo"
        >
            <SidebarContent
                className="bg-white !p-2 text-white border-none overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                }}
            >
                <SidebarGroup>
                    <SidebarGroupLabel className="p-2 text-white flex items-center justify-center gap-3">
                        <img
                            src={logo}
                            alt={logo || "Marfae"}
                            className="w-dull h-24 object-cover border-2 border-white/30 hover:scale-105 transition-transform duration-200"
                        />
                    </SidebarGroupLabel>
                    <hr className="w-full border-white !mb-3" />

                    <SidebarGroupContent>
                        <SidebarMenu className="list-none p-0 rounded-md flex flex-col gap-3">
                            {navItems.map((item) => {
                                const isActive = (() => {
                                    if (item.to === "/") {
                                        return location.pathname === "/";
                                    } else if (item.subItems) {
                                        return item.subItems.some((sub) => location.pathname.startsWith(sub.to));
                                    } else if (item.to) {
                                        return location.pathname.startsWith(item.to);
                                    }
                                    return false;
                                })();

                                const isExpanded = expandedItems[item.label];

                                return (
                                    <SidebarMenuItem key={item.label}>
                                        {item.to && !item.subItems && item.label !== "Sign Out" ? (
                                            <Link to={item.to}>
                                                <SidebarMenuButton
                                                    isActive={isActive}
                                                    className={`flex bg-bgsidebar justify-between items-center gap-3 p-2 text-white transition-all duration-200 text-base font-medium
                            ${isActive ? "shadow-md bg-bgsidebar" : "bg-white hover:bg-white hover:text-teal-600"}`}
                                                >
                                                    <div className="flex items-center gap-3 text-bg-primary">
                                                        {item.icon}
                                                        <span className="text-base text-textsidebar">{item.label}</span>
                                                    </div>
                                                </SidebarMenuButton>
                                            </Link>
                                        ) : item.label === "Sign Out" ? (
                                            <SidebarMenuButton
                                                onClick={handleSignOutClick}
                                                isActive={isActive}
                                                className={`flex bg-bgsidebar justify-between items-center gap-3 p-2 text-white transition-all duration-200 text-base font-medium
                            ${isActive ? "shadow-md bg-bgsidebar" : "bg-white hover:bg-white"}`}
                                            >
                                                <div className="flex items-center gap-3 text-bg-primary">
                                                    {item.icon}
                                                    <span className="text-base text-red-600">Sign Out</span>
                                                </div>
                                            </SidebarMenuButton>
                                        ) : (
                                            <SidebarMenuButton
                                                onClick={() => toggleExpand(item.label)}
                                                isActive={isActive}
                                                className={`flex justify-between items-center gap-3 !p-4 text-white transition-all duration-200 text-base font-medium
                          ${isActive ? "bg-white text-teal-600 shadow-md" : "hover:bg-white hover:text-teal-600"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.icon}
                                                    <span className="text-base">{item.label}</span>
                                                </div>
                                                {item.subItems && (
                                                    <span>{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                                                )}
                                            </SidebarMenuButton>
                                        )}

                                        {item.subItems && isExpanded && (
                                            <div className="!ml-6 !mt-1 flex flex-col gap-1">
                                                {item.subItems.map((subItem) => {
                                                    const isSubActive = location.pathname.startsWith(subItem.to);
                                                    return (
                                                        <Link to={subItem.to} key={subItem.label}>
                                                            <SidebarMenuButton
                                                                isActive={isSubActive}
                                                                className={`flex justify-start items-center gap-3 !px-4 !py-2 text-white transition-all duration-200 text-base
                                  ${isSubActive ? "bg-white text-teal-600 shadow-md" : "hover:bg-white hover:text-teal-600"}`}
                                                            >
                                                                {subItem.icon}
                                                                <span className="text-base">{subItem.label}</span>
                                                            </SidebarMenuButton>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-md bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold text-gray-800">
                                Are you sure you want to sign out?
                            </DialogTitle>
                        </DialogHeader>
                        <DialogFooter className="flex justify-end gap-4">
                            <Button
                                onClick={handleCancelSignOut}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                                No
                            </Button>
                            <Button
                                onClick={handleConfirmSignOut}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                            >
                                Yes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SidebarContent>
        </Sidebar>
    );
}