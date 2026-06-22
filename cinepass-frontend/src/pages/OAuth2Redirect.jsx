import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuth2Redirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Fetch user details
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem("user", JSON.stringify(data.data));
          // Dispatch a custom event so the Navbar can update immediately without a full reload
          window.dispatchEvent(new Event("auth-change"));
          navigate("/");
        } else {
          console.error("Failed to fetch user details", data);
          navigate("/login?error=true");
        }
      })
      .catch(err => {
        console.error("Error fetching user", err);
        navigate("/login?error=true");
      });
    } else {
      navigate("/login?error=true");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#e11d48] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/70 font-medium">Signing you in...</p>
      </div>
    </div>
  );
}
