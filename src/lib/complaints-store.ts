import { type Complaint, type ComplaintCategory, type UrgencyLevel } from "@/lib/sample-data";

const STORAGE_KEY = "nagar-connect-complaints";
export type CreateComplaintInput = {
  title: string;
  description: string;
  category: ComplaintCategory;
  urgency: UrgencyLevel;
  location: string;
  ward: string;
  userId: string;
  reportedBy: string;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getComplaints(): Complaint[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Complaint[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveComplaints(complaints: Complaint[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  window.dispatchEvent(new Event("complaints:updated"));
}

export function createComplaint(input: CreateComplaintInput): Complaint {
  const now = new Date().toISOString();
  return {
    id: `CMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    title: input.title || "Untitled issue",
    description: input.description || "No description provided.",
    category: input.category,
    urgency: input.urgency,
    status: "pending",
    location: input.location || "Location not specified",
    ward: input.ward || "Ward not specified",
    lat: 0,
    lng: 0,
    reportedBy: input.reportedBy,
    assignedTo: "",
    createdAt: now,
    updatedAt: now,
    userId: input.userId,
  };
}

export function addComplaint(input: CreateComplaintInput): Complaint {
  const complaint = createComplaint(input);
  const current = getComplaints();
  saveComplaints([complaint, ...current]);
  return complaint;
}
