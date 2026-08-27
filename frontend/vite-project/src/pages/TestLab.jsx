import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const TestLab = () => {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const response = await api.get("/projects");

            setProjects(response.data.projects || []);
        } catch (error) {
            console.error("Failed to load projects:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#080a0f] text-white">

            <div className="max-w-6xl mx-auto p-8">

                <p className="font-mono text-[10px] text-slate-600 tracking-widest">
                    TEST ENGINE
                </p>

                <h1 className="text-3xl font-semibold mt-2">
                    Test Lab
                </h1>

                <p className="text-sm text-slate-500 mt-2">
                    Select a project to generate and execute AI test cases.
                </p>

                <div className="mt-8 space-y-3">

                    {projects.length === 0 ? (

                        <div className="border border-dashed border-white/10 p-12 text-center">
                            <p className="font-mono text-sm text-slate-500">
                                NO PROJECTS FOUND
                            </p>
                        </div>

                    ) : (

                        projects.map((project) => (

                            <div
                                key={project._id}
                                className="border border-white/10 bg-[#0d1016] p-5 flex justify-between items-center hover:border-violet-400/20 transition"
                            >

                                <div>
                                    <h2 className="font-medium">
                                        {project.name}
                                    </h2>

                                    <p className="text-xs text-slate-500 mt-1">
                                        {project.githubOwner && project.githubRepo
                                            ? `${project.githubOwner}/${project.githubRepo}`
                                            : "Repository not connected"}
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        navigate(`/projects/${project._id}`)
                                    }
                                    className="border border-violet-400/20 px-4 py-2 text-[10px] font-mono text-violet-300 hover:bg-violet-400/10 transition"
                                >
                                    OPEN LAB
                                </button>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>
    );
};

export default TestLab;