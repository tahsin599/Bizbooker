// 
import { useForm } from "react-hook-form";
import { Calendar } from 'lucide-react';
//import { Link } from "react-router-dom";
import "./SignupForm.css"

const SignupForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        const formData = {
            role: data.role,
            fullname: data.fullname,
            email: data.email,
            password: data.password,
            bio: data.bio || "",
            profilepicture: data.profilepicture?.[0] || null, // Access the file object
        };

        console.log("Form Data:", formData);
    };

    return (
        <div className="signupform">
            <div className="signupformheadercontainer">
                <div className="signupfromheadericon">
                    <Calendar className="headericon" />
                </div>
                <div className="signupformheader">
                    <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-500">BizBooker</h1>
                </div>
                <div className="signupformsubheader">
                    Create your account and start booking
                </div>
            </div>

            <div className="signupformcontainer">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="signupform-subcontainer">
                        <div className="type-name">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">I'm a</label>
                            </div>
                            <select
                                {...register("role", { required: true })}
                                className="box"
                            >
                                <option value="">Select your role</option>
                                <option value="customer">Customer</option>
                                <option value="owner">Owner</option>
                            </select>
                            {errors.role && <span className="error-message">This field is required</span>}
                        </div>
                    </div>

                    <div className="signupform-subcontainer">
                        <div className="userfullname">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Fullname</label>
                            </div>
                            <input
                                {...register("fullname", { required: true })}
                                className="box"
                            />
                            {errors.fullname && <span className="error-message">This field is required</span>}
                        </div>
                    </div>

                    <div className="signupform-subcontainer">
                        <div className="useremail">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                            </div>
                            <input
                                {...register("email", { required: true })}
                                className="box"
                            />
                            {errors.email && <span className="error-message">This field is required</span>}
                        </div>
                    </div>

                    <div className="signupform-subcontainer">
                        <div className="userpassword">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                            </div>
                            <input
                                {...register("password", { required: true })}
                                className="box"
                                type="password"
                            />
                            {errors.password && <span className="error-message">This field is required</span>}
                        </div>

                        <div className="userpassword">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            </div>
                            <input
                                {...register("confirmPassword", { required: true })}
                                className="box"
                                type="password"
                            />
                            {errors.confirmPassword && <span className="error-message">This field is required</span>}
                        </div>
                    </div>

                    <div className="signupform-subcontainer">
                        <div className="description">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Bio(Optional)</label>
                            </div>
                            <textarea
                                {...register("bio")}
                                rows={3}
                                className="box"
                            />
                        </div>
                    </div>

                    <div className="signupform-subcontainer">
                        <div className="description">
                            <div className="title">
                                <label className="block text-sm font-medium text-gray-700">Profile Picture(Optional)</label>
                            </div>
                            <input
                                {...register("profilepicture")}
                                className="box"
                                type="file"
                                accept="image/*"
                            />
                        </div>
                    </div>

                    <div className="signupform-subcontainer">
                        <button type="submit" className="signupbutton">
                            Sign Up
                        </button>
                    </div>

                    <div className="signupform-subcontainer">
                        <div className="lineup"></div>
                        <div className="otheroption">Or continue with</div>
                        <div className="lineup"></div>
                    </div>

                    <div className="signupform-subcontainer">
                        <div className="otheroptioncontainer">
                            <button type="button" className="otheroptionbutton">
                                Continue with Google
                            </button>
                        </div>
                        <div className="otheroptioncontainer">
                            <button type="button" className="otheroptionbutton">
                                Continue with Apple
                            </button>
                        </div>
                    </div>

                    <div className="signupformfooter">
                        Already have an account?
                       
                            Log in
                        
                        here
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupForm;
