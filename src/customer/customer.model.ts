export type InputSetCustomer = {
  id?: string;
  logo?: Express.Multer.File;
  name: string;
};
export type InputSetAuth = {
  username: string;
  password: string;
};
export type InputUpLoad = {
  description: string;
  video: Express.Multer.File;
  user: object
};
