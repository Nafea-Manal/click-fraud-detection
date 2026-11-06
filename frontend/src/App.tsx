import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { ClickProvider } from "./context/ClickContext";
import { Layout } from "./components/Layout";
import { Accueil } from "./pages/Accueil";
import { Simulation } from "./pages/Simulation";
import { SimulationBatch } from "./pages/SimulationBatch";
import { Dashboard } from "./pages/Dashboard";
import { ROI } from "./pages/ROI";

function App() {
  return (
    <ToastProvider>
      <ClickProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Accueil />} />
              <Route path="simulation" element={<Simulation />} />
              <Route path="simulation-batch" element={<SimulationBatch />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="roi" element={<ROI />} />
            </Route>
          </Routes>
        </Router>
      </ClickProvider>
    </ToastProvider>
  );
}

export default App;
