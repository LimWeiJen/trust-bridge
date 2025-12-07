export interface MockUser {
  id: string;
  legalName: string;
  myKad: string;
  age: number;
  imageUrl: string;
  occupation: string;
  company: string;
  crimesCommited: string[];
  safetyStatus: 'Safe' | 'Unsafe' | 'Caution';
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "user_ali",
    legalName: "Ali bin Ahmad",
    myKad: "990101-14-5678",
    age: 21,
    imageUrl: "https://picsum.photos/seed/1/400/400",
    occupation: "Student",
    company: "University Malaya",
    crimesCommited: [],
    safetyStatus: "Safe",
  },
  {
    id: "user_siti",
    legalName: "Siti binti Osman",
    myKad: "550505-10-1234",
    age: 68,
    imageUrl: "https://picsum.photos/seed/2/400/400",
    occupation: "Retired Teacher",
    company: "SMK Damansara",
    crimesCommited: [],
    safetyStatus: "Safe",
  },
  {
    id: "user_scammer",
    legalName: "John Doe",
    myKad: "909090-90-9090",
    age: 35,
    imageUrl: "https://picsum.photos/seed/3/400/400",
    occupation: "Tech Support",
    company: "Freelance",
    crimesCommited: ["Online Fraud", "Identity Theft"],
    safetyStatus: "Unsafe",
  }
];

export function getUserByMyKad(myKad: string): MockUser | undefined {
  // Remove dashes for comparison if needed, but for now we assume exact match
  return MOCK_USERS.find(u => u.myKad === myKad);
}
