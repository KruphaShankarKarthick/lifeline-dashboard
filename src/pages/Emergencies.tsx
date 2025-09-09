import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertTriangle,
  MapPin,
  Clock,
  Phone,
  Plus,
  Search,
  Filter,
  Ambulance,
  CheckCircle,
} from 'lucide-react';

interface Accident {
  id: string;
  type: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'responded' | 'resolved';
  reporter_name: string;
  reporter_phone: string;
  reporter_id: string;
  assigned_ambulance_id?: string;
  created_at: string;
  updated_at: string;
}

const Emergencies = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newAccident, setNewAccident] = useState({
    type: '',
    description: '',
    location: '',
    priority: 'medium' as const,
    reporter_name: '',
    reporter_phone: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userRole = user?.user_metadata?.role || 'responder';

  useEffect(() => {
    fetchAccidents();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('accidents-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accidents'
        },
        () => fetchAccidents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAccidents = async () => {
    try {
      const { data, error } = await supabase
        .from('accidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccidents(data || []);
    } catch (error) {
      console.error('Error fetching accidents:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch emergency data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAccident = async () => {
    if (!newAccident.type || !newAccident.description || !newAccident.location) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('accidents')
        .insert([{
          ...newAccident,
          reporter_id: user?.id,
          status: 'active',
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Emergency report submitted successfully',
      });

      setNewAccident({
        type: '',
        description: '',
        location: '',
        priority: 'medium',
        reporter_name: '',
        reporter_phone: '',
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting accident:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit emergency report',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (accidentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('accidents')
        .update({ status })
        .eq('id', accidentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Emergency status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update emergency status',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emergency text-emergency-foreground';
      case 'responded': return 'bg-warning text-warning-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-emergency text-emergency-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-info text-info-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredAccidents = accidents.filter(accident => {
    const matchesSearch = accident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         accident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         accident.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || accident.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || accident.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Emergency Management</h2>
          <p className="text-muted-foreground">Monitor and respond to active emergencies</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Report Emergency
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Report New Emergency</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Emergency Type*</Label>
                <Input
                  id="type"
                  value={newAccident.type}
                  onChange={(e) => setNewAccident({ ...newAccident, type: e.target.value })}
                  placeholder="e.g., Car accident, Medical emergency"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  value={newAccident.description}
                  onChange={(e) => setNewAccident({ ...newAccident, description: e.target.value })}
                  placeholder="Detailed description of the emergency"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location*</Label>
                <Input
                  id="location"
                  value={newAccident.location}
                  onChange={(e) => setNewAccident({ ...newAccident, location: e.target.value })}
                  placeholder="Address or landmark"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newAccident.priority}
                  onValueChange={(value: any) => setNewAccident({ ...newAccident, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reporter_name">Reporter Name</Label>
                  <Input
                    id="reporter_name"
                    value={newAccident.reporter_name}
                    onChange={(e) => setNewAccident({ ...newAccident, reporter_name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reporter_phone">Phone Number</Label>
                  <Input
                    id="reporter_phone"
                    value={newAccident.reporter_phone}
                    onChange={(e) => setNewAccident({ ...newAccident, reporter_phone: e.target.value })}
                    placeholder="Contact number"
                  />
                </div>
              </div>
              <Button onClick={handleSubmitAccident} disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Submit Emergency Report'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-card p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emergencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Emergency List */}
      <div className="grid gap-4">
        {filteredAccidents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No emergencies found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? 'Try adjusting your search criteria.'
                  : 'No emergency reports at this time.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAccidents.map((accident) => (
            <Card key={accident.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-emergency" />
                    <div>
                      <CardTitle className="text-lg">{accident.type}</CardTitle>
                      <p className="text-sm text-muted-foreground">{accident.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(accident.priority)}>
                      {accident.priority}
                    </Badge>
                    <Badge className={getStatusColor(accident.status)}>
                      {accident.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{accident.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(accident.created_at).toLocaleString()}</span>
                  </div>
                  {accident.reporter_phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{accident.reporter_phone}</span>
                    </div>
                  )}
                  {accident.reporter_name && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Reporter: </span>
                      <span>{accident.reporter_name}</span>
                    </div>
                  )}
                </div>
                
                {(userRole === 'admin' || userRole === 'dispatcher') && (
                  <div className="flex items-center space-x-2">
                    {accident.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(accident.id, 'responded')}
                      >
                        <Ambulance className="h-4 w-4 mr-1" />
                        Respond
                      </Button>
                    )}
                    {accident.status === 'responded' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(accident.id, 'resolved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Emergencies;