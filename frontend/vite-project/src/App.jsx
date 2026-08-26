import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProjectLab from "./pages/ProjectLab";


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
        </Routes>
    );
}

export default App;