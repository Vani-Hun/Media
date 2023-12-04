import { Home } from './home.entity';

export type HomeType = {
  home: Home;
};

export type InputSetHome = {
  introduction: string;
  slogan: string;
};
