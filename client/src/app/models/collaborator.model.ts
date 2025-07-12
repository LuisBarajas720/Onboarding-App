export interface Collaborator {
  id: number;
  fullName: string;
  email: string;
  startDate: string;
  welcomeOnboardingStatus: boolean;
  techOnboardingStatus: boolean;
  assignedTechOnboardingEvent?: string;
}