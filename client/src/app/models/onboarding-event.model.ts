export interface OnboardingEvent {
    id?: number;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    color: string;
    maxParticipants: number;
    isActive: boolean;
    createdAt?: string;
  }