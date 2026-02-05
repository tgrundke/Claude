export interface Engineer {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string; // initials-based
  color: string;
  availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  date: string; // ISO date yyyy-MM-dd
  available: boolean;
  bookedHours: number;
  totalHours: number;
  appointments: CalendarAppointment[];
}

export interface CalendarAppointment {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  clientName?: string;
}

export interface EngineerAssignment {
  engineerId: string;
  engineerName: string;
  taskId: string;
}
