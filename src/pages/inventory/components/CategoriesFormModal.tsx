import { useEffect, useState } from 'react';

interface CategoriesFormModalProps {
  category: string | null;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function CategoriesFormModal({ category, onClose, onSave }: CategoriesFormModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(category || '');
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">{category ? 'Edit Category' : 'Add Category'}</h3>
            <p className="text-xs text-gray-400 mt-1">This updates the inventory category list.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Category Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Packaging"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 cursor-pointer"
            >
              {category ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
