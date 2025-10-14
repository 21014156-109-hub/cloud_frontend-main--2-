import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SharedProvider } from './components';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthGuard from './core/guard/authGuard';
import AdminGuard from './core/guard/adminGuard';
import BuildManagement from './build-management/listing/BuildManagement';
import ClientServiceSettings from './client-service-settings/ClientServiceSettings';
import ClientTestSuitListing from './client-test-suit/listing/ClientTestSuitListing';
import AddClientTestSuit from './client-test-suit/add/AddClientTestSuit';
import UpdateClientTestSuit from './client-test-suit/update/UpdateClientTestSuit';
import WifiProfilesListing from './wifi-profiles/listing/WifiProfilesListing';
import AddWifiProfile from './wifi-profiles/add/AddWifiProfile';
import UpdateWifiProfile from './wifi-profiles/update/UpdateWifiProfile';
import UpdateProfile from './profile/UpdateProfile';
import WarehouseListing from './warehouses/listing/WarehouseListing';
import AddWarehouse from './warehouses/add/AddWarehouse';
import UpdateWarehouse from './warehouses/update/UpdateWarehouse';
import Layout from './layout/Layout';
import CloudDBListing from './cloudDB/listing/CloudDBListing';
import DeviceResultAnalysis from './cloudDB/analysis/DeviceResultAnalysis';
import ConfigurationPackage from './configuration-package/ConfigurationPackage';
import TestSuitesTab from './configuration-package/test-suites-tab/TestSuitesTab';
import AssignTestSuitesTab from './configuration-package/assign-test-suites-tab/AssignTestSuitesTab';
import MonthlyReport from './reporting/monthly-report/MonthlyReport';
import DeviceReport from './device-report/DeviceReport';
import AddTestSuitesAssignment from './configuration-package/assign-test-suites-tab/AddTestSuitesAssignment';
import './App.css';
import LogoSetting from './logo-setting/LogoSetting';
import RequestListing from './licenses/RequestListing';
import AddRequest from './licenses/AddRequest';
import AdminRequest from './licenses/AdminRequest';
import ViewRequest from './licenses/ViewRequest';
import Management from './licenses/Management';
import ClientInfo from './licenses/ClientInfo';
import LicensesListing from './licenses/listing/LicensesListing';
import AddLicenseRequest from './licenses/add/AddLicenseRequest';
import UpdateLicenseRequest from './licenses/update/UpdateLicenseRequest';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <BrowserRouter>
      <SharedProvider>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <Routes>
        <Route path="/" element={<Login />} />
    <Route path="/dashboard" element={<AuthGuard><Layout><Dashboard /></Layout></AuthGuard>} />
    {/* Public device report route so QR links can be opened directly without auth */}
    <Route path="/device-report" element={<DeviceReport />} />
        <Route path="/build-management/listing" element={<AuthGuard><AdminGuard><Layout><BuildManagement /></Layout></AdminGuard></AuthGuard>} />
  <Route path="/client-service-settings" element={<AuthGuard><Layout><ClientServiceSettings /></Layout></AuthGuard>} />
  <Route path="/client-test-suit/listing" element={<AuthGuard><Layout><ClientTestSuitListing /></Layout></AuthGuard>} />
  <Route path="/client-test-suit/add" element={<AuthGuard><AdminGuard><Layout><AddClientTestSuit /></Layout></AdminGuard></AuthGuard>} />
  <Route path="/client-test-suit/update/:id" element={<AuthGuard><Layout><UpdateClientTestSuit /></Layout></AuthGuard>} />
    <Route path="/cloudDB/listing" element={<AuthGuard><Layout><CloudDBListing /></Layout></AuthGuard>} />
  <Route path="/devices/listing" element={<AuthGuard><Layout><CloudDBListing /></Layout></AuthGuard>} />
    <Route path="/reporting/monthly-report" element={<AuthGuard><Layout><MonthlyReport /></Layout></AuthGuard>} />
  <Route path="/cloudDB/analysis" element={<AuthGuard><Layout><DeviceResultAnalysis /></Layout></AuthGuard>} />
  <Route path="/configuration-package" element={<AuthGuard><Layout><ConfigurationPackage /></Layout></AuthGuard>} />
  <Route path="/licenses/listing" element={<AuthGuard><Layout><LicensesListing /></Layout></AuthGuard>} />
  <Route path="/licenses/add" element={<AuthGuard><Layout><AddLicenseRequest /></Layout></AuthGuard>} />
  <Route path="/licenses/update/:id" element={<AuthGuard><Layout><UpdateLicenseRequest /></Layout></AuthGuard>} />
  <Route path="/licenses/request" element={<AuthGuard><Layout><RequestListing /></Layout></AuthGuard>} />
  <Route path="/licenses/add-request" element={<AuthGuard><Layout><AddRequest /></Layout></AuthGuard>} />
  <Route path="/licenses/admin-request" element={<AuthGuard><AdminGuard><Layout><AdminRequest /></Layout></AdminGuard></AuthGuard>} />
  <Route path="/licenses/view-request/:id" element={<AuthGuard><Layout><ViewRequest /></Layout></AuthGuard>} />
  <Route path="/licenses/management" element={<AuthGuard><Layout><Management /></Layout></AuthGuard>} />
  <Route path="/licenses/client-info" element={<AuthGuard><Layout><ClientInfo /></Layout></AuthGuard>} />
  <Route path="/wifi-profiles/listing" element={<AuthGuard><Layout><WifiProfilesListing /></Layout></AuthGuard>} />
  <Route path="/wifi-profiles/add" element={<AuthGuard><Layout><AddWifiProfile /></Layout></AuthGuard>} />
  <Route path="/wifi-profiles/update/:id" element={<AuthGuard><Layout><UpdateWifiProfile /></Layout></AuthGuard>} />
  <Route path="/logo-setting" element={<AuthGuard><Layout><LogoSetting /></Layout></AuthGuard>} />
  <Route path="/profile/update" element={<AuthGuard><Layout><UpdateProfile /></Layout></AuthGuard>} />
  <Route path="/warehouse/listing" element={<AuthGuard><Layout><WarehouseListing /></Layout></AuthGuard>} />
  <Route path="/warehouse/add" element={<AuthGuard><Layout><AddWarehouse /></Layout></AuthGuard>} />
  <Route path="/warehouse/update/:id" element={<AuthGuard><Layout><UpdateWarehouse /></Layout></AuthGuard>} />
  {/* Direct routes for listings to match Angular-style links */}
  <Route path="/test-suites/listing" element={<AuthGuard><Layout><TestSuitesTab /></Layout></AuthGuard>} />
  <Route path="/test-suites-assignment/listing" element={<AuthGuard><Layout><AssignTestSuitesTab /></Layout></AuthGuard>} />
  {/* Alias Angular-style assignment routes to React pages */}
  <Route path="/test-suites-assignment/add" element={<AuthGuard><Layout><AddTestSuitesAssignment /></Layout></AuthGuard>} />
  <Route path="/test-suites-assignment/update/:id" element={<AuthGuard><Layout><UpdateClientTestSuit /></Layout></AuthGuard>} />
        <Route path="*" element={<Login />} />
      </Routes>
      </SharedProvider>
    </BrowserRouter>
  );
}
