import { useState, type Dispatch, type SetStateAction } from "react";
import * as yup from "yup";

interface ISecurityTab {
    errorPass: Record<string, string>;
    setErrorPass : Dispatch<SetStateAction<Record<string, string>>>;
    setOtpModalOpen : Dispatch<SetStateAction<boolean>>;

}

export function SecurityTab({  errorPass, setErrorPass, setOtpModalOpen }: ISecurityTab) {

    const [formPass, setFormPass] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

      const schema = yup.object().shape({
            current_password: yup
                .string()
                .required("Required")
                .trim(),
            new_password: yup
                .string()
                .required("Required")
                .trim()
                 .notOneOf([yup.ref("current_password")], "New password must be different from current password"),
            confirm_password: yup
                .string()
                .required("Please confirm password")
                .oneOf([yup.ref("new_password")], "New Passwords must match"),
        });
    

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormPass((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await schema.validate(formPass, { abortEarly: false });
            setErrorPass({});
            console.log("✅ Form submitted:", formPass);

        } catch (err) {
            if (err instanceof yup.ValidationError) {
                const newErrors: Record<string, string> = {};
                err.inner.forEach((e) => {
                    if (e.path) newErrors[e.path] = e.message;
                });
                console.log(" Error:", newErrors);
                setErrorPass(newErrors);
            }
        }
        const plainObj = Object.assign({}, errorPass);
        if (Object.keys(plainObj).length === 0) {
            setOtpModalOpen(true);
        }
    };
    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold text-indigo-800 dark:text-white mb-4">
                Security Settings
            </h2>
            <form className="space-y-4" onSubmit={(e) => handleUpdatePassword(e)}>
                <div>
                    <label className="block mb-1 text-sm font-medium text-indigo-400">
                        Current Password
                    </label>
                    <input
                        name="current_password"
                        type="password"
                        value={formPass.current_password}
                        onChange={handleChangePassword}
                        className={`w-full px-3 py-2 rounded-lg border 
        ${errorPass.current_password ? "border-red-500" : "border-gray-300 dark:border-gray-600"} 
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                    />
                    {errorPass.current_password && (
                        <p className="mt-1 text-sm text-red-500">{errorPass.current_password}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-indigo-400">
                        New Password
                    </label>
                    <input
                        name="new_password"
                        type="password"
                        value={formPass.new_password}
                        onChange={handleChangePassword}
                        className={`w-full px-3 py-2 rounded-lg border 
        ${errorPass.new_password ? "border-red-500" : "border-gray-300 dark:border-gray-600"} 
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                    />
                    {errorPass.new_password && (
                        <p className="mt-1 text-sm text-red-500">{errorPass.new_password}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-indigo-400">
                        Confirm Password
                    </label>
                    <input
                        name="confirm_password"
                        type="password"
                        value={formPass.confirm_password}
                        onChange={handleChangePassword}
                        className={`w-full px-3 py-2 rounded-lg border 
        ${errorPass.confirm_password ? "border-red-500" : "border-gray-300 dark:border-gray-600"} 
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                    />
                    {errorPass.confirm_password && (
                        <p className="mt-1 text-sm text-red-500">{errorPass.confirm_password}</p>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <button
                        type="submit"
                        className="bg-indigo-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors duration-300"
                    >
                        Update Password
                    </button>
                    <a
                        href="#"
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Forget Password?
                    </a>
                </div>
            </form>

        </div>
    )
}