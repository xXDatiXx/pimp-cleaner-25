import React, { useState, useMemo } from "react";
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Package, CheckCircle, Clock, User, Mail, Phone, GripVertical, Trash2, Search, TrendingUp, DollarSign, MoreVertical, Edit, Settings, Grid3X3, Info } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [metricsFilter, setMetricsFilter] = useState("all");
  const [dashboardSearch, setDashboardSearch] = useState({
    received: "",
    in_work: "",
    ready: ""
  });
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isRackInfoDialogOpen, setIsRackInfoDialogOpen] = useState(false);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  const [selectedRackInfo, setSelectedRackInfo] = useState<any>(null);
  const [deliveryOrder, setDeliveryOrder] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [pendingAmountReceived, setPendingAmountReceived] = useState(false);
  const ordersPerPage = 20;

  // Configuration states
  const [totalRacks, setTotalRacks] = useState(50); // Default 50 racks (10x5 grid)
  const [serviceTypes, setServiceTypes] = useState([
    { id: "basic_repair", name: "Basic Shoe Repair", price: 35 },
    { id: "sole_replacement", name: "Sole Replacement", price: 85 },
    { id: "heel_repair", name: "Heel Repair", price: 45 },
    { id: "leather_restoration", name: "Leather Restoration", price: 75 },
    { id: "boot_resoling", name: "Boot Resoling", price: 120 },
    { id: "vintage_restoration", name: "Vintage Restoration", price: 95 },
  ]);

  // New service form state
  const [newService, setNewService] = useState({ name: "", price: 0 });

  // Mock data - in real app this would come from Supabase
  const [clients, setClients] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", phone: "+1234567890" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1987654321" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "+1122334455" }
  ]);

  const [orders, setOrders] = useState([
    { 
      id: 1, 
      clientId: 1, 
      clientName: "John Doe", 
      status: "received", 
      receivedDate: "2024-06-25", 
      deliveryDate: "2024-06-30",
      deliveredDate: null,
      notes: "Handle with care",
      paymentStatus: "pending",
      amountPaid: 0,
      shoes: [
        { id: 1, brand: "Nike", service: "premium", details: "White Nike Air Force 1", rack: "A1" },
        { id: 2, brand: "Timberland", service: "suede", details: "Brown Timberlands", rack: "B2" }
      ]
    },
    { 
      id: 2, 
      clientId: 2, 
      clientName: "Jane Smith", 
      status: "in_work", 
      receivedDate: "2024-06-24", 
      deliveryDate: "2024-06-29",
      deliveredDate: null,
      notes: "Rush order",
      paymentStatus: "partial",
      amountPaid: 25,
      shoes: [
        { id: 3, brand: "Clarks", service: "clean_gent", details: "Black leather dress shoes", rack: "C3" }
      ]
    },
    { 
      id: 3, 
      clientId: 1, 
      clientName: "John Doe", 
      status: "ready", 
      receivedDate: "2024-06-22", 
      deliveryDate: "2024-06-28",
      deliveredDate: null,
      notes: "Customer notified",
      paymentStatus: "paid",
      amountPaid: 160,
      shoes: [
        { id: 4, brand: "Adidas", service: "ultra_white", details: "White Adidas Ultraboost", rack: "D4" }
      ]
    }
  ]);

  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [newOrder, setNewOrder] = useState({ 
    clientId: "", 
    notes: "",
    deliveryDate: "",
    paymentStatus: "pending",
    amountPaid: 0,
    shoes: [{ brand: "", service: "", details: "", rack: "" }]
  });

  const statusConfig = {
    received: { label: "Received", color: "bg-blue-500", icon: Package },
    in_work: { label: "In Work", color: "bg-yellow-500", icon: Clock },
    ready: { label: "Ready to Deliver", color: "bg-green-500", icon: CheckCircle },
    delivered: { label: "Delivered", color: "bg-gray-500", icon: CheckCircle }
  };

  // Helper function to calculate order total
  const calculateOrderTotal = (orderShoes: any[]) => {
    return orderShoes.reduce((total, shoe) => {
      const service = serviceTypes.find(s => s.id === shoe.service);
      return total + (service?.price || 0);
    }, 0);
  };

  // Generate rack matrix
  const generateRackMatrix = () => {
    const rows = Math.ceil(totalRacks / 10);
    const matrix = [];
    for (let row = 0; row < rows; row++) {
      const rowRacks = [];
      for (let col = 0; col < 10 && (row * 10 + col) < totalRacks; col++) {
        const rackNumber = row * 10 + col + 1;
        const rackId = `${String.fromCharCode(65 + row)}${col + 1}`;
        rowRacks.push(rackId);
      }
      matrix.push(rowRacks);
    }
    return matrix;
  };

  // Get occupied racks
  const getOccupiedRacks = () => {
    const occupied = new Set();
    orders.forEach(order => {
      if (order.status !== 'delivered') {
        order.shoes?.forEach(shoe => {
          if (shoe.rack) occupied.add(shoe.rack);
        });
      }
    });
    return occupied;
  };

  // Get free racks
  const getFreeRacks = () => {
    const allRacks = generateRackMatrix().flat();
    const occupied = getOccupiedRacks();
    return allRacks.filter(rack => !occupied.has(rack));
  };

  // Get rack information
  const getRackInfo = (rackId: string) => {
    for (const order of orders) {
      if (order.status !== 'delivered') {
        const shoe = order.shoes?.find(s => s.rack === rackId);
        if (shoe) {
          return { order, shoe };
        }
      }
    }
    return null;
  };

  // Handle rack click
  const handleRackClick = (rackId: string) => {
    const rackInfo = getRackInfo(rackId);
    if (rackInfo) {
      setSelectedRackInfo(rackInfo);
      setIsRackInfoDialogOpen(true);
    }
  };

  // Filter orders for dashboard (exclude delivered)
  const dashboardOrders = orders.filter(order => order.status !== 'delivered');
  
  // Filter orders for search
  const filteredOrders = orders.filter(order => 
    order.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter clients for search
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone.includes(clientSearchTerm)
  );

  // Pagination for orders
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Metrics calculations - fixed to prevent initialization errors
  const metricsData = useMemo(() => {
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    const allShoes = orders.flatMap(order => order.shoes || []);
    
    // Service usage statistics
    const serviceStats = serviceTypes.map(service => {
      const count = allShoes.filter(shoe => shoe.service === service.id).length;
      const revenue = count * service.price;
      return { ...service, count, revenue };
    }).sort((a, b) => b.count - a.count);

    // Revenue calculations
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + calculateOrderTotal(order.shoes || []);
    }, 0);
    const receivedRevenue = orders.reduce((sum, order) => sum + (order.amountPaid || 0), 0);
    const pendingRevenue = totalRevenue - receivedRevenue;
    
    return {
      serviceStats,
      totalRevenue,
      receivedRevenue,
      pendingRevenue,
      totalOrders: orders.length,
      deliveredOrders: deliveredOrders.length
    };
  }, [orders, serviceTypes]);

  const getOrdersByStatus = (status: string) => {
    const filteredOrders = dashboardOrders.filter(order => order.status === status);
    const searchTerm = dashboardSearch[status as keyof typeof dashboardSearch];
    
    if (!searchTerm) return filteredOrders;
    
    return filteredOrders.filter(order =>
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Configuration functions
  const handleAddService = () => {
    if (newService.name && newService.price > 0) {
      const service = {
        id: newService.name.toLowerCase().replace(/\s+/g, '_'),
        name: newService.name,
        price: newService.price
      };
      setServiceTypes([...serviceTypes, service]);
      setNewService({ name: "", price: 0 });
      toast({
        title: "Service Added",
        description: `${service.name} has been added successfully.`,
      });
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setServiceTypes(serviceTypes.filter(s => s.id !== serviceId));
    toast({
      title: "Service Removed",
      description: "Service has been removed successfully.",
    });
  };

  const handleUpdateTotalRacks = (newTotal: number) => {
    if (newTotal > 0 && newTotal <= 200) {
      setTotalRacks(newTotal);
      toast({
        title: "Racks Updated",
        description: `Total racks set to ${newTotal}.`,
      });
    }
  };

  const handleAddClient = () => {
    if (newClient.name && newClient.email && newClient.phone) {
      const client = {
        id: clients.length + 1,
        ...newClient
      };
      setClients([...clients, client]);
      setNewClient({ name: "", email: "", phone: "" });
      setIsClientDialogOpen(false);
      toast({
        title: "Client Added",
        description: `${client.name} has been added successfully.`,
      });
    }
  };

  const handleEditClient = () => {
    if (editingClient && editingClient.name && editingClient.email && editingClient.phone) {
      setClients(clients.map(client => 
        client.id === editingClient.id ? editingClient : client
      ));
      setIsEditClientDialogOpen(false);
      setEditingClient(null);
      toast({
        title: "Client Updated",
        description: `${editingClient.name} has been updated successfully.`,
      });
    }
  };

  const addShoeToOrder = () => {
    setNewOrder({
      ...newOrder,
      shoes: [...newOrder.shoes, { brand: "", service: "", details: "", rack: "" }]
    });
  };

  const removeShoeFromOrder = (index: number) => {
    if (newOrder.shoes.length > 1) {
      const updatedShoes = newOrder.shoes.filter((_, i) => i !== index);
      setNewOrder({ ...newOrder, shoes: updatedShoes });
    }
  };

  const updateShoeInOrder = (index: number, field: string, value: string) => {
    const updatedShoes = newOrder.shoes.map((shoe, i) => 
      i === index ? { ...shoe, [field]: value } : shoe
    );
    setNewOrder({ ...newOrder, shoes: updatedShoes });
  };

  const handleAddOrder = () => {
    if (newOrder.clientId && newOrder.shoes.every(shoe => shoe.brand && shoe.service && shoe.rack)) {
      const client = clients.find(c => c.id === parseInt(newOrder.clientId));
      const order = {
        id: orders.length + 1,
        clientId: parseInt(newOrder.clientId),
        clientName: client?.name || "",
        status: "received",
        receivedDate: new Date().toISOString().split('T')[0],
        deliveryDate: newOrder.deliveryDate,
        deliveredDate: null,
        notes: newOrder.notes,
        paymentStatus: newOrder.paymentStatus,
        amountPaid: newOrder.amountPaid,
        shoes: newOrder.shoes.map((shoe, index) => ({ ...shoe, id: Date.now() + index }))
      };
      setOrders([...orders, order]);
      setNewOrder({ 
        clientId: "", 
        notes: "",
        deliveryDate: "",
        paymentStatus: "pending",
        amountPaid: 0,
        shoes: [{ brand: "", service: "", details: "", rack: "" }]
      });
      setIsOrderDialogOpen(false);
      
      const totalShoes = order.shoes.length;
      toast({
        title: "Order Received",
        description: `New order from ${order.clientName} with ${totalShoes} shoe${totalShoes > 1 ? 's' : ''} has been received.`,
      });
    }
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    if (newStatus === 'delivered') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setDeliveryOrder(order);
        setIsDeliveryDialogOpen(true);
        setPendingAmountReceived(false); // Reset checkbox when opening dialog
        return;
      }
    }

    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, status: newStatus };
        if (newStatus === 'delivered') {
          updatedOrder.deliveredDate = new Date().toISOString().split('T')[0];
        }
        return updatedOrder;
      }
      return order;
    }));

    const order = orders.find(o => o.id === orderId);
    if (order) {
      toast({
        title: "Status Updated",
        description: `${order.clientName}'s order moved to ${statusConfig[newStatus as keyof typeof statusConfig].label}`,
      });
    }
  };

  const confirmDelivery = () => {
    if (deliveryOrder) {
      const pendingAmount = calculateOrderTotal(deliveryOrder.shoes) - (deliveryOrder.amountPaid || 0);
      if (pendingAmount > 0 && !pendingAmountReceived) {
        toast({
          title: "Payment Required",
          description: `Please collect the pending amount of $${pendingAmount} or check the 'Pending Amount Received' box.`,
          variant: "destructive"
        });
        return;
      }

      setOrders(orders.map(order => {
        if (order.id === deliveryOrder.id) {
          return {
            ...order,
            status: 'delivered',
            deliveredDate: new Date().toISOString().split('T')[0],
            paymentStatus: pendingAmountReceived ? 'paid' : order.paymentStatus,
            amountPaid: pendingAmountReceived ? calculateOrderTotal(order.shoes) : order.amountPaid
          };
        }
        return order;
      }));

      setIsDeliveryDialogOpen(false);
      setDeliveryOrder(null);
      setPendingAmountReceived(false);

      toast({
        title: "Order Delivered",
        description: `${deliveryOrder.clientName}'s order has been marked as delivered.`,
      });
    }
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId) {
      return;
    }

    const orderId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    handleStatusChange(orderId, newStatus);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'partial': return 'Abonado';
      default: return 'Pendiente';
    }
  };

  const calculateProgress = (order: any) => {
    const statuses = ['received', 'in_work', 'ready', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

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
          
          <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg">
                <Settings className="h-4 w-4 mr-2" />
                Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">System Configuration</DialogTitle>
                <DialogDescription className="text-gray-300">Manage services and rack settings</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Services Configuration */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Services Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-white">Service Name</Label>
                      <Input
                        value={newService.name}
                        onChange={(e) => setNewService({...newService, name: e.target.value})}
                        placeholder="e.g., Deep Clean - Leather"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Price</Label>
                      <Input
                        type="number"
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: parseInt(e.target.value) || 0})}
                        placeholder="Price in USD"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddService} className="bg-orange-500 hover:bg-orange-600 mb-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                  
                  <div className="space-y-2">
                    {serviceTypes.map(service => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div>
                          <span className="text-white font-medium">{service.name}</span>
                          <span className="text-green-400 ml-2">${service.price}</span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Racks Configuration */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Racks Configuration</h3>
                  <div className="flex items-center gap-4">
                    <div>
                      <Label className="text-white">Total Number of Racks</Label>
                      <Input
                        type="number"
                        value={totalRacks}
                        onChange={(e) => handleUpdateTotalRacks(parseInt(e.target.value) || 0)}
                        min="1"
                        max="200"
                        className="bg-gray-700 border-gray-600 text-white w-32"
                      />
                    </div>
                    <div className="text-sm text-gray-300">
                      <p>Current: {totalRacks} racks</p>
                      <p>Occupied: {getOccupiedRacks().size} racks</p>
                      <p>Free: {getFreeRacks().length} racks</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 border border-orange-500/30 shadow-lg">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-300">
              <Package className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="racks" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-300">
              <Grid3X3 className="h-4 w-4" />
              Racks
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-300">
              <TrendingUp className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-300">
              <User className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-300">
              <Clock className="h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(statusConfig).filter(([status]) => status !== 'delivered').map(([status, config]) => {
                  const Icon = config.icon;
                  const statusOrders = getOrdersByStatus(status);
                  return (
                    <div key={status} className="space-y-4">
                      <Card className="bg-gray-800 border-gray-700 shadow-xl">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-lg ${config.color} shadow-lg`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <Badge variant="secondary" className="text-lg font-bold bg-pink-500 text-white">
                              {statusOrders.length}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg text-white">{config.label}</CardTitle>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              placeholder="Search orders..."
                              value={dashboardSearch[status as keyof typeof dashboardSearch]}
                              onChange={(e) => setDashboardSearch({
                                ...dashboardSearch,
                                [status]: e.target.value
                              })}
                              className="pl-10 bg-gray-700 border-gray-600 text-white text-sm"
                            />
                          </div>
                        </CardHeader>
                      </Card>
                      
                      <Droppable droppableId={status}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-[300px] p-2 rounded-lg transition-colors ${
                              snapshot.isDraggingOver ? 'bg-gray-700/50' : 'bg-transparent'
                            }`}
                          >
                            {statusOrders.map((order, index) => (
                              <Draggable key={order.id} draggableId={order.id.toString()} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`mb-3 p-4 bg-gray-800 border border-gray-600 rounded-lg shadow-lg transition-all ${
                                      snapshot.isDragging ? 'rotate-3 shadow-2xl' : 'hover:bg-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div {...provided.dragHandleProps} className="mt-1">
                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <p className="font-medium text-white">{order.clientName}</p>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                                <MoreVertical className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-gray-800 border-gray-600">
                                              {Object.entries(statusConfig).map(([statusKey, statusInfo]) => (
                                                <DropdownMenuItem
                                                  key={statusKey}
                                                  onClick={() => handleStatusChange(order.id, statusKey)}
                                                  className="text-white hover:bg-gray-700"
                                                >
                                                  {statusInfo.label}
                                                </DropdownMenuItem>
                                              ))}
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                        
                                        <div className="text-xs text-gray-300 space-y-1">
                                          <div className="flex justify-between">
                                            <span>Recibido: {order.receivedDate}</span>
                                            <span>Entrega: {order.deliveryDate}</span>
                                          </div>
                                        </div>
                                        
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                          <div 
                                            className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${calculateProgress(order)}%` }}
                                          ></div>
                                        </div>
                                        
                                        <div className="space-y-1">
                                          {order.shoes.map((shoe, shoeIndex) => (
                                            <div key={shoeIndex} className="text-xs bg-gray-700 p-2 rounded">
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <div className="font-medium text-white">{shoe.brand}</div>
                                                  <div className="text-gray-400">{shoe.details}</div>
                                                  <div className="text-orange-400">
                                                    {serviceTypes.find(s => s.id === shoe.service)?.name}
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <div className="text-pink-400 font-medium">Rack: {shoe.rack}</div>
                                                  <div className="text-green-400">${serviceTypes.find(s => s.id === shoe.service)?.price}</div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                                          <div className="text-sm">
                                            <div className="font-bold text-pink-400">
                                              Total: ${calculateOrderTotal(order.shoes)}
                                            </div>
                                            <div className="text-green-400">
                                              Pagado: ${order.amountPaid || 0}
                                            </div>
                                            <div className="text-red-400">
                                              Pendiente: ${calculateOrderTotal(order.shoes) - (order.amountPaid || 0)}
                                            </div>
                                          </div>
                                          <Badge 
                                            className={`${getPaymentStatusColor(order.paymentStatus)} text-white text-xs`}
                                          >
                                            {getPaymentStatusLabel(order.paymentStatus)}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          </TabsContent>

          <TabsContent value="racks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Rack Management</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-300">Free ({getFreeRacks().length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-300">Occupied ({getOccupiedRacks().size})</span>
                </div>
              </div>
            </div>

            <Card className="bg-gray-800 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Rack Matrix</CardTitle>
                <CardDescription className="text-gray-300">
                  Visual representation of all racks. Click on any rack to see details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {generateRackMatrix().map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2 justify-center">
                      {row.map((rackId) => {
                        const isOccupied = getOccupiedRacks().has(rackId);
                        const occupiedShoe = isOccupied ? 
                          orders.flatMap(o => o.shoes || []).find(shoe => shoe.rack === rackId) : null;
                        
                        return (
                          <div
                            key={rackId}
                            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all hover:scale-105 ${
                              isOccupied 
                                ? 'bg-red-500 border-red-400 text-white' 
                                : 'bg-green-500 border-green-400 text-white hover:bg-green-400'
                            }`}
                            title={isOccupied ? `Occupied by ${occupiedShoe?.brand || 'Unknown'}` : 'Free rack'}
                            onClick={() => handleRackClick(rackId)}
                          >
                            {rackId}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    Free Racks ({getFreeRacks().length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {getFreeRacks().map(rack => (
                      <Badge key={rack} variant="outline" className="border-green-500 text-green-500">
                        {rack}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    Occupied Racks ({getOccupiedRacks().size})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                     {Array.from(getOccupiedRacks()).map((rack: string) => {
                       const shoe = orders.flatMap(o => o.shoes || []).find(s => s.rack === rack);
                       const order = orders.find(o => o.shoes?.some(s => s.rack === rack));
                       return (
                         <div key={rack} className="flex items-center justify-between p-2 bg-secondary rounded cursor-pointer hover:bg-accent" onClick={() => handleRackClick(rack)}>
                           <Badge variant="outline" className="border-destructive text-destructive">
                             {rack}
                           </Badge>
                           <div className="text-xs text-muted-foreground">
                             <div>{shoe?.brand} - {order?.clientName}</div>
                             <div className="text-accent">{serviceTypes.find(s => s.id === shoe?.service)?.name}</div>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Business Metrics</h2>
              <Select value={metricsFilter} onValueChange={setMetricsFilter}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Filter period" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">All Time</SelectItem>
                  <SelectItem value="month" className="text-white hover:bg-gray-700">This Month</SelectItem>
                  <SelectItem value="week" className="text-white hover:bg-gray-700">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-green-500 shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold bg-pink-500 text-white">
                      ${metricsData.totalRevenue}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-white">Total Revenue</CardTitle>
                </CardHeader>
              </Card>

              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-green-600 shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold bg-green-500 text-white">
                      ${metricsData.receivedRevenue}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-white">Revenue Received</CardTitle>
                </CardHeader>
              </Card>

              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-red-500 shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold bg-red-500 text-white">
                      ${metricsData.pendingRevenue}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-white">Pending Revenue</CardTitle>
                </CardHeader>
              </Card>

              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-blue-500 shadow-lg">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold bg-pink-500 text-white">
                      {metricsData.totalOrders}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-white">Total Orders</CardTitle>
                </CardHeader>
              </Card>

              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-orange-500 shadow-lg">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold bg-pink-500 text-white">
                      {metricsData.deliveredOrders}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-white">Delivered Orders</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Most Popular Services</CardTitle>
                <CardDescription className="text-gray-300">Service usage and revenue statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricsData.serviceStats.map((service, index) => (
                    <div key={service.id} className="flex items-center justify-between p-4 bg-gray-700 border border-gray-600 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{service.name}</p>
                          <p className="text-sm text-gray-400">${service.price} per service</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-pink-400">{service.count} orders</p>
                        <p className="text-sm text-green-400">${service.revenue} revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Client Management</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search clients..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white w-64"
                  />
                </div>
                <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Client</DialogTitle>
                      <DialogDescription className="text-gray-300">Enter client information to add them to the system.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-white">Name</Label>
                        <Input
                          id="name"
                          value={newClient.name}
                          onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newClient.email}
                          onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-white">Phone</Label>
                        <Input
                          id="phone"
                          value={newClient.phone}
                          onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <Button onClick={handleAddClient} className="w-full bg-orange-500 hover:bg-orange-600">Add Client</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map(client => (
                <Card key={client.id} className="bg-gray-800 border-gray-700 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <User className="h-5 w-5 text-orange-500" />
                        {client.name}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingClient(client);
                          setIsEditClientDialogOpen(true);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Mail className="h-4 w-4 text-pink-500" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Phone className="h-4 w-4 text-pink-500" />
                      {client.phone}
                    </div>
                    <div className="pt-2">
                      <Badge variant="outline" className="border-orange-500 text-orange-500">
                        {orders.filter(order => order.clientId === client.id).length} orders
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Edit Client</DialogTitle>
                  <DialogDescription className="text-gray-300">Update client information.</DialogDescription>
                </DialogHeader>
                {editingClient && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name" className="text-white">Name</Label>
                      <Input
                        id="edit-name"
                        value={editingClient.name}
                        onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email" className="text-white">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editingClient.email}
                        onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone" className="text-white">Phone</Label>
                      <Input
                        id="edit-phone"
                        value={editingClient.phone}
                        onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Button onClick={handleEditClient} className="w-full bg-orange-500 hover:bg-orange-600">Update Client</Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Order Management</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by client name..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 bg-gray-700 border-gray-600 text-white w-64"
                  />
                </div>
                <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      New Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New Order</DialogTitle>
                      <DialogDescription className="text-gray-300">Add a new shoe cleaning order with multiple shoes.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="client" className="text-white">Client</Label>
                          <Select value={newOrder.clientId} onValueChange={(value) => setNewOrder({...newOrder, clientId: value})}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              {clients.map(client => (
                                <SelectItem key={client.id} value={client.id.toString()} className="text-white hover:bg-gray-700">
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="deliveryDate" className="text-white">Delivery Date</Label>
                          <Input
                            id="deliveryDate"
                            type="date"
                            value={newOrder.deliveryDate}
                            onChange={(e) => setNewOrder({...newOrder, deliveryDate: e.target.value})}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-white text-lg">Shoes</Label>
                          <Button 
                            type="button" 
                            onClick={addShoeToOrder}
                            className="bg-pink-500 hover:bg-pink-600 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Shoe
                          </Button>
                        </div>
                        
                        {newOrder.shoes.map((shoe, index) => (
                          <Card key={index} className="bg-gray-700 border-gray-600">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-white font-medium">Shoe {index + 1}</h4>
                                {newOrder.shoes.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeShoeFromOrder(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                  <Label className="text-white">Marca</Label>
                                  <Input
                                    value={shoe.brand}
                                    onChange={(e) => updateShoeInOrder(index, 'brand', e.target.value)}
                                    placeholder="e.g., Nike, Adidas"
                                    className="bg-gray-600 border-gray-500 text-white"
                                  />
                                </div>
                                
                                <div>
                                  <Label className="text-white">Service</Label>
                                  <Select 
                                    value={shoe.service} 
                                    onValueChange={(value) => updateShoeInOrder(index, 'service', value)}
                                  >
                                    <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                                      <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      {serviceTypes.map(service => (
                                        <SelectItem key={service.id} value={service.id} className="text-white hover:bg-gray-700">
                                          {service.name} - ${service.price}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label className="text-white">Detalles del calzado</Label>
                                  <Input
                                    value={shoe.details}
                                    onChange={(e) => updateShoeInOrder(index, 'details', e.target.value)}
                                    placeholder="e.g., White Air Force 1"
                                    className="bg-gray-600 border-gray-500 text-white"
                                  />
                                </div>
                                
                                <div>
                                  <Label className="text-white">Rack</Label>
                                  <Select 
                                    value={shoe.rack} 
                                    onValueChange={(value) => updateShoeInOrder(index, 'rack', value)}
                                  >
                                    <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                                      <SelectValue placeholder="Select free rack" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-600 max-h-32 overflow-y-auto">
                                      {getFreeRacks().map(rack => (
                                        <SelectItem key={rack} value={rack} className="text-white hover:bg-gray-700">
                                          {rack}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div>
                        <Label htmlFor="notes" className="text-white">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newOrder.notes}
                          onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                          placeholder="Any special instructions or notes"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="paymentStatus" className="text-white">Payment Status</Label>
                          <Select 
                            value={newOrder.paymentStatus} 
                            onValueChange={(value) => setNewOrder({...newOrder, paymentStatus: value})}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select payment status" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="pending" className="text-white hover:bg-gray-700">Pendiente</SelectItem>
                              <SelectItem value="partial" className="text-white hover:bg-gray-700">Abonado</SelectItem>
                              <SelectItem value="paid" className="text-white hover:bg-gray-700">Pagado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="amountPaid" className="text-white">Amount Paid</Label>
                          <Input
                            id="amountPaid"
                            type="number"
                            min="0"
                            value={newOrder.amountPaid}
                            onChange={(e) => setNewOrder({...newOrder, amountPaid: parseInt(e.target.value) || 0})}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-pink-400">
                          Total: ${newOrder.shoes.reduce((total, shoe) => {
                            const service = serviceTypes.find(s => s.id === shoe.service);
                            return total + (service?.price || 0);
                          }, 0)}
                        </div>
                      </div>
                      
                      <Button onClick={handleAddOrder} className="w-full bg-orange-500 hover:bg-orange-600">Create Order</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card className="bg-gray-800 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">All Orders</CardTitle>
                <CardDescription className="text-gray-300">
                  {filteredOrders.length} orders found
                  {searchTerm && ` for "${searchTerm}"`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paginatedOrders.map(order => (
                    <div key={order.id} className="p-4 bg-gray-700 border border-gray-600 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-white">{order.clientName}</p>
                          <p className="text-sm text-gray-300">Received: {order.receivedDate}</p>
                          {order.deliveryDate && (
                            <p className="text-sm text-blue-400">Delivery: {order.deliveryDate}</p>
                          )}
                          {order.deliveredDate && (
                            <p className="text-sm text-green-400">Delivered: {order.deliveredDate}</p>
                          )}
                          {order.notes && <p className="text-xs text-gray-400 mt-1">{order.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-gray-500 text-gray-300">
                            {statusConfig[order.status as keyof typeof statusConfig].label}
                          </Badge>
                          <Badge className={`${getPaymentStatusColor(order.paymentStatus)} text-white`}>
                            {getPaymentStatusLabel(order.paymentStatus)}
                          </Badge>
                          <div className="text-lg font-bold text-pink-400">
                            ${calculateOrderTotal(order.shoes)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {order.shoes.map((shoe, shoeIndex) => (
                          <div key={shoeIndex} className="bg-gray-800 p-3 rounded border border-gray-600">
                            <div className="text-sm font-medium text-white">{shoe.brand}</div>
                            <div className="text-xs text-gray-400">{shoe.details}</div>
                            <div className="text-xs text-orange-400 font-medium">
                              {serviceTypes.find(s => s.id === shoe.service)?.name}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <div className="text-xs text-pink-400 font-bold">
                                ${serviceTypes.find(s => s.id === shoe.service)?.price}
                              </div>
                              <div className="text-xs text-blue-400">
                                Rack: {shoe.rack}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-gray-600 flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-green-400">Paid: ${order.amountPaid || 0}</span>
                          <span className="text-red-400 ml-4">
                            Pending: ${calculateOrderTotal(order.shoes) - (order.amountPaid || 0)}
                          </span>
                        </div>
                        <div className="w-32 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${calculateProgress(order)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-white hover:bg-gray-700"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer text-white hover:bg-gray-700 data-[active]:bg-orange-500"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-white hover:bg-gray-700"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rack Info Dialog */}
        <Dialog open={isRackInfoDialogOpen} onOpenChange={setIsRackInfoDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Info className="h-5 w-5 text-orange-500" />
                Rack Information
              </DialogTitle>
            </DialogHeader>
            {selectedRackInfo && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Rack: {selectedRackInfo.shoe.rack}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Client:</span>
                      <span className="text-white">{selectedRackInfo.order.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Brand:</span>
                      <span className="text-white">{selectedRackInfo.shoe.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Details:</span>
                      <span className="text-white">{selectedRackInfo.shoe.details}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Service:</span>
                      <span className="text-orange-400">
                        {serviceTypes.find(s => s.id === selectedRackInfo.shoe.service)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Price:</span>
                      <span className="text-green-400">
                        ${serviceTypes.find(s => s.id === selectedRackInfo.shoe.service)?.price}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status:</span>
                      <Badge className={`${statusConfig[selectedRackInfo.order.status as keyof typeof statusConfig].color} text-white`}>
                        {statusConfig[selectedRackInfo.order.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Received:</span>
                      <span className="text-white">{selectedRackInfo.order.receivedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Delivery:</span>
                      <span className="text-white">{selectedRackInfo.order.deliveryDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delivery Confirmation Dialog */}
        <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Confirm Delivery
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Review the order details and confirm payment before marking as delivered.
              </DialogDescription>
            </DialogHeader>
            {deliveryOrder && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-white font-semibold mb-3">Order #{deliveryOrder.id} - {deliveryOrder.clientName}</h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-300">Received:</span>
                        <span className="text-white ml-2">{deliveryOrder.receivedDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-300">Delivery Date:</span>
                        <span className="text-white ml-2">{deliveryOrder.deliveryDate}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Shoes:</h4>
                      {deliveryOrder.shoes.map((shoe: any, index: number) => (
                        <div key={index} className="bg-gray-600 p-3 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-white font-medium">{shoe.brand}</div>
                              <div className="text-gray-300 text-sm">{shoe.details}</div>
                              <div className="text-orange-400 text-sm">
                                {serviceTypes.find(s => s.id === shoe.service)?.name}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-pink-400 text-sm">Rack: {shoe.rack}</div>
                              <div className="text-green-400">${serviceTypes.find(s => s.id === shoe.service)?.price}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-600 pt-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Total Amount:</span>
                          <span className="text-pink-400 font-bold text-lg">${calculateOrderTotal(deliveryOrder.shoes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Amount Paid:</span>
                          <span className="text-green-400">${deliveryOrder.amountPaid || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Pending Amount:</span>
                          <span className={`font-bold ${
                            calculateOrderTotal(deliveryOrder.shoes) - (deliveryOrder.amountPaid || 0) > 0 
                              ? 'text-red-400' 
                              : 'text-green-400'
                          }`}>
                            ${calculateOrderTotal(deliveryOrder.shoes) - (deliveryOrder.amountPaid || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {calculateOrderTotal(deliveryOrder.shoes) - (deliveryOrder.amountPaid || 0) > 0 && (
                      <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 text-sm font-medium">
                          ⚠️ Payment Required: ${calculateOrderTotal(deliveryOrder.shoes) - (deliveryOrder.amountPaid || 0)} pending
                        </p>
                        <div className="flex items-center space-x-2 mt-3">
                          <Checkbox 
                            id="pending-received" 
                            checked={pendingAmountReceived}
                            onCheckedChange={(checked) => setPendingAmountReceived(checked as boolean)}
                            className="border-red-400 data-[state=checked]:bg-red-500"
                          />
                          <Label htmlFor="pending-received" className="text-red-300 text-sm cursor-pointer">
                            Pending amount received
                          </Label>
                        </div>
                      </div>
                    )}

                    {deliveryOrder.notes && (
                      <div>
                        <span className="text-gray-300 text-sm">Notes:</span>
                        <p className="text-white text-sm mt-1">{deliveryOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDeliveryDialogOpen(false);
                      setPendingAmountReceived(false);
                    }}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmDelivery}
                    disabled={calculateOrderTotal(deliveryOrder.shoes) - (deliveryOrder.amountPaid || 0) > 0 && !pendingAmountReceived}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
