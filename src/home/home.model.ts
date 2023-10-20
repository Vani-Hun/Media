import { Contact } from 'src/contact/contact.entity';
import { Home } from './home.entity';

export type HomeType = {
  home: Home;
  contact: Contact;
};

export type InputSetHome = {
  introduction: string;
  slogan: string;
};
