export interface Authority {
  id: string;
  name: string;
  type: "department" | "ngo" | "helpline";
  area: string;
  contact: string;
  category: string;
}

export const ESSENTIAL_AUTHORITIES: Authority[] = [
  {
    id: "auth-pwd",
    name: "Haryana Public Works Department (PWD) - Roads & Bridges",
    type: "department",
    area: "Haryana",
    contact: "PWD Grievance Cell",
    category: "pothole",
  },
  {
    id: "auth-phed",
    name: "Public Health Engineering Department (PHED), Haryana",
    type: "department",
    area: "Haryana",
    contact: "PHED Division Office",
    category: "water",
  },
  {
    id: "auth-ulb",
    name: "Urban Local Bodies Department + Municipal Sanitation Branch",
    type: "department",
    area: "Urban Haryana",
    contact: "Municipal Complaint Cell",
    category: "sanitation",
  },
  {
    id: "auth-uhbvn",
    name: "UHBVN / DHBVN Electricity Complaint Center",
    type: "department",
    area: "Haryana",
    contact: "1912",
    category: "electricity",
  },
  {
    id: "auth-women-helpline",
    name: "Women Helpline 181 + Haryana Police 112",
    type: "helpline",
    area: "Haryana",
    contact: "181 / 112",
    category: "gender_violence",
  },
  {
    id: "auth-food-civil",
    name: "Food, Civil Supplies & Consumer Affairs Department, Haryana",
    type: "department",
    area: "Haryana",
    contact: "District Food Supply Office",
    category: "food_scarcity",
  },
  {
    id: "auth-pfa",
    name: "People For Animals (Haryana)",
    type: "ngo",
    area: "Rohtak / Panipat",
    contact: "Local Animal Rescue Helpline",
    category: "stray_dogs",
  },
  {
    id: "auth-red-cross",
    name: "Indian Red Cross Society - Haryana State Branch",
    type: "ngo",
    area: "Haryana",
    contact: "District Unit",
    category: "other",
  },
];
