import { useState } from 'react';
import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Google from './Google';

const SignUp = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const navigate = useNavigate();

	const handleCreateUser = async (e) => {
		e.preventDefault();
		try {
			await createUserWithEmailAndPassword(auth, email, password);
			alert('User created successfully');
			navigate('/signin');
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className='flex flex-col items-center pt-20'>
			<h2 className='text-3xl font-bold'>Register your Account</h2>
			<form onSubmit={handleCreateUser}>
				<div>
					<label>Name</label>
					<input
						type='text'
						id='name'
						name='name'
						className='input'
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>

				<div className='mb-4'>
					<label htmlFor='email'>Email</label>
					<input
						type='email'
						id='email'
						name='email'
						value={email}
						className='input'
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>

				<div className='mb-4'>
					<label htmlFor='password'>Password</label>
					<input
						type='password'
						id='password'
						name='password'
						className='input'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>

				<div className='mb-4'>
					<label htmlFor='confirm_password'>Confirm Password</label>
					<input
						type='password'
						id='confirm_password'
						name='confirm_password'
						className='input'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
				</div>

				<div>
					<div className='mb-4'>
						<input type='checkbox' id='terms' name='terms' className='mr-2' />
						<label htmlFor='terms'>
							I agree to the <a href='#'>Terms and Conditions</a>
						</label>
					</div>
				</div>

				<button
					type='submit'
					className='bg-blue-500 text-white px-4 py-2 w-full'>
					Register
				</button>
				<p className='text-center font-bold'>or</p>
				<Google />
				<p className='text-center mt-2'>
					Already have an account?{' '}
					<a href='/signin' className='text-blue-500'>
						Sign in
					</a>
				</p>
			</form>
		</div>
	);
};

export default SignUp;