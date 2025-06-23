import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './modules/Navbar';
import LandingPage from './modules/LandingPage';
import Footer from './modules/Footer';
import SignupForm from './modules/SignupForm'; // Make sure this file exists
import LoginForm from './modules/LoginForm'; // Make sure this file exists
import AboutUs from './modules/AboutUs';
import Dashboard from './modules/DashBoard';
import CreateBusiness from './modules/CreateBusiness';
import BusinessService from './modules/BusinessService';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* <Navbar isAuthenticated={false} /> */}
        <Routes>
          <Route path="/" element={<><Navbar isAuthenticated={false} /><LandingPage /><Footer /></>} />
          <Route path="/signup" element={<><Navbar isAuthenticated={false} /><SignupForm /><Footer /></>} />
          <Route path="/login" element={<><Navbar isAuthenticated={false} /><LoginForm /><Footer /></>} />
          <Route path="/about" element={<><Navbar isAuthenticated={false} /><AboutUs /><Footer /></>} />
          <Route path="/dashboard" element={<><Navbar isAuthenticated={true} /><Dashboard /><Footer /></>} />
          <Route path="/create-business" element={<><Navbar isAuthenticated={true} /><CreateBusiness /><Footer /></>} />
          <Route path="/business-service" element={<><Navbar isAuthenticated={true} /><BusinessService /><Footer   /></>} />

          {/* Add more routes as needed */}
          
        </Routes>
        {/* <Footer /> */}
      </div>
    </BrowserRouter>
  );
}

export default App;
