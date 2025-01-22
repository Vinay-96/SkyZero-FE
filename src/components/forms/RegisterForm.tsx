import { useState } from "react";
import { useRouter } from "next/router";
import { Eye, EyeOff, Upload, Loader2 } from "lucide-react";
import { apiService } from "@/lib/api/services/api.service";

interface FormData {
  name: string;
  userName: string;
  gender: "male" | "female" | "other";
  phoneNumber: string;
  email: string;
  password: string;
  profilePicture: File | null;
}

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    userName: "",
    gender: "male",
    phoneNumber: "",
    email: "",
    password: "",
    profilePicture: null,
  });

  interface FormErrors extends Partial<FormData> {
    submit?: string;
  }

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (formData.name.length < 2) {
      newErrors.name = "Name should be at least 2 characters";
    }

    if (formData.userName.length < 3) {
      newErrors.userName = "Username should be at least 3 characters";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password should be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          profilePicture: "File size should be less than 5MB",
        });
        return;
      }

      setFormData({
        ...formData,
        profilePicture: file
          ? file
          : "https://wallpapercave.com/wp/wp4923332.jpg",
      });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name);
      formDataToSend.append("userName", formData.userName);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);

      // Append file only if it exists
      if (formData.profilePicture) {
        formDataToSend.append("profilePicture", formData.profilePicture);
      }

      await apiService.auth.register(formDataToSend);
      router.push("/login");
    } catch (err: any) {
      setErrors({
        ...errors,
        submit: err.response?.data?.message || "Registration failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-full h-full rounded-full object-cover border-4 border-indigo-500"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <label
            htmlFor="profile-upload"
            className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors"
          >
            <Upload className="w-4 h-4 text-white" />
          </label>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {errors.profilePicture && (
          <p className="text-red-500 text-sm">{errors.profilePicture}</p>
        )}
      </div>

      {/* Name & Username */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Name
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                         shadow-sm focus:border-indigo-500 focus:ring-indigo-500
                         dark:bg-gray-700 dark:text-white"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Username
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                         shadow-sm focus:border-indigo-500 focus:ring-indigo-500
                         dark:bg-gray-700 dark:text-white"
            value={formData.userName}
            onChange={(e) =>
              setFormData({ ...formData, userName: e.target.value })
            }
          />
          {errors.userName && (
            <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
          )}
        </div>
      </div>

      {/* Gender Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Gender
        </label>
        <div className="flex space-x-4">
          {["male", "female", "other"].map((gender) => (
            <label key={gender} className="flex items-center">
              <input
                type="radio"
                name="gender"
                value={gender}
                checked={formData.gender === gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as "male" | "female" | "other",
                  })
                }
                className="form-radio text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-200 capitalize">
                {gender}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Phone & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Phone Number
          </label>
          <input
            type="tel"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                         shadow-sm focus:border-indigo-500 focus:ring-indigo-500
                         dark:bg-gray-700 dark:text-white"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Email
          </label>
          <input
            type="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                         shadow-sm focus:border-indigo-500 focus:ring-indigo-500
                         dark:bg-gray-700 dark:text-white"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Password
        </label>
        <div className="mt-1 relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 
                         shadow-sm focus:border-indigo-500 focus:ring-indigo-500
                         dark:bg-gray-700 dark:text-white pr-10"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {errors.submit && (
        <p className="text-red-500 text-sm text-center">{errors.submit}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md
                     shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                     disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}

