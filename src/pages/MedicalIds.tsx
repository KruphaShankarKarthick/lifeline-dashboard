import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  Heart,
  Plus,
  Search,
  Calendar,
  Phone,
  User,
  AlertTriangle,
  Edit,
  Trash2,
} from 'lucide-react';

interface MedicalId {
  id: string;
  full_name: string;
  date_of_birth: string;
  blood_type: string;
  allergies: string | null;
  medications: string | null;
  medical_conditions: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const MedicalIds = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [medicalIds, setMedicalIds] = useState<MedicalId[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMedicalId, setNewMedicalId] = useState({
    full_name: '',
    date_of_birth: '',
    blood_type: '',
    allergies: '',
    medications: '',
    medical_conditions: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userRole = user?.user_metadata?.role || 'responder';

  useEffect(() => {
    fetchMedicalIds();
  }, []);

  const fetchMedicalIds = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_ids')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedicalIds(data || []);
    } catch (error) {
      console.error('Error fetching medical IDs:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch medical ID data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMedicalId = async () => {
    if (!newMedicalId.full_name || !newMedicalId.date_of_birth || !newMedicalId.blood_type) {
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
        .from('medical_ids')
        .insert([{
          ...newMedicalId,
          created_by: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Medical ID created successfully',
      });

      setNewMedicalId({
        full_name: '',
        date_of_birth: '',
        blood_type: '',
        allergies: '',
        medications: '',
        medical_conditions: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
      });
      setIsDialogOpen(false);
      fetchMedicalIds();
    } catch (error) {
      console.error('Error creating medical ID:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create medical ID',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedicalId = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medical ID?')) return;

    try {
      const { error } = await supabase
        .from('medical_ids')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Medical ID deleted successfully',
      });

      fetchMedicalIds();
    } catch (error) {
      console.error('Error deleting medical ID:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete medical ID',
      });
    }
  };

  const getBloodTypeColor = (bloodType: string) => {
    const colors = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-200 text-red-900',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-200 text-blue-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-yellow-100 text-yellow-800',
    };
    return colors[bloodType as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const filteredMedicalIds = medicalIds.filter(medicalId =>
    medicalId.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicalId.blood_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicalId.emergency_contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

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
          <h2 className="text-3xl font-bold tracking-tight">Medical IDs</h2>
          <p className="text-muted-foreground">Manage emergency medical identification records</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Medical ID
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Medical ID</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name*</Label>
                <Input
                  id="full_name"
                  value={newMedicalId.full_name}
                  onChange={(e) => setNewMedicalId({ ...newMedicalId, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth*</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={newMedicalId.date_of_birth}
                  onChange={(e) => setNewMedicalId({ ...newMedicalId, date_of_birth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_type">Blood Type*</Label>
                <Select
                  value={newMedicalId.blood_type}
                  onValueChange={(value) => setNewMedicalId({ ...newMedicalId, blood_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={newMedicalId.allergies}
                  onChange={(e) => setNewMedicalId({ ...newMedicalId, allergies: e.target.value })}
                  placeholder="List any known allergies"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  value={newMedicalId.medications}
                  onChange={(e) => setNewMedicalId({ ...newMedicalId, medications: e.target.value })}
                  placeholder="List current medications and dosages"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medical_conditions">Medical Conditions</Label>
                <Textarea
                  id="medical_conditions"
                  value={newMedicalId.medical_conditions}
                  onChange={(e) => setNewMedicalId({ ...newMedicalId, medical_conditions: e.target.value })}
                  placeholder="List any medical conditions or history"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Emergency Contact</Label>
                  <Input
                    id="emergency_contact_name"
                    value={newMedicalId.emergency_contact_name}
                    onChange={(e) => setNewMedicalId({ ...newMedicalId, emergency_contact_name: e.target.value })}
                    placeholder="Contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={newMedicalId.emergency_contact_phone}
                    onChange={(e) => setNewMedicalId({ ...newMedicalId, emergency_contact_phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <Button onClick={handleSubmitMedicalId} disabled={submitting} className="w-full">
                {submitting ? 'Creating...' : 'Create Medical ID'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4 bg-card p-4 rounded-lg">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, blood type, or emergency contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Medical ID List */}
      <div className="grid gap-4">
        {filteredMedicalIds.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No medical IDs found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : 'Create the first medical ID to get started.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMedicalIds.map((medicalId) => (
            <Card key={medicalId.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Heart className="h-5 w-5 text-emergency" />
                    <div>
                      <CardTitle className="text-lg">{medicalId.full_name}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Age: {calculateAge(medicalId.date_of_birth)}</span>
                        <span>DOB: {new Date(medicalId.date_of_birth).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getBloodTypeColor(medicalId.blood_type)}>
                      {medicalId.blood_type}
                    </Badge>
                    {(userRole === 'admin' || medicalId.created_by === user?.id) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMedicalId(medicalId.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medicalId.allergies && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="font-medium text-sm">Allergies</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">{medicalId.allergies}</p>
                    </div>
                  )}
                  
                  {medicalId.medications && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-info" />
                        <span className="font-medium text-sm">Medications</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">{medicalId.medications}</p>
                    </div>
                  )}
                  
                  {medicalId.medical_conditions && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">Medical Conditions</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">{medicalId.medical_conditions}</p>
                    </div>
                  )}
                  
                  {medicalId.emergency_contact_name && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-success" />
                        <span className="font-medium text-sm">Emergency Contact</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        {medicalId.emergency_contact_name}
                        {medicalId.emergency_contact_phone && ` - ${medicalId.emergency_contact_phone}`}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  Created: {new Date(medicalId.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicalIds;