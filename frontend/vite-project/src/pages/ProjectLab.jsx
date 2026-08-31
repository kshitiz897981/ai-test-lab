
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import api from "../services/api";

function ProjectLab() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [testCases, setTestCases] = useState([]);
    const [results, setResults] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");

    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState("");

    const [expandedResult, setExpandedResult] = useState(null);

    const [testRuns, setTestRuns] = useState([]);
const [selectedRun, setSelectedRun] = useState(null);
const [runResults, setRunResults] = useState([]);
const [loadingRuns, setLoadingRuns] = useState(false);

    const loadProject = async () => {
        try {
            const response = await api.get(`/projects/${id}`);
            setProject(response.data.project);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load project"
            );
        }
    };

      const loadTests = async () => {
    try {
        const response = await api.get(
            `/projects/${id}/tests`
        );

        setTestCases(response.data.testCases || []);
        setResults(response.data.results || []);

    } catch (error) {
        console.error(
            "Failed to load tests:",
            error
        );
    }
};

     const loadAnalytics = async () => {
    try {
        const response = await api.get(
            `/projects/${id}/analytics`
        );

        setAnalytics(response.data);

    } catch (error) {
        console.error(
            "Failed to load analytics:",
            error
        );
    }
};

    const loadTestRuns = async () => {
    try {
        setLoadingRuns(true);

        const response = await api.get(
            `/projects/${id}/test-runs`
        );

        setTestRuns(response.data.runs || []);

    } catch (error) {
        console.error(
            "Failed to load test runs:",
            error
        );
    } finally {
        setLoadingRuns(false);
    }
};

   const viewRun = async (runId) => {
    try {
        const response = await api.get(
            `/projects/${id}/test-runs/${encodeURIComponent(runId)}`
        );

        setSelectedRun(response.data);
        setRunResults(response.data.results || []);
        setExpandedResult(null);

    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to load test run"
        );
    }
};

const deleteTest = async (testId) => {
    try {
        console.log("DELETE ID:", testId);

        await api.delete(
            `/projects/${id}/tests/${testId}`
        );

        setTestCases(prev =>
            prev.filter(test => test._id !== testId)
        );

    } catch (error) {
        console.error("DELETE ERROR:", error);

        alert(
            error.response?.data?.message ||
            "Failed to delete test case"
        );
    }
};

const deleteAllTests = async () => {

    const confirmed = window.confirm(
        "Delete ALL test cases for this project?"
    );

    if (!confirmed) return;

    try {

        await api.delete(`/projects/${id}/tests`);

        await loadTests();

    } catch (error) {

        setError(
            error.response?.data?.message ||
            "Failed to delete tests"
        );
    }
};

const deleteResult = async (resultId) => {
    try {
        await api.delete(
            `/projects/${id}/test-results/${resultId}`
        );

        setResults(prev =>
            prev.filter(result => result._id !== resultId)
        );

        setRunResults(prev =>
            prev.filter(result => result._id !== resultId)
        );

    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to delete test result"
        );
    }
};

