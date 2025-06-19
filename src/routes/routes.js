import { HomePage } from '../pages/home/home-page.js';
import { AboutPage } from '../pages/about/about-page.js';
import { AddStoryPage } from '../pages/add/add-story-page.js';
import { MapPage } from '../pages/map/map-page.js';
import { DetailPage } from '../pages/detail/detail-page.js';
import { LoginPage } from '../pages/login/login-page.js';
import { RegisterPage } from '../pages/register/register-page.js';
import { NotFoundPage } from '../pages/not-found/not-found-page.js';
import { FavoritesPage } from '../pages/favorite/favorite-page.js';

export const routes = {
  '/': { view: HomePage },
  '/about': { view: AboutPage },
  '/add': { view: AddStoryPage },
  '/map': { view: MapPage },
  '/detail': { view: DetailPage },
  '/login': { view: LoginPage },
  '/register': { view: RegisterPage },
  '/favorites': { view: FavoritesPage },
  '/404': { view: NotFoundPage }
};