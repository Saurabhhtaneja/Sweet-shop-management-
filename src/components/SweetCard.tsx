import { useState } from 'react';
import { Sweet, supabase } from '../lib/supabase';
import { ShoppingCart, Package, AlertCircle, CheckCircle } from 'lucide-react';

interface SweetCardProps {
  sweet: Sweet;
  onUpdate: () => void;
}

export function SweetCard({ sweet, onUpdate }: SweetCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePurchase = async () => {
    if (quantity > sweet.quantity) {
      setMessage({ type: 'error', text: 'Not enough stock available' });
      return;
    }

    setPurchasing(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage({ type: 'error', text: 'Please sign in to purchase' });
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/inventory/purchase`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sweetId: sweet.id,
          quantity,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Purchase failed');
      }

      setMessage({ type: 'success', text: 'Purchase successful!' });
      setQuantity(1);
      setTimeout(() => setMessage(null), 3000);
      onUpdate();
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setPurchasing(false);
    }
  };

  const isOutOfStock = sweet.quantity === 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="h-48 bg-gradient-to-br from-amber-300 via-orange-300 to-pink-300 flex items-center justify-center">
        <div className="text-6xl">🍬</div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{sweet.name}</h3>
            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              {sweet.category}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">
              ${sweet.price.toFixed(2)}
            </div>
          </div>
        </div>

        {sweet.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{sweet.description}</p>
        )}

        <div className="flex items-center gap-2 mb-4 text-sm">
          <Package className={`w-4 h-4 ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`} />
          <span className={`font-medium ${isOutOfStock ? 'text-red-600' : 'text-gray-700'}`}>
            {isOutOfStock ? 'Out of Stock' : `${sweet.quantity} in stock`}
          </span>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <p
              className={`text-sm ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label htmlFor={`quantity-${sweet.id}`} className="text-sm font-medium text-gray-700">
              Quantity:
            </label>
            <input
              id={`quantity-${sweet.id}`}
              type="number"
              min="1"
              max={sweet.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isOutOfStock}
              className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            onClick={handlePurchase}
            disabled={isOutOfStock || purchasing}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {purchasing ? 'Processing...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
