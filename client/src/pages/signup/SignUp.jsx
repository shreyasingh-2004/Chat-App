import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  User, Mail, Lock, UserPlus, CheckCircle, AlertCircle, 
  Eye, EyeOff, Shield, ShieldCheck, ShieldAlert, Calendar 
} from "lucide-react";
import useSignup from "../../hooks/useSignup";

const SignUp = () => {
  const [inputs, setInputs] = useState({
    fullName: "", username: "", password: "", confirmPassword: "", age: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: "", color: "", width: "0%" });
  const [isValid, setIsValid] = useState(false);
  
  const { loading, signup } = useSignup();

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengthMap = {
      0: { text: "Very Weak", color: "bg-red-500", width: "10%" },
      1: { text: "Weak", color: "bg-orange-500", width: "25%" },
      2: { text: "Fair", color: "bg-yellow-500", width: "40%" },
      3: { text: "Good", color: "bg-blue-500", width: "60%" },
      4: { text: "Strong", color: "bg-green-500", width: "80%" },
      5: { text: "Very Strong", color: "bg-emerald-500", width: "100%" }
    };
    
    return { score, ...strengthMap[score] };
  };

  // Live validation
  useEffect(() => {
    const newErrors = {};
    
    // Full Name validation
    if (touched.fullName || submitAttempted) {
      if (!inputs.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      } else if (inputs.fullName.trim().length < 2) {
        newErrors.fullName = "Name must be at least 2 characters";
      } else if (inputs.fullName.trim().length > 50) {
        newErrors.fullName = "Name is too long";
      } else if (!/^[a-zA-Z\s]+$/.test(inputs.fullName)) {
        newErrors.fullName = "Name can only contain letters and spaces";
      }
    }
    
    // Username validation
    if (touched.username || submitAttempted) {
      if (!inputs.username.trim()) {
        newErrors.username = "Username is required";
      } else if (inputs.username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      } else if (inputs.username.length > 20) {
        newErrors.username = "Username must be less than 20 characters";
      } else if (!/^[a-zA-Z0-9_]+$/.test(inputs.username)) {
        newErrors.username = "Only letters, numbers, and underscores";
      }
    }
    
    // Password validation
    if (touched.password || submitAttempted) {
      if (!inputs.password) {
        newErrors.password = "Password is required";
      } else if (inputs.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      } else if (inputs.password.length > 50) {
        newErrors.password = "Password is too long";
      }
    }
    
    // Confirm Password validation
    if (touched.confirmPassword || submitAttempted) {
      if (!inputs.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (inputs.password !== inputs.confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
    }
    
    // Age validation
    if (touched.age || submitAttempted) {
      if (!inputs.age) {
        newErrors.age = "Age is required";
      } else {
        const ageNum = parseInt(inputs.age);
        if (isNaN(ageNum)) {
          newErrors.age = "Please enter a valid age";
        } else if (ageNum < 13) {
          newErrors.age = "You must be at least 13 years old";
        } else if (ageNum > 120) {
          newErrors.age = "Please enter a valid age (13-120)";
        }
      }
    }
    
    setErrors(newErrors);
    
    // Update password strength
    if (inputs.password) {
      setPasswordStrength(calculatePasswordStrength(inputs.password));
    }
    
    // Check overall form validity
    setIsValid(
      inputs.fullName.trim().length >= 2 &&
      /^[a-zA-Z\s]+$/.test(inputs.fullName) &&
      inputs.username.trim().length >= 3 &&
      /^[a-zA-Z0-9_]+$/.test(inputs.username) &&
      inputs.password.length >= 6 &&
      inputs.password === inputs.confirmPassword &&
      parseInt(inputs.age) >= 13 &&
      parseInt(inputs.age) <= 120 &&
      Object.keys(newErrors).length === 0
    );
  }, [inputs, touched, submitAttempted]);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({
      fullName: true,
      username: true,
      password: true,
      confirmPassword: true,
      age: true
    });
    
    if (isValid) {
      await signup(inputs);
    }
  };

  const getFieldStatus = (field) => {
    const isTouched = touched[field] || submitAttempted;
    if (!isTouched) return null;
    return errors[field] ? 'error' : 'success';
  };

  const getInputClass = (field) => {
    const status = getFieldStatus(field);
    let classes = "w-full pl-10 pr-10 py-3 rounded-xl border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 outline-none";
    if (status === 'error') classes += " border-red-500 bg-red-50 dark:bg-red-950/20";
    if (status === 'success') classes += " border-green-500 focus:border-green-500";
    if (errors[field] && (touched[field] || submitAttempted)) classes += " error-shake";
    return classes;
  };

  const getPasswordStrengthIcon = () => {
    if (passwordStrength.score <= 1) return <ShieldAlert className="w-3 h-3 text-red-500" />;
    if (passwordStrength.score <= 3) return <Shield className="w-3 h-3 text-yellow-500" />;
    return <ShieldCheck className="w-3 h-3 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md my-8 animate-slide-up">
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-full blur-3xl opacity-20 animate-float" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
          
          <div className="relative text-center mb-6">
            <div className="inline-flex p-3 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl shadow-lg mb-4 animate-scale-in">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Join our community today</p>
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200
                  ${getFieldStatus('fullName') === 'error' ? 'text-red-400' : 
                    getFieldStatus('fullName') === 'success' ? 'text-green-500' : 
                    'text-gray-400'}`} 
                />
                <input
                  type="text"
                  placeholder="John Doe"
                  className={getInputClass('fullName')}
                  value={inputs.fullName}
                  onChange={(e) => setInputs({...inputs, fullName: e.target.value})}
                  onBlur={() => handleBlur('fullName')}
                />
                {getFieldStatus('fullName') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-scale-in" />
                )}
              </div>
              {errors.fullName && (touched.fullName || submitAttempted) && (
                <p className="text-red-500 text-xs flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200
                  ${getFieldStatus('username') === 'error' ? 'text-red-400' : 
                    getFieldStatus('username') === 'success' ? 'text-green-500' : 
                    'text-gray-400'}`} 
                />
                <input
                  type="text"
                  placeholder="@username"
                  className={getInputClass('username')}
                  value={inputs.username}
                  onChange={(e) => setInputs({...inputs, username: e.target.value})}
                  onBlur={() => handleBlur('username')}
                />
                {getFieldStatus('username') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-scale-in" />
                )}
              </div>
              {errors.username && (touched.username || submitAttempted) && (
                <p className="text-red-500 text-xs flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.username}
                </p>
              )}
              {touched.username && !errors.username && inputs.username.length >= 3 && (
                <p className="text-green-500 text-xs flex items-center gap-1 animate-fade-in mt-1">
                  <CheckCircle className="w-3 h-3" />
                  Username is available
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200
                  ${getFieldStatus('password') === 'error' ? 'text-red-400' : 
                    getFieldStatus('password') === 'success' ? 'text-green-500' : 
                    'text-gray-400'}`} 
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className={getInputClass('password')}
                  value={inputs.password}
                  onChange={(e) => setInputs({...inputs, password: e.target.value})}
                  onBlur={() => handleBlur('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {inputs.password && (touched.password || submitAttempted) && (
                <div className="space-y-1 mt-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      {getPasswordStrengthIcon()}
                      <span className="text-gray-600 dark:text-gray-400">Password Strength:</span>
                    </span>
                    <span className={`font-semibold ${
                      passwordStrength.score <= 1 ? 'text-red-500' :
                      passwordStrength.score <= 3 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-500 rounded-full`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>6+ chars</span>
                    <span>Uppercase</span>
                    <span>Number</span>
                    <span>Special</span>
                  </div>
                </div>
              )}
              
              {errors.password && (touched.password || submitAttempted) && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1 animate-fade-in">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <CheckCircle className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200
                  ${getFieldStatus('confirmPassword') === 'error' ? 'text-red-400' : 
                    getFieldStatus('confirmPassword') === 'success' ? 'text-green-500' : 
                    'text-gray-400'}`} 
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={getInputClass('confirmPassword')}
                  value={inputs.confirmPassword}
                  onChange={(e) => setInputs({...inputs, confirmPassword: e.target.value})}
                  onBlur={() => handleBlur('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (touched.confirmPassword || submitAttempted) && (
                <p className="text-red-500 text-xs flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
              {touched.confirmPassword && !errors.confirmPassword && inputs.confirmPassword && inputs.password === inputs.confirmPassword && (
                <p className="text-green-500 text-xs flex items-center gap-1 animate-fade-in mt-1">
                  <CheckCircle className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Age
              </label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200
                  ${getFieldStatus('age') === 'error' ? 'text-red-400' : 
                    getFieldStatus('age') === 'success' ? 'text-green-500' : 
                    'text-gray-400'}`} 
                />
                <input
                  type="number"
                  placeholder="18"
                  min="13"
                  max="120"
                  className={getInputClass('age')}
                  value={inputs.age}
                  onChange={(e) => setInputs({...inputs, age: e.target.value})}
                  onBlur={() => handleBlur('age')}
                />
                {getFieldStatus('age') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-scale-in" />
                )}
              </div>
              {errors.age && (touched.age || submitAttempted) && (
                <p className="text-red-500 text-xs flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.age}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] w-full mt-6 group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </span>
              {!loading && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500" />
              )}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-all hover:scale-105 inline-block">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        .error-shake {
          animation: errorShake 0.5s ease-in-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        input:focus {
          border-color: #6366f1;
          ring: 4px solid rgba(99, 102, 241, 0.2);
        }

        input.error:focus {
          ring-color: rgba(239, 68, 68, 0.2);
        }

        /* Remove number input spinners */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default SignUp;