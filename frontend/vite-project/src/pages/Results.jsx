
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Results = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    const [runs, setRuns] = useState([]);
    const [selectedRun, setSelectedRun] = useState(null);
    const [results, setResults] = useState([]);

    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingRuns, setLoadingRuns] = useState(false);
    const [loadingResults, setLoadingResults] = useState(false);

    const navigate = useNavigate();

    // Load projects
    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const response = await api.get("/projects");

            setProjects(response.data.projects || []);
        } catch (error) {
            console.error("Failed to load projects:", error);
        } finally {
            setLoadingProjects(false);
        }
    };

    // Load runs for selected project
    const loadRuns = async (projectId) => {
        try {
            setLoadingRuns(true);
            setSelectedProject(projectId);
            setSelectedRun(null);
            setResults([]);

            const response = await api.get(
                `/projects/${projectId}/test-runs`
            );

            setRuns(response.data.runs || []);
        } catch (error) {
            console.error("Failed to load test runs:", error);
            setRuns([]);
        } finally {
            setLoadingRuns(false);
        }
    };

    // Load results for selected run
    const loadRunResults = async (projectId, runId) => {
        try {
            setLoadingResults(true);
            setSelectedRun(runId);

            const response = await api.get(
                `/projects/${projectId}/test-runs/${runId}`
            );

            setResults(response.data.results || []);
        } catch (error) {
            console.error("Failed to load run results:", error);
            setResults([]);
        } finally {
            setLoadingResults(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080a0f] text-white">

            <div className="max-w-7xl mx-auto p-8">

                {/* HEADER */}
                <div className="mb-10">

                    <p className="font-mono text-[10px] text-slate-600 tracking-widest">
                        EXECUTION HISTORY
                    </p>

                    <h1 className="text-3xl font-semibold mt-2">
                        Results
                    </h1>

                    <p className="text-sm text-slate-500 mt-2">
                        View previous test executions and detailed results.
                    </p>

                </div>


                {/* PROJECTS */}
                <section className="mb-10">

                    <div className="flex justify-between items-end mb-4">

                        <div>
                            <p className="font-mono text-[10px] text-slate-600 tracking-widest">
                                PROJECTS
                            </p>

                            <h2 className="text-xl font-semibold mt-1">
                                Select Project
                            </h2>
                        </div>

                    </div>


                    {loadingProjects ? (

                        <div className="border border-white/10 p-8 text-center">
                            <p className="font-mono text-xs text-slate-500">
                                LOADING PROJECTS...
                            </p>
                        </div>

                    ) : projects.length === 0 ? (

                        <div className="border border-dashed border-white/10 p-8 text-center">
                            <p className="font-mono text-xs text-slate-500">
                                NO PROJECTS FOUND
                            </p>
                        </div>

                    ) : (

                        <div className="grid md:grid-cols-3 gap-3">

                            {projects.map((project) => (

                                <button
                                    key={project._id}
                                    onClick={() =>
                                        loadRuns(project._id)
                                    }
                                    className={`text-left border p-4 transition ${
                                        selectedProject === project._id
                                            ? "border-violet-400/40 bg-violet-400/10"
                                            : "border-white/10 bg-[#0d1016] hover:border-violet-400/20"
                                    }`}
                                >

                                    <p className="font-medium">
                                        {project.name}
                                    </p>

                                    <p className="text-xs text-slate-600 mt-1">
                                        {project.githubOwner &&
                                        project.githubRepo
                                            ? `${project.githubOwner}/${project.githubRepo}`
                                            : "Repository not connected"}
                                    </p>

                                </button>

                            ))}

                        </div>

                    )}

                </section>


                {/* RUN HISTORY */}
                {selectedProject && (

                    <section className="mb-10">

                        <div className="flex justify-between items-end mb-4">

                            <div>
                                <p className="font-mono text-[10px] text-slate-600 tracking-widest">
                                    TEST RUNS
                                </p>

                                <h2 className="text-xl font-semibold mt-1">
                                    Execution History
                                </h2>
                            </div>

                            <span className="font-mono text-xs text-slate-500">
                                {runs.length} RUNS
                            </span>

                        </div>


                        {loadingRuns ? (

                            <div className="border border-white/10 p-8 text-center">
                                <p className="font-mono text-xs text-slate-500">
                                    LOADING RUNS...
                                </p>
                            </div>

                        ) : runs.length === 0 ? (

                            <div className="border border-dashed border-white/10 p-8 text-center">

                                <p className="font-mono text-xs text-slate-500">
                                    NO TEST RUNS FOUND
                                </p>

                                <p className="text-xs text-slate-700 mt-2">
                                    Run the project's test suite first.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-3">

                                {runs.map((run) => (

                                    <button
                                        key={run.runId}
                                        onClick={() =>
                                            loadRunResults(
                                                selectedProject,
                                                run.runId
                                            )
                                        }
                                        className={`w-full text-left border p-5 transition ${
                                            selectedRun === run.runId
                                                ? "border-violet-400/40 bg-violet-400/10"
                                                : "border-white/10 bg-[#0d1016] hover:border-violet-400/20"
                                        }`}
                                    >

                                        <div className="flex justify-between items-center">

                                            <div>

                                                <p className="font-mono text-xs text-slate-400">
                                                    RUN
                                                </p>

                                                <p className="font-mono text-[11px] text-slate-600 mt-1">
                                                    {run.runId}
                                                </p>

                                            </div>

                                            <div className="text-right">

                                                <p className="text-sm font-medium">
                                                    {run.passRate}% PASS
                                                </p>

                                                <p className="text-xs text-slate-600 mt-1">
                                                    {run.total} tests
                                                </p>

                                            </div>

                                        </div>


                                        <div className="flex gap-6 mt-4 font-mono text-[10px]">

                                            <span className="text-slate-500">
                                                TOTAL {run.total}
                                            </span>

                                            <span className="text-emerald-400">
                                                PASSED {run.passed}
                                            </span>

                                            <span className="text-red-400">
                                                FAILED {run.failed}
                                            </span>

                                            <span className="text-slate-600">
                                                {run.startedAt
                                                    ? new Date(
                                                        run.startedAt
                                                    ).toLocaleString()
                                                    : ""}
                                            </span>

                                        </div>

                                    </button>

                                ))}

                            </div>

                        )}

                    </section>

                )}


                {/* INDIVIDUAL RESULTS */}
                {selectedRun && (

                    <section>

                        <div className="flex justify-between items-end mb-4">

                            <div>
                                <p className="font-mono text-[10px] text-slate-600 tracking-widest">
                                    RUN RESULTS
                                </p>

                                <h2 className="text-xl font-semibold mt-1">
                                    Test Results
                                </h2>
                            </div>

                            <span className="font-mono text-xs text-slate-500">
                                {results.length} RESULTS
                            </span>

                        </div>


                        {loadingResults ? (

                            <div className="border border-white/10 p-8 text-center">
                                <p className="font-mono text-xs text-slate-500">
                                    LOADING RESULTS...
                                </p>
                            </div>

                        ) : (

                            <div className="space-y-3">

                                {results.map((result) => (

                                    <div
                                        key={result._id}
                                        className="border border-white/10 bg-[#0d1016] p-5"
                                    >

                                        <div className="flex justify-between gap-5">

                                            <div>

                                                <p className="font-medium">
                                                    {result.testCase?.name ||
                                                        "Unknown Test"}
                                                </p>

                                                <p className="text-xs text-slate-600 mt-1">
                                                    {result.testCase?.input?.method}{" "}
                                                    {result.testCase?.input?.path}
                                                </p>

                                            </div>


                                            <span
                                                className={`font-mono text-[10px] ${
                                                    result.status === "PASSED"
                                                        ? "text-emerald-400"
                                                        : "text-red-400"
                                                }`}
                                            >
                                                {result.status}
                                            </span>

                                        </div>


                                        <div className="grid md:grid-cols-3 gap-4 mt-5">

                                            <div>
                                                <p className="font-mono text-[9px] text-slate-700">
                                                    EXPECTED
                                                </p>

                                                <pre className="text-xs text-slate-500 mt-2 whitespace-pre-wrap">
                                                    {result.expectedOutput}
                                                </pre>
                                            </div>


                                            <div>
                                                <p className="font-mono text-[9px] text-slate-700">
                                                    ACTUAL
                                                </p>

                                                <pre className="text-xs text-slate-500 mt-2 whitespace-pre-wrap">
                                                    {result.actualOutput}
                                                </pre>
                                            </div>


                                            <div>
                                                <p className="font-mono text-[9px] text-slate-700">
                                                    EXECUTION TIME
                                                </p>

                                                <p className="text-xs text-slate-500 mt-2">
                                                    {result.executionTime} ms
                                                </p>
                                            </div>

                                        </div>


                                        {result.failureAnalysis && (

                                            <div className="mt-5 border-t border-white/5 pt-4">

                                                <p className="font-mono text-[9px] text-red-400">
                                                    AI FAILURE ANALYSIS
                                                </p>

                                                <p className="text-xs text-slate-500 mt-2">
                                                    {typeof result.failureAnalysis ===
                                                    "string"
                                                        ? result.failureAnalysis
                                                        : JSON.stringify(
                                                            result.failureAnalysis,
                                                            null,
                                                            2
                                                        )}
                                                </p>

                                            </div>

                                        )}

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>

                )}

            </div>

        </div>
    );
};

export default Results;

