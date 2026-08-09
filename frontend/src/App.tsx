import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { GraveyardPage } from "./pages/GraveyardPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProjectFormPage } from "./pages/ProjectFormPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ResurrectPage } from "./pages/ResurrectPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<ProjectFormPage mode="create" />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="projects/:projectId/edit" element={<ProjectFormPage mode="edit" />} />
        <Route path="resurrect" element={<ResurrectPage />} />
        <Route path="graveyard" element={<GraveyardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

