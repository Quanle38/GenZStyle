import { Image } from "antd";
import { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { registerThunk } from "../features/auth/authSlice";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";


export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birthday: "",
    gender: "male",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm_password: "",
    file: null as File | null,
  });

  const dispatch = useAppDispatch();
  const { setAccessToken } = useAuth()
  const { error, isLoading } = useAppSelector(state => state.auth)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({ ...prev, file: file || null }));
  };
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleRemoveAvatar = () => {
    setFormData({ ...formData, file: null });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  const today = new Date();
  const minBirthDate = new Date(
    today.getFullYear() - 16,
    today.getMonth(),
    today.getDate()
  );
  // Yup schema
  const schema = yup.object().shape({
    first_name: yup
      .string()
      .required("Required")
      .min(3, "Min 3 chars")
      .max(10, "Max 10 chars")
      .trim(),
    last_name: yup.string().required("Required").trim(),
    email: yup.string().required("Required").email("Email invalid").trim(),
    password: yup
      .string()
      .required("Password required")
      .min(6, "At least 6 characters")
      .trim(),
    confirm_password: yup
      .string()
      .required("Please confirm password")
      .oneOf([yup.ref("password")], "Passwords must match"),
    birthday: yup
      .date()
      .required("Birthday required")
      .test("birthday-check", "Invalid birthday", (value, ctx) => {
        if (!value) return false;

        if (value > today) {
          return ctx.createError({ message: "Birthday cannot be in the future" });
        }

        if (value > minBirthDate) {
          return ctx.createError({ message: "You must be at least 16 years old" });
        }

        return true;
      }),
    phone: yup.string().required("Please enter your PhoneNumber !").trim()
      .matches(/^(?:\+84|0)(3|5|7|8|9)\d{8}$/, "Invalid Vietnamese phone number"),
    address: yup.string().required("Please Enter Your Address !").trim(),
    file: yup
      .mixed()
      .nullable()
      .test("fileSize", "Max size 100MB", (value) => {
        const file = value as File | null;
        if (!file) return true;
        return file.size <= 100 * 1024 * 1024;
      })
      .test("fileType", "Only .jpg/.png allowed", (value) => {
        const file = value as File | null;
        if (!file) return true;
        return ["image/jpeg", "image/png"].includes(file.type);
      }),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ Thêm dòng này

    if (isLoading) return;

    try {
      await schema.validate(formData, { abortEarly: false });
      setErrors({});

      const body = new FormData();
      body.append("first_name", formData.first_name);
      body.append("last_name", formData.last_name);
      body.append("email", formData.email);
      body.append("password", formData.password);
      body.append("birthday", formData.birthday);
      body.append("phone_number", formData.phone);
      body.append("gender", formData.gender);
      body.append("address", formData.address); // ✅ Thêm address vì schema require

      if (formData.file) {
        body.append("file", formData.file);
      }
      const result = await dispatch(registerThunk(body));

      if (registerThunk.fulfilled.match(result)) {
        const token = result.payload.access_token; // đổi theo API backend của bạn
        if (token) {
          setAccessToken(token); // ⬅️ Lưu token
        }

        toast.success("Register success!");
        window.location.href = "/"; // ⬅️ Redirect
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center gap-[30px] font-sans text-white">
      <div className="bg-gray-900/80 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-green-400 via-orange-500 to-yellow-400 flex items-center justify-center">
            <span className="text-2xl">👟</span>
          </div>
          <h2 className="text-3xl font-bold mt-4">
            <span className="text-green-400">Create</span>{" "}
            <span className="text-orange-400">Account</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Join the GenZStyle community
          </p>
        </div>

        {/* FORM */}
        <div className="flex gap-8 items-start">
          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
            {/* First + Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-sm font-medium">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 
                           focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
                {errors.first_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 
                           focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
                {errors.last_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 
                         focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Birthday + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-sm font-medium">Birthday</label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 
                           focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
                {errors.birthday && (
                  <p className="text-red-400 text-sm mt-1">{errors.birthday}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Gender</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={handleChange}
                      className="accent-green-400"
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={handleChange}
                      className="accent-orange-400"
                    />
                    Female
                  </label>
                </div>
              </div>
            </div>
            {/* Avatar Upload */}
            <div>
              <label className="block mb-1 text-sm font-medium">Avatar</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 
               focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
              {errors.avatar && (
                <p className="text-red-400 text-sm mt-1">{errors.avatar}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1 text-sm font-medium">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 
                         focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block mb-1 text-sm font-medium">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 
                         focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
              {errors.address && (
                <p className="text-red-400 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 
                         focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-1 text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 
                         focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              {errors.confirm_password && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.confirm_password}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-400 via-orange-500 to-yellow-400 font-semibold text-black hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {formData.file && (
        <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-900 border border-gray-700 shadow-lg w-[260px]">

          <div className="w-[200px] h-[200px] rounded-full overflow-hidden border border-gray-600">
            <Image
              src={URL.createObjectURL(formData.file)}
              alt="preview"
              className="w-full h-full object-cover"
            />
          </div>

          <button
            type="button"
            className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-500 transition"
            onClick={() => handleRemoveAvatar()}
          >
            Remove Avatar
          </button>

        </div>
      )}

    </div>
  );
}
