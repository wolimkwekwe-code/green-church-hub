export interface Member {
  id: string;
  fullName: string;
  address: string;
  phoneNumber: string;
  cellGroup: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MemberFormData = Omit<Member, 'id' | 'createdAt' | 'updatedAt'>;
