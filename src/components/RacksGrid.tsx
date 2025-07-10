
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRacks } from '@/hooks/useRacks';

const statusColors = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  out_of_service: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  available: 'Disponible',
  occupied: 'Ocupado',
  maintenance: 'Mantenimiento',
  out_of_service: 'Fuera de Servicio',
};

export const RacksGrid = () => {
  const { data: racks, isLoading } = useRacks();

  if (isLoading) {
    return <div>Cargando racks...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Racks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {racks?.map((rack) => (
            <Card key={rack.id} className="border">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{rack.rack_number}</CardTitle>
                  <Badge className={statusColors[rack.status]}>
                    {statusLabels[rack.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Ubicación:</span> {rack.location || 'N/A'}</p>
                  <p><span className="font-medium">Capacidad:</span> {rack.capacity || 1}</p>
                  {rack.description && (
                    <p><span className="font-medium">Descripción:</span> {rack.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
