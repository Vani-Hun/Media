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
  who: string,
  caption: string;
  image: string;
  video: Express.Multer.File;
  user: object
};

export type InputUpaDateVideo = {
  video: string,
  who: string;
  allowComment: boolean;
  user: object
};