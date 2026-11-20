import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import foodService from '../../services/foodService';
import { extractErrorMessage } from '../../services/api';
import FoodCard from '../../components/food/FoodCard';
import FoodModalForm from '../../components/food/FoodModalForm';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { FOOD_TYPES } from '../../utils/constants';

export const ChefFoodsPage = () => {
  const { approvalStatus, isApproved } = useAuth();
  const { addToast } = useToast();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFoodType, setSelectedFoodType] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [deleteModalFood, setDeleteModalFood] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchFoodsAndCategories = useCallback(async () => {
    try {
      const [foodsRes, catsRes] = await Promise.allSettled([
        foodService.getFoods({ limit: 100 }),
        foodService.getCategories(),
      ]);

      if (foodsRes.status === 'fulfilled' && foodsRes.value?.foods) {
        setFoods(foodsRes.value.foods);
      }

      if (catsRes.status === 'fulfilled') {
        const catList = catsRes.value.categories || catsRes.value.data || [];
        setCategories(catList);
      }
    } catch (err) {
      console.error('Failed to load foods:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFoodsAndCategories();
  }, [fetchFoodsAndCategories]);

  // Client-side filtering
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      // Search
      if (
        searchQuery &&
        !food.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !food.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        const foodCatId = food.categoryId?._id || food.categoryId;
        if (foodCatId !== selectedCategory) return false;
      }

      // Food Type
      if (selectedFoodType !== 'all' && food.foodType !== selectedFoodType) {
        return false;
      }

      // Availability
      if (selectedAvailability === 'available' && !food.isAvailable) return false;
      if (selectedAvailability === 'unavailable' && food.isAvailable) return false;

      return true;
    });
  }, [foods, searchQuery, selectedCategory, selectedFoodType, selectedAvailability]);

  // Toggle availability
  const handleToggleAvailability = async (foodId, newStatus) => {
    setTogglingId(foodId);
    try {
      await foodService.toggleAvailability(foodId, newStatus);
      setFoods((prev) =>
        prev.map((f) => (f._id === foodId ? { ...f, isAvailable: newStatus } : f))
      );
      addToast(
        `Dish marked as ${newStatus ? 'available (in stock)' : 'sold out'}`,
        'success'
      );
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to update availability.'), 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Add / Edit submission
  const handleFormSubmit = async (formDataPayload) => {
    setIsSubmitting(true);
    try {
      if (editingFood) {
        await foodService.updateFood(editingFood._id, formDataPayload);
        addToast('Dish updated successfully!', 'success');
      } else {
        await foodService.createFood(formDataPayload);
        addToast('New dish added to your kitchen menu!', 'success');
      }
      setFormModalOpen(false);
      setEditingFood(null);
      fetchFoodsAndCategories();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to save food details.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete submission
  const handleConfirmDelete = async () => {
    if (!deleteModalFood) return;
    setIsSubmitting(true);
    try {
      await foodService.deleteFood(deleteModalFood._id);
      addToast('Dish deleted from menu.', 'info');
      setDeleteModalFood(null);
      fetchFoodsAndCategories();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to delete dish.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" text="Loading your kitchen menu..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#27352F] tracking-tight">
            Food Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
            Manage your recipes, pricing, stock availability, and ingredients.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchFoodsAndCategories();
            }}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-[#27352F] hover:border-[#14513F]/30 transition"
            title="Refresh Menu"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#14513F]' : ''}`} />
          </button>

          <button
            onClick={() => {
              setEditingFood(null);
              setFormModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8ECE7] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737B76]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dish name..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-xs sm:text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-xs sm:text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
            >
              <option value="all">All Food Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Food Type Dropdown */}
          <div>
            <select
              value={selectedFoodType}
              onChange={(e) => setSelectedFoodType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-xs sm:text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition capitalize"
            >
              <option value="all">All Dietary Types</option>
              {FOOD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Dropdown */}
          <div>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-xs sm:text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
            >
              <option value="all">All Stock Status</option>
              <option value="available">In Stock Only</option>
              <option value="unavailable">Sold Out Only</option>
            </select>
          </div>
        </div>

        {/* Active Filter Clear Tag */}
        {(searchQuery || selectedCategory !== 'all' || selectedFoodType !== 'all' || selectedAvailability !== 'all') && (
          <div className="flex items-center justify-between text-xs text-[#737B76] pt-2 border-t border-[#E8ECE7]">
            <span>
              Showing {filteredFoods.length} of {foods.length} dishes
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedFoodType('all');
                setSelectedAvailability('all');
              }}
              className="text-[#14513F] font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Dishes Grid */}
      {filteredFoods.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title={foods.length === 0 ? 'Your menu is empty' : 'No dishes match your filter'}
          description={
            foods.length === 0
              ? 'Start by adding your specialty homemade delicacies so customers can place orders.'
              : 'Try clearing your search query or changing filters to view other dishes.'
          }
          actionLabel={foods.length === 0 ? 'Add Your First Dish' : 'Clear Filters'}
          onAction={
            foods.length === 0
              ? () => {
                  setEditingFood(null);
                  setFormModalOpen(true);
                }
              : () => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedFoodType('all');
                  setSelectedAvailability('all');
                }
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredFoods.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              onEdit={(f) => {
                setEditingFood(f);
                setFormModalOpen(true);
              }}
              onDelete={(f) => setDeleteModalFood(f)}
              onToggleAvailability={handleToggleAvailability}
              isToggling={togglingId === food._id}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Food Modal */}
      <FoodModalForm
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingFood(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingFood}
        categories={categories}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteModalFood}
        onClose={() => setDeleteModalFood(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete "${deleteModalFood?.name}"?`}
        description="Are you sure you want to remove this dish from your kitchen menu? Customers won't be able to order it."
        confirmLabel="Delete Dish"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ChefFoodsPage;
