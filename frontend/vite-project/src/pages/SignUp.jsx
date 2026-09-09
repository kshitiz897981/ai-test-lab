import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function SignUp() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/auth/register", form);
            navigate("/login");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <span className="inline-block bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-blue-500/20 mb-3">
                        Internal Platform
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">
                        Sign up to get access to AI Test Lab
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-600 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-600 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-600 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition duration-150 flex items-center justify-center space-x-2"
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        <span>{loading ? "Creating account..." : "Sign Up"}</span>
                    </button>
                </form>

                {/* Link to Login */}
                <p className="text-center text-sm text-slate-400 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-400 hover:underline font-medium">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default SignUp;