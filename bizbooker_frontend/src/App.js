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
import OAuthCallback from './modules/OauthCallBack';
import UserBusinesses from './modules/UserBusinesses';
import BusinessDetailPage from './modules/BusinessDetailPage';
import AddLocationPage from './modules/AddLocationPage'; // Import the AddLocationPage component
import LocationImagesPage from './modules/LocationImagesPage'; // Import the LocationImagesPage component
import BusinessListingPage from './modules/BusinessListingPage';
import BusinessHoursConfig from './modules/BusinessHoursConfig';
import ErrorBoundary from './modules/ErrorBoundary'; // Import the ErrorBoundary component
import CategoryBusinessListingPage from './modules/CategoryBusinessListingPage'; // Import the CategoryBusinessListingPage component
import NoBusinessesFound from './modules/NoBusinessesFound';
import BusinessConfig from './modules/BusinessConfig';
import BookingsPage from './modules/BookingsPage'; // Import the BookingsPage component
import Chatbot from './modules/Chatbot'; // Import the Chatbot component
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
          <Route path="/business-service" element={<><Navbar isAuthenticated={true} /><BusinessService /><Footer /></>} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/userBusiness" element={<><Navbar isAuthenticated={true} /><UserBusinesses /><Footer /></>} />
          <Route path="/business/:id" element={<><Navbar isAuthenticated={true} /><BusinessDetailPage /><Footer /></>} />
          <Route path="/business/:businessId/add-location" element={<><Navbar isAuthenticated={true}/><AddLocationPage /><Footer /></>} />
          <Route path="/locations/:locationId/images" element={<><Navbar isAuthenticated={true} /><LocationImagesPage /><Footer /></>} />
          <Route path="/business/customer" element={<><Navbar isAuthenticated={true}/><BusinessListingPage /><Footer/></>} />
          <Route path="/business/customer/:businessId" element={<><Navbar/><BusinessService /><Footer/></>} />
          <Route path="/business/category/:categoryId" element={<><Navbar /><CategoryBusinessListingPage /><Footer /></>} />
          <Route path="/explore" element={<><Navbar isAuthenticated={false} /><NoBusinessesFound /><Footer /></>} />
          <Route path="/business/config/:businessId" element={<><BusinessConfig /></>} /> 
          <Route path="/bookings" element={<><BookingsPage/></>}/>
          <Route path="/chatbot" element={<><Navbar isAuthenticated={false} /><Chatbot /></>} />
       

          {/* Add more routes as needed */}
        </Routes>
        
        {/* <Footer /> */}
      </div>
    </BrowserRouter>
  );
}

export default App;
