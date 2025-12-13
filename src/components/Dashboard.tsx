import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sweet, supabase } from '../lib/supabase';
import { SweetCard } from './SweetCard';
import { AdminPanel } from './AdminPanel';
import { SearchBar } from './SearchBar';
import { LogOut, User, Crown, ShoppingBag } from 'lucide-react';

export function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [searchParams, setSearchParams] = useState({
    name: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    loadSweets();
  }, []);

  useEffect(() => {
    filterSweets();
  }, [sweets, searchParams]);

  const loadSweets = async () => {
    try {
      const { data, error } = await supabase
        .from('sweets')
        .select('*')
        .order('name');

      if (error) throw error;
      setSweets(data || []);
    } catch (error) {
      console.error('Error loading sweets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSweets = () => {
    let filtered = [...sweets];

    if (searchParams.name) {
      filtered = filtered.filter((sweet) =>
        sweet.name.toLowerCase().includes(searchParams.name.toLowerCase())
      );
    }

    if (searchParams.category) {
      filtered = filtered.filter(
        (sweet) => sweet.category === searchParams.category
      );
    }

    if (searchParams.minPrice) {
      const minPrice = parseFloat(searchParams.minPrice);
      filtered = filtered.filter((sweet) => sweet.price >= minPrice);
    }

    if (searchParams.maxPrice) {
      const maxPrice = parseFloat(searchParams.maxPrice);
      filtered = filtered.filter((sweet) => sweet.price <= maxPrice);
    }

    setFilteredSweets(filtered);
  };

  const categories = [...new Set(sweets.map((sweet) => sweet.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading sweet treats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Sweet Shop
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user?.email}</span>
                {isAdmin && (
                  <span title="Admin">
                    <Crown className="w-4 h-4 text-amber-500" />
                  </span>
                )}
              </div>

              {isAdmin && (
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition font-medium shadow-md hover:shadow-lg"
                >
                  {showAdminPanel ? 'View Shop' : 'Admin Panel'}
                </button>
              )}

              <button
                onClick={() => signOut()}
                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAdminPanel && isAdmin ? (
          <AdminPanel onUpdate={loadSweets} />
        ) : (
          <>
            <div className="mb-8">
              <SearchBar
                searchParams={searchParams}
                onSearchChange={setSearchParams}
                categories={categories}
              />
            </div>

            {filteredSweets.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block p-4 bg-white rounded-full mb-4 shadow-lg">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No sweets found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSweets.map((sweet) => (
                  <SweetCard key={sweet.id} sweet={sweet} onUpdate={loadSweets} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
