export type InputSetPersonnel = {
  id?: string;
  name: string;
  img?: Express.Multer.File;
  position: string;
  bio: string[];
};
