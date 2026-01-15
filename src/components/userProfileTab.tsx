/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import type { Gender, Membership } from "../features/auth/authTypes";
import { formatDate } from "../utils/dayFormat";
import { getUserThunk, updateUserThunk } from "../features/user/userSlice";
import type { UpdateRequestBodyUser } from "../features/user/userTypes";
import { useAuth } from "../hooks/useAuth";
import { useNotificationContext } from "../contexts/notificationContext";

interface IUserProfileTab {
    errors: Record<string, string>;
    setErrors: Dispatch<SetStateAction<Record<string, string>>>;
}

export type ProfileForm = {
    first_name: string;
    last_name: string;
    birthday: string;
    gender: Gender;
    email: string;
    phone: string;
    membership: Membership;
    avatar: File | string | null;
};


export function UserProfileTab({ errors, setErrors }: IUserProfileTab) {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [form, setForm] = useState<ProfileForm>({
        first_name: "Unknow",
        last_name: "Unknow",
        birthday: "Unknow",
        gender: "MALE",
        email: "Unknow",
        phone: "Unknow",
        membership: "BRONZE",
        avatar: null,
    });
    const { user, isLoading } = useAppSelector((state) => state.user)
    const [editAbleForm, setEditAbleForm] = useState<ProfileForm>(form)
    const dispatch = useAppDispatch();
    const { userInfo } = useAuth();


    // ===== FETCH USER =====
    useEffect(() => {
        if (!userInfo?.id) return;
        dispatch(getUserThunk(userInfo.id));

    }, [userInfo?.id, dispatch]);

    // ===== SYNC REDUX → FORM =====
    useEffect(() => {
        if (!user) return;

        const mapped: ProfileForm = {
            first_name: user.first_name ?? "Unknown",
            last_name: user.last_name ?? "Unknown",
            birthday: user.dob ? user.dob.slice(0, 10) : "",
            gender: user.gender ?? "MALE",
            email: user.email ?? "",
            phone: user.phone_number ?? "",
            membership: user.membership_id ?? "BRONZE",
            avatar: user.avatar ?? "",
        };
        console.log("mapped", mapped.birthday);
        setForm(mapped);
        setEditAbleForm(mapped);
    }, [user]);

    const { notify } = useNotificationContext();
    // ===== SAVE USER =====
    const saveUser = async () => {
        if (!user) return;

        const payload: UpdateRequestBodyUser = {
            first_name: editAbleForm.first_name,
            last_name: editAbleForm.last_name,
            dob: new Date(editAbleForm.birthday),
            phone_number: editAbleForm.phone,
            gender: editAbleForm.gender,
        };
        try {
            await dispatch(
                updateUserThunk({
                    id: user.id,
                    body: payload,
                })
            ).unwrap();

            notify("Updated Successfully");
        } catch (error: any) {
            notify("Update Failed");
        }
    };


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
        birthday: yup
            .date()
            .required("Birthday required")
            .test("birthday-check", "Invalid birthday", (defaultValue, ctx) => {
                if (!defaultValue) return false;

                if (defaultValue > today) {
                    return ctx.createError({ message: "Birthday cannot be in the future" });
                }

                if (defaultValue > minBirthDate) {
                    return ctx.createError({ message: "You must be at least 16 years old" });
                }

                return true;
            }),
        phone: yup.string().required("Please enter your PhoneNumber !").trim()
            .matches(/^(?:\+84|0)(3|5|7|8|9)\d{8}$/, "Invalid Vietnamese phone number")
    });
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        console.log(value)
        setEditAbleForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleSubmit = async () => {
        try {
            await schema.validate(editAbleForm, { abortEarly: false });


            setErrors({});
            console.log("✅ Form submitted:", editAbleForm);
            await saveUser();
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
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!(editAbleForm.avatar instanceof File)) return;

        const url = URL.createObjectURL(editAbleForm.avatar);
        return () => URL.revokeObjectURL(url);
    }, [editAbleForm.avatar]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // optional validate
        if (!file.type.startsWith("image/")) {
            notify("Invalid image file");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            notify("Image must be under 2MB");
            return;
        }

        setEditAbleForm((prev) => ({
            ...prev,
            avatar: file,
        }));
    };


    if (isLoading || !user) {
        return (
            <div className="w-48 h-48 rounded-full bg-gray-300 dark:bg-gray-700 mb-4 
                flex items-center justify-center">
                <div className="w-10 h-10 
                  border-4 border-indigo-500 
                  border-t-transparent 
                  rounded-full 
                  animate-spin" />
            </div>
        )
    }

    return (

        <div >
            <form name="form_edit" className="flex flex-col md:flex-row" onSubmit={(e) => {
                setIsEdit(!isEdit);
                e.preventDefault();
                if (isEdit) {
                    handleSubmit()
                }

            }}>
                {/* Left section */}
                <div className="md:w-1/3 text-center mb-8 md:mb-0">
                    {/* Avatar */}
                    <div className="relative w-48 h-48 mx-auto mb-4 group">
                        <div
                            className={`w-full h-full rounded-full ${isEdit ? "cursor-pointer" : "cursor-default"
                                }`}
                            onClick={() => {
                                if (isEdit) setOpen(true);
                            }}
                        >
                            <img
                                src={
                                    editAbleForm.avatar instanceof File
                                        ? URL.createObjectURL(editAbleForm.avatar)
                                        : editAbleForm.avatar || "/default-avatar.png"
                                }
                                alt="Profile"
                                className={`rounded-full w-48 h-48 object-cover border-4 
        border-indigo-800 dark:border-blue-900 
        transition-all duration-300
        ${isEdit ? "group-hover:opacity-40" : ""}`}
                            />

                            {/* Overlay chỉ khi edit */}
                            {isEdit && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center 
        text-white font-semibold text-sm 
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-300"
                                >
                                    Change Avatar
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Name */}
                    <h1 className="text-2xl font-bold text-indigo-800 dark:text-white mb-2">
                        {editAbleForm.first_name}, {editAbleForm.last_name}
                    </h1>

                    <p className="text-gray-600 dark:text-gray-300"></p>

                    {/* Edit / Save button */}
                    <button
                        onClick={() => {
                            if (!isEdit) return;
                            handleSubmit();
                        }}
                        className="mt-4 bg-indigo-800 text-white px-4 py-2 rounded-lg 
               hover:bg-blue-900 transition-colors duration-300"
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
                            <p>{editAbleForm.email}</p>
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
                                    name="phone"
                                    type="text"
                                    onChange={(e) => handleChange(e)}
                                    defaultValue={editAbleForm.phone}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            ) : (
                                <p>{editAbleForm.phone}</p>
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
                                    name="first_name"
                                    type="text"
                                    defaultValue={editAbleForm.first_name}
                                    onChange={(e) => handleChange(e)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            ) : (
                                <p>{editAbleForm.first_name || "John"}</p>
                            )}
                        </li>
                        <li>
                            {errors.firtst && (
                                <>
                                    <p className="mt-1 text-sm text-red-500 block">{errors.address}</p>
                                </>
                            )}
                        </li>

                        {/* Last Name */}
                        <li className="flex items-center">
                            <span className="w-28 font-medium">Last Name:</span>
                            {isEdit ? (
                                <input
                                    name="last_name"
                                    type="text"
                                    defaultValue={editAbleForm.last_name}
                                    onChange={(e) => handleChange(e)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            ) : (
                                <p>{editAbleForm.last_name || "Doe"}</p>
                            )}
                        </li>

                        {/* Birthday */}
                        <li className="flex items-center">
                            <span className="w-28 font-medium">Birthday:</span>
                            {isEdit ? (
                                <input
                                    name="birthday"
                                    type="date"
                                    defaultValue={editAbleForm.birthday}
                                    onChange={(e) => handleChange(e)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            ) : (
                                <p>{formatDate(editAbleForm.birthday) || "1995-05-10"}</p>
                            )}
                        </li>

                        {/* Gender */}
                        <li className="flex items-center">
                            <span className="w-28 font-medium">Gender:</span>
                            {isEdit ? (
                                <select
                                    defaultValue={editAbleForm.gender}
                                    onChange={(e) => handleChange(e)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                >
                                    <option defaultValue="MALE">Male</option>
                                    <option defaultValue="FEMALE">Female</option>
                                </select>
                            ) : (
                                <p className="capitalize">{editAbleForm.gender}</p>
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
            {open && isEdit && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="relative bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                        >
                            ✕
                        </button>

                        <img
                            src={
                                editAbleForm.avatar instanceof File
                                    ? URL.createObjectURL(editAbleForm.avatar)
                                    : editAbleForm.avatar || "/default-avatar.png"
                            }
                            alt="Profile"
                            className="w-64 h-64 rounded-full mx-auto object-cover mb-4"
                        />

                        <label className="block text-center">
                            <span
                                className={`inline-block px-4 py-2 rounded-lg text-white
            ${isEdit
                                        ? "bg-indigo-600 cursor-pointer hover:bg-indigo-700"
                                        : "bg-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Thay đổi ảnh
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                disabled={!isEdit}
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>
                </div>
            )}

        </div>
    )
}