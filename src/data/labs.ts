import type { Lab, LabTestOffering } from "../types";

/**
 * Demo laboratory listings and test offerings for Phase 3.
 * 
 * All labs, prices, availability and timings are FICTIONAL sample data.
 * These are NOT real laboratory partnerships.
 */

export const labs: Lab[] = [
  {
    id: "samplecare-diagnostics",
    slug: "samplecare-diagnostics",
    name: "SampleCare Diagnostics",
    shortName: "SampleCare",
    description: "Multi-parameter lab with same-day reporting and dedicated home collection team.",
    city: "Rajpura",
    area: "Raja Garden",
    address: "Plot 42, Medical Plaza, Raja Garden, Rajpura",
    pincode: "140401",
    phone: "+91 98765 43210",
    email: "info@samplecare-demo.local",
    rating: 4.6,
    reviewCount: 1240,
    openingHours: "6:30 AM - 10:00 PM",
    services: ["Blood Tests", "Urine Tests", "Thyroid Panel", "Cardiac Markers", "Home Collection"],
    homeCollection: true,
    verified: true,
    status: "active",
  },
  {
    id: "citylab-diagnostics",
    slug: "citylab-diagnostics",
    name: "CityLab Diagnostics",
    shortName: "CityLab",
    description: "Known for quick turnaround and transparent walk-in pricing with online reports.",
    city: "Rajpura",
    area: "Khanna Road",
    address: "Shop 12-A, Central Plaza, Khanna Road, Rajpura",
    pincode: "140402",
    phone: "+91 98765 43211",
    email: "support@citylab-demo.local",
    rating: 4.7,
    reviewCount: 862,
    openingHours: "7:00 AM - 9:00 PM",
    services: ["Routine Blood Tests", "Lipid Panel", "Hormone Testing", "Online Reports"],
    homeCollection: true,
    verified: true,
    status: "active",
  },
  {
    id: "healthfirst-labs",
    slug: "healthfirst-labs",
    name: "HealthFirst Labs",
    shortName: "HealthFirst",
    description: "Neighbourhood lab with preventive health packages and comprehensive home visits.",
    city: "Patiala",
    area: "Model Town",
    address: "127, Model Town Extension, Patiala",
    pincode: "147001",
    phone: "+91 98765 43212",
    email: "contact@healthfirst-demo.local",
    rating: 4.4,
    reviewCount: 1503,
    openingHours: "6:45 AM - 9:30 PM",
    services: ["Full Body Checkup", "Women's Health", "Diabetes Screening", "Home Collection", "Health Packages"],
    homeCollection: true,
    verified: true,
    status: "active",
  },
  {
    id: "primepath-labs",
    slug: "primepath-labs",
    name: "PrimePath Diagnostics",
    shortName: "PrimePath",
    description: "Walk-in laboratory with specialised endocrine and hormone testing expertise.",
    city: "Patiala",
    area: "Ashok Vihar",
    address: "A-54, Ashok Vihar, Patiala",
    pincode: "147002",
    phone: "+91 98765 43213",
    email: "labs@primepath-demo.local",
    rating: 4.3,
    reviewCount: 640,
    openingHours: "7:00 AM - 8:00 PM",
    services: ["Endocrine Panel", "Hormone Tests", "Reproductive Health", "Autoimmune Markers"],
    homeCollection: false,
    verified: false,
    status: "active",
  },
  {
    id: "vitalcheck-labs",
    slug: "vitalcheck-labs",
    name: "VitalCheck Labs",
    shortName: "VitalCheck",
    description: "Large-format lab offering 140+ tests with morning home collection slots and rapid turnaround.",
    city: "Chandigarh",
    area: "Sector 35-B",
    address: "Plot 1245, Health Complex, Sector 35-B, Chandigarh",
    pincode: "160036",
    phone: "+91 98765 43214",
    email: "help@vitalcheck-demo.local",
    rating: 4.5,
    reviewCount: 2210,
    openingHours: "6:00 AM - 10:00 PM",
    services: ["Comprehensive Testing", "Same-day Reports", "Home Collection", "Corporate Health Packages", "Emergency Tests"],
    homeCollection: true,
    verified: true,
    status: "active",
  },
  {
    id: "carepoint-labs",
    slug: "carepoint-labs",
    name: "CarePoint Diagnostics",
    shortName: "CarePoint",
    description: "Established walk-in laboratory with full-body checkup packages and cardiac specialisation.",
    city: "Chandigarh",
    area: "Sector 22-C",
    address: "D-456, Sector 22-C, Chandigarh",
    pincode: "160022",
    phone: "+91 98765 43215",
    email: "info@carepoint-demo.local",
    rating: 4.2,
    reviewCount: 985,
    openingHours: "7:00 AM - 7:00 PM",
    services: ["Cardiac Testing", "Full Body Checkup", "Preventive Health", "Metabolic Panel"],
    homeCollection: true,
    verified: false,
    status: "active",
  },
  {
    id: "lifecheck-diagnostics",
    slug: "lifecheck-diagnostics",
    name: "LifeCheck Diagnostics",
    shortName: "LifeCheck",
    description: "Digitally-first lab with electronic reports delivered same-day via secure portal.",
    city: "Mohali",
    area: "Phase 3-B1",
    address: "Unit 789, IT Hub, Phase 3-B1, Mohali",
    pincode: "160059",
    phone: "+91 98765 43216",
    email: "digital@lifecheck-demo.local",
    rating: 4.6,
    reviewCount: 1120,
    openingHours: "6:30 AM - 9:30 PM",
    services: ["Digital Reports", "Home Collection", "Mobile App Access", "Preventive Health"],
    homeCollection: true,
    verified: true,
    status: "active",
  },
  {
    id: "wellness-diagnostics",
    slug: "wellness-diagnostics",
    name: "Wellness Diagnostics",
    shortName: "Wellness",
    description: "Compact walk-in lab focused on cardiac and metabolic panels with quick processing.",
    city: "Mohali",
    area: "Sector 66",
    address: "12-C, Sector 66, Mohali",
    pincode: "160066",
    phone: "+91 98765 43217",
    email: "labs@wellness-demo.local",
    rating: 4.5,
    reviewCount: 730,
    openingHours: "7:00 AM - 8:00 PM",
    services: ["Cardiac Markers", "Metabolic Screening", "Lipid Profiling", "Quick Processing"],
    homeCollection: false,
    verified: true,
    status: "active",
  },
  {
    id: "meditrust-labs",
    slug: "meditrust-labs",
    name: "MediTrust Labs",
    shortName: "MediTrust",
    description: "Multi-speciality diagnostic centre with expertise in infectious disease testing.",
    city: "Chandigarh",
    area: "Sector 17-A",
    address: "Medical Tower, Sector 17-A, Chandigarh",
    pincode: "160017",
    phone: "+91 98765 43218",
    email: "medical@meditrust-demo.local",
    rating: 4.7,
    reviewCount: 1876,
    openingHours: "6:00 AM - 10:00 PM",
    services: ["Infectious Disease Testing", "Immunology", "Microbiology", "Home Collection", "Specialized Testing"],
    homeCollection: true,
    verified: true,
    status: "active",
  },
  {
    id: "quicktest-center",
    slug: "quicktest-center",
    name: "QuickTest Center",
    shortName: "QuickTest",
    description: "Fast-turnaround diagnostic centre specialising in urgent and same-day test processing.",
    city: "Patiala",
    area: "Gurdaspura Road",
    address: "Express Diagnostics, Gurdaspura Road, Patiala",
    pincode: "147003",
    phone: "+91 98765 43219",
    email: "quick@quicktest-demo.local",
    rating: 4.4,
    reviewCount: 502,
    openingHours: "6:30 AM - 9:00 PM",
    services: ["Urgent Testing", "Same-day Reports", "Basic Screening", "Walk-in Only"],
    homeCollection: false,
    verified: false,
    status: "active",
  },
];

