
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, CheckCircle, Wrench } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export const DashboardStats = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <div>Cargando estadísticas...</div>;
  }

  const statCards = [
    {
      title: 'Total Órdenes',
      value: stats?.totalOrders || 0,
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Pendientes',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'En Progreso',
      value: stats?.inProgressOrders || 0,
      icon: Wrench,
      color: 'text-orange-600',
    },
    {
      title: 'Completadas',
      value: stats?.completedOrders || 0,
      icon: CheckCircle,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
