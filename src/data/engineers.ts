import type { Engineer, AvailabilitySlot, CalendarAppointment } from "@/types/engineer";
import { generateId } from "@/lib/id";
import { format, addDays } from "date-fns";

function generateAvailability(startDate: Date, days: number, seed: number): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Simulate varying availability with deterministic "randomness" based on seed
    const hash = ((seed * 31 + i * 17) % 100);
    const bookedHours = isWeekend ? 0 : Math.min(8, Math.floor(hash / 15));
    
    const appointments: CalendarAppointment[] = [];
    if (!isWeekend && bookedHours > 0) {
      // Generate some simulated calendar appointments
      if (bookedHours >= 2) {
        appointments.push({
          id: generateId(),
          title: hash % 3 === 0 ? "Client deployment" : hash % 3 === 1 ? "Team standup" : "Project work",
          startTime: "09:00",
          endTime: `${9 + Math.min(bookedHours, 3)}:00`,
          clientName: hash % 2 === 0 ? "Existing Client" : undefined,
        });
      }
      if (bookedHours >= 5) {
        appointments.push({
          id: generateId(),
          title: "Afternoon block",
          startTime: "13:00",
          endTime: `${13 + (bookedHours - 3)}:00`,
        });
      }
    }

    slots.push({
      date: format(date, "yyyy-MM-dd"),
      available: !isWeekend && bookedHours < 7,
      bookedHours: isWeekend ? 0 : bookedHours,
      totalHours: isWeekend ? 0 : 8,
      appointments,
    });
  }
  return slots;
}

const today = new Date();

export const ENGINEERS: Engineer[] = [
  {
    id: "eng-ds",
    name: "David Stiles",
    email: "dstiles@company.com",
    role: "Senior Systems Engineer",
    avatar: "DS",
    color: "bg-blue-500",
    availability: generateAvailability(today, 30, 1),
  },
  {
    id: "eng-tf",
    name: "Tom Foley",
    email: "tfoley@company.com",
    role: "Network Engineer",
    avatar: "TF",
    color: "bg-emerald-500",
    availability: generateAvailability(today, 30, 2),
  },
  {
    id: "eng-cm",
    name: "Caroline Millican",
    email: "cmillican@company.com",
    role: "Security Engineer",
    avatar: "CM",
    color: "bg-purple-500",
    availability: generateAvailability(today, 30, 3),
  },
  {
    id: "eng-an",
    name: "Adam Novotny",
    email: "anovotny@company.com",
    role: "Cloud & M365 Specialist",
    avatar: "AN",
    color: "bg-orange-500",
    availability: generateAvailability(today, 30, 4),
  },
  {
    id: "eng-ms",
    name: "Matt Stupka",
    email: "mstupka@company.com",
    role: "Systems Engineer",
    avatar: "MS",
    color: "bg-rose-500",
    availability: generateAvailability(today, 30, 5),
  },
  {
    id: "eng-cp",
    name: "Calvin Philipp",
    email: "cphilipp@company.com",
    role: "Field Engineer",
    avatar: "CP",
    color: "bg-cyan-500",
    availability: generateAvailability(today, 30, 6),
  },
];

export function getEngineerById(id: string): Engineer | undefined {
  return ENGINEERS.find((e) => e.id === id);
}

export function getAvailableEngineers(date: string): Engineer[] {
  return ENGINEERS.filter((eng) => {
    const slot = eng.availability.find((s) => s.date === date);
    return slot?.available ?? false;
  });
}

export function getEngineerAvailabilityForDate(engineerId: string, date: string): AvailabilitySlot | undefined {
  const eng = getEngineerById(engineerId);
  return eng?.availability.find((s) => s.date === date);
}