const deleteAllResults = async () => {
    try {
        await api.delete(
            `/projects/${id}/test-results`
        );

        setResults([]);
        setRunResults([]);
        setSelectedRun(null);
        setExpandedResult(null);

        await loadTestRuns();

    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to delete execution results"
        );
    }
};

    const analyzeRepository = async () => {
        try {
            setAnalyzing(true);
            setError("");

            const response = await api.post(
                `/projects/${id}/analyze`
            );

            setTestCases(
                response.data.testCases?.testCases || []
            );
            setAnalysis(
                 response.data.analysis || null
            );

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Repository analysis failed"
            );
        } finally {
            setAnalyzing(false);
        }
    };

    const runTests = async () => {
        try {
            setRunning(true);
            setError("");

            const response = await api.post(
                `/projects/${id}/run-tests`
            );

            setResults(prev => [
    ...(response.data.results || []),
    ...prev
]);
            await loadAnalytics();
            await loadTestRuns();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Test execution failed"
            );
        } finally {
            setRunning(false);
        }
    };

    useEffect(() => {
        const load = async () => {
            await loadProject();
            await loadTests();
            await loadTestRuns();
            await loadAnalytics();
            setLoading(false);
        };

        load();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#08090d] text-slate-400 flex items-center justify-center font-mono">
                INITIALIZING LAB...
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-[#08090d] text-white p-10">
                <p>{error || "Project not found"}</p>
            </div>
        );
    }

    const passed = results.filter(
        result => result.status === "PASSED"
    ).length;

    const failed = results.filter(
        result => result.status === "FAILED"
    ).length;

    const passRate = results.length
        ? Math.round((passed / results.length) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-[#08090d] text-slate-200">

            {/* HEADER */}
            <header className="h-16 border-b border-white/10 bg-[#0b0d12] px-6 flex items-center justify-between">

                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-xs font-mono text-slate-500 hover:text-white transition"
                >
                    ← WORKSPACE
                </button>

                <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    LAB ONLINE
                </div>

            </header>


            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* PROJECT HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">

                    <div>

                        <p className="font-mono text-xs text-violet-400 mb-3">
                            ~/projects/{project.name}
                        </p>

                        <h1 className="text-4xl font-semibold tracking-tight">
                            {project.name}
                        </h1>

                        <p className="text-slate-500 mt-2">
                            {project.description}
                        </p>

                    </div>


                    <div className="flex gap-3">

                        <button
                            onClick={analyzeRepository}
                            disabled={analyzing}
                            className="rounded-lg bg-violet-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-400 disabled:opacity-50 transition"
                        >
                            {analyzing
                                ? "ANALYZING..."
                                : "ANALYZE REPOSITORY"}
                        </button>


                        <button
                            onClick={runTests}
                            disabled={running || testCases.length === 0}
                            className="rounded-lg border border-emerald-400/30 px-5 py-2.5 text-sm font-mono text-emerald-400 hover:bg-emerald-400/10 disabled:opacity-30 transition"
                        >
                            {running
                                ? "RUNNING..."
                                : "▶ RUN TESTS"}
                        </button>

                    </div>

                </div>

                 {/* LAB TABS */}

                   <div className="border-b border-white/10 mb-10">

    <div className="flex gap-8">

        <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 text-xs font-mono transition ${
                activeTab === "overview"
                    ? "text-violet-400 border-b border-violet-400"
                    : "text-slate-600 hover:text-slate-300"
            }`}
        >
            OVERVIEW
        </button>

        <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-4 text-xs font-mono transition ${
                activeTab === "analytics"
                    ? "text-violet-400 border-b border-violet-400"
                    : "text-slate-600 hover:text-slate-300"
            }`}
        >
            ANALYTICS
        </button>

    </div>

                   </div>


                {/* ERROR */}
                {error && (
                    <div className="mb-6 border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {activeTab === "overview" && (
                <>
                {/* PIPELINE */}
                <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10 mb-10">

                    <Pipeline
                        title="SOURCE"
                        value={
                            project.githubRepo ||
                            "Not connected"
                        }
                        status={
        analysis
            ? `${analysis.totalFiles} source files`
            : "READY"
    }
                    />

                       <Pipeline
                       title="AI ANALYSIS"
                       value={         
                       analysis
                       ?`${analysis.totalFiles} files · ${analysis.totalChunks} chunks`
                        : "LangChain + RAG"
                        }
                      status={
                     analysis
            ? `${analysis.rag.relevantChunks} chunks → ${analysis.testGeneration.totalTests} tests`
            : "WAITING"
                       }
               />

                    <Pipeline
                        title="TEST ENGINE"
                        value={
                            project.targetUrl ||
                            "Target not configured"
                        }
                        status={
                            project.targetUrl
                                ? "READY"
                                : "CONFIGURE"
                        }
                    />

                </div>

                {/* ANALYTICS */}

               {analytics && (

    <section className="mb-12">

        <div className="mb-4">

            <p className="font-mono text-[10px] text-slate-600 tracking-widest">
                PROJECT ANALYTICS
            </p>

            <h2 className="text-xl font-semibold mt-1">
                Execution Overview
            </h2>

        </div>


        {/* SUMMARY */}

        <div className="grid md:grid-cols-5 gap-px bg-white/10 border border-white/10">

            <ResultStat
                label="TOTAL RUNS"
                value={analytics.summary.totalRuns}
            />

            <ResultStat
                label="TOTAL TESTS"
                value={analytics.summary.totalTests}
            />

            <ResultStat
                label="PASSED"
                value={analytics.summary.totalPassed}
                positive
            />

            <ResultStat
                label="FAILED"
                value={analytics.summary.totalFailed}
                negative={analytics.summary.totalFailed > 0}
            />

            <div className="bg-[#0d1016] p-5">

                <p className="font-mono text-[9px] text-slate-600">
                    PASS RATE
                </p>

                <p className="text-2xl font-semibold text-violet-400 mt-2">
                    {analytics.summary.overallPassRate}%
                </p>

            </div>

        </div>


        {/* PERFORMANCE */}

        <div className="mt-4 border border-white/10 bg-[#0d1016] p-5">

            <div className="flex items-center justify-between">

                <div>

                    <p className="font-mono text-[9px] text-slate-600 tracking-widest">
                        PERFORMANCE
                    </p>

                    <p className="text-sm mt-2">
                        Average execution time
                    </p>

                </div>

                <p className="font-mono text-xl text-emerald-400">
                    {analytics.summary.averageExecutionTime}ms
                </p>

            </div>

        </div>

    </section>

                )}

                {/* TEST CASES */}
                <section className="mb-12">

                    <div className="w-full flex justify-between items-end mb-4">

                        <div>
                            <p className="font-mono text-[10px] text-slate-600 tracking-widest">
                                GENERATED TEST CASES
                            </p>

                            <h2 className="text-xl font-semibold mt-1">
                                AI Test Suite
                            </h2>
                        </div>

                         <button
                        onClick={deleteAllTests}
                        className="ml-auto block border border-red-400/20 px-4 py-2 text-[10px] font-mono text-red-400 hover:bg-red-400/10 transition"
>
    DELETE ALL TESTS
                         </button>

                        <span className="font-mono text-xs text-slate-500">
                            {testCases.length} TESTS
                        </span>

                    </div>


                    {testCases.length === 0 ? (

                        <div className="border border-dashed border-white/10 p-12 text-center">

                            <div className="text-3xl text-slate-700 mb-3">
                                ◌
                            </div>

                            <p className="font-mono text-sm text-slate-500">
                                NO TEST CASES GENERATED
                            </p>

                            <p className="text-xs text-slate-700 mt-2">
                                Run repository analysis to generate tests.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-3">

                            {testCases.map((testCase, index) => (

                                <div
                                    key={testCase._id}
                                    className="border border-white/10 bg-[#0d1016] p-5 hover:border-violet-400/20 transition"
                                >

                                    <div className="flex justify-between gap-5">

                                        <div>

                                            <div className="flex items-center gap-3">

                                                <span className="font-mono text-[10px] text-slate-700">
                                                    TEST-{String(index + 1).padStart(2, "0")}
                                                </span>

                                                <h3 className="font-medium">
                                                    {testCase.name}
                                                </h3>

                                                <button
    onClick={() => deleteTest(testCase._id)}
    className="border border-red-400/20 px-3 py-1.5 text-[9px] font-mono text-red-400 hover:bg-red-400/10 transition"
>
    DELETE
</button>

                                            </div>

                                            <p className="text-sm text-slate-500 mt-2">
                                                {testCase.description}
                                            </p>

                                        </div>

                                        <Priority
                                            priority={testCase.priority}
                                        />

                                    </div>


                                    <div className="mt-4 grid md:grid-cols-2 gap-3">

                                        <CodeBox
                                            label="INPUT"
                                            value={testCase.input}
                                        />

                                        <CodeBox
                                            label="EXPECTED"
                                            value={testCase.expectedOutput}
                                        />

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

              


                {/* EXECUTION RESULTS */}
                {results.length > 0 && (

                    <section>

                        <div className="flex items-end justify-between mb-4">

                            <div>

                                <p className="font-mono text-[10px] text-slate-600 tracking-widest">
                                    EXECUTION RESULTS
                                </p>

                                <h2 className="text-xl font-semibold mt-1">
                                    Test Run
                                </h2>

                            </div>

                            <div className="font-mono text-xs text-slate-500">
                                {passRate}% PASS RATE
                            </div>

                             <button
        onClick={deleteAllResults}
        className="border border-red-400/20 px-3 py-2 text-[10px] font-mono text-red-400 hover:bg-red-400/10 transition"
    >
        DELETE ALL
                            </button>

                        </div>


                        {/* STATS */}
                        <div className="grid grid-cols-3 gap-px bg-white/10 border border-white/10">

                            <ResultStat
                                label="TOTAL"
                                value={results.length}
                            />

                            <ResultStat
                                label="PASSED"
                                value={passed}
                                positive
                            />

                            <ResultStat
                                label="FAILED"
                                value={failed}
                                negative={failed > 0}
                            />

                        </div>


                        {/* PROGRESS */}
                        <div className="h-1 bg-white/5 mt-4 overflow-hidden">

                            <div
                                className="h-full bg-emerald-400 transition-all duration-700"
                                style={{
                                    width: `${passRate}%`
                                }}
                            />

                        </div>


                        {/* RESULTS LIST */}
                        <div className="mt-5 space-y-2">

                            {results.map((result, index) => {

                                const isExpanded =
                                    expandedResult === result._id;

                                const isPassed =
                                    result.status === "PASSED";

                                return (

                                    <div
                                        key={result._id}
                                        className={`border bg-[#0d1016] transition ${
                                            isPassed
                                                ? "border-emerald-400/10"
                                                : "border-red-400/10"
                                        }`}
                                    >

                                        {/* RESULT HEADER */}
                                        <button
                                            onClick={() =>
                                                setExpandedResult(
                                                    isExpanded
                                                        ? null
                                                        : result._id
                                                )
                                            }
                                            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02]"
                                        >

                                            <div className="flex items-center gap-4">

                                                <div
                                                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs ${
                                                        isPassed
                                                            ? "bg-emerald-400/10 text-emerald-400"
                                                            : "bg-red-400/10 text-red-400"
                                                    }`}
                                                >
                                                    {isPassed
                                                        ? "✓"
                                                        : "!"}
                                                </div>


                                                <div>

                                                   <p className="font-mono text-xs text-slate-300">
                                                  {result.testCaseName || `TEST-${String(index + 1).padStart(2, "0")}`}
                                                   </p>

                                                   <p className="font-mono text-[10px] text-slate-600 mt-1">
                                                    TEST-{String(index + 1).padStart(2, "0")} · {result.testCase}
                                                   </p>

                                                </div>

                                            </div>


                                            <div className="flex items-center gap-5">

                                                <span className="font-mono text-[10px] text-slate-600">
                                                    {result.executionTime}ms
                                                </span>

                                                <span
                                                    className={
                                                        isPassed
                                                            ? "text-emerald-400 text-[10px] font-mono"
                                                            : "text-red-400 text-[10px] font-mono"
                                                    }
                                                >
                                                    ● {result.status}
                                                </span>

                                                 <button
        onClick={(e) => {
            e.stopPropagation();
            deleteResult(result._id);
        }}
        className="text-red-400/60 hover:text-red-400 transition"
        title="Delete result"
    >
        🗑
                                                </button>

                                                <span className="text-slate-600">
                                                    {isExpanded
                                                        ? "⌃"
                                                        : "⌄"}
                                                </span>

                                            </div>

                                        </button>


                                        {/* EXPANDED RESULT */}
                                        {isExpanded && (

                                            <div className="border-t border-white/5 p-5 space-y-5">

                                                {/* Expected / Actual */}
                                                <div className="grid md:grid-cols-2 gap-4">

                                                    <ResponsePanel
                                                        label="EXPECTED RESPONSE"
                                                        value={
                                                            result.expectedOutput
                                                        }
                                                    />

                                                    <ResponsePanel
                                                        label="ACTUAL RESPONSE"
                                                        value={
                                                            result.actualOutput
                                                        }
                                                        error={!isPassed}
                                                    />

                                                </div>


                                                {/* Error */}
                                                {result.error && (

                                                    <div className="border border-red-400/10 bg-red-400/5 p-4">

                                                        <p className="font-mono text-[9px] text-red-400 tracking-widest mb-2">
                                                            EXECUTION ERROR
                                                        </p>

                                                        <p className="font-mono text-xs text-red-300 break-all">
                                                            {result.error}
                                                        </p>

                                                    </div>

                                                )}


                                                {/* AI Analysis */}
                                                {result.failureAnalysis && (

                                                    <div className="border border-violet-400/10 bg-violet-400/5 p-4">

                                                        <div className="flex items-center justify-between">

                                                            <p className="font-mono text-[9px] text-violet-300 tracking-widest">
                                                                AI FAILURE ANALYSIS
                                                            </p>

                                                            <span className="font-mono text-[9px] text-red-400">
                                                                {result.failureAnalysis.severity}
                                                            </span>

                                                        </div>


                                                        <p className="text-sm text-slate-400 mt-3">
                                                            {result.failureAnalysis.reason}
                                                        </p>


                                                        {result.failureAnalysis.suggestedFix && (

                                                            <div className="mt-4 pt-4 border-t border-white/5">

                                                                <p className="font-mono text-[9px] text-slate-600 mb-2">
                                                                    SUGGESTED FIX
                                                                </p>

                                                                <p className="text-xs text-slate-400">
                                                                    {result.failureAnalysis.suggestedFix}
                                                                </p>

                                                            </div>

                                                        )}

                                                    </div>

                                                )}

                                            </div>

                                        )}

                                    </div>

                                );
                            })}

                        </div>

                    </section>

                )}

                {/* TEST RUN HISTORY */}
               <section className="mt-16">

    <div className="flex items-end justify-between mb-4">

        <div>
            <p className="font-mono text-[10px] text-slate-600 tracking-widest">
                EXECUTION HISTORY
            </p>

            <h2 className="text-xl font-semibold mt-1">
                Test Runs
            </h2>
        </div>

        <span className="font-mono text-xs text-slate-500">
            {testRuns.length} RUNS
        </span>

    </div>


    {loadingRuns ? (

        <div className="border border-white/10 bg-[#0d1016] p-8 text-center">
            <p className="font-mono text-xs text-slate-500">
                LOADING RUN HISTORY...
            </p>
        </div>

    ) : testRuns.length === 0 ? (

        <div className="border border-dashed border-white/10 p-10 text-center">

            <p className="font-mono text-sm text-slate-500">
                NO TEST RUNS YET
            </p>

            <p className="text-xs text-slate-700 mt-2">
                Execute your test suite to create a run.
            </p>

        </div>

    ) : (

        <div className="space-y-2">

            {testRuns.map((run) => {

                const passRate = run.total
                    ? Math.round(
                        (run.passed / run.total) * 100
                    )
                    : 0;

                const runDate = new Date(run.startedAt);

                return (

    <div
        key={run.runId}
        className="border border-white/10 bg-[#0d1016] hover:border-violet-400/20 transition"
    >

        <div className="px-5 py-5 flex items-center justify-between gap-5">

            <div>

                <p className="font-mono text-xs text-slate-300">
                    {runDate.toLocaleString()}
                </p>

                <p className="font-mono text-[10px] text-slate-600 mt-2">
                    RUN ID · {run.runId}
                </p>

            </div>


            <div className="flex items-center gap-6">

                <div className="text-center">
                    <p className="font-mono text-[9px] text-slate-600">
                        TOTAL
                    </p>

                    <p className="font-mono text-sm mt-1">
                        {run.total}
                    </p>
                </div>


                <div className="text-center">
                    <p className="font-mono text-[9px] text-slate-600">
                        PASSED
                    </p>

                    <p className="font-mono text-sm text-emerald-400 mt-1">
                        {run.passed}
                    </p>
                </div>


                <div className="text-center">
                    <p className="font-mono text-[9px] text-slate-600">
                        FAILED
                    </p>

                    <p
                        className={`font-mono text-sm mt-1 ${
                            run.failed > 0
                                ? "text-red-400"
                                : "text-slate-500"
                        }`}
                    >
                        {run.failed}
                    </p>
                </div>


                <div className="text-center min-w-[70px]">
                    <p className="font-mono text-[9px] text-slate-600">
                        PASS RATE
                    </p>

                    <p className="font-mono text-sm text-violet-400 mt-1">
                        {run.passRate}%
                    </p>
                </div>


                <button
                    onClick={() => viewRun(run.runId)}
                    className="border border-violet-400/20 px-4 py-2 text-[10px] font-mono text-violet-400 hover:bg-violet-400/10 transition"
                >
                    VIEW RUN →
                </button>

            </div>

        </div>

    </div>
);
            })}

        </div>

    )}

               </section>
               </>
                )}

                {activeTab === "analytics" && (
    <AnalyticsPanel analytics={analytics} />
)}

               {selectedRun && (

    <section className="mt-10">

        <div className="flex items-end justify-between mb-4">

            <div>
                <p className="font-mono text-[10px] text-violet-400 tracking-widest">
                    RUN DETAILS
                </p>
            
                <h2 className="text-xl font-semibold mt-1">
                    {new Date(
                        selectedRun.startedAt
                    ).toLocaleString()}
                </h2>
            </div>

            <button
                onClick={() => {
                    setSelectedRun(null);
                    setRunResults([]);
                }}
                className="text-[10px] font-mono text-slate-500 hover:text-white"
            >
                CLOSE ×
            </button>

        </div>


        <div className="grid grid-cols-3 gap-px bg-white/10 border border-white/10">

            <ResultStat
                label="TOTAL"
                value={selectedRun.total}
            />

            <ResultStat
                label="PASSED"
                value={selectedRun.passed}
                positive
            />

            <ResultStat
                label="FAILED"
                value={selectedRun.failed}
                negative={selectedRun.failed > 0}
            />

        </div>


        <div className="mt-5 space-y-2">

            {runResults.map((result, index) => {

                const isPassed =
                    result.status === "PASSED";

                const isExpanded =
                    expandedResult === `history-${result._id}`;

                return (

                    <div
                        key={result._id}
                        className={`border bg-[#0d1016] ${
                            isPassed
                                ? "border-emerald-400/10"
                                : "border-red-400/10"
                        }`}
                    >

                        <button
                            onClick={() =>
                                setExpandedResult(
                                    isExpanded
                                        ? null
                                        : `history-${result._id}`
                                )
                            }
                            className="w-full px-5 py-4 flex items-center justify-between text-left"
                        >

                            <div className="flex items-center gap-4">

                                <div
                                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs ${
                                        isPassed
                                            ? "bg-emerald-400/10 text-emerald-400"
                                            : "bg-red-400/10 text-red-400"
                                    }`}
                                >
                                    {isPassed ? "✓" : "!"}
                                </div>

                                <div>

                                    <p className="font-mono text-xs text-slate-300">
                                        {result.testCase?.name ||
                                            `TEST-${String(index + 1).padStart(2, "0")}`}
                                    </p>

                                    <p className="font-mono text-[10px] text-slate-600 mt-1">
                                        {result.testCase?.input?.method}{" "}
                                        {result.testCase?.input?.path}
                                    </p>

                                </div>

                            </div>


                            <div className="flex items-center gap-5">

                                <span className="font-mono text-[10px] text-slate-600">
                                    {result.executionTime}ms
                                </span>

                                <span
                                    className={`text-[10px] font-mono ${
                                        isPassed
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                    }`}
                                >
                                    ● {result.status}
                                </span>

                                <span className="text-slate-600">
                                    {isExpanded ? "⌃" : "⌄"}
                                </span>

                            </div>

                        </button>


                        {isExpanded && (

                            <div className="border-t border-white/5 p-5 space-y-5">

                                <div className="grid md:grid-cols-2 gap-4">

                                    <ResponsePanel
                                        label="EXPECTED RESPONSE"
                                        value={result.expectedOutput}
                                    />

                                    <ResponsePanel
                                        label="ACTUAL RESPONSE"
                                        value={result.actualOutput}
                                        error={!isPassed}
                                    />

                                </div>


                                {result.error && (
                                    <div className="border border-red-400/10 bg-red-400/5 p-4">

                                        <p className="font-mono text-[9px] text-red-400 tracking-widest mb-2">
                                            EXECUTION ERROR
                                        </p>

                                        <p className="font-mono text-xs text-red-300">
                                            {result.error}
                                        </p>

                                    </div>
                                )}


                                {result.failureAnalysis && (

                                    <div className="border border-violet-400/10 bg-violet-400/5 p-4">

                                        <p className="font-mono text-[9px] text-violet-300 tracking-widest">
                                            AI FAILURE ANALYSIS
                                        </p>

                                        <p className="text-sm text-slate-400 mt-3">
                                            {result.failureAnalysis.reason}
                                        </p>

                                        {result.failureAnalysis.suggestedFix && (
                                            <div className="mt-4 pt-4 border-t border-white/5">

                                                <p className="font-mono text-[9px] text-slate-600 mb-2">
                                                    SUGGESTED FIX
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {result.failureAnalysis.suggestedFix}
                                                </p>

                                            </div>
                                        )}

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                );
            })}

        </div>

    </section>
)}

            </main>
        </div>
    );
}


function Pipeline({ title, value, status }) {
    return (
        <div className="bg-[#0d1016] p-6">

            <p className="font-mono text-[10px] text-slate-600 tracking-widest">
                {title}
            </p>

            <p className="text-sm mt-3 truncate">
                {value}
            </p>

            <p className="font-mono text-[10px] text-emerald-400 mt-3">
                ● {status}
            </p>

        </div>
    );
}


function Priority({ priority }) {

    const styles = {
        HIGH: "text-red-400 border-red-400/20 bg-red-400/5",
        MEDIUM: "text-yellow-400 border-yellow-400/20 bg-yellow-400/5",
        LOW: "text-slate-400 border-slate-400/20"
    };

    return (
        <span
            className={`h-fit border px-2 py-1 text-[9px] font-mono ${
                styles[priority] || styles.LOW
            }`}
        >
            {priority}
        </span>
    );
}


function CodeBox({ label, value }) {

    return (
        <div className="border border-white/5 bg-black/20 p-3">

            <p className="font-mono text-[9px] text-slate-600 mb-2">
                {label}
            </p>

            <pre className="font-mono text-[10px] text-slate-400 break-all whitespace-pre-wrap">
                {typeof value === "string"
                    ? value
                    : JSON.stringify(value, null, 2)}
            </pre>

        </div>
    );
}


function ResponsePanel({ label, value, error }) {

    let formattedValue = value;

    try {
        const parsed =
            typeof value === "string"
                ? JSON.parse(value)
                : value;

        formattedValue = JSON.stringify(
            parsed,
            null,
            2
        );

    } catch {
        formattedValue = value;
    }

    return (
        <div
            className={`border p-4 ${
                error
                    ? "border-red-400/10 bg-red-400/5"
                    : "border-white/5 bg-black/20"
            }`}
        >

            <p
                className={`font-mono text-[9px] tracking-widest mb-3 ${
                    error
                        ? "text-red-400"
                        : "text-slate-600"
                }`}
            >
                {label}
            </p>

            <pre className="font-mono text-[10px] text-slate-400 whitespace-pre-wrap break-all">
                {formattedValue}
            </pre>

        </div>
    );
}


function ResultStat({
    label,
    value,
    positive,
    negative
}) {

    return (
        <div className="bg-[#0d1016] p-5">

            <p className="font-mono text-[9px] text-slate-600">
                {label}
            </p>

            <p
                className={`text-2xl font-semibold mt-2 ${
                    positive
                        ? "text-emerald-400"
                        : negative
                            ? "text-red-400"
                            : ""
                }`}
            >
                {value}
            </p>

        </div>
    );
}

function AnalyticsPanel({ analytics }) {

    if (!analytics) {
        return (
            <div className="border border-dashed border-white/10 p-12 text-center">

                <p className="font-mono text-sm text-slate-500">
                    LOADING ANALYTICS...
                </p>

            </div>
        );
    }

    const {
        summary,
        trend
    } = analytics;

    return (
        <section>

            {/* HEADER */}

            <div className="mb-8">

                <p className="font-mono text-[10px] text-slate-600 tracking-widest">
                    PROJECT ANALYTICS
                </p>

                <h2 className="text-2xl font-semibold mt-2">
                    Execution Intelligence
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                    Historical performance across all test runs.
                </p>

            </div>


            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border border-white/10">

                <AnalyticsCard
                    label="TOTAL RUNS"
                    value={summary.totalRuns}
                />

                <AnalyticsCard
                    label="TOTAL TESTS"
                    value={summary.totalTests}
                />

                <AnalyticsCard
                    label="PASSED"
                    value={summary.totalPassed}
                    positive
                />

                <AnalyticsCard
                    label="FAILED"
                    value={summary.totalFailed}
                    negative={summary.totalFailed > 0}
                />

            </div>


            {/* PASS RATE */}

            <div className="mt-6 border border-white/10 bg-[#0d1016] p-6">

                <div className="flex items-center justify-between mb-5">

                    <div>

                        <p className="font-mono text-[9px] text-slate-600 tracking-widest">
                            OVERALL PASS RATE
                        </p>

                        <p className="text-3xl font-semibold text-emerald-400 mt-2">
                            {summary.overallPassRate}%
                        </p>

                    </div>

                    <div className="text-right">

                        <p className="font-mono text-[9px] text-slate-600">
                            AVG EXECUTION
                        </p>

                        <p className="font-mono text-lg text-violet-400 mt-2">
                            {summary.averageExecutionTime}ms
                        </p>

                    </div>

                </div>


                <div className="h-2 bg-white/5 overflow-hidden">

                    <div
                        className="h-full bg-emerald-400 transition-all duration-700"
                        style={{
                            width: `${summary.overallPassRate}%`
                        }}
                    />

                </div>

            </div>


        {/* PASS RATE TREND */}

<div className="mt-6 border border-white/10 bg-[#0d1016]">

    <div className="px-6 py-5 border-b border-white/5">

        <p className="font-mono text-[9px] text-slate-600 tracking-widest">
            PASS RATE
        </p>

        <h3 className="text-lg font-semibold mt-2">
            Test Success Trend
        </h3>

    </div>

    <div className="p-6">

        <ResponsiveContainer width="100%" height={300}>

            <LineChart data={trend}>

                <CartesianGrid
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                />

                <XAxis
                    dataKey="runNumber"
                    tickFormatter={(value) => `Run ${value}`}
                    tick={{
                        fill: "#64748b",
                        fontSize: 10
                    }}
                    axisLine={false}
                    tickLine={false}
                />

                <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{
                        fill: "#64748b",
                        fontSize: 10
                    }}
                    axisLine={false}
                    tickLine={false}
                />

                <Tooltip
                    contentStyle={{
                        background: "#0d1016",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "11px"
                    }}
                    formatter={(value) => [`${value}%`, "Pass Rate"]}
                    labelFormatter={(value) => `Run ${value}`}
                />

                <Line
                    type="monotone"
                    dataKey="passRate"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    dot={{
                        r: 4,
                        fill: "#a78bfa"
                    }}
                    activeDot={{
                        r: 6
                    }}
                />

            </LineChart>

        </ResponsiveContainer>

    </div>

</div>


{/* EXECUTION TIME TREND */}

<div className="mt-6 border border-white/10 bg-[#0d1016]">

    <div className="px-6 py-5 border-b border-white/5">

        <p className="font-mono text-[9px] text-slate-600 tracking-widest">
            PERFORMANCE
        </p>

        <h3 className="text-lg font-semibold mt-2">
            Execution Time Trend
        </h3>

    </div>

    <div className="p-6">

        <ResponsiveContainer width="100%" height={300}>

            <LineChart data={trend}>

                <CartesianGrid
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                />

                <XAxis
                    dataKey="runNumber"
                    tickFormatter={(value) => `Run ${value}`}
                    tick={{
                        fill: "#64748b",
                        fontSize: 10
                    }}
                    axisLine={false}
                    tickLine={false}
                />

                <YAxis
                    tickFormatter={(value) => `${value}ms`}
                    tick={{
                        fill: "#64748b",
                        fontSize: 10
                    }}
                    axisLine={false}
                    tickLine={false}
                />

                <Tooltip
                    contentStyle={{
                        background: "#0d1016",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "11px"
                    }}
                    formatter={(value) => [`${value}ms`, "Avg Execution"]}
                    labelFormatter={(value) => `Run ${value}`}
                />

                <Line
                    type="monotone"
                    dataKey="averageExecutionTime"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={{
                        r: 4,
                        fill: "#34d399"
                    }}
                    activeDot={{
                        r: 6
                    }}
                />

            </LineChart>

        </ResponsiveContainer>

    </div>

</div>

        </section>
    );
}

function AnalyticsCard({
    label,
    value,
    positive,
    negative
}) {

    return (
        <div className="bg-[#0d1016] p-6">

            <p className="font-mono text-[9px] text-slate-600 tracking-widest">
                {label}
            </p>

            <p
                className={`text-3xl font-semibold mt-3 ${
                    positive
                        ? "text-emerald-400"
                        : negative
                            ? "text-red-400"
                            : "text-slate-200"
                }`}
            >
                {value}
            </p>

        </div>
    );
}


export default ProjectLab;

