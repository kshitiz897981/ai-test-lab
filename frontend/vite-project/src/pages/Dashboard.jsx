
import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate,useLocation } from "react-router-dom";

function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location=useLocation();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const [form, setForm] = useState({
        name: "",
        description: "",
        githubOwner: "",
        githubRepo: "",
        targetUrl: "",
        language: "JavaScript"
    });

    const deleteProject = async (projectId) => {
    try {
        await api.delete(`/projects/${projectId}`);

        setProjects(prev =>
            prev.filter(project => project._id !== projectId)
        );

    } catch (error) {
        console.error("DELETE PROJECT ERROR:", error);

        alert(
            error.response?.data?.message ||
            "Failed to delete project"
        );
    }
};

    const fetchProjects = async () => {
        try {
            const response = await api.get("/projects");
            setProjects(response.data.projects || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const createProject = async (e) => {
        e.preventDefault();

        try {
            setCreating(true);
            setCreateError("");

            const response = await api.post("/projects", form);

            const newProject =
                response.data.project ||
                response.data;

            setProjects((prev) => [
                newProject,
                ...prev
            ]);

            setForm({
                name: "",
                description: "",
                githubOwner: "",
                githubRepo: "",
                targetUrl: "",
                language: "JavaScript"
            });

            setShowCreateModal(false);

        } catch (error) {
            console.error(error);

            setCreateError(
                error.response?.data?.message ||
                "Failed to create project"
            );
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#08090d] text-slate-200">

            {/* Top bar */}
            <header className="h-16 border-b border-white/10 bg-[#0b0d12] px-6 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <div className="h-8 w-8 rounded-lg bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-violet-400">
                        ◈
                    </div>

                    <div>

                        <h1 className="font-semibold tracking-wide">
                            AI TEST LAB
                        </h1>

                        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-600">
                            intelligent test infrastructure
                        </p>

                    </div>

                </div>


                <div className="flex items-center gap-5">

                    <div className="flex items-center gap-2 text-xs text-emerald-400">

                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />

                        SYSTEM ONLINE

                    </div>

                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
                        K
                    </div>

                </div>

            </header>


            <div className="flex">

                {/* Sidebar */}
                <aside className="hidden md:flex w-56 min-h-[calc(100vh-4rem)] border-r border-white/10 bg-[#0b0d12] p-4 flex-col">

                    <div className="space-y-1">

                        <p className="px-3 mb-3 text-[10px] uppercase tracking-[0.25em] text-slate-600">
                            Workspace
                        </p>

                        <button
    onClick={() => navigate("/dashboard")}
    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        location.pathname === "/dashboard"
            ? "bg-violet-500/10 border border-violet-400/10 text-violet-300"
            : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
    }`}
>
    <span>⌂</span>
    Overview
                        </button>

                       <button
    onClick={() => navigate("/repositories")}
    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        location.pathname === "/repositories"
            ? "bg-violet-500/10 border border-violet-400/10 text-violet-300"
            : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
    }`}
>
    <span>◉</span>
    Repositories
                       </button>

                       <button
    onClick={() => navigate("/projects")}
    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        location.pathname === "/projects" ||
        location.pathname.startsWith("/projects/")
            ? "bg-violet-500/10 border border-violet-400/10 text-violet-300"
            : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
    }`}
>
    <span>◇</span>
    Test Lab
                      </button>

                        <button
    onClick={() => navigate("/results")}
    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        location.pathname === "/results"
            ? "bg-violet-500/10 border border-violet-400/10 text-violet-300"
            : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
    }`}
>
    <span>▤</span>
    Results
                        </button>

                    </div>


                    <div className="mt-auto">

                        <p className="px-3 mb-3 text-[10px] uppercase tracking-[0.25em] text-slate-600">
                            System
                        </p>

                        <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-white/5 hover:text-slate-200">
                            ⚙ Settings
                        </button>

                    </div>

                </aside>


                {/* Main */}
                <main className="flex-1 p-6 md:p-10">

                    {/* Header */}
                    <div className="mb-10">

                        <p className="font-mono text-xs text-violet-400 mb-3">
                            ~/workspace/dashboard
                        </p>

                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                            Repository Intelligence
                        </h2>

                        <p className="mt-2 text-sm text-slate-500 max-w-xl">
                            Analyze source code, generate intelligent test
                            cases and execute them against your running API.
                        </p>

                    </div>


                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 mb-10">

                        <Stat
                            label="PROJECTS"
                            value={projects.length}
                        />

                        <Stat
                            label="TESTS GENERATED"
                            value="—"
                        />

                        <Stat
                            label="PASSED"
                            value="—"
                        />

                        <Stat
                            label="FAILED"
                            value="—"
                        />

                    </div>


                    <div className="grid xl:grid-cols-[1fr_340px] gap-6">

                        {/* Projects */}
                        <section>

                            <div className="flex items-center justify-between mb-4">

                                <div>

                                    <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
                                        repositories
                                    </p>

                                    <h3 className="text-lg font-semibold mt-1">
                                        Your projects
                                    </h3>

                                </div>


                                <button
                                    onClick={() => {
                                        setCreateError("");
                                        setShowCreateModal(true);
                                    }}
                                    className="font-mono text-xs border border-violet-400/30 text-violet-300 px-4 py-2 rounded-lg hover:bg-violet-400/10 transition"
                                >
                                    + NEW PROJECT
                                </button>

                            </div>


                            {loading ? (

                                <div className="border border-white/10 bg-[#0d1016] p-10 text-center font-mono text-xs text-slate-600">
                                    SCANNING WORKSPACE...
                                </div>

                            ) : projects.length === 0 ? (

                                <div className="border border-dashed border-white/10 bg-[#0d1016] p-12 text-center">

                                    <div className="text-3xl mb-4 text-slate-700">
                                        ◌
                                    </div>

                                    <p className="font-mono text-sm text-slate-400">
                                        NO REPOSITORIES FOUND
                                    </p>

                                    <p className="text-xs text-slate-600 mt-2">
                                        Connect a GitHub repository to begin.
                                    </p>

                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-5 text-xs font-mono text-violet-300 border border-violet-400/20 px-4 py-2 rounded-lg hover:bg-violet-400/10"
                                    >
                                        CREATE FIRST PROJECT
                                    </button>

                                </div>

                            ) : (

                                <div className="space-y-3">

                                    {projects.map((project) => (
                                       
                                        <ProjectCard
                                            key={project._id}
                                            project={project}
                                             onDelete={deleteProject}
                                        />

                                    ))}

                                </div>

                            )}

                        </section>


                        {/* Terminal */}
                        <section>

                            <div className="border border-white/10 bg-[#0a0c10]">

                                <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2">

                                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />

                                    <span className="ml-2 text-[10px] font-mono text-slate-600">
                                        ai-engine
                                    </span>

                                </div>

                                <div className="p-5 font-mono text-xs leading-7">

                                    <p className="text-slate-600">
                                        $ ai-test-lab status
                                    </p>

                                    <p className="text-emerald-400">
                                        ✓ vector engine online
                                    </p>

                                    <p className="text-emerald-400">
                                        ✓ llm engine online
                                    </p>

                                    <p className="text-emerald-400">
                                        ✓ test runner online
                                    </p>

                                    <p className="text-slate-600 mt-3">
                                        $ waiting_for_repository
                                    </p>

                                    <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse align-middle" />

                                </div>

                            </div>


                            {/* Pipeline */}
                            <div className="mt-6 border border-white/10 bg-[#0d1016] p-5">

                                <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest mb-5">
                                    pipeline
                                </p>

                                <PipelineStep
                                    number="01"
                                    title="SOURCE"
                                    description="Repository ingestion"
                                />

                                <PipelineStep
                                    number="02"
                                    title="RAG"
                                    description="Code intelligence"
                                />

                                <PipelineStep
                                    number="03"
                                    title="LLM"
                                    description="Test generation"
                                />

                                <PipelineStep
                                    number="04"
                                    title="RUNNER"
                                    description="API execution"
                                />

                            </div>

                        </section>

                    </div>

                </main>

            </div>


            {/* CREATE PROJECT MODAL */}
            {showCreateModal && (

                <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowCreateModal(false);
                        }
                    }}
                >

                    <div className="w-full max-w-2xl border border-white/10 bg-[#0d1016] shadow-2xl">

                        {/* Modal header */}
                        <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between">

                            <div>

                                <p className="font-mono text-[10px] tracking-widest text-violet-400">
                                    NEW WORKSPACE
                                </p>

                                <h2 className="text-xl font-semibold mt-1">
                                    Connect a project
                                </h2>

                            </div>


                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-600 hover:text-white text-xl"
                            >
                                ×
                            </button>

                        </div>


                        {/* Form */}
                        <form
                            onSubmit={createProject}
                            className="p-6 space-y-5"
                        >

                            {createError && (

                                <div className="border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-400">
                                    {createError}
                                </div>

                            )}


                            <div className="grid md:grid-cols-2 gap-4">

                                <FormField
                                    label="PROJECT NAME"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Ledger API"
                                    required
                                />

                                <FormField
                                    label="LANGUAGE"
                                    name="language"
                                    value={form.language}
                                    onChange={handleChange}
                                    placeholder="JavaScript"
                                    required
                                />

                            </div>


                            <FormField
                                label="DESCRIPTION"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="AI-powered API testing project"
                            />


                            <div className="pt-3 border-t border-white/5">

                                <p className="font-mono text-[9px] tracking-widest text-slate-600 mb-4">
                                    GITHUB SOURCE
                                </p>


                                <div className="grid md:grid-cols-2 gap-4">

                                    <FormField
                                        label="GITHUB OWNER"
                                        name="githubOwner"
                                        value={form.githubOwner}
                                        onChange={handleChange}
                                        placeholder="kshitiz897981"
                                        required
                                    />

                                    <FormField
                                        label="REPOSITORY"
                                        name="githubRepo"
                                        value={form.githubRepo}
                                        onChange={handleChange}
                                        placeholder="backend-ledger-main"
                                        required
                                    />

                                </div>

                            </div>


                            <div className="pt-3 border-t border-white/5">

                                <p className="font-mono text-[9px] tracking-widest text-slate-600 mb-4">
                                    TEST TARGET
                                </p>


                                <FormField
                                    label="TARGET API URL"
                                    name="targetUrl"
                                    value={form.targetUrl}
                                    onChange={handleChange}
                                    placeholder="http://localhost:2000"
                                    required
                                />

                            </div>


                            <div className="flex justify-end gap-3 pt-3">

                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-5 py-2.5 text-xs font-mono text-slate-500 hover:text-white"
                                >
                                    CANCEL
                                </button>


                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-5 py-2.5 rounded-lg bg-violet-500 text-sm font-medium text-white hover:bg-violet-400 disabled:opacity-50 transition"
                                >
                                    {creating
                                        ? "CREATING..."
                                        : "CREATE PROJECT →"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}


