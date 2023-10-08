import { Contact } from 'src/contact/contact.entity';
import { Product } from 'src/product/product.entity';
import { Home } from './home.entity';

export type HomeType = {
  home: Home;
  contact: Contact;
  products: Product[];
};

export type InputSetHome = {
  introduction: string;
  slogan: string;
};
