import { useState } from "react";
import "./UserSignupPage.css";

function UserSignupPage({ onNavigate }) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        console.log("User signup data:", formData);
        alert("User account created successfully!");

        setFormData({
            fullName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: ""
        });
    };

    const goHome = () => {
        if (typeof onNavigate === "function") {
            onNavigate("landing");
        } else {
            window.location.href = "/";
        }
    };

    return (
        <div className="user-signup-container">
            <div className="user-nav-bar">
                <button onClick={goHome}>LOGO</button>
            </div>

            <div className="user-signup-form-container">
                <h1>Create User Account</h1>

                <form onSubmit={handleSubmit} className="user-form">
                    <div className="user-form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="user-form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="user-form-group">
                        <label>Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div className="user-form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter password"
                        />
                    </div>

                    <div className="user-form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm password"
                        />
                    </div>

                    <button type="submit" className="user-submit-btn">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UserSignupPage;