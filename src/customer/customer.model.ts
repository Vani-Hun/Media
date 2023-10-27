export type InputSetCustomer = {
  id?: string;
  logo?: Express.Multer.File;
  name: string;
  username: string;
  bio: string;
};

export type InputSetAuth = {
  username: string;
  password: string;
};

export type InputUpLoad = {
  caption: string;
  image: string;
  video: Express.Multer.File;
  user: object
};