function FormField({
    label,
    name,
    value,
    onChange,
    placeholder,
    required
}) {
    return (
        <label className="block">

            <span className="font-mono text-[9px] tracking-widest text-slate-600">
                {label}
            </span>

            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="mt-2 w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-700 outline-none focus:border-violet-400/40 focus:ring-1 focus:ring-violet-400/10"
            />

        </label>
    );
}


function Stat({ label, value }) {
    return (
        <div className="bg-[#0d1016] p-5">

            <p className="font-mono text-[9px] tracking-[0.2em] text-slate-600">
                {label}
            </p>

            <p className="text-2xl font-semibold mt-2">
                {value}
            </p>

        </div>
    );
}


function ProjectCard({ project,onDelete }) {

    const navigate = useNavigate();

    return (
        <div className="group border border-white/10 bg-[#0d1016] p-5 hover:border-violet-400/30 transition">

            <div className="flex items-start justify-between">

                <div className="flex gap-4">

                    <div className="mt-1 h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-400/10 flex items-center justify-center text-violet-300">
                        ◉
                    </div>

                    <div>

                        <h4 className="font-semibold">
                            {project.name}
                        </h4>

                        <p className="text-xs text-slate-600 mt-1 font-mono">
                            {project.githubRepo || "repository not connected"}
                        </p>

                    </div>
                     <button
    onClick={() => onDelete(project._id)}
    className="border border-red-400/20 px-3 py-1.5 text-[9px] font-mono text-red-400 hover:bg-red-400/10 transition"
>
    DELETE
                     </button>

                </div>


                <span className="text-[10px] font-mono text-emerald-400">
                    ● READY
                </span>

                

            </div>


            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">

                <div className="flex gap-5 text-[10px] font-mono text-slate-600">

                    <span>
                        LANG: {project.language || "—"}
                    </span>

                    <span>
                        TESTS: —
                    </span>

                </div>


                <button
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="text-xs text-violet-300 opacity-70 group-hover:opacity-100 transition"
                >
                    OPEN LAB →
                </button>

            </div>

        </div>
    );
}


function PipelineStep({
    number,
    title,
    description
}) {
    return (
        <div className="flex gap-4 mb-5 last:mb-0">

            <span className="font-mono text-[10px] text-violet-400">
                {number}
            </span>

            <div>

                <p className="font-mono text-xs text-slate-300">
                    {title}
                </p>

                <p className="text-[10px] text-slate-600 mt-1">
                    {description}
                </p>

            </div>

        </div>
    );
}


export default Dashboard;

