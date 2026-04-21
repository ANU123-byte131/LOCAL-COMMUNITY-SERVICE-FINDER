import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import HomePage from './pages/index';

const SearchPage = lazy(() => import('./pages/search'));
const ProviderPage = lazy(() => import('./pages/provider/[id]'));
const AdminPage = lazy(() => import('./pages/admin/index'));
const CompanyPage = lazy(() => import('./pages/company'));
const ContactPage = lazy(() => import('./pages/contact'));
const SupportPage = lazy(() => import('./pages/support'));

const isDevelopment = import.meta.env.MODE === 'development';
const NotFoundPage = isDevelopment ? lazy(() => import('../dev-tools/src/PageNotFound')) : lazy(() => import('./pages/_404'));

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/provider/:id', element: <ProviderPage /> },
  { path: '/admin', element: <AdminPage /> },
  { path: '/company', element: <CompanyPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/support', element: <SupportPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export type Path = '/' | '/search' | '/provider/:id' | '/admin' | '/company' | '/contact' | '/support';
export type Params = Record<string, string | undefined>;

