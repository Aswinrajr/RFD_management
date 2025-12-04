import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

// Pages
import Dashboard from './pages/Dashboard';
import CreateRFP from './pages/CreateRFP';
import VendorManagement from './pages/VendorManagement';
import RFPDetails from './pages/RFPDetails';
import CompareProposals from './pages/CompareProposals';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🚀 RFP Management
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/create-rfp" className="nav-link">Create RFP</Link>
              </li>
              <li className="nav-item">
                <Link to="/vendors" className="nav-link">Vendors</Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-rfp" element={<CreateRFP />} />
            <Route path="/vendors" element={<VendorManagement />} />
            <Route path="/rfp/:id" element={<RFPDetails />} />
            <Route path="/compare/:rfpId" element={<CompareProposals />} />
          </Routes>
        </main>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
