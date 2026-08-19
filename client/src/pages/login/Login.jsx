import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import useLogin from "../../hooks/useLogin";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  const { loading, login } = useLogin();

  // Live validation with your CSS animations
  useEffect(() => {
    const newErrors = {};
    
    if (touched.username || submitAttempted) {
      if (!username.trim()) {
        newErrors.username = "Username is required";
      } else if (username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      } else if (username.length > 20) {
        newErrors.username = "Username must be less than 20 characters";
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        newErrors.username = "Only letters, numbers, and underscores";
      }
    }
    
    if (touched.password || submitAttempted) {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      } else if (password.length > 50) {
        newErrors.password = "Password is too long";
      }
    }
    
    setErrors(newErrors);
    setIsValid(
      username.trim().length >= 3 && 
      /^[a-zA-Z0-9_]+$/.test(username) &&
      password.length >= 6 && 
      Object.keys(newErrors).length === 0
    );
  }, [username, password, touched, submitAttempted]);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({ username: true, password: true });
    
    if (isValid) {
      await login(username, password);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Glass Card */}
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
          {/* Decorative gradient orbs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-full blur-3xl opacity-20 animate-float" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
          
          {/* Logo & Title */}
          <div className="relative text-center mb-8">
            <div className="inline-flex p-3 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl shadow-lg mb-4 animate-scale-in">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-5">
            {/* Username Field */}
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
                  placeholder="Enter your username"
                  className={getInputClass('username')}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors({ ...errors, username: '' });
                  }}
                  onBlur={() => handleBlur('username')}
                />
                {getFieldStatus('username') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-scale-in" />
                )}
                {getFieldStatus('username') === 'error' && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400 animate-scale-in" />
                )}
              </div>
              {errors.username && (touched.username || submitAttempted) && (
                <p className="text-red-500 text-xs flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.username}
                </p>
              )}
              {touched.username && !errors.username && username.length > 0 && (
                <p className="text-green-500 text-xs flex items-center gap-1 animate-fade-in mt-1">
                  <CheckCircle className="w-3 h-3" />
                  Username looks good!
                </p>
              )}
            </div>

            {/* Password Field */}
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
                  placeholder="Enter your password"
                  className={getInputClass('password')}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  onBlur={() => handleBlur('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {getFieldStatus('password') === 'success' && (
                  <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-scale-in" />
                )}
              </div>
              {errors.password && (touched.password || submitAttempted) && (
                <p className="text-red-500 text-xs flex items-center gap-1 animate-fade-in mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
              {touched.password && !errors.password && password.length >= 6 && (
                <p className="text-green-500 text-xs flex items-center gap-1 animate-fade-in mt-1">
                  <CheckCircle className="w-3 h-3" />
                  Password is valid
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </span>
              {!loading && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500" />
              )}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-all hover:scale-105 inline-block">
                Create account
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
      `}</style>
    </div>
  );
};

export default Login;