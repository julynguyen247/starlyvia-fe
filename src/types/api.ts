export type UserRole = 'USER' | 'ADMIN';

export type User = {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl: string | null;
  bio: string | null;
};

export type AuthResponse = User & { token: string };

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  username: string;
  avatarUrl?: string;
  bio?: string;
};

export type GroupType =
  | 'SOLO'
  | 'COUPLE'
  | 'FRIENDS'
  | 'FAMILY'
  | 'DOUBLE_DATE'
  | 'CUSTOM';

export type Group = {
  id: string;
  name: string;
  description: string | null;
  type: GroupType;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type GroupRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type GroupMember = {
  id: string;
  group?: Group;
  userId: string;
  role: GroupRole;
  joinedAt: string;
};

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type GroupInvitation = {
  id: string;
  group: Group;
  inviterId: string;
  inviteeId: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
};

export type PlanStatus = 'DRAFT' | 'PLANNED' | 'COMPLETED' | 'CANCELLED';

export type PlanStopInput = {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  provider?: string;
  providerPlaceId?: string;
  photoUrl?: string;
  rating?: number;
  ratingCount?: number;
  websiteUrl?: string;
  phoneNumber?: string;
  orderIndex?: number;
  arrivalTime: string;
  departureTime: string;
  note?: string;
};

export type PlanStop = PlanStopInput & {
  id: string;
  planId: string;
};

export type TimelineSegment = {
  fromStopId: string;
  toStopId: string;
  fromStopName: string;
  toStopName: string;
  fromOrderIndex: number;
  toOrderIndex: number;
  fromDepartureTime: string;
  toArrivalTime: string;
};

export type Plan = {
  id: string;
  planName: string;
  planDescription: string;
  planStartDate: string;
  planEndDate: string;
  planStartTime: string;
  planEndTime: string;
  groupId: string | null;
  status: PlanStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  stops: PlanStop[];
  timeline: TimelineSegment[];
};

export type CreatePlanInput = {
  planName: string;
  planDescription: string;
  planStartDate: string;
  planEndDate: string;
  planStartTime: string;
  planEndTime: string;
  groupId: string;
  status: PlanStatus;
  stops: PlanStopInput[];
};

export type TravelMode = 'DRIVE' | 'WALK' | 'BICYCLE';

export type RouteCoordinate = {
  latitude: number;
  longitude: number;
};

export type RouteLeg = {
  fromStopIndex: number;
  toStopIndex: number;
  fromStopId: string;
  toStopId: string;
  distanceMeters: number;
  durationSeconds: number;
};

export type PlanRoute = {
  provider: string;
  travelMode: TravelMode;
  distanceMeters: number;
  durationSeconds: number;
  geometry: RouteCoordinate[];
  legs: RouteLeg[];
};

export type PlaceProvider = 'GOOGLE' | 'GEOAPIFY';

export type PlaceSuggestion = {
  provider: PlaceProvider;
  providerPlaceId: string | null;
  name: string | null;
  address: string | null;
  fullText: string | null;
};

export type PlaceDetails = {
  provider: PlaceProvider;
  providerPlaceId: string | null;
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
  rating: number | null;
  ratingCount: number | null;
  websiteUrl: string | null;
  phoneNumber: string | null;
};

export type NotificationStatus = 'UNREAD' | 'READ';

export type Notification = {
  id: string;
  recipientUserId: string;
  actorUserId: string | null;
  type: string;
  title: string;
  message: string;
  resourceType: string | null;
  resourceId: string | null;
  sourceEventId: string;
  sourceTopic: string;
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string;
  readAt: string | null;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};
