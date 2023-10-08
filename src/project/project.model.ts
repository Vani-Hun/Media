export type InputSetProject = {
  id?: string;
  name: string;
  description: string;
  banner?: Express.Multer.File;
  productID?: string;
  partnerID?: string;
  utility: string[];
  feature: string[];
};
