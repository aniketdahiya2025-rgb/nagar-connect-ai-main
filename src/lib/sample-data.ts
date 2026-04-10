export type ComplaintCategory = 'pothole' | 'stray_dogs' | 'gender_violence' | 'food_scarcity' | 'water' | 'sanitation' | 'electricity' | 'other';
export type UrgencyLevel = 'high' | 'medium' | 'low';
export type ComplaintStatus = 'pending' | 'in_progress' | 'assigned' | 'resolved' | 'cancelled';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  urgency: UrgencyLevel;
  status: ComplaintStatus;
  location: string;
  ward: string;
  lat: number;
  lng: number;
  reportedBy: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  userId?: string;
}

export const categoryLabels: Record<ComplaintCategory, string> = {
  pothole: '🛣️ Road/Pothole',
  stray_dogs: '🐕 Stray Animals',
  gender_violence: '🛡️ Gender Safety',
  food_scarcity: '🍚 Food Scarcity',
  water: '💧 Water Supply',
  sanitation: '🧹 Sanitation',
  electricity: '💡 Electricity',
  other: '📋 Other',
};

export const urgencyColors: Record<UrgencyLevel, string> = {
  high: 'bg-urgent text-urgent-foreground',
  medium: 'bg-warning text-warning-foreground',
  low: 'bg-muted text-muted-foreground',
};

export const statusColors: Record<ComplaintStatus, string> = {
  pending: 'bg-warning/20 text-warning-foreground border-warning/30',
  in_progress: 'bg-accent/20 text-accent border-accent/30',
  assigned: 'bg-primary/20 text-primary border-primary/30',
  resolved: 'bg-success/20 text-success border-success/30',
  cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function getCategoryIcon(cat: ComplaintCategory): string {
  return categoryLabels[cat]?.split(' ')[0] || '📋';
}
