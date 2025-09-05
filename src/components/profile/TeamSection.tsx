import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, CreditCard, Shield, Plus } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';

interface TeamSectionProps {
  dealer: any;
}

const TeamSection: React.FC<TeamSectionProps> = ({ dealer }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamMembers();
  }, [dealer?.id]);

  const loadTeamMembers = async () => {
    if (!dealer?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('dealer_id', dealer.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading team members:', error);
      } else {
        setTeamMembers(data || []);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'manager':
        return 'secondary';
      case 'sales':
        return 'outline';
      case 'support':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'inactive':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
          <div className="space-y-3">
            <div className="h-32 bg-slate-200 rounded" />
            <div className="h-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!teamMembers || teamMembers.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Team Members</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">You haven't added any team members yet.</p>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Team Member
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Team Members</h2>
          <p className="text-slate-600 dark:text-slate-300">Your team members and their roles</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      <div className="grid gap-6">
        {teamMembers.map((member: any, index: number) => (
          <Card key={member.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-slate-100 text-slate-600">
                      {member.full_name ? member.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'TM'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {member.full_name || 'Unnamed Member'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                        {member.role || 'No Role'}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(member.status)} className="text-xs">
                        {member.status || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-900 dark:text-white">{member.email || 'Email not provided'}</span>
                </div>

                {member.mobile_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-900 dark:text-white">{member.mobile_number}</span>
                  </div>
                )}

                {member.aadhar_number && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-900 dark:text-white">
                      Aadhar: {member.aadhar_number.replace(/(\d{4})(\d{4})(\d{4})/, '$1-XXXX-XXXX')}
                    </span>
                  </div>
                )}
              </div>

              {/* Role Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Role & Permissions</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {member.role ? `${member.role.charAt(0).toUpperCase() + member.role.slice(1)} role` : 'No role assigned'}
                  </p>
                  {member.permissions && Object.keys(member.permissions).length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Permissions:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.keys(member.permissions).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Member Status */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Member since {new Date(member.created_at).toLocaleDateString()}</span>
                  <span>ID: {member.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamSection;
