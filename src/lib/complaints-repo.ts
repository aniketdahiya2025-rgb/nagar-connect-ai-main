import { supabase } from "@/integrations/supabase/client";
import { addComplaint, createComplaint, getComplaints, type CreateComplaintInput } from "@/lib/complaints-store";
import type { Complaint } from "@/lib/sample-data";

type DbComplaintRow = {
  id: string;
  title: string;
  description: string;
  category: Complaint["category"];
  urgency: Complaint["urgency"];
  status: Complaint["status"];
  location: string;
  ward: string;
  lat: number;
  lng: number;
  reported_by: string;
  assigned_to: string;
  image_url: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

function mapRowToComplaint(row: DbComplaintRow): Complaint {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    urgency: row.urgency,
    status: row.status,
    location: row.location,
    ward: row.ward,
    lat: row.lat,
    lng: row.lng,
    reportedBy: row.reported_by,
    assignedTo: row.assigned_to,
    imageUrl: row.image_url ?? undefined,
    userId: row.user_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInputToRow(input: ReturnType<typeof createComplaint>): DbComplaintRow {
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    category: input.category,
    urgency: input.urgency,
    status: input.status,
    location: input.location,
    ward: input.ward,
    lat: input.lat,
    lng: input.lng,
    reported_by: input.reportedBy,
    assigned_to: input.assignedTo,
    image_url: input.imageUrl ?? null,
    user_id: input.userId ?? null,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  };
}

export async function fetchComplaints(userId?: string, officerMode = false): Promise<Complaint[]> {
  if (!officerMode && !userId) return [];
  try {
    const client = supabase as any;
    let query = client.from("complaints").select("*").order("created_at", { ascending: false });
    if (!officerMode && userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query;

    if (error || !data) return getComplaints();
    return (data as DbComplaintRow[]).map(mapRowToComplaint);
  } catch {
    return getComplaints();
  }
}

export async function createComplaintRecord(input: CreateComplaintInput): Promise<Complaint> {
  const local = addComplaint(input);
  try {
    const client = supabase as any;
    const row = mapInputToRow(local);
    const { error } = await client.from("complaints").insert(row);
    if (error) return local;
    return local;
  } catch {
    return local;
  }
}

export async function deployComplaintAuthority(complaintId: string, authorityName: string): Promise<boolean> {
  try {
    const client = supabase as any;
    const { error } = await client
      .from("complaints")
      .update({
        status: "assigned",
        assigned_to: authorityName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", complaintId);
    return !error;
  } catch {
    return false;
  }
}

export async function cancelComplaintByOfficer(complaintId: string): Promise<boolean> {
  try {
    const client = supabase as any;
    const { error } = await client
      .from("complaints")
      .update({
        status: "cancelled",
        assigned_to: "Cancelled by officer",
        updated_at: new Date().toISOString(),
      })
      .eq("id", complaintId);
    return !error;
  } catch {
    return false;
  }
}
