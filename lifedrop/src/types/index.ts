export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Priority = 'normal' | 'urgent' | 'critical';
export type RequestStatus = 'open' | 'fulfilled' | 'cancelled' | 'removed';

export interface Profile {
  id: string; full_name: string; email: string; phone: string | null; avatar_url: string | null;
  role: 'user' | 'donor'; is_suspended: boolean; created_at: string;
}
export interface Donor {
  id: string; user_id: string; blood_group: BloodGroup; date_of_birth: string | null; gender: string | null;
  last_donation_date: string | null; availability: 'available' | 'unavailable'; state: string; city: string;
  area: string; pin_code: string; bio: string | null; show_in_public: boolean; show_phone: boolean;
  is_verified: boolean; status: 'active' | 'removed';
}
export interface PublicDonor {
  id: string; full_name: string; avatar_url: string | null; blood_group: BloodGroup; state: string; city: string;
  area: string; pin_code: string; availability: 'available' | 'unavailable'; last_donation_date: string | null;
  bio: string | null; is_verified: boolean; phone: string | null;
}
export interface PublicRequest {
  id: string; request_code: string; blood_group: BloodGroup; hospital_name: string; state: string; city: string;
  units: number; required_date: string; priority: Priority; status: RequestStatus; message: string | null; created_at: string;
}
export interface BloodRequest extends PublicRequest {
  requester_id: string; patient_name: string; hospital_address: string; pin_code: string;
  contact_person: string; contact_number: string;
}
export interface AppNotification {
  id: string; user_id: string; request_id: string | null; type: string; title: string; body: string;
  is_read: boolean; created_at: string;
  request?: Pick<BloodRequest, 'request_code' | 'blood_group' | 'city' | 'hospital_name' | 'required_date' | 'priority' | 'status'> | null;
}
export interface DonorResponse {
  donor_user_id: string; full_name: string; blood_group: string; city: string; phone: string | null;
  response: 'interested' | 'declined'; message: string | null; responded_at: string;
}
export interface Paged<T> { items: T[]; total: number; pageSize: number }
