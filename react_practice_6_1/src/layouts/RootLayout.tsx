import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PwaStatus from '../components/PwaStatus';
export default function RootLayout() {
  return (
    <>
      <Navbar />
      <PwaStatus />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
