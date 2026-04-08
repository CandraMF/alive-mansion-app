export default function AdminOverview() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Overview</h1>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
          Today's Performance
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

        <div className="bg-white border border-gray-200 p-6 rounded-md shadow-sm">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-2xl font-black">IDR 4.250.000</p>
          <p className="text-[10px] font-bold text-green-600 mt-2">+12% from yesterday</p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-md shadow-sm">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Orders to Ship</h3>
          <p className="text-2xl font-black">8</p>
          <p className="text-[10px] font-bold text-orange-600 mt-2">Requires immediate action</p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-md shadow-sm">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Active Products</h3>
          <p className="text-2xl font-black">24</p>
          <p className="text-[10px] font-bold text-gray-400 mt-2">2 items out of stock</p>
        </div>

      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden mt-4">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest">Recent Orders</h3>
          <button className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-widest border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-bold">Order ID</th>
                <th className="px-6 py-3 font-bold">Customer</th>
                <th className="px-6 py-3 font-bold">Date</th>
                <th className="px-6 py-3 font-bold">Total</th>
                <th className="px-6 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Dummy Order 1 */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold">#ALV-001</td>
                <td className="px-6 py-4">Budi Santoso</td>
                <td className="px-6 py-4 text-gray-500">Today, 14:30</td>
                <td className="px-6 py-4 font-bold">IDR 850.000</td>
                <td className="px-6 py-4">
                  <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest">
                    Pending
                  </span>
                </td>
              </tr>
              {/* Dummy Order 2 */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold">#ALV-002</td>
                <td className="px-6 py-4">Andi Wijaya</td>
                <td className="px-6 py-4 text-gray-500">Yesterday, 09:15</td>
                <td className="px-6 py-4 font-bold">IDR 450.000</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest">
                    Paid
                  </span>
                </td>
              </tr>
              {/* Dummy Order 3 */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold">#ALV-003</td>
                <td className="px-6 py-4">Siti Aminah</td>
                <td className="px-6 py-4 text-gray-500">Mon, 11 Oct</td>
                <td className="px-6 py-4 font-bold">IDR 1.200.000</td>
                <td className="px-6 py-4">
                  <span className="bg-gray-200 text-gray-600 px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest">
                    Shipped
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}