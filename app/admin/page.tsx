import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

        <Card className="shadow-sm rounded-md border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">IDR 4.250.000</div>
            <p className="text-[10px] font-bold text-green-600 mt-2">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-md border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Orders to Ship
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">8</div>
            <p className="text-[10px] font-bold text-orange-600 mt-2">Requires immediate action</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-md border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">24</div>
            <p className="text-[10px] font-bold text-gray-400 mt-2">2 items out of stock</p>
          </CardContent>
        </Card>

      </div>

      {/* RECENT ORDERS TABLE */}
      <Card className="shadow-sm rounded-md border-gray-200 overflow-hidden mt-4">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest">Recent Orders</h3>
          <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black">
            View All
          </Button>
        </div>

        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-widest h-12">Order ID</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-widest h-12">Customer</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-widest h-12">Date</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-widest h-12">Total</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-widest h-12">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Dummy Order 1 */}
            <TableRow className="hover:bg-gray-50 transition-colors">
              <TableCell className="font-bold text-xs py-4">#ALV-001</TableCell>
              <TableCell className="text-xs py-4">Budi Santoso</TableCell>
              <TableCell className="text-gray-500 text-xs py-4">Today, 14:30</TableCell>
              <TableCell className="font-bold text-xs py-4">IDR 850.000</TableCell>
              <TableCell className="py-4">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100 rounded-sm text-[9px] font-bold uppercase tracking-widest">
                  Pending
                </Badge>
              </TableCell>
            </TableRow>

            {/* Dummy Order 2 */}
            <TableRow className="hover:bg-gray-50 transition-colors">
              <TableCell className="font-bold text-xs py-4">#ALV-002</TableCell>
              <TableCell className="text-xs py-4">Andi Wijaya</TableCell>
              <TableCell className="text-gray-500 text-xs py-4">Yesterday, 09:15</TableCell>
              <TableCell className="font-bold text-xs py-4">IDR 450.000</TableCell>
              <TableCell className="py-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 rounded-sm text-[9px] font-bold uppercase tracking-widest">
                  Paid
                </Badge>
              </TableCell>
            </TableRow>

            {/* Dummy Order 3 */}
            <TableRow className="hover:bg-gray-50 transition-colors">
              <TableCell className="font-bold text-xs py-4">#ALV-003</TableCell>
              <TableCell className="text-xs py-4">Siti Aminah</TableCell>
              <TableCell className="text-gray-500 text-xs py-4">Mon, 11 Oct</TableCell>
              <TableCell className="font-bold text-xs py-4">IDR 1.200.000</TableCell>
              <TableCell className="py-4">
                <Badge variant="secondary" className="bg-gray-200 text-gray-600 hover:bg-gray-200 rounded-sm text-[9px] font-bold uppercase tracking-widest">
                  Shipped
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}