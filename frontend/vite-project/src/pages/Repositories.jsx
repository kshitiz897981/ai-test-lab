
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Repositories = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        loadRepositories();
    }, []);

    const loadRepositories = async () => {
        try {
            const response = await api.get("/projects");

            setProjects(response.data.projects || []);
        } catch (error) {
            console.error("Failed to load repositories:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080a0f] text-white">

            <div className="max-w-6xl mx-auto p-8">

                {/* HEADER */}
                <div className="mb-10">

                    <p className="font-mono text-[10px] text-slate-600 tracking-widest">
                        SOURCE CONTROL
                    </p>

                    <h1 className="text-3xl font-semibold mt-2">
                        Repositories
                    </h1>

                    <p className="text-sm text-slate-500 mt-2">
                        Connected GitHub repositories available for testing.
                    </p>

                </div>


                {/* LOADING */}
                {loading ? (

                    <div className="border border-white/10 p-12 text-center">

                        <p className="font-mono text-xs text-slate-500">
                            LOADING REPOSITORIES...
                        </p>

                    </div>

                ) : projects.length === 0 ? (

                    /* EMPTY STATE */
                    <div className="border border-dashed border-white/10 p-12 text-center">

                        <div className="text-3xl text-slate-700 mb-3">
                            ◌
                        </div>

                        <p className="font-mono text-sm text-slate-500">
                            NO REPOSITORIES CONNECTED
                        </p>

                        <p className="text-xs text-slate-700 mt-2">
                            Connect a GitHub repository to start testing.
                        </p>

                        <button
                            onClick={() => navigate("/dashboard")}
                            className="mt-6 border border-violet-400/20 px-5 py-2.5 text-[10px] font-mono text-violet-300 hover:bg-violet-400/10 transition"
                        >
                            GO TO OVERVIEW
                        </button>

                    </div>

                ) : (

                    /* REPOSITORIES */
                    <div className="space-y-3">

                        {projects.map((project) => (

                            <div
                                key={project._id}
                                className="border border-white/10 bg-[#0d1016] p-5 hover:border-violet-400/20 transition"
                            >

                                <div className="flex justify-between items-center gap-6">

                                    <div className="min-w-0">

                                        <div className="flex items-center gap-3">

                                            <span className="text-violet-400">
                                                ◉
                                            </span>

                                            <h2 className="font-medium truncate">
                                                {project.name}
                                            </h2>

                                        </div>

                                        <p className="font-mono text-xs text-slate-600 mt-2">
                                            {project.githubOwner &&
                                            project.githubRepo
                                                ? `${project.githubOwner}/${project.githubRepo}`
                                                : "GitHub repository not connected"}
                                        </p>

                                    </div>


                                    <div className="flex items-center gap-3">

                                        <span
                                            className={`font-mono text-[9px] px-2 py-1 border ${
                                                project.githubOwner &&
                                                project.githubRepo
                                                    ? "border-emerald-400/20 text-emerald-400"
                                                    : "border-yellow-400/20 text-yellow-400"
                                            }`}
                                        >
                                            {project.githubOwner &&
                                            project.githubRepo
                                                ? "CONNECTED"
                                                : "NOT CONNECTED"}
                                        </span>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/projects/${project._id}`
                                                )
                                            }
                                            className="border border-violet-400/20 px-4 py-2 text-[10px] font-mono text-violet-300 hover:bg-violet-400/10 transition"
                                        >
                                            OPEN
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
};

export default Repositories;

