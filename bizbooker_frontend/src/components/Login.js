import { useForm } from "react-hook-form";
import { Calendar } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { motion } from "framer-motion";
import "./SignupForm.css"; 

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:8081/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });

      if (response.ok) {
        alert("Login successful!");
      } else {
        const errText = await response.text();
        alert("Login failed: " + errText);
      }
    } catch (error) {
      alert("Error occurred: " + error.message);
    }
  };

  return (
    <div className="signupform">
      <motion.div
        className="signupformheadercontainer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="signupfromheadericon"
          initial={{ y: -150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <Calendar className="headericon" />
        </motion.div>

        <motion.div
          className="signupformheader"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="title-gradient">BizBooker</h1>
        </motion.div>

        <motion.div
          className="signupformsubheader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Log into your account to continue booking
        </motion.div>
      </motion.div>

      <motion.div
        className="signupformcontainer"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Email</label>
            <input {...register("email", { required: true })} className="box" />
            {errors.email && <span className="error-message">This field is required</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              {...register("password", { required: true })}
              type="password"
              className="box"
            />
            {errors.password && <span className="error-message">This field is required</span>}
          </div>

          <button type="submit" className="signupbutton">Log In</button>

          <div className="separator">
            <div className="lineup"></div>
            <div className="otheroption">Or continue with</div>
            <div className="lineup"></div>
          </div>

          <div className="alt-buttons">
            <button type="button" className="otheroptionbutton icon-btn">
              <FcGoogle className="icon" />
              Continue with Google
            </button>
            <button type="button" className="otheroptionbutton icon-btn">
              <FaApple className="icon" />
              Continue with Apple
            </button>
          </div>

          <div className="signupformfooter">
            Don't have an account? <a href="/signup">Sign up here</a>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginForm;
