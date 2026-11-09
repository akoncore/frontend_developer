import LogoutButton from '../components/LogoutButton';
export default function Signout() {
  return (
    <section className="container profile-page">
      <h1>Sign out</h1>
      <p>Ready to leave? You can sign in again at any time.</p>
      <LogoutButton />
    </section>
  );
}
