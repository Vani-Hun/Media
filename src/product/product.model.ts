export type InputGetRequest = {
  productID?: string;
  projectID?: string;
};

export type InputGetByCategory = {
  categoryId: string;
  productId?: string;
};

export type InputSetProduct = {
  id?: string;
  name: string;
  description: string;
  banner?: Express.Multer.File;
};
