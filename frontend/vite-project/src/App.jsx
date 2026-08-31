import { Routes, Route } from "react-router-dom";
import Repositories from "./pages/Repositories";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProjectLab from "./pages/ProjectLab";
import TestLab from "./pages/TestLab";
import Results from "./pages/Results";



function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="/dashboard"
                element={<Dashboard />}
            />
             <Route
                path="/projects/:id"
                element={<ProjectLab />}
            />
            <Route
            path="/projects"
           element={<TestLab />}
           />

           <Route
           path="/results"
           element={<Results />}
           />

           <Route
           path="/repositories"
           element={<Repositories />}
           />
        </Routes>
    );
}

export default App;