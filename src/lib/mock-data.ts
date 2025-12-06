export interface MockUser {
  id: string;
  legalName: string;
  age: number;
  imageUrl: string;
  relationship: string;
  currentLocation: string;
  occupation: string;
  isFlaggedScammer: boolean;
}

export const mockUserAli: MockUser = {
  id: "user_ali",
  legalName: "Ali bin Ahmad",
  age: 21,
  imageUrl: "https://picsum.photos/seed/1/400/400",
  relationship: "Grandson",
  currentLocation: "Kuala Lumpur, Malaysia",
  occupation: "Student",
  isFlaggedScammer: false,
};
