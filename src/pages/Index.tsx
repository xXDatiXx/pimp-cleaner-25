
import { DashboardStats } from '@/components/DashboardStats';
import { ClientsTable } from '@/components/ClientsTable';
import { OrdersTable } from '@/components/OrdersTable';
import { RacksGrid } from '@/components/RacksGrid';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard de Reparaciones</h1>
        
        <DashboardStats />
        
        <div className="grid grid-cols-1 gap-8">
          <OrdersTable />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ClientsTable />
            <RacksGrid />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
