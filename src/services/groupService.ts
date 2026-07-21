import type { Group, GroupInvitation, GroupMember, GroupType } from '../types/api';
import { request } from './apiClient';

export const groupService = {
  list() {
    return request<Group[]>('/api/v1/groups');
  },
  get(groupId: string) {
    return request<Group>(`/api/v1/groups/${groupId}`);
  },
  create(input: { name: string; description?: string; type: GroupType }) {
    return request<Group>('/api/v1/groups', { body: input, method: 'POST' });
  },
  members(groupId: string) {
    return request<GroupMember[]>(`/api/v1/groups/${groupId}/members`);
  },
  invite(groupId: string, inviteeId: string) {
    return request<GroupInvitation>(`/api/v1/groups/${groupId}/invitations`, {
      body: { inviteeId },
      method: 'POST',
    });
  },
  incomingInvitations() {
    return request<GroupInvitation[]>('/api/v1/groups/invitations/incoming');
  },
  outgoingInvitations() {
    return request<GroupInvitation[]>('/api/v1/groups/invitations/outgoing');
  },
  acceptInvitation(invitationId: string) {
    return request<GroupMember>(`/api/v1/groups/invitations/${invitationId}/accept`, {
      method: 'POST',
    });
  },
  rejectInvitation(invitationId: string) {
    return request<GroupInvitation>(`/api/v1/groups/invitations/${invitationId}/reject`, {
      method: 'POST',
    });
  },
  removeMember(groupId: string, memberUserId: string) {
    return request<void>(`/api/v1/groups/${groupId}/members/${memberUserId}`, {
      method: 'DELETE',
    });
  },
};
