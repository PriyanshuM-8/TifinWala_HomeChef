import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../services/api';
import {
  UtensilsCrossed,
  Mail,
  Lock,
  Phone,
  User,
  MapPin,
  Building,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export const ChefRegisterPage = () => {
  const navigate = useNavigate();
  const { registerSendOtp, registerVerifyOtp } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    kitchenName: '',
    ownerName: '',
    kitchenAddress: '',
    city: '',
    description: '',
    foodCategories: 'North Indian, Homestyle Thali, Dal Bati',
    cuisineTypes: 'North Indian, Vegetarian, Rajasthani',
    fssaiNumber: '',
    hygieneDeclaration: true,
  });

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Valid email address is required';
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      errs.phone = '10-digit mobile number is required';
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!formData.kitchenName.trim()) {
      errs.kitchenName = 'Kitchen/Brand name is required';
    }
    if (!formData.kitchenAddress.trim()) {
      errs.kitchenAddress = 'Kitchen address is required';
    }
    if (!formData.city.trim()) {
      errs.city = 'City is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        kitchenName: formData.kitchenName.trim(),
        ownerName: formData.ownerName.trim() || formData.name.trim(),
        kitchenAddress: formData.kitchenAddress.trim(),
        city: formData.city.trim(),
        description: formData.description.trim() || 'Authentic homemade food kitchen.',
        foodCategories: formData.foodCategories
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        cuisineTypes: formData.cuisineTypes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        foodSafetyDetails: {
          fssaiLicenseNumber: formData.fssaiNumber.trim(),
          hygieneDeclaration: formData.hygieneDeclaration,
        },
      };

      await registerSendOtp(payload);
      addToast(`Verification OTP sent to ${formData.email}!`, 'success');
      setStep(2);
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to send registration OTP.'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 4) {
      addToast('Please enter the OTP sent to your email.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      await registerVerifyOtp({
        email: formData.email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      addToast('Kitchen registered successfully! Welcome to GharKaSwad.', 'success');
      navigate('/');
    } catch (err) {
      addToast(extractErrorMessage(err, 'Invalid or expired OTP.'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
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
              Partner Kitchen Application
            </span>
          </div>
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#27352F]">
          {step === 1 ? 'Register as a HomeChef Partner' : 'Verify Your Email'}
        </h2>
        <p className="text-xs sm:text-sm text-[#737B76] mt-1">
          {step === 1
            ? 'Join our network of celebrated home cooks serving authentic meals.'
            : `Enter the verification code sent to ${formData.email}`}
        </p>

        {/* Multi-step indicator */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <span
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
              step === 1
                ? 'bg-[#14513F] text-white border-[#14513F]'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            <span>1</span>
            <span>Kitchen Profile</span>
          </span>
          <span className="text-[#737B76]">→</span>
          <span
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
              step === 2
                ? 'bg-[#14513F] text-white border-[#14513F]'
                : 'bg-white text-[#737B76] border-[#E8ECE7]'
            }`}
          >
            <span>2</span>
            <span>OTP Verification</span>
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-xl border border-[#E8ECE7] rounded-3xl">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Section: Chef Personal Info */}
              <div className="pb-2 border-b border-[#E8ECE7]">
                <h4 className="text-xs font-extrabold text-[#14513F] uppercase tracking-wider mb-3">
                  Chef Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Jyoti Gupta"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-500 font-semibold mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-500 font-semibold mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="jyoti@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                    />
                    {errors.password && (
                      <p className="text-xs text-rose-500 font-semibold mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Repeat password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-rose-500 font-semibold mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Kitchen Details */}
              <div className="pb-2 border-b border-[#E8ECE7]">
                <h4 className="text-xs font-extrabold text-[#14513F] uppercase tracking-wider mb-3">
                  Kitchen &amp; Operational Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                      Kitchen Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.kitchenName}
                      onChange={(e) =>
                        setFormData({ ...formData, kitchenName: e.target.value })
                      }
                      placeholder="e.g. Maa Ki Rasoi"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                    />
                    {errors.kitchenName && (
                      <p className="text-xs text-rose-500 font-semibold mt-1">
                        {errors.kitchenName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="e.g. Jaipur"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                    />
                    {errors.city && (
                      <p className="text-xs text-rose-500 font-semibold mt-1">
                        {errors.city}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                    Complete Kitchen Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kitchenAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kitchenAddress: e.target.value,
                      })
                    }
                    placeholder="House/Plot No, Street, Landmark, Area"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                  />
                  {errors.kitchenAddress && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">
                      {errors.kitchenAddress}
                    </p>
                  )}
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                    Kitchen Bio / Speciality
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Tell food lovers about your homemade secret spices, pure ingredients..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition resize-none"
                  />
                </div>
              </div>

              {/* Section: Food Safety & Declaration */}
              <div>
                <h4 className="text-xs font-extrabold text-[#14513F] uppercase tracking-wider mb-2">
                  Food Safety Compliance
                </h4>
                <div>
                  <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                    FSSAI License / Registration No (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.fssaiNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, fssaiNumber: e.target.value })
                    }
                    placeholder="14-digit FSSAI number if available"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                  />
                </div>

                <label className="flex items-start gap-2.5 mt-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.hygieneDeclaration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hygieneDeclaration: e.target.checked,
                      })
                    }
                    className="mt-0.5 rounded text-[#14513F] focus:ring-[#14513F]"
                  />
                  <span className="text-xs text-[#737B76]">
                    I declare that all food prepared follows strict homemade hygiene
                    standards, purified drinking water, and safe packaging.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Verification OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Verification</span>
                      <ArrowRight className="w-4 h-4 text-[#F6A23A]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] text-center">
                <KeyRound className="w-8 h-8 text-[#14513F] mx-auto mb-2" />
                <p className="text-xs text-[#737B76]">
                  We have sent an authentication code to
                </p>
                <p className="text-sm font-extrabold text-[#27352F] mt-0.5">
                  {formData.email}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full py-3 text-center tracking-[0.5em] text-2xl font-extrabold rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] text-[#14513F] focus:outline-none focus:border-[#14513F] transition"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isLoading || otp.length < 4}
                  className="w-full py-3.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying &amp; Registering Kitchen...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#F6A23A]" />
                      <span>Verify &amp; Enter Dashboard</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#737B76] hover:text-[#27352F] transition flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Edit Kitchen Details</span>
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-[#E8ECE7] text-center">
            <p className="text-xs text-[#737B76]">Already have a kitchen account?</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#14513F] hover:text-[#0E3B2E] mt-1 hover:underline"
            >
              <span>Sign in here</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F6A23A]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefRegisterPage;
