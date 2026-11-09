import { useAuth } from '../hooks/useAuth';
import LogoutButton from '../components/LogoutButton';
export default function Profile() {
  const { user } = useAuth();
  return (
    <section className="container profile-page">
      <span className="eyebrow">YOUR ACCOUNT</span>
      <h1>
        Your <em>profile.</em>
      </h1>
      <p>Welcome back{user?.displayName ? ', ' + user.displayName : ''}.</p>
      <dl className="profile-details">
        <dt>Email</dt>
        <dd>{user?.email ?? 'No email provided'}</dd>
        <dt>UID</dt>
        <dd>{user?.uid}</dd>
        <dt>Sign-in provider</dt>
        <dd>
          {user?.providerData
            .map((provider) =>
              provider.providerId === 'password'
                ? 'Email / Password'
                : provider.providerId,
            )
            .join(', ')}
        </dd>
      </dl>
      <LogoutButton />
    </section>
  );
}
