import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import chefService from '../../services/chefService';
import { extractErrorMessage } from '../../services/api';
import { APPROVAL_STATUS_CONFIG } from '../../utils/constants';
import {
  User,
  Building,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Edit2,
  Save,
  LogOut,
  UtensilsCrossed,
  Sparkles,
  Loader2,
  Navigation,
  Crosshair,
  Compass,
  CheckCircle2,
  Radio,
} from 'lucide-react';

const POPULAR_HUBS = [
  { city: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { city: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  { city: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { city: 'Indore', lat: 22.7196, lng: 75.8577 },
  { city: 'Prayagraj', lat: 25.4358, lng: 81.8463 },
  { city: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
];

export const ChefProfilePage = () => {
  const { user, chefProfile, approvalStatus, refreshProfile, logout } = useAuth();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  // Profile Form Data
  const [formData, setFormData] = useState({
    kitchenName: '',
    ownerName: '',
    kitchenAddress: '',
    city: '',
    description: '',
    cuisineTypes: '',
    foodCategories: '',
    fssaiLicenseNumber: '',
  });

  // Location & Service Radius State
  const [lat, setLat] = useState('26.8467');
  const [lng, setLng] = useState('80.9462');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(10);

  useEffect(() => {
    if (chefProfile) {
      setFormData({
        kitchenName: chefProfile.kitchenName || '',
        ownerName: chefProfile.ownerName || user?.name || '',
        kitchenAddress: chefProfile.kitchenAddress || '',
        city: chefProfile.city || '',
        description: chefProfile.description || '',
        cuisineTypes: Array.isArray(chefProfile.cuisineTypes)
          ? chefProfile.cuisineTypes.join(', ')
          : chefProfile.cuisineTypes || '',
        foodCategories: Array.isArray(chefProfile.foodCategories)
          ? chefProfile.foodCategories.join(', ')
          : chefProfile.foodCategories || '',
        fssaiLicenseNumber:
          typeof chefProfile.foodSafetyDetails === 'object'
            ? chefProfile.foodSafetyDetails?.fssaiLicenseNumber || ''
            : chefProfile.foodSafetyDetails || '',
      });

      // Extract existing GeoJSON coordinates [longitude, latitude]
      if (
        chefProfile.location &&
        Array.isArray(chefProfile.location.coordinates) &&
        chefProfile.location.coordinates.length === 2
      ) {
        setLng(String(chefProfile.location.coordinates[0]));
        setLat(String(chefProfile.location.coordinates[1]));
      } else {
        // Fallback default according to city
        const hub = POPULAR_HUBS.find(
          (h) => h.city.toLowerCase() === (chefProfile.city || '').toLowerCase()
        );
        if (hub) {
          setLat(String(hub.lat));
          setLng(String(hub.lng));
        }
      }

      if (chefProfile.serviceRadiusKm) {
        setServiceRadiusKm(chefProfile.serviceRadiusKm);
      }
    }
  }, [chefProfile, user]);

  const statusConfig =
    APPROVAL_STATUS_CONFIG[approvalStatus] || APPROVAL_STATUS_CONFIG.pending;

  // Handle GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsLocatingGPS(true);
    addToast('Detecting high-precision kitchen GPS coordinates...', 'info');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGPS(false);
        const { latitude, longitude } = pos.coords;
        setLat(latitude.toFixed(6));
        setLng(longitude.toFixed(6));
        addToast(`GPS coordinates updated: [${longitude.toFixed(4)}, ${latitude.toFixed(4)}]`, 'success');
      },
      (err) => {
        setIsLocatingGPS(false);
        if (err.code === 1) {
          addToast('Location permission denied. Please enter coordinates manually.', 'error');
        } else if (err.code === 2) {
          addToast('GPS unavailable. Please enter coordinates manually.', 'error');
        } else if (err.code === 3) {
          addToast('GPS request timed out. Please try again or enter manually.', 'error');
        } else {
          addToast('Failed to acquire GPS location.', 'error');
        }
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  };

  // Fine-tune coordinate pin
  const adjustCoordinate = (type, delta) => {
    if (type === 'lat') {
      const val = parseFloat(lat) || 26.8467;
      setLat((val + delta).toFixed(6));
    } else {
      const val = parseFloat(lng) || 80.9462;
      setLng((val + delta).toFixed(6));
    }
  };

  // Save Location & Service Radius directly without touching critical compliance fields
  const handleSaveLocationOnly = async () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      addToast('Latitude must be a valid number between -90 and 90.', 'error');
      return;
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      addToast('Longitude must be a valid number between -180 and 180.', 'error');
      return;
    }

    const radiusNum = parseInt(serviceRadiusKm, 10);
    if (isNaN(radiusNum) || radiusNum < 1 || radiusNum > 50) {
      addToast('Service radius must be between 1 KM and 50 KM.', 'error');
      return;
    }

    setIsSavingLocation(true);
    try {
      const payload = {
        location: {
          type: 'Point',
          coordinates: [lngNum, latNum], // GeoJSON standard: [longitude, latitude]
        },
        serviceRadiusKm: radiusNum,
      };

      const res = await chefService.updateProfile(payload);
      addToast(
        `Kitchen location & ${radiusNum} km service radius updated successfully!`,
        'success'
      );
      await refreshProfile();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to update location & radius.'), 'error');
    } finally {
      setIsSavingLocation(false);
    }
  };

  // Submit General Profile Updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseInt(serviceRadiusKm, 10);

      const hasValidCoords =
        !isNaN(lngNum) &&
        !isNaN(latNum) &&
        lngNum >= -180 &&
        lngNum <= 180 &&
        latNum >= -90 &&
        latNum <= 90;

      const payload = {
        kitchenName: formData.kitchenName.trim(),
        ownerName: formData.ownerName.trim(),
        kitchenAddress: formData.kitchenAddress.trim(),
        city: formData.city.trim(),
        description: formData.description.trim(),
        cuisineTypes: formData.cuisineTypes
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        foodCategories: formData.foodCategories
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        foodSafetyDetails: formData.fssaiLicenseNumber
          ? formData.fssaiLicenseNumber.trim()
          : typeof chefProfile?.foodSafetyDetails === 'string'
          ? chefProfile.foodSafetyDetails
          : '',
        ...(hasValidCoords && {
          location: {
            type: 'Point',
            coordinates: [lngNum, latNum], // [longitude, latitude]
          },
        }),
        serviceRadiusKm: radiusNum || 10,
      };

      const res = await chefService.updateProfile(payload);
      addToast(res.message || 'Kitchen profile updated successfully!', 'success');
      await refreshProfile();
      setIsEditing(false);
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to update kitchen profile.'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#27352F] tracking-tight">
              Kitchen Profile &amp; Location
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.badgeClass}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
            Manage your kitchen identity, GPS coordinates, delivery service radius, and food safety details.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-95"
            >
              <Edit2 className="w-4 h-4 text-[#F6A23A]" />
              <span>Edit Details</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-[#E8ECE7] text-[#27352F] text-xs sm:text-sm font-bold hover:bg-[#F7F8F5] transition cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Warning on Re-verification if critical fields edited */}
      {isEditing && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">Compliance Notice:</span> Updating critical
            compliance details such as kitchen address, city, or FSSAI number will
            place your account in <span className="font-bold">"Pending Verification"</span>{' '}
            for Safety re-approval. Setting your GPS coordinates and adjusting your delivery radius
            does not interrupt active kitchen operations.
          </p>
        </div>
      )}

      {/* LOCATION & SERVICE AREA SECTION (FIRST-CLASS CHEF LOCATION MANAGEMENT) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8ECE7]">
          <div className="flex items-center gap-2 text-sm font-bold text-[#14513F] uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#F6A23A]" />
            <span>Kitchen Location &amp; Service Radius</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#14513F]/10 text-[#14513F]">
            GeoJSON 2dsphere Enabled
          </span>
        </div>

        {/* Informative Visual Coverage Banner */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#F6A23A]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F6A23A] flex items-center justify-center shrink-0 mt-0.5">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#14513F]">
                Active Service Reach: Within {serviceRadiusKm} KM Radius
              </p>
              <p className="text-[11px] text-[#737B76] mt-0.5 leading-snug">
                Only customers located within <strong className="text-[#27352F]">{serviceRadiusKm} km</strong> of your kitchen coordinates will discover your kitchen and be able to book meals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocatingGPS}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border-2 border-[#14513F] text-[#14513F] hover:bg-[#14513F]/5 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isLocatingGPS ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F6A23A]" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-[#F6A23A]" />
            )}
            <span>{isLocatingGPS ? 'Detecting GPS...' : 'Auto-Detect Current GPS'}</span>
          </button>
        </div>

        {/* Coordinates Inputs & Pin Adjuster */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Latitude */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#27352F] uppercase tracking-wider">
                Latitude (lat)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustCoordinate('lat', -0.001)}
                  className="px-1.5 py-0.5 rounded bg-[#F7F8F5] border text-[10px] font-bold text-[#737B76] hover:text-[#14513F]"
                  title="Move South ~100m"
                >
                  -100m
                </button>
                <button
                  type="button"
                  onClick={() => adjustCoordinate('lat', 0.001)}
                  className="px-1.5 py-0.5 rounded bg-[#F7F8F5] border text-[10px] font-bold text-[#737B76] hover:text-[#14513F]"
                  title="Move North ~100m"
                >
                  +100m
                </button>
              </div>
            </div>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g. 26.846700"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] font-mono focus:outline-none focus:border-[#14513F] transition"
            />
          </div>

          {/* Longitude */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#27352F] uppercase tracking-wider">
                Longitude (lng)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustCoordinate('lng', -0.001)}
                  className="px-1.5 py-0.5 rounded bg-[#F7F8F5] border text-[10px] font-bold text-[#737B76] hover:text-[#14513F]"
                  title="Move West ~100m"
                >
                  -100m
                </button>
                <button
                  type="button"
                  onClick={() => adjustCoordinate('lng', 0.001)}
                  className="px-1.5 py-0.5 rounded bg-[#F7F8F5] border text-[10px] font-bold text-[#737B76] hover:text-[#14513F]"
                  title="Move East ~100m"
                >
                  +100m
                </button>
              </div>
            </div>
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="e.g. 80.946200"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] font-mono focus:outline-none focus:border-[#14513F] transition"
            />
          </div>
        </div>

        {/* Service Radius Presets */}
        <div>
          <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-2">
            Configure Service Delivery Radius
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { km: 3, label: '3 KM', note: 'Hyperlocal Walking/Cycling' },
              { km: 5, label: '5 KM', note: 'Standard Neighborhood' },
              { km: 10, label: '10 KM', note: 'Recommended City Radius' },
              { km: 15, label: '15 KM', note: 'Extended Vehicle Delivery' },
            ].map((option) => (
              <button
                key={option.km}
                type="button"
                onClick={() => setServiceRadiusKm(option.km)}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  serviceRadiusKm === option.km
                    ? 'border-[#14513F] bg-[#14513F]/10 text-[#14513F] font-bold shadow-xs'
                    : 'border-[#E8ECE7] bg-white hover:border-[#14513F]/40 text-[#27352F]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black">{option.label}</span>
                  {serviceRadiusKm === option.km && (
                    <CheckCircle2 className="w-4 h-4 text-[#14513F]" />
                  )}
                </div>
                <p className="text-[10px] text-[#737B76] mt-0.5 line-clamp-1">{option.note}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Fast Save Location Action */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8ECE7]">
          <span className="text-[11px] text-[#737B76]">
            GeoJSON format: <code>[lng: {lng}, lat: {lat}]</code>
          </span>
          <button
            type="button"
            onClick={handleSaveLocationOnly}
            disabled={isSavingLocation}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSavingLocation ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F6A23A]" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[#F6A23A]" />
            )}
            <span>{isSavingLocation ? 'Updating...' : 'Save Location & Radius'}</span>
          </button>
        </div>
      </div>

      {/* Main General Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kitchen Identity Section */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#14513F] uppercase tracking-wider pb-2 border-b border-[#E8ECE7]">
            <UtensilsCrossed className="w-4 h-4 text-[#F6A23A]" />
            <span>Kitchen Brand Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Kitchen Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.kitchenName}
                  onChange={(e) =>
                    setFormData({ ...formData, kitchenName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                />
              ) : (
                <p className="text-sm font-bold text-[#27352F] py-1">
                  {formData.kitchenName || 'Not configured'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Owner / Head Chef Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                />
              ) : (
                <p className="text-sm font-bold text-[#27352F] py-1">
                  {formData.ownerName || user?.name || 'Chef'}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
              Kitchen Bio / Description
            </label>
            {isEditing ? (
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition resize-none"
              />
            ) : (
              <p className="text-xs sm:text-sm text-[#737B76] leading-relaxed py-1">
                {formData.description || 'No description provided.'}
              </p>
            )}
          </div>
        </div>

        {/* Address & City Details */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#14513F] uppercase tracking-wider pb-2 border-b border-[#E8ECE7]">
            <Building className="w-4 h-4 text-[#F6A23A]" />
            <span>Kitchen Postal Address</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                City / Operating Hub
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                />
              ) : (
                <p className="text-sm font-bold text-[#27352F] py-1">
                  {formData.city || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Registered Contact Email
              </label>
              <p className="text-sm font-bold text-[#27352F] py-1">
                {user?.email}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
              Complete Kitchen Address
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.kitchenAddress}
                onChange={(e) =>
                  setFormData({ ...formData, kitchenAddress: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
              />
            ) : (
              <p className="text-sm text-[#737B76] py-1">
                {formData.kitchenAddress || 'Not provided'}
              </p>
            )}
          </div>
        </div>

        {/* Cuisines & Safety */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#14513F] uppercase tracking-wider pb-2 border-b border-[#E8ECE7]">
            <ShieldCheck className="w-4 h-4 text-[#F6A23A]" />
            <span>Cuisines &amp; Safety Compliance</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Cuisine Specialties (comma separated)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.cuisineTypes}
                  onChange={(e) =>
                    setFormData({ ...formData, cuisineTypes: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                />
              ) : (
                <p className="text-sm font-bold text-[#27352F] py-1">
                  {formData.cuisineTypes || 'North Indian, Homestyle'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                FSSAI License / Registration No
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fssaiLicenseNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fssaiLicenseNumber: e.target.value,
                    })
                  }
                  placeholder="14-digit FSSAI number"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                />
              ) : (
                <p className="text-sm font-bold text-[#27352F] py-1">
                  {formData.fssaiLicenseNumber || 'Not submitted'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button when editing general details */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl border border-[#E8ECE7] text-sm font-semibold text-[#27352F] hover:bg-[#F7F8F5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Kitchen Profile</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChefProfilePage;
