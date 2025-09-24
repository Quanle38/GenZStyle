import { useState, type Dispatch, type SetStateAction } from "react";
import * as yup from "yup";

interface IUserProfileTab {
    errors: Record<string, string>;
    setErrors: Dispatch<SetStateAction<Record<string, string>>>;

}

export function UserProfileTab({ errors, setErrors }: IUserProfileTab) {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        birthday: "",
        gender: "male",
        email: "",
        phone: "",
        address: "",
    });

    const today = new Date();
    const minBirthDate = new Date(
        today.getFullYear() - 16,
        today.getMonth(),
        today.getDate()
    );
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
        address: yup.string().required("Please Enter Your Address !").trim()
    });
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await schema.validate(form, { abortEarly: false });
            setErrors({});
            console.log("✅ Form submitted:", form);
            setIsEdit(false);
        } catch (err) {
            if (err instanceof yup.ValidationError) {
                const newErrors: Record<string, string> = {};
                err.inner.forEach((e) => {
                    if (e.path) newErrors[e.path] = e.message;
                });
                console.log(" Error:", newErrors);
                setErrors(newErrors);

            }
        }
        
    };


    return (
       
        <div >
             <form name="form_edit" className="flex flex-col md:flex-row"  onSubmit={(e)=>{
                 setIsEdit(true);
                 e.preventDefault();
                 handleSubmit();
            }}>
            {/* Left section */}
            <div className="md:w-1/3 text-center mb-8 md:mb-0">
                <img
                    src="https://i.pravatar.cc/300"
                    alt="Profile"
                    className="rounded-full w-48 h-48 mx-auto mb-4 border-4 border-indigo-800 dark:border-blue-900 transition-transform duration-300 hover:scale-105"
                />
                <h1 className="text-2xl font-bold text-indigo-800 dark:text-white mb-2">
                    John Doe
                </h1>
                <p className="text-gray-600 dark:text-gray-300">Software Developer</p>
                <button
                    className="mt-4 bg-indigo-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors duration-300"
                >
                    {!isEdit ? "Edit Profile" : "Save Changes"}
                </button>
            </div>

            {/* Right section */}
            
                <div className="md:w-2/3 md:pl-8" >
                    <h2 className="text-xl font-semibold text-indigo-800 dark:text-white mb-4">
                        Contact Information
                    </h2>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        {/* Email */}
                        <li className="flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-indigo-800 dark:text-blue-900"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {isEdit ? (
                                <input
                                    type="email"
                                    defaultValue="john.doe@example.com"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            ) : (
                                <p>john.doe@example.com</p>
                            )}
                        </li>

                        {/* Phone */}
                        <li className="flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-indigo-800 dark:text-blue-900"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {isEdit ? (
                                <input
                                    type="text"
                                    defaultValue="+1 (555) 123-4567"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            ) : (
                                <p>+1 (555) 123-4567</p>
                            )}
                        </li>

                        {/* Location */}
                        <li className="flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-indigo-800 dark:text-blue-900"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {isEdit ? (
                                <>
                                    <input
                                        onChange={(e) => handleChange(e)}
                                        name="address"
                                        type="text"
                                        defaultValue="San Francisco, CA"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    />
                                 
                                </>
                            ) : (
                                <p>{form.address || "San Francisco, CA"}</p>
                            )}
                        </li>
                        <li>
                               {errors.address && (
                                      <>
                                      <p className="mt-1 text-sm text-red-500 block">{errors.address}</p>
                                      </>
                                    )}
                        </li>
                    </ul>

                    {/* Personal Information */}
                    <h2 className="text-xl font-semibold text-indigo-800 dark:text-white mb-4 mt-[15px]">
                        Personal Information
                    </h2>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                        {/* First Name */}
                        <li className="flex items-center">
                            <span className="w-28 font-medium">First Name:</span>
                            {isEdit ? (
                                <input
                                    type="text"
                                    value={form.first_name}
                                    onChange={(e) =>
                                        setForm({ ...form, first_name: e.target.value })
                                    }
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            ) : (
                                <p>{form.first_name || "John"}</p>
                            )}
                        </li>

                        {/* Last Name */}
                        <li className="flex items-center">
                            <span className="w-28 font-medium">Last Name:</span>
                            {isEdit ? (
                                <input
                                    type="text"
                                    value={form.last_name}
                                    onChange={(e) =>
                                        setForm({ ...form, last_name: e.target.value })
                                    }
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            ) : (
                                <p>{form.last_name || "Doe"}</p>
                            )}
                        </li>

                        {/* Birthday */}
                        <li className="flex items-center">
                            <span className="w-28 font-medium">Birthday:</span>
                            {isEdit ? (
                                <input
                                    type="date"
                                    value={form.birthday}
                                    onChange={(e) =>
                                        setForm({ ...form, birthday: e.target.value })
                                    }
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            ) : (
                                <p>{form.birthday || "1995-05-10"}</p>
                            )}
                        </li>

                        {/* Gender */}
                        <li className="flex items-center">
                            <span className="w-28 font-medium">Gender:</span>
                            {isEdit ? (
                                <select
                                    value={form.gender}
                                    onChange={(e) =>
                                        setForm({ ...form, gender: e.target.value })
                                    }
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            ) : (
                                <p className="capitalize">{form.gender}</p>
                            )}
                        </li>
                    </ul>

                    {isEdit && (
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => console.log("a")}
                                className="bg-indigo-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}