import { ShoppingBag, Users, Package, DollarSign, AlertCircle } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-pulse">
      
      {/* HEADER SKELETON */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded-sm" />
        <div className="h-3 w-64 bg-gray-100 rounded-sm" />
      </div>

      {/* METRIC CARDS SKELETON */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`p-6 border ${i === 0 ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-sm h-32 flex flex-col justify-between`}>
            <div className="flex justify-between items-start">
              <div className={`h-3 w-20 ${i === 0 ? 'bg-gray-700' : 'bg-gray-100'} rounded-sm`} />
              <div className={`w-4 h-4 ${i === 0 ? 'bg-gray-700' : 'bg-gray-100'} rounded-full`} />
            </div>
            <div className="space-y-2">
              <div className={`h-6 w-32 ${i === 0 ? 'bg-gray-700' : 'bg-gray-100'} rounded-sm`} />
              <div className={`h-2 w-24 ${i === 0 ? 'bg-gray-800' : 'bg-gray-50'} rounded-sm`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT ORDERS SKELETON */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-gray-200 rounded-sm" />
            <div className="h-3 w-16 bg-gray-100 rounded-sm" />
          </div>

          <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-10 bg-gray-50 border-b border-gray-100" />
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-gray-100 rounded-sm" />
                    <div className="h-2 w-16 bg-gray-50 rounded-sm" />
                  </div>
                  <div className="h-3 w-20 bg-gray-100 rounded-sm" />
                  <div className="h-3 w-12 bg-gray-100 rounded-sm ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LOW STOCK SKELETON */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-gray-200 rounded-sm" />
            <div className="h-3 w-12 bg-gray-100 rounded-sm" />
          </div>

          <div className="bg-white border border-gray-200 shadow-sm p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-gray-100 rounded-sm" />
                  <div className="h-2 w-20 bg-gray-50 rounded-sm" />
                </div>
                <div className="h-5 w-12 bg-gray-50 rounded-sm" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}