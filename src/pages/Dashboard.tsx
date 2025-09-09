import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertTriangle,
  Heart,
  Ambulance,
  Users,
  Activity,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';

interface DashboardStats {
  activeEmergencies: number;
  availableAmbulances: number;
  totalMedicalIds: number;
  totalUsers: number;
  recentAlerts: any[];
  activeAccidents: any[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeEmergencies: 0,
    availableAmbulances: 0,
    totalMedicalIds: 0,
    totalUsers: 0,
    recentAlerts: [],
    activeAccidents: [],
  });
  const [loading, setLoading] = useState(true);

  const userRole = user?.user_metadata?.role || 'responder';

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time subscription for accidents
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accidents'
        },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch active emergencies
      const { data: accidents } = await supabase
        .from('accidents')
        .select('*')
        .eq('status', 'active');

      // Fetch available ambulances
      const { data: ambulances } = await supabase
        .from('ambulances')
        .select('*')
        .eq('status', 'available');

      // Fetch medical IDs
      const { data: medicalIds } = await supabase
        .from('medical_ids')
        .select('id');

      // Fetch users (only for admin)
      let userData = null;
      if (userRole === 'admin') {
        const { data } = await supabase
          .from('profiles')
          .select('id');
        userData = data;
      }

      // Fetch recent alerts
      const { data: alerts } = await supabase
        .from('alert_logs')
        .select('*, accidents(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        activeEmergencies: accidents?.length || 0,
        availableAmbulances: ambulances?.length || 0,
        totalMedicalIds: medicalIds?.length || 0,
        totalUsers: userData?.length || 0,
        recentAlerts: alerts || [],
        activeAccidents: accidents || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-emergency text-emergency-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-info text-info-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-emergency';
      case 'high': return 'text-warning';
      case 'medium': return 'text-info';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">
          Here's what's happening in your emergency response system today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Emergencies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-emergency" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emergency">{stats.activeEmergencies}</div>
            <p className="text-xs text-muted-foreground">
              Incidents requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Ambulances</CardTitle>
            <Ambulance className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.availableAmbulances}</div>
            <p className="text-xs text-muted-foreground">
              Ready for deployment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical IDs</CardTitle>
            <Heart className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedicalIds}</div>
            <p className="text-xs text-muted-foreground">
              Registered medical profiles
            </p>
          </CardContent>
        </Card>

        {userRole === 'admin' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Total registered users
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active Incidents */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-emergency" />
              <span>Active Incidents</span>
            </CardTitle>
            <CardDescription>
              Current emergencies requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.activeAccidents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No active incidents at this time
              </p>
            ) : (
              <div className="space-y-3">
                {stats.activeAccidents.slice(0, 5).map((accident) => (
                  <div key={accident.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(accident.priority)}>
                          {accident.priority}
                        </Badge>
                        <span className="text-sm font-medium">{accident.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {accident.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{accident.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(accident.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Respond
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-info" />
              <span>Recent Alerts</span>
            </CardTitle>
            <CardDescription>
              Latest system alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentAlerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No recent alerts
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {alert.type === 'emergency_call' && <Phone className="h-4 w-4 text-emergency" />}
                      {alert.type === 'medical_alert' && <Heart className="h-4 w-4 text-info" />}
                      {alert.type === 'system_alert' && <Activity className="h-4 w-4 text-warning" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;