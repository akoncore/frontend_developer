import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RootLayout from './layouts/RootLayout';
import PostsLayout from './layouts/PostsLayout';
import Home from './pages/Home';
import { LoadingState } from './components/States';
const About = lazy(() => import('./pages/About'));
const Posts = lazy(() => import('./pages/Posts'));
const PostDetails = lazy(() => import('./pages/PostDetails'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Signout = lazy(() => import('./pages/Signout'));
const Community = lazy(() => import('./pages/Community'));
const NotFound = lazy(() => import('./pages/NotFound'));
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      {
        path: 'posts',
        element: <PostsLayout />,
        children: [
          { index: true, element: <Posts /> },
          { path: ':id', element: <PostDetails /> },
        ],
      },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'login', element: <Login key="login" /> },
      { path: 'signup', element: <Login key="signup" signup /> },
      { path: 'signin', element: <Navigate to="/login" replace /> },
      { path: 'community', element: <Community /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: <Profile /> },
          { path: 'signout', element: <Signout /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
export default function App() {
  return (
    <Suspense fallback={<LoadingState text="Loading page…" />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
