import type {
  CreatePlanInput,
  Plan,
  PlanRoute,
  PlanStop,
  PlanStopInput,
  TravelMode,
} from '../types/api';
import { queryString, request } from './apiClient';

export const planService = {
  listByGroup(groupId: string) {
    return request<Plan[]>(`/api/v1/plans/groups/${groupId}`);
  },
  get(planId: string) {
    return request<Plan>(`/api/v1/plans/${planId}`);
  },
  create(input: CreatePlanInput) {
    return request<Plan>('/api/v1/plans', { body: input, method: 'POST' });
  },
  update(planId: string, input: Omit<CreatePlanInput, 'groupId'>) {
    return request<Plan>(`/api/v1/plans/${planId}`, { body: input, method: 'PUT' });
  },
  delete(planId: string) {
    return request<void>(`/api/v1/plans/${planId}`, { method: 'DELETE' });
  },
  route(planId: string, travelMode: TravelMode) {
    return request<PlanRoute>(
      `/api/v1/plans/${planId}/route${queryString({ travelMode })}`,
    );
  },
  addStop(planId: string, input: PlanStopInput) {
    return request<PlanStop>(`/api/v1/plans/${planId}/stops`, {
      body: input,
      method: 'POST',
    });
  },
  deleteStop(stopId: string) {
    return request<void>(`/api/v1/plan-stops/${stopId}`, { method: 'DELETE' });
  },
};
