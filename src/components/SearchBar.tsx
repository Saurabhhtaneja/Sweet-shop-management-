import { Search, Filter, DollarSign } from 'lucide-react';

interface SearchBarProps {
  searchParams: {
    name: string;
    category: string;
    minPrice: string;
    maxPrice: string;
  };
  onSearchChange: (params: any) => void;
  categories: string[];
}

export function SearchBar({ searchParams, onSearchChange, categories }: SearchBarProps) {
  const handleChange = (field: string, value: string) => {
    onSearchChange({ ...searchParams, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-800">Search & Filter</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchParams.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Sweet name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={searchParams.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={searchParams.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={searchParams.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              placeholder="99.99"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>
        </div>
      </div>

      {(searchParams.name || searchParams.category || searchParams.minPrice || searchParams.maxPrice) && (
        <button
          onClick={() =>
            onSearchChange({ name: '', category: '', minPrice: '', maxPrice: '' })
          }
          className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
