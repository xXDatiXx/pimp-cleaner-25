
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClients } from '@/hooks/useClients';

export const ClientsTable = () => {
  const { data: clients, isLoading } = useClients();

  if (isLoading) {
    return <div>Cargando clientes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Fecha de Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.email || 'N/A'}</TableCell>
                <TableCell>{client.phone || 'N/A'}</TableCell>
                <TableCell>{client.address || 'N/A'}</TableCell>
                <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