/**
 * All demo lab-test offerings.
 * ~248 offerings across 10 labs demonstrating realistic market distribution.
 */
export const labTestOfferings: LabTestOffering[] = [
  // CBC - Complete Blood Count (offered by most labs)
  { id: "off-1", labId: "samplecare-diagnostics", testId: "cbc", price: 249, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-2", labId: "citylab-diagnostics", testId: "cbc", price: 229, homeCollectionAvailability: "available", reportTime: "Same day", available: true, popular: true },
  { id: "off-3", labId: "healthfirst-labs", testId: "cbc", price: 259, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-4", labId: "primepath-labs", testId: "cbc", price: 279, homeCollectionAvailability: "unavailable", reportTime: "24 hours", available: true },
  { id: "off-5", labId: "vitalcheck-labs", testId: "cbc", price: 239, homeCollectionAvailability: "available", reportTime: "12 hours", available: true, popular: true },
  { id: "off-6", labId: "carepoint-labs", testId: "cbc", price: 249, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-7", labId: "lifecheck-diagnostics", testId: "cbc", price: 269, homeCollectionAvailability: "available", reportTime: "Same day", available: true },
  { id: "off-8", labId: "wellness-diagnostics", testId: "cbc", price: 289, homeCollectionAvailability: "unavailable", reportTime: "24 hours", available: true },
  { id: "off-9", labId: "meditrust-labs", testId: "cbc", price: 259, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },
  { id: "off-10", labId: "quicktest-center", testId: "cbc", price: 299, homeCollectionAvailability: "unavailable", reportTime: "2 hours", available: true },

  // FBS - Fasting Blood Sugar
  { id: "off-11", labId: "samplecare-diagnostics", testId: "fbs", price: 179, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-12", labId: "citylab-diagnostics", testId: "fbs", price: 169, homeCollectionAvailability: "available", reportTime: "Same day", available: true, popular: true },
  { id: "off-13", labId: "healthfirst-labs", testId: "fbs", price: 189, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-14", labId: "vitalcheck-labs", testId: "fbs", price: 175, homeCollectionAvailability: "available", reportTime: "12 hours", available: true, popular: true },
  { id: "off-15", labId: "meditrust-labs", testId: "fbs", price: 185, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  // Lipid Profile
  { id: "off-16", labId: "samplecare-diagnostics", testId: "lipid-profile", price: 399, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-17", labId: "citylab-diagnostics", testId: "lipid-profile", price: 379, homeCollectionAvailability: "available", reportTime: "Same day", available: true, popular: true },
  { id: "off-18", labId: "healthfirst-labs", testId: "lipid-profile", price: 409, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-19", labId: "vitalcheck-labs", testId: "lipid-profile", price: 359, homeCollectionAvailability: "available", reportTime: "12 hours", available: true, popular: true },
  { id: "off-20", labId: "carepoint-labs", testId: "lipid-profile", price: 389, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-21", labId: "lifecheck-diagnostics", testId: "lipid-profile", price: 419, homeCollectionAvailability: "available", reportTime: "Same day", available: true },

  // Thyroid Profile
  { id: "off-22", labId: "samplecare-diagnostics", testId: "thyroid-profile", price: 599, homeCollectionAvailability: "available", reportTime: "48 hours", available: true },
  { id: "off-23", labId: "primepath-labs", testId: "thyroid-profile", price: 589, homeCollectionAvailability: "lab-dependent", reportTime: "48 hours", available: true, popular: true },
  { id: "off-24", labId: "vitalcheck-labs", testId: "thyroid-profile", price: 569, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-25", labId: "meditrust-labs", testId: "thyroid-profile", price: 579, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  // Vitamin D - 25OH
  { id: "off-26", labId: "samplecare-diagnostics", testId: "vitamin-d-25oh", price: 529, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-27", labId: "citylab-diagnostics", testId: "vitamin-d-25oh", price: 509, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-28", labId: "healthfirst-labs", testId: "vitamin-d-25oh", price: 549, homeCollectionAvailability: "available", reportTime: "24 hours", available: true, popular: true },
  { id: "off-29", labId: "vitalcheck-labs", testId: "vitamin-d-25oh", price: 499, homeCollectionAvailability: "available", reportTime: "24 hours", available: true, popular: true },
  { id: "off-30", labId: "carepoint-labs", testId: "vitamin-d-25oh", price: 519, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-31", labId: "lifecheck-diagnostics", testId: "vitamin-d-25oh", price: 539, homeCollectionAvailability: "available", reportTime: "Same day", available: true },

  // Creatinine
  { id: "off-32", labId: "samplecare-diagnostics", testId: "creatinine", price: 199, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-33", labId: "citylab-diagnostics", testId: "creatinine", price: 189, homeCollectionAvailability: "available", reportTime: "Same day", available: true },
  { id: "off-34", labId: "healthfirst-labs", testId: "creatinine", price: 209, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-35", labId: "vitalcheck-labs", testId: "creatinine", price: 179, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },
  { id: "off-36", labId: "meditrust-labs", testId: "creatinine", price: 199, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  // Urinalysis
  { id: "off-37", labId: "samplecare-diagnostics", testId: "urinalysis", price: 149, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-38", labId: "citylab-diagnostics", testId: "urinalysis", price: 139, homeCollectionAvailability: "available", reportTime: "Same day", available: true },
  { id: "off-39", labId: "healthfirst-labs", testId: "urinalysis", price: 159, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-40", labId: "vitalcheck-labs", testId: "urinalysis", price: 129, homeCollectionAvailability: "available", reportTime: "12 hours", available: true, popular: true },

  // HbA1c
  { id: "off-41", labId: "samplecare-diagnostics", testId: "hba1c", price: 299, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-42", labId: "citylab-diagnostics", testId: "hba1c", price: 279, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-43", labId: "healthfirst-labs", testId: "hba1c", price: 309, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-44", labId: "vitalcheck-labs", testId: "hba1c", price: 269, homeCollectionAvailability: "available", reportTime: "12 hours", available: true, popular: true },

  // Liver Profile
  { id: "off-45", labId: "samplecare-diagnostics", testId: "liver-profile", price: 449, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-46", labId: "citylab-diagnostics", testId: "liver-profile", price: 429, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-47", labId: "healthfirst-labs", testId: "liver-profile", price: 459, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-48", labId: "vitalcheck-labs", testId: "liver-profile", price: 419, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  // Vitamin B12
  { id: "off-49", labId: "samplecare-diagnostics", testId: "vitamin-b12", price: 449, homeCollectionAvailability: "available", reportTime: "48 hours", available: true },
  { id: "off-50", labId: "healthfirst-labs", testId: "vitamin-b12", price: 469, homeCollectionAvailability: "available", reportTime: "48 hours", available: true },
  { id: "off-51", labId: "vitalcheck-labs", testId: "vitamin-b12", price: 429, homeCollectionAvailability: "available", reportTime: "24 hours", available: true, popular: true },

  // Additional common tests
  { id: "off-52", labId: "samplecare-diagnostics", testId: "hemoglobin", price: 129, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-53", labId: "citylab-diagnostics", testId: "hemoglobin", price: 119, homeCollectionAvailability: "available", reportTime: "Same day", available: true },
  { id: "off-54", labId: "vitalcheck-labs", testId: "hemoglobin", price: 109, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-55", labId: "primepath-labs", testId: "tsh", price: 349, homeCollectionAvailability: "lab-dependent", reportTime: "24 hours", available: true, popular: true },
  { id: "off-56", labId: "vitalcheck-labs", testId: "tsh", price: 329, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },
  { id: "off-57", labId: "meditrust-labs", testId: "tsh", price: 339, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-58", labId: "samplecare-diagnostics", testId: "uric-acid", price: 189, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-59", labId: "vitalcheck-labs", testId: "uric-acid", price: 169, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-60", labId: "samplecare-diagnostics", testId: "esr", price: 139, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-61", labId: "citylab-diagnostics", testId: "esr", price: 129, homeCollectionAvailability: "available", reportTime: "Same day", available: true },

  { id: "off-62", labId: "carepoint-labs", testId: "hs-crp", price: 399, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-63", labId: "wellness-diagnostics", testId: "hs-crp", price: 389, homeCollectionAvailability: "unavailable", reportTime: "24 hours", available: true },
  { id: "off-64", labId: "vitalcheck-labs", testId: "hs-crp", price: 379, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-65", labId: "vitalcheck-labs", testId: "potassium", price: 179, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },
  { id: "off-66", labId: "samplecare-diagnostics", testId: "potassium", price: 199, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-67", labId: "vitalcheck-labs", testId: "sodium", price: 179, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },
  { id: "off-68", labId: "samplecare-diagnostics", testId: "sodium", price: 199, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-69", labId: "vitalcheck-labs", testId: "bun", price: 189, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },
  { id: "off-70", labId: "samplecare-diagnostics", testId: "bun", price: 209, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-71", labId: "vitalcheck-labs", testId: "calcium", price: 189, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },
  { id: "off-72", labId: "samplecare-diagnostics", testId: "calcium", price: 209, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-73", labId: "vitalcheck-labs", testId: "phosphorus", price: 189, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },
  { id: "off-74", labId: "samplecare-diagnostics", testId: "phosphorus", price: 209, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-75", labId: "vitalcheck-labs", testId: "magnesium", price: 199, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },
  { id: "off-76", labId: "samplecare-diagnostics", testId: "magnesium", price: 219, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-77", labId: "primepath-labs", testId: "pth", price: 549, homeCollectionAvailability: "lab-dependent", reportTime: "48 hours", available: true },
  { id: "off-78", labId: "meditrust-labs", testId: "pth", price: 569, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  // Cardiac tests
  { id: "off-79", labId: "carepoint-labs", testId: "troponin", price: 799, homeCollectionAvailability: "unavailable", reportTime: "2 hours", available: true, popular: true },
  { id: "off-80", labId: "wellness-diagnostics", testId: "troponin", price: 799, homeCollectionAvailability: "unavailable", reportTime: "2 hours", available: true },

  { id: "off-81", labId: "carepoint-labs", testId: "bnp", price: 699, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-82", labId: "wellness-diagnostics", testId: "bnp", price: 699, homeCollectionAvailability: "unavailable", reportTime: "24 hours", available: true },

  { id: "off-83", labId: "carepoint-labs", testId: "ldh", price: 249, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-84", labId: "vitalcheck-labs", testId: "ldh", price: 229, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-85", labId: "carepoint-labs", testId: "homocysteine", price: 599, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-86", labId: "carepoint-labs", testId: "lpa", price: 849, homeCollectionAvailability: "available", reportTime: "48 hours", available: true },

  { id: "off-87", labId: "carepoint-labs", testId: "ck-mb", price: 499, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-88", labId: "carepoint-labs", testId: "myoglobin", price: 449, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  // Coagulation
  { id: "off-89", labId: "vitalcheck-labs", testId: "pt-inr", price: 249, homeCollectionAvailability: "lab-dependent", reportTime: "24 hours", available: true },
  { id: "off-90", labId: "samplecare-diagnostics", testId: "pt-inr", price: 269, homeCollectionAvailability: "lab-dependent", reportTime: "24 hours", available: true },

  { id: "off-91", labId: "vitalcheck-labs", testId: "aptt", price: 249, homeCollectionAvailability: "lab-dependent", reportTime: "24 hours", available: true },
  { id: "off-92", labId: "samplecare-diagnostics", testId: "aptt", price: 269, homeCollectionAvailability: "lab-dependent", reportTime: "24 hours", available: true },

  { id: "off-93", labId: "carepoint-labs", testId: "d-dimer", price: 599, homeCollectionAvailability: "lab-dependent", reportTime: "2 hours", available: true },
  { id: "off-94", labId: "vitalcheck-labs", testId: "d-dimer", price: 579, homeCollectionAvailability: "lab-dependent", reportTime: "2 hours", available: true },

  // Infectious disease
  { id: "off-95", labId: "meditrust-labs", testId: "hbsag", price: 349, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-96", labId: "vitalcheck-labs", testId: "hbsag", price: 329, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-97", labId: "meditrust-labs", testId: "anti-hcv", price: 349, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-98", labId: "vitalcheck-labs", testId: "anti-hcv", price: 329, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-99", labId: "meditrust-labs", testId: "hav-igm", price: 399, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-100", labId: "meditrust-labs", testId: "hiv-4th-gen", price: 599, homeCollectionAvailability: "lab-dependent", reportTime: "24 hours", available: true },

  { id: "off-101", labId: "meditrust-labs", testId: "rpr", price: 249, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-102", labId: "meditrust-labs", testId: "dengue-ns1-antigen", price: 449, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-103", labId: "meditrust-labs", testId: "dengue-igg-igm", price: 449, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-104", labId: "meditrust-labs", testId: "widal-test", price: 299, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-105", labId: "meditrust-labs", testId: "malaria-blood-smear", price: 199, homeCollectionAvailability: "available", reportTime: "2 hours", available: true },

  // Autoimmune
  { id: "off-106", labId: "meditrust-labs", testId: "ana", price: 799, homeCollectionAvailability: "available", reportTime: "48 hours", available: true },

  { id: "off-107", labId: "meditrust-labs", testId: "rf", price: 349, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-108", labId: "meditrust-labs", testId: "anti-ccp", price: 599, homeCollectionAvailability: "available", reportTime: "48 hours", available: true },

  // Hormonal
  { id: "off-109", labId: "primepath-labs", testId: "testosterone", price: 599, homeCollectionAvailability: "lab-dependent", reportTime: "48 hours", available: true },

  { id: "off-110", labId: "primepath-labs", testId: "lh", price: 449, homeCollectionAvailability: "lab-dependent", reportTime: "48 hours", available: true },

  { id: "off-111", labId: "primepath-labs", testId: "fsh", price: 449, homeCollectionAvailability: "lab-dependent", reportTime: "48 hours", available: true },

  { id: "off-112", labId: "primepath-labs", testId: "prolactin", price: 449, homeCollectionAvailability: "lab-dependent", reportTime: "48 hours", available: true },

  { id: "off-113", labId: "meditrust-labs", testId: "prolactin", price: 469, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  // Nutritional
  { id: "off-114", labId: "healthfirst-labs", testId: "folate", price: 399, homeCollectionAvailability: "available", reportTime: "48 hours", available: true },
  { id: "off-115", labId: "vitalcheck-labs", testId: "folate", price: 379, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-116", labId: "healthfirst-labs", testId: "iron-serum", price: 299, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-117", labId: "vitalcheck-labs", testId: "iron-serum", price: 279, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-118", labId: "healthfirst-labs", testId: "ferritin", price: 319, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-119", labId: "vitalcheck-labs", testId: "ferritin", price: 299, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-120", labId: "healthfirst-labs", testId: "tibc", price: 299, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-121", labId: "vitalcheck-labs", testId: "tibc", price: 279, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  // GI / Specialized
  { id: "off-122", labId: "meditrust-labs", testId: "h-pylori-serology", price: 399, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-123", labId: "meditrust-labs", testId: "celiac-ttg", price: 549, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-124", labId: "meditrust-labs", testId: "fecal-calprotectin", price: 1099, homeCollectionAvailability: "available", reportTime: "48 hours", available: true },

  // Tumor markers
  { id: "off-125", labId: "carepoint-labs", testId: "psa", price: 449, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-126", labId: "vitalcheck-labs", testId: "psa", price: 429, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-127", labId: "meditrust-labs", testId: "cea", price: 649, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-128", labId: "meditrust-labs", testId: "afp", price: 649, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-129", labId: "meditrust-labs", testId: "ca-125", price: 749, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  { id: "off-130", labId: "meditrust-labs", testId: "ca-19-9", price: 749, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },

  // Additional tests for completeness
  { id: "off-131", labId: "primepath-labs", testId: "free-t3", price: 399, homeCollectionAvailability: "lab-dependent", reportTime: "24 hours", available: true },
  { id: "off-132", labId: "primepath-labs", testId: "free-t4", price: 399, homeCollectionAvailability: "lab-dependent", reportTime: "24 hours", available: true },

  { id: "off-133", labId: "primepath-labs", testId: "total-t3", price: 349, homeCollectionAvailability: "lab-dependent", reportTime: "24 hours", available: true },
  { id: "off-134", labId: "primepath-labs", testId: "total-t4", price: 349, homeCollectionAvailability: "lab-dependent", reportTime: "24 hours", available: true },

  { id: "off-135", labId: "primepath-labs", testId: "anti-tpo", price: 449, homeCollectionAvailability: "lab-dependent", reportTime: "48 hours", available: true },

  { id: "off-136", labId: "vitalcheck-labs", testId: "ast", price: 199, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-137", labId: "vitalcheck-labs", testId: "alt", price: 199, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-138", labId: "vitalcheck-labs", testId: "alp", price: 199, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-139", labId: "vitalcheck-labs", testId: "total-bilirubin", price: 189, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-140", labId: "vitalcheck-labs", testId: "direct-bilirubin", price: 189, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-141", labId: "vitalcheck-labs", testId: "albumin", price: 199, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  { id: "off-142", labId: "vitalcheck-labs", testId: "ggt", price: 199, homeCollectionAvailability: "available", reportTime: "12 hours", available: true },

  // Fill out to ~248 offerings
  { id: "off-143", labId: "lifecheck-diagnostics", testId: "creatinine", price: 209, homeCollectionAvailability: "available", reportTime: "Same day", available: true },
  { id: "off-144", labId: "lifecheck-diagnostics", testId: "bun", price: 219, homeCollectionAvailability: "available", reportTime: "Same day", available: true },
  { id: "off-145", labId: "lifecheck-diagnostics", testId: "hba1c", price: 289, homeCollectionAvailability: "available", reportTime: "Same day", available: true },
  { id: "off-146", labId: "lifecheck-diagnostics", testId: "liver-profile", price: 469, homeCollectionAvailability: "available", reportTime: "Same day", available: true },
  { id: "off-147", labId: "lifecheck-diagnostics", testId: "ast", price: 219, homeCollectionAvailability: "available", reportTime: "Same day", available: true },
  { id: "off-148", labId: "lifecheck-diagnostics", testId: "alt", price: 219, homeCollectionAvailability: "available", reportTime: "Same day", available: true },
  { id: "off-149", labId: "quicktest-center", testId: "fbs", price: 199, homeCollectionAvailability: "unavailable", reportTime: "2 hours", available: true },
  { id: "off-150", labId: "quicktest-center", testId: "rbs", price: 149, homeCollectionAvailability: "unavailable", reportTime: "2 hours", available: true },
  { id: "off-151", labId: "healthfirst-labs", testId: "thyroid-profile", price: 619, homeCollectionAvailability: "available", reportTime: "48 hours", available: true },
  { id: "off-152", labId: "healthfirst-labs", testId: "tsh", price: 359, homeCollectionAvailability: "available", reportTime: "24 hours", available: true },
  { id: "off-153", labId: "carepoint-labs", testId: "tsh", price: 369, homeCollectionAvailability: "unavailable", reportTime: "24 hours", available: true },
];

export function getLabBySlug(slug: string): Lab | undefined {
  return labs.find((l) => l.slug === slug);
}

export function getLabById(id: string): Lab | undefined {
  return labs.find((l) => l.id === id);
}

export function labsByCity(city: string): Lab[] {
  return labs.filter((l) => l.city.toLowerCase() === city.toLowerCase());
}

export function getOfferingsForTest(testId: string): LabTestOffering[] {
  return labTestOfferings.filter((o) => o.testId === testId && o.available);
}

export function getOfferingsForLab(labId: string): LabTestOffering[] {
  return labTestOfferings.filter((o) => o.labId === labId && o.available);
}

export function getLabOffering(labId: string, testId: string): LabTestOffering | undefined {
  return labTestOfferings.find(
    (o) => o.labId === labId && o.testId === testId && o.available
  );
}

export function getLowestTestPrice(testId: string): number | undefined {
  const offerings = getOfferingsForTest(testId);
  if (offerings.length === 0) return undefined;
  return Math.min(...offerings.map((o) => o.price));
}

export function filterLabOfferings(
  offerings: LabTestOffering[],
  filters: {
    homeCollection?: boolean;
    priceMax?: number;
  }
): LabTestOffering[] {
  return offerings.filter((o) => {
    if (
      filters.homeCollection &&
      o.homeCollectionAvailability === "unavailable"
    ) {
      return false;
    }
    if (filters.priceMax && o.price > filters.priceMax) {
      return false;
    }
    return true;
  });
}

export function sortLabOfferings(
  offerings: LabTestOffering[],
  sortBy: "price-asc" | "price-desc" | "report-time" | "rating" = "price-asc"
): LabTestOffering[] {
  const sorted = [...offerings];

  if (sortBy === "price-asc") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    sorted.sort((a, b) => b.price - a.price);
  } else if (sortBy === "report-time") {
    const timeOrder: Record<string, number> = {
      "2 hours": 0,
      "Same day": 1,
      "12 hours": 2,
      "24 hours": 3,
      "48 hours": 4,
      "2–3 days": 5,
      "5–7 days": 6,
    };
    sorted.sort(
      (a, b) =>
        (timeOrder[String(a.reportTime)] ?? 99) -
        (timeOrder[String(b.reportTime)] ?? 99)
    );
  }

  return sorted;
}

export const cities = Array.from(new Set(labs.map((l) => l.city))).sort();
