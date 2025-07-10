
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/useOrders';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const OrdersTable = () => {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) {
    return <div>Cargando órdenes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes de Reparación</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Dispositivo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Rack</TableHead>
              <TableHead>Costo Estimado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>{order.clients?.name || 'N/A'}</TableCell>
                <TableCell>
                  {order.device_brand} {order.device_model} ({order.device_type})
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                    {statusLabels[order.status as keyof typeof statusLabels]}
                  </Badge>
                </TableCell>
                <TableCell>{order.racks?.rack_number || 'Sin asignar'}</TableCell>
                <TableCell>
                  {order.estimated_cost ? `$${order.estimated_cost}` : 'N/A'}
                </TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
