import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Shield, Heart, AlertTriangle, Ambulance, Users } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <Heart className="h-8 w-8 text-emergency" />
            <span className="text-2xl font-bold">Lifeline Dashboard</span>
          </div>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight">
            Emergency Response
            <span className="text-primary block">Management System</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline emergency response with real-time coordination, medical ID management, 
            and comprehensive incident tracking for first responders and dispatch teams.
          </p>
          <div className="flex items-center justify-center space-x-4 pt-8">
            <Button size="lg" asChild>
              <a href="/auth">Get Started</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Emergency Management</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to coordinate effective emergency response
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <AlertTriangle className="h-12 w-12 text-emergency mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Emergency Tracking</h3>
              <p className="text-muted-foreground">
                Monitor and respond to emergencies as they happen with live updates and priority-based dispatch.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <Heart className="h-12 w-12 text-info mb-4" />
              <h3 className="text-xl font-semibold mb-2">Medical ID Management</h3>
              <p className="text-muted-foreground">
                Access critical medical information instantly to provide appropriate emergency care.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <Ambulance className="h-12 w-12 text-success mb-4" />
              <h3 className="text-xl font-semibold mb-2">Resource Coordination</h3>
              <p className="text-muted-foreground">
                Manage ambulance deployment and first responder assignments efficiently.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-warning mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-role Access</h3>
              <p className="text-muted-foreground">
                Tailored dashboards for administrators, dispatchers, and first responders.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Communications</h3>
              <p className="text-muted-foreground">
                HIPAA-compliant data handling with secure real-time communication channels.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Comprehensive Reporting</h3>
              <p className="text-muted-foreground">
                Detailed incident logs and analytics to improve response times and outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24 text-center">
          <div className="bg-primary/5 p-12 rounded-2xl border">
            <h2 className="text-3xl font-bold mb-4">Ready to Save Lives?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join the emergency response network and help coordinate life-saving interventions 
              with our comprehensive management platform.
            </p>
            <Button size="lg" asChild>
              <a href="/auth">Join Emergency Network</a>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Shield className="h-5 w-5" />
            <Heart className="h-5 w-5" />
            <span>Lifeline Dashboard - Emergency Response Management System</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
