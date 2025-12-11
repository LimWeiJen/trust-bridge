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
    id: "user_lim",
    legalName: "Lim Wei Jen",
    myKad: "990101-14-5678",
    age: 21,
    imageUrl: "/images/user_lim.png",
    occupation: "Student",
    company: "University Malaya",
    crimesCommited: [],
    safetyStatus: "Safe",
  },
  {
    id: "user_ooi",
    legalName: "Ooi Jia Earn",
    myKad: "550505-10-1234",
    age: 19,
    imageUrl: "/images/user_ooi.png",
    occupation: "Student",
    company: "University Malaya",
    crimesCommited: [],
    safetyStatus: "Safe",
  },
  {
    id: "user_scammer",
    legalName: "John Doe",
    myKad: "909090-90-9090",
    age: 35,
    imageUrl: "/images/user_scammer.png",
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
