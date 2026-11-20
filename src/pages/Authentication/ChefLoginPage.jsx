import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../services/api';
import {
  UtensilsCrossed,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ChefLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(formData.email.trim(), formData.password);
      addToast('Welcome back, Partner Chef!', 'success');
      const origin = location.state?.from?.pathname || '/';
      navigate(origin, { replace: true });
    } catch (err) {
      addToast(extractErrorMessage(err, 'Invalid email or password.'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#14513F] text-white flex items-center justify-center shadow-md group-hover:bg-[#0E3B2E] transition">
            <UtensilsCrossed className="w-7 h-7 text-[#F6A23A]" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl tracking-tight text-[#14513F]">
              GharKa<span className="text-[#F6A23A]">Swad</span>
            </span>
            <span className="block text-[11px] font-bold text-[#737B76] tracking-widest uppercase">
              HomeChef Partner Portal
            </span>
          </div>
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#27352F]">
          Sign In to Your Kitchen
        </h2>
        <p className="text-xs sm:text-sm text-[#737B76] mt-1">
          Manage your orders, food menu, and daily earnings.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-xl border border-[#E8ECE7] rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737B76]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="chef@gharkaswad.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737B76]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Kitchen</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-6 border-t border-[#E8ECE7] text-center">
            <p className="text-xs text-[#737B76]">
              Want to become a GharKaSwad Kitchen Partner?
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#14513F] hover:text-[#0E3B2E] mt-1 hover:underline"
            >
              <span>Apply &amp; Register Your Kitchen</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F6A23A]" />
            </Link>
          </div>
        </div>

        {/* Quality & Safety Assurance Note */}
        <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs text-[#737B76]">
          <ShieldCheck className="w-4 h-4 text-[#14513F]" />
          <span>Verified GharKaSwad Homemade Food Network</span>
        </div>
      </div>
    </div>
  );
};

export default ChefLoginPage;
