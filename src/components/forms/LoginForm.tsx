import { useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/lib/zustand/store";
import { socketService } from "@/lib/socket";
import { apiService } from "@/lib/api/services/api.service";

export default function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.auth.login(formData);
      const { user, token } = response.data;
      setAuth(user, token);
      socketService.connect(token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Email
        </label>
        <input
          type="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                   shadow-sm focus:border-primary-light dark:focus:border-primary-dark 
                   focus:ring-primary-light dark:focus:ring-primary-dark
                   dark:bg-gray-700 dark:text-white transition-colors"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Password
        </label>
        <input
          type="password"
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                   shadow-sm focus:border-primary-light dark:focus:border-primary-dark 
                   focus:ring-primary-light dark:focus:ring-primary-dark
                   dark:bg-gray-700 dark:text-white transition-colors"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
      </div>

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent 
                 rounded-md shadow-sm text-sm font-medium text-white 
                 bg-primary-light dark:bg-primary-dark 
                 hover:bg-indigo-700 dark:hover:bg-indigo-400 
                 focus:outline-none focus:ring-2 focus:ring-offset-2 
                 focus:ring-primary-light dark:focus:ring-primary-dark
                 transition-colors"
      >
        Login
      </button>
    </form>
  );
}

