import { Navigate, Route, Routes } from 'react-router';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import CompanyDetailsPage from './pages/CompanyDetails/CompanyDetailsPage';
import FloorDetailsPage from './pages/FloorDetails/FloorDetailsPage';
import FloorPlanEditorPage from './pages/FloorPlanEditor/FloorPlanEditorPage';
import './styles/global.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />

      <Route path="/sign-in" element={<LoginPage />} />

      <Route element={<DashboardLayout />}>

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/companies/:companyId"element={<CompanyDetailsPage />}/>
        <Route path="/companies/:companyId/floors/:floorId" element={<FloorDetailsPage />}/>
        <Route path="/companies/:companyId/floors/:floorId/editor" element={<FloorPlanEditorPage />}/>
        
      </Route>

      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}

export default App;