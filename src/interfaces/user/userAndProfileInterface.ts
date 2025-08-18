export interface User {
   id: string;
   email: string;
   profile: Profile;
}

export interface Profile {
   id: string;
   firstName: string;
   lastName: string;
   phone: string;
   address: string;
}
