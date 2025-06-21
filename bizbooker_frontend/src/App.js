import './App.css';
import SignupForm from './components/SignupForm';
import LoginForm from './components/Login';
import ImageFromBackend from './components/check';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AboutUs from './components/AboutUs';
import SocialIcons from './components/SocialIcons';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar/>
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          
          <Route path="/signup" element={<SignupForm />} />

          
          <Route path="/login" element={<LoginForm />} />
          <Route path="/about" element={<AboutUs/>} />
        </Routes>
        <SocialIcons/>
        <Footer/>
        
 
        
        <ImageFromBackend />
      </div>
    </BrowserRouter>
  );
}

export default App;
