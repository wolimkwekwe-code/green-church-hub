import { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import MemberForm from '@/components/MemberForm';
import MemberTable from '@/components/MemberTable';
import { Member, MemberFormData } from '@/types/member';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

const Dashboard = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const membersQuery = query(
        collection(db, 'members'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(membersQuery);
      const membersData: Member[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Member;
      });
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (data: MemberFormData) => {
    try {
      setFormLoading(true);
      const docRef = await addDoc(collection(db, 'members'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      const newMember: Member = {
        id: docRef.id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setMembers(prev => [newMember, ...prev]);
      setFormOpen(false);
      toast.success('Member added successfully');
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateMember = async (data: MemberFormData) => {
    if (!editingMember) return;
    
    try {
      setFormLoading(true);
      const memberRef = doc(db, 'members', editingMember.id);
      await updateDoc(memberRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      
      setMembers(prev => prev.map(m => 
        m.id === editingMember.id 
          ? { ...m, ...data, updatedAt: new Date() }
          : m
      ));
      
      setFormOpen(false);
      setEditingMember(null);
      toast.success('Member updated successfully');
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'members', id));
      setMembers(prev => prev.filter(m => m.id !== id));
      toast.success('Member deleted successfully');
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingMember(null);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
            <p className="mt-1 text-muted-foreground">
              Manage your church membership records
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-5 w-5" />
            Add Member
          </Button>
        </div>

        <div className="mb-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Total Members
              </CardTitle>
              <CardDescription>
                Active members in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{members.length}</p>
            </CardContent>
          </Card>
        </div>

        <MemberTable
          members={members}
          onEdit={handleEdit}
          onDelete={handleDeleteMember}
          loading={loading}
        />
      </main>

      <MemberForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={editingMember ? handleUpdateMember : handleAddMember}
        member={editingMember}
        loading={formLoading}
      />
    </div>
  );
};

export default Dashboard;
