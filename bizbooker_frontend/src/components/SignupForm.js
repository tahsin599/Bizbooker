import { useForm } from "react-hook-form";
import { Calendar } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { motion } from "framer-motion";
import "./SignupForm.css";

const SignupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const onSubmit = async (data) => {
    const user = {
      role: data.role.toUpperCase(),
      name: data.fullname,
      email: data.email,
      password: data.password,
      bio: data.bio || "",
    };

    const formData = new FormData();
    formData.append("user", new Blob([JSON.stringify(user)], { type: "application/json" }));

    if (data.profilepicture && data.profilepicture.length > 0) {
      formData.append("profilePicture", data.profilepicture[0]);
    }

    try {
      const response = await fetch("http://localhost:8081/loging", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        alert("Signup successful!");
      } else {
        const errText = await response.text();
        alert("Signup failed: " + errText);
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
          Create your account and start booking
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
            <label>I am a</label>
            <select {...register("role", { required: true })} className="box">
              <option value="">Select your role</option>
              <option value="customer">Customer</option>
              <option value="owner">Owner</option>
            </select>
            {errors.role && <span className="error-message">This field is required</span>}
          </div>

          <div className="form-group">
            <label>Fullname</label>
            <input {...register("fullname", { required: true })} className="box" />
            {errors.fullname && <span className="error-message">This field is required</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input {...register("email", { required: true })} className="box" />
            {errors.email && <span className="error-message">This field is required</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input {...register("password", { required: true })} type="password" className="box" />
              {errors.password && <span className="error-message">This field is required</span>}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                {...register("confirmPassword", {
                  required: true,
                  validate: value => value === watch("password") || "Passwords do not match"
                })}
                type="password"
                className="box"
              />
              {errors.confirmPassword && (
                <span className="error-message">
                  {errors.confirmPassword.message || "This field is required"}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Bio (Optional)</label>
            <textarea {...register("bio")} rows={3} className="box" />
          </div>

          <div className="form-group">
            <label>Profile Picture (Optional)</label>
            <input {...register("profilepicture")} className="box" type="file" accept="image/*" />
          </div>

          <button type="submit" className="signupbutton">Sign Up</button>

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
            Already have an account? <a href="/login">Log in here</a>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupForm;
