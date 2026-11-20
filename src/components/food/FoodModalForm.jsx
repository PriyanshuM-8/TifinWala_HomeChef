import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { FOOD_TYPES } from '../../utils/constants';

export const FoodModalForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    foodType: 'veg',
    preparationTime: '30',
    availableQuantity: '20',
    servingSize: 'Serves 1-2',
    ingredients: '',
    tags: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        categoryId: initialData.categoryId?._id || initialData.categoryId || '',
        price: initialData.price || '',
        foodType: initialData.foodType || 'veg',
        preparationTime: initialData.preparationTime || '30',
        availableQuantity: initialData.availableQuantity || '20',
        servingSize: initialData.servingSize || 'Serves 1-2',
        ingredients: Array.isArray(initialData.ingredients)
          ? initialData.ingredients.join(', ')
          : initialData.ingredients || '',
        tags: Array.isArray(initialData.tags)
          ? initialData.tags.join(', ')
          : initialData.tags || '',
      });
      setImagePreview(initialData.imageUrl || initialData.image?.url || '');
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        description: '',
        categoryId: categories[0]?._id || '',
        price: '',
        foodType: 'veg',
        preparationTime: '30',
        availableQuantity: '20',
        servingSize: 'Serves 1-2',
        ingredients: '',
        tags: '',
      });
      setImagePreview('');
      setImageFile(null);
    }
    setErrors({});
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Dish name is required';
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = 'Valid price in rupees is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.description.trim())
      newErrors.description = 'Description is required';
    if (!initialData && !imageFile && !imagePreview) {
      newErrors.image = 'Dish photo is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Use FormData for image upload
    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('description', formData.description.trim());
    payload.append('categoryId', formData.categoryId);
    payload.append('price', String(Number(formData.price)));
    payload.append('foodType', formData.foodType);
    payload.append('preparationTime', String(Number(formData.preparationTime) || 30));
    payload.append('availableQuantity', String(Number(formData.availableQuantity) || 10));
    payload.append('servingSize', formData.servingSize.trim());

    if (formData.ingredients.trim()) {
      payload.append('ingredients', formData.ingredients.trim());
    }
    if (formData.tags.trim()) {
      payload.append('tags', formData.tags.trim());
    }

    if (imageFile) {
      payload.append('image', imageFile);
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8ECE7] my-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:px-6 border-b border-[#E8ECE7] flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-[#27352F]">
              {initialData ? 'Edit Dish Details' : 'Add New Dish to Menu'}
            </h3>
            <p className="text-xs text-[#737B76]">
              Fill out your authentic homemade recipe details.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-[#737B76] hover:text-[#27352F] hover:bg-[#F7F8F5] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Dish Image Upload with Live Preview */}
          <div>
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-2">
              Dish Photograph <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-32 rounded-2xl bg-[#F7F8F5] border-2 border-dashed border-[#E8ECE7] flex items-center justify-center overflow-hidden shrink-0 relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#737B76]" />
                )}
              </div>

              <div className="flex-1 w-full">
                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-[#E8ECE7] hover:border-[#14513F] transition bg-[#F7F8F5] cursor-pointer">
                  <Upload className="w-6 h-6 text-[#14513F] mb-1" />
                  <span className="text-xs font-bold text-[#14513F]">
                    Click to browse dish photo
                  </span>
                  <span className="text-[11px] text-[#737B76] mt-0.5">
                    PNG, JPG or WEBP (Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
                {errors.image && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">
                    {errors.image}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dish Name */}
          <div>
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
              Dish Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Desi Ghee Paneer Butter Masala"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
            />
            {errors.name && (
              <p className="text-xs text-rose-500 font-semibold mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Category & Food Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {errors.categoryId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Dietary Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.foodType}
                onChange={(e) =>
                  setFormData({ ...formData, foodType: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition capitalize"
              >
                {FOOD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Serving Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="249"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
              />
              {errors.price && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Serving Size
              </label>
              <input
                type="text"
                value={formData.servingSize}
                onChange={(e) =>
                  setFormData({ ...formData, servingSize: e.target.value })
                }
                placeholder="e.g. Serves 1-2 (450g)"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Prep Time (Mins)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={formData.preparationTime}
                onChange={(e) =>
                  setFormData({ ...formData, preparationTime: e.target.value })
                }
                placeholder="30"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the flavors, spices, homestyle cooking style..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition resize-none"
            />
            {errors.description && (
              <p className="text-xs text-rose-500 font-semibold mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Ingredients & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Key Ingredients (comma separated)
              </label>
              <input
                type="text"
                value={formData.ingredients}
                onChange={(e) =>
                  setFormData({ ...formData, ingredients: e.target.value })
                }
                placeholder="Fresh Paneer, Desi Ghee, Kasuri Methi, Cashews"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="bestseller, spicy, homemade, north-indian"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-[#E8ECE7] flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl border border-[#E8ECE7] text-sm font-semibold text-[#27352F] hover:bg-[#F7F8F5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-sm font-semibold shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialData ? 'Update Dish' : 'Publish to Menu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodModalForm;
