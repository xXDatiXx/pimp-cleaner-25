
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background vintage-pattern">
      {/* Header with user info and logout */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-playfair font-bold text-foreground">
            Repair Room
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-playfair font-bold mb-4 text-foreground">
            Bienvenido a Repair Room
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tu espacio para gestionar reparaciones con estilo vintage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="country-card hover:shadow-lg transition-all duration-300 border-vintage-brown/20">
            <CardHeader>
              <CardTitle className="text-vintage-gold">Gestión de Reparaciones</CardTitle>
              <CardDescription>
                Administra y supervisa todas las reparaciones en progreso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Mantén un registro detallado de cada trabajo de reparación.
              </p>
              <Button className="w-full bg-vintage-brown hover:bg-vintage-brown/90 text-white">
                Ver Reparaciones
              </Button>
            </CardContent>
          </Card>

          <Card className="country-card hover:shadow-lg transition-all duration-300 border-vintage-rust/20">
            <CardHeader>
              <CardTitle className="text-vintage-rust">Inventario</CardTitle>
              <CardDescription>
                Control de piezas y herramientas disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Gestiona el stock de componentes y herramientas necesarias.
              </p>
              <Button className="w-full bg-vintage-rust hover:bg-vintage-rust/90 text-white">
                Ver Inventario
              </Button>
            </CardContent>
          </Card>

          <Card className="country-card hover:shadow-lg transition-all duration-300 border-vintage-gold/20">
            <CardHeader>
              <CardTitle className="text-vintage-gold">Clientes</CardTitle>
              <CardDescription>
                Base de datos de clientes y historial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Administra la información de tus clientes y su historial.
              </p>
              <Button className="w-full bg-vintage-gold hover:bg-vintage-gold/90 text-white">
                Ver Clientes
              </Button>
            </CardContent>
          </Card>

          <Card className="country-card hover:shadow-lg transition-all duration-300 border-wood-brown/20">
            <CardHeader>
              <CardTitle className="text-wood-brown">Estadísticas</CardTitle>
              <CardDescription>
                Reportes y métricas de rendimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Analiza el rendimiento de tu taller de reparaciones.
              </p>
              <Button className="w-full bg-wood-brown hover:bg-wood-brown/90 text-white">
                Ver Estadísticas
              </Button>
            </CardContent>
          </Card>

          <Card className="country-card hover:shadow-lg transition-all duration-300 border-vintage-tan/20">
            <CardHeader>
              <CardTitle className="text-vintage-tan">Configuración</CardTitle>
              <CardDescription>
                Ajustes del sistema y preferencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Personaliza la configuración según tus necesidades.
              </p>
              <Button className="w-full bg-vintage-tan hover:bg-vintage-tan/90 text-white">
                Configurar
              </Button>
            </CardContent>
          </Card>

          <Card className="country-card hover:shadow-lg transition-all duration-300 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Ayuda</CardTitle>
              <CardDescription>
                Soporte técnico y documentación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Encuentra respuestas a tus preguntas frecuentes.
              </p>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Obtener Ayuda
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
