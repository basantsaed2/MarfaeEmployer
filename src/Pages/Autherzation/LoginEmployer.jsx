import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { setEmployer } from "../../Store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import "react-toastify/dist/ReactToastify.css";
import { usePost } from "@/Hooks/UsePost";
import { FaStethoscope, FaHeartbeat, FaUserMd, FaSyringe } from "react-icons/fa";

const LoginEmployer = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/login`,
  });
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const container = entry.target;
          const bgImage = container.dataset.bgImage;
          if (bgImage) {
            container.style.setProperty('--bg-image', `url(${bgImage})`);
            container.classList.add('loaded');
            observer.disconnect();
          }
        }
      },
      { rootMargin: '100px' }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const localUser = localStorage.getItem("employer");
    if (localUser) {
      toast.info("You are already logged in");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      toast.error("Email/Username and password are required");
      return;
    }
    const body = new FormData();
    body.append("email", emailOrUsername);
    body.append("password", password);
    postData(body);
  };

  useEffect(() => {
    if (!loadingPost && response) {
      if (response.data.message === "Employeer account is not active yet") {
        setIsModalOpen(true);
      } else if (response.status === 200 && response.data?.user?.role === "employeer") {
        toast.success("Login successfully");
        dispatch(setEmployer(response?.data));
        localStorage.setItem("employer", JSON.stringify(response?.data));
        localStorage.setItem("token", response?.data.token);
        const redirectTo = new URLSearchParams(location.search).get("redirect");
        navigate(redirectTo || "/");
      } else if (response.status === 200 && response.data?.user?.role !== "employeer") {
        toast.error("You do not have employer role");
      }
    }
  }, [response, loadingPost, navigate, dispatch]);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-bg-primary/40 to-white bg-cover bg-center relative overflow-hidden"
      ref={containerRef}
      data-bg-image="https://images.unsplash.com/photo-1580281780460-82d277b0e3f8"
    >
      {/* Background image overlay */}
      <div className="absolute inset-0 bg-[var(--bg-image)] bg-cover bg-center opacity-20"></div>

      {/* Decorative medical elements */}
      <div className="absolute top-8 left-8 text-bg-primary opacity-30 text-6xl">
        <FaStethoscope />
      </div>
      <div className="absolute bottom-8 right-8 text-bg-primary opacity-30 text-6xl">
        <FaHeartbeat />
      </div>
      <div className="absolute top-1/4 right-12 text-bg-primary opacity-25 text-5xl">
        <FaUserMd />
      </div>
      <div className="absolute bottom-1/4 left-12 text-bg-primary opacity-25 text-5xl">
        <FaSyringe />
      </div>

      <div className="relative z-10 max-w-md w-full">
        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-bg-primary/50 overflow-hidden ring-1 ring-bg-primary/30">
          <CardContent className="p-12">
            <div className="text-center mb-10">
              <h2 className="text-5xl font-extrabold text-bg-primary tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-bg-primary to-blue-300">
                Login Mrfae
              </h2>
              <p className="text-gray-500 mt-4 text-lg font-medium">
                Seamless access for medical jobs
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Email or Username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="w-full p-4 pr-12 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
                  disabled={loadingPost}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bg-primary">
                  <FaUserMd />
                </span>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pr-12 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
                  disabled={loadingPost}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bg-primary">
                  <FaHeartbeat />
                </span>
              </div>
              <div>
                <Button
                  type="submit"
                  className="w-full p-4 text-lg bg-gradient-to-r from-bg-primary to-blue-300 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 shadow-lg"
                  disabled={loadingPost}
                >
                  {loadingPost ? "Logging in..." : "Login Mrfae"}
                </Button>
              </div>
            </form>
            <p className="text-center text-gray-500 mt-6 text-sm">
              New to Mrfae?{" "}
              <Link
                to="/register"
                className="text-bg-primary font-semibold hover:underline hover:text-blue-500 transition-colors duration-200"
              >
                Register Now
              </Link>
            </p>
            <p className="mt-3 text-center text-sm text-gray-500">
              Log in as an User?{" "}
              <a
                href="https://mrfae.com/login"
                className="font-semibold text-blue-600 hover:underline hover:text-blue-700 transition-colors duration-200"
              >
                User Login
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal for inactive account */}
      <Dialog className="bg-white" open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white/90 backdrop-blur-xl rounded-xl border border-bg-primary/50">
          <DialogHeader>
            <DialogTitle className="text-bg-primary text-2xl">Account Not Active</DialogTitle>
            <DialogDescription className="text-bg-primary/70">
              Your account is not active yet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleModalClose}
              className="bg-gradient-to-r from-bg-primary to-blue-300 text-white rounded-xl hover:from-blue-700 hover:to-blue-500"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default LoginEmployer;