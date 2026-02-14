'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Clock, Users, ChevronDown } from 'lucide-react';
import { TutorCourse, TutorCategory, getTutorCategories } from '@/lib/tutor-lms';
import { getWordPressCoursesWithPrices } from '@/lib/wordpress';
import CourseCard from '@/components/courses/CourseCard';
import CourseFilters from '@/components/courses/CourseFilters';
import CourseSearch from '@/components/courses/CourseSearch';
import { useAuth } from '@/contexts/AuthContext';

export default function CoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<TutorCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<TutorCourse[]>([]);
  const [categories, setCategories] = useState<TutorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const hasLoadedData = useRef(false);

  // Load courses and categories immediately
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      console.log('🔄 [Courses Page] useEffect triggered', { authLoading, hasLoadedData: hasLoadedData.current });
      
      // Prevent duplicate calls
      if (hasLoadedData.current) {
        console.log('⏳ [Courses Page] Data already loaded, skipping');
        return;
      }
      
      console.log('🔄 [Courses Page] Starting data load...');
      
      try {
        setLoading(true);
        const [coursesData, categoriesData] = await Promise.all([
          getWordPressCoursesWithPrices({ per_page: 50 }),
          getTutorCategories()
        ]);
        
        // Skip enrollment check on courses list page for better performance
        // Enrollment will be checked when user tries to access the course
        console.log('⚡ Skipping enrollment check for better performance');
        console.log('📚 Loaded courses:', coursesData.length);
        console.log('📁 Loaded categories:', categoriesData.length);
        setCourses(coursesData);
        setFilteredCourses(coursesData);
        
        setCategories(categoriesData);
        hasLoadedData.current = true; // Set after successful data load
      } catch (error) {
        console.error('Error loading courses:', error);
        hasLoadedData.current = true; // Set even on error to prevent infinite loading
      } finally {
        console.log('✅ [Courses Page] Data loading complete, setting loading to false');
        setLoading(false);
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - load only once on mount

  // Filter and search courses
  useEffect(() => {
    console.log('🔄 Filtering courses. Total courses:', courses.length);
    let filtered = [...courses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(course =>
        course.categories?.some(cat => cat.slug === selectedCategory)
      );
    }

    // Level filter
    if (selectedLevel) {
      filtered = filtered.filter(course => course.course_level === selectedLevel);
    }

    // Price filter
    filtered = filtered.filter(course => {
      const price = course.course_price || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price_low':
          return (a.course_price || 0) - (b.course_price || 0);
        case 'price_high':
          return (b.course_price || 0) - (a.course_price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'enrolled':
          return (b.enrolled_count || 0) - (a.enrolled_count || 0);
        default:
          return 0;
      }
    });

    console.log('✅ Filtered courses:', filtered.length);
    setFilteredCourses(filtered);
  }, [courses, searchQuery, selectedCategory, selectedLevel, priceRange, sortBy]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const searchResults = await getWordPressCoursesWithPrices({
          search: query,
          category: selectedCategory,
          level: selectedLevel,
        });
        setFilteredCourses(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('newest');
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    selectedLevel,
    priceRange.min > 0 || priceRange.max < 10000
  ].filter(Boolean).length;

  console.log('🔍 Render state:', { loading, coursesCount: courses.length, filteredCount: filteredCourses.length });

  // Show skeleton only if we haven't loaded any data yet
  const isInitialLoading = loading && courses.length === 0 && categories.length === 0;
  
  if (isInitialLoading) {
    console.log('⏳ Still loading...', { loading, coursesCount: courses.length });
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering content with', filteredCourses.length, 'courses');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Nos Formations
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Découvrez notre catalogue de formations professionnelles
            </p>
            
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <CourseSearch
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Rechercher une formation..."
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="price_low">Prix croissant</option>
                  <option value="price_high">Prix décroissant</option>
                  <option value="rating">Mieux notés</option>
                  <option value="enrolled">Plus populaires</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <CourseFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Courses Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                {loading ? (
                  <h2 className="text-xl font-semibold text-gray-900">
                    Chargement des formations...
                  </h2>
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900">
                    {filteredCourses.length} formation{filteredCourses.length !== 1 ? 's' : ''} trouvée{filteredCourses.length !== 1 ? 's' : ''}
                  </h2>
                )}
                {!loading && activeFiltersCount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Filtres actifs: {activeFiltersCount}
                  </p>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chargement des formations...
                </h3>
                <p className="text-gray-600">
                  Veuillez patienter pendant que nous récupérons les formations
                </p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune formation trouvée
                </h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CourseCard course={course} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
