import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useClients } from "@/hooks/useClients";
import { useOrders } from "@/hooks/useOrders";
import { useRacks } from "@/hooks/useRacks";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Plus, Package, CheckCircle, Clock, User, Mail, Phone, Trash2, Search, TrendingUp, DollarSign, MoreVertical, Edit, Settings } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  
  // Database hooks
  const { clients, loading: clientsLoading, addClient, updateClient, deleteClient } = useClients();
  const { orders, loading: ordersLoading, addOrder, updateOrder, updateOrderStatus, deleteOrder } = useOrders();
  const { racks, loading: racksLoading, addRack, updateRack, updateRackStatus, deleteRack } = useRacks();
  const { stats, loading: statsLoading, updateStat, getStatValue, calculateDerivedStats } = useDashboardStats();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  
  // Dialog states
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  
  // Form states
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", address: "" });
  const [newOrder, setNewOrder] = useState({ 
    client_id: "", 
    device_type: "",
    device_brand: "",
    device_model: "",
    problem_description: "",
    estimated_cost: 0,
    rack_id: "",
    notes: ""
  });

  // Status configuration
  const statusConfig = {
    pending: { label: "Pendiente", color: "bg-blue-500", icon: Package },
    in_progress: { label: "En Progreso", color: "bg-yellow-500", icon: Clock },
    completed: { label: "Completado", color: "bg-green-500", icon: CheckCircle },
    cancelled: { label: "Cancelado", color: "bg-red-500", icon: Package }
  };

  // Rack status configuration
  const rackStatusConfig = {
    available: { label: "Disponible", color: "bg-green-500" },
    occupied: { label: "Ocupado", color: "bg-red-500" },
    maintenance: { label: "Mantenimiento", color: "bg-yellow-500" },
    out_of_service: { label: "Fuera de Servicio", color: "bg-gray-500" }
  };

  // Calculate stats when component mounts or orders change
  useEffect(() => {
    if (!ordersLoading) {
      calculateDerivedStats();
    }
  }, [orders, ordersLoading]);

  // Filter functions
  const filteredOrders = orders.filter(order => 
    order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.device_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone?.includes(clientSearchTerm)
  );

  // Client handlers
  const handleAddClient = async () => {
    if (newClient.name && newClient.email) {
      const result = await addClient(newClient);
      if (result) {
        setNewClient({ name: "", email: "", phone: "", address: "" });
        setIsClientDialogOpen(false);
      }
    }
  };

  const handleEditClient = async () => {
    if (editingClient && editingClient.name && editingClient.email) {
      const result = await updateClient(editingClient.id, editingClient);
      if (result) {
        setIsEditClientDialogOpen(false);
        setEditingClient(null);
      }
    }
  };

  // Order handlers
  const handleAddOrder = async () => {
    if (newOrder.client_id && newOrder.device_type && newOrder.problem_description) {
      const orderData = {
        ...newOrder,
        order_number: `ORD-${Date.now()}`, // This will be overridden in the hook
        actual_cost: null,
        status: 'pending' as const,
        priority: 1,
        assigned_to: null,
        completed_at: null
      };
      
      const result = await addOrder(orderData);
      if (result) {
        setNewOrder({ 
          client_id: "", 
          device_type: "",
          device_brand: "",
          device_model: "",
          problem_description: "",
          estimated_cost: 0,
          rack_id: "",
          notes: ""
        });
        setIsOrderDialogOpen(false);
      }
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    await updateOrderStatus(orderId, newStatus);
  };

  // Dashboard stats
  const totalOrders = getStatValue('total_orders');
  const pendingOrders = getStatValue('pending_orders');
  const inProgressOrders = getStatValue('in_progress_orders');
  const completedOrders = getStatValue('completed_orders');
  const totalRevenue = getStatValue('total_revenue');

  return (
    <div className="min-h-screen bg-background dark vintage-pattern">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img 
              src="/lovable-uploads/963e805e-2488-4996-b59d-10f9b951544c.png" 
              alt="Ginger Bull Repair Room Logo" 
              className="h-32 w-auto vintage-pattern rounded-lg p-2 bg-card/50"
            />
            <div>
              <h1 className="text-5xl font-bold text-primary mb-2 font-playfair">Ginger Bull Repair Room</h1>
              <p className="text-accent text-xl font-merriweather">Premium Shoe Repair & Restoration Services</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Órdenes</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="racks">Racks</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingOrders}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedOrders}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Órdenes Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ordersLoading ? (
                      <p>Cargando órdenes...</p>
                    ) : (
                      orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{order.order_number}</p>
                            <p className="text-sm text-gray-500">{order.client?.name}</p>
                            <p className="text-sm text-gray-500">{order.device_type}</p>
                          </div>
                          <Badge className={statusConfig[order.status].color}>
                            {statusConfig[order.status].label}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estado de Racks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {racksLoading ? (
                      <p>Cargando racks...</p>
                    ) : (
                      Object.entries(rackStatusConfig).map(([status, config]) => {
                        const count = racks.filter(rack => rack.status === status).length;
                        return (
                          <div key={status} className="flex items-center justify-between p-2">
                            <span className="capitalize">{config.label}</span>
                            <Badge className={config.color}>{count}</Badge>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Órdenes</h2>
              <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Orden
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Orden</DialogTitle>
                    <DialogDescription>
                      Ingresa los detalles de la nueva orden de reparación.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="client" className="text-right">Cliente</Label>
                      <Select value={newOrder.client_id} onValueChange={(value) => setNewOrder({...newOrder, client_id: value})}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} - {client.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="device_type" className="text-right">Tipo de Dispositivo</Label>
                      <Input
                        id="device_type"
                        value={newOrder.device_type}
                        onChange={(e) => setNewOrder({...newOrder, device_type: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="device_brand" className="text-right">Marca</Label>
                      <Input
                        id="device_brand"
                        value={newOrder.device_brand}
                        onChange={(e) => setNewOrder({...newOrder, device_brand: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="device_model" className="text-right">Modelo</Label>
                      <Input
                        id="device_model"
                        value={newOrder.device_model}
                        onChange={(e) => setNewOrder({...newOrder, device_model: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="problem_description" className="text-right">Descripción del Problema</Label>
                      <Textarea
                        id="problem_description"
                        value={newOrder.problem_description}
                        onChange={(e) => setNewOrder({...newOrder, problem_description: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="estimated_cost" className="text-right">Costo Estimado</Label>
                      <Input
                        id="estimated_cost"
                        type="number"
                        value={newOrder.estimated_cost}
                        onChange={(e) => setNewOrder({...newOrder, estimated_cost: parseFloat(e.target.value) || 0})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="rack" className="text-right">Rack</Label>
                      <Select value={newOrder.rack_id} onValueChange={(value) => setNewOrder({...newOrder, rack_id: value})}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Seleccionar rack" />
                        </SelectTrigger>
                        <SelectContent>
                          {racks.filter(rack => rack.status === 'available').map((rack) => (
                            <SelectItem key={rack.id} value={rack.id}>
                              {rack.rack_number} - {rack.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="notes" className="text-right">Notas</Label>
                      <Textarea
                        id="notes"
                        value={newOrder.notes}
                        onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddOrder}>
                      Crear Orden
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, dispositivo o número de orden..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Número</th>
                        <th className="text-left p-4">Cliente</th>
                        <th className="text-left p-4">Dispositivo</th>
                        <th className="text-left p-4">Estado</th>
                        <th className="text-left p-4">Costo</th>
                        <th className="text-left p-4">Rack</th>
                        <th className="text-left p-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersLoading ? (
                        <tr>
                          <td colSpan={7} className="text-center p-4">Cargando órdenes...</td>
                        </tr>
                      ) : filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center p-4">No se encontraron órdenes</td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">{order.order_number}</td>
                            <td className="p-4">{order.client?.name}</td>
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{order.device_type}</p>
                                <p className="text-sm text-gray-500">{order.device_brand} {order.device_model}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value as any)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusConfig).map(([status, config]) => (
                                    <SelectItem key={status} value={status}>
                                      {config.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-4">
                              ${order.estimated_cost || 0}
                            </td>
                            <td className="p-4">
                              {order.rack?.rack_number || 'Sin asignar'}
                            </td>
                            <td className="p-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => deleteOrder(order.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
              <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                    <DialogDescription>
                      Ingresa los datos del nuevo cliente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Nombre</Label>
                      <Input
                        id="name"
                        value={newClient.name}
                        onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Teléfono</Label>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">Dirección</Label>
                      <Textarea
                        id="address"
                        value={newClient.address}
                        onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsClientDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddClient}>
                      Agregar Cliente
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar clientes..."
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="grid gap-4">
              {clientsLoading ? (
                <p>Cargando clientes...</p>
              ) : filteredClients.length === 0 ? (
                <p>No se encontraron clientes</p>
              ) : (
                filteredClients.map((client) => (
                  <Card key={client.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">{client.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4" />
                              {client.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4" />
                              {client.phone}
                            </div>
                          </div>
                          {client.address && (
                            <p className="text-sm text-gray-500">{client.address}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingClient(client);
                                setIsEditClientDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteClient(client.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Racks Tab */}
          <TabsContent value="racks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Gestión de Racks</h2>
            </div>

            <div className="grid gap-4">
              {racksLoading ? (
                <p>Cargando racks...</p>
              ) : racks.length === 0 ? (
                <p>No hay racks configurados</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {racks.map((rack) => (
                    <Card key={rack.id} className="relative">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{rack.rack_number}</h3>
                            <Badge className={rackStatusConfig[rack.status].color}>
                              {rackStatusConfig[rack.status].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{rack.location}</p>
                          <p className="text-sm text-gray-500">Capacidad: {rack.capacity}</p>
                          {rack.description && (
                            <p className="text-sm text-gray-500">{rack.description}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Client Dialog */}
        <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Modifica los datos del cliente.
              </DialogDescription>
            </DialogHeader>
            {editingClient && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Nombre</Label>
                  <Input
                    id="edit-name"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">Teléfono</Label>
                  <Input
                    id="edit-phone"
                    value={editingClient.phone}
                    onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-address" className="text-right">Dirección</Label>
                  <Textarea
                    id="edit-address"
                    value={editingClient.address}
                    onChange={(e) => setEditingClient({...editingClient, address: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditClientDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditClient}>
                Actualizar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;