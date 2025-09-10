import { useState } from "react";
import "../assets/css/register.css";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        birthday: "",
        gender: "male",
        email: "",
        phone: "",
        address: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        // Gọi API hoặc xử lý submit tại đây
    };

    return (
        <div className="page-wrapper bg-gra-02 p-t-130 p-b-100 font-poppins">
            <div className="wrapper wrapper--w680">
                <div className="card card-4">
                    <div className="card-body">
                        <h2 className="title">Registration Form</h2>
                        <form onSubmit={handleSubmit}>
                            {/* First + Last Name */}
                            <div className="row row-space">
                                <div className="col-2">
                                    <div className="input-group">
                                        <label className="label">First Name</label>
                                        <input
                                            className="input--style-4"
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-2">
                                    <div className="input-group">
                                        <label className="label">Last Name</label>
                                        <input
                                            className="input--style-4"
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Birthday + Gender */}
                            <div className="row row-space">
                                <div className="col-2">
                                    <div className="input-group">
                                        <label className="label">Birthday</label>
                                        <div className="input-group-icon">
                                            <input
                                                className="input--style-4"
                                                type="date"
                                                name="birthday"
                                                value={formData.birthday}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-2">
                                    <div className="input-group">
                                        <label className="label">Gender</label>
                                        <div className="p-t-10">
                                            <label className="radio-container m-r-45">
                                                Male
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="male"
                                                    checked={formData.gender === "male"}
                                                    onChange={handleChange}
                                                />
                                                <span className="checkmark"></span>
                                            </label>
                                            <label className="radio-container">
                                                Female
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="female"
                                                    checked={formData.gender === "female"}
                                                    onChange={handleChange}
                                                />
                                                <span className="checkmark"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email + Phone */}
                            <div className="row row-space">
                                <div className="col-2">
                                    <div className="input-group">
                                        <label className="label">Email</label>
                                        <input
                                            className="input--style-4"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-2">
                                    <div className="input-group">
                                        <label className="label">Phone Number</label>
                                        <input
                                            className="input--style-4"
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="input-group">
                                <label className="label">Address</label>                              
                                    <div className="input-group">
                                        <input
                                            className="input--style-4"
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                    </div>                              
                            </div>

                            {/* Submit */}
                            <div className="p-t-15">
                                <button className="btn btn--radius-2 btn--blue" type="submit">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
