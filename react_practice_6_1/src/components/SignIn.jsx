import { useState } from 'react';
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Googlesignin from './Googlesignin';


const SignIn = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	const handleSignIn = async (e) => {
		e.preventDefault();
		try {
			await signInWithEmailAndPassword(auth, email, password);
			alert('Signed in successfully');
			navigate('/dashboard');
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className='flex flex-col items-center pt-20'>
			<h2 className='text-3xl font-bold'>Sign In</h2>
			<form onSubmit={handleSignIn}>
				<div>
					<label>Email</label>
					<input
						type='email'
						value={email}
						className='input'
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>

				<div className='mb-4'>
					<label>Password</label>
					<input
						type='password'
						value={password}
						className='input mb-4'
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>

				<button
					type='submit'
					className='bg-blue-500 text-white px-4 py-2 w-full'>
					Sign In
				</button>
				<p className='text-center font-bold'>or</p>
				<Googlesignin />
			</form>
		</div>
	);
};

export default SignIn;