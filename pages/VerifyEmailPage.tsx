import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getAuth, sendEmailVerification } from 'firebase/auth';

const VerifyEmailPage: React.FC = () => {
    const authContext = useContext(AuthContext);
    const user = authContext?.user;
    const auth = getAuth();

    const handleResendEmail = async () => {
        if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser);
            alert("A new verification email has been sent.");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 text-center bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-xl">
            <h1 className="font-display text-3xl font-bold mb-4">Verify Your Email</h1>
            <p className="text-light-subtle dark:text-dark-subtle mb-6">
                A verification link has been sent to **{user?.email}**. Please check your inbox (and spam folder) to complete your registration.
            </p>
            <p className="text-sm text-light-subtle dark:text-dark-subtle">
                Didn't receive an email? 
                <button onClick={handleResendEmail} className="font-semibold text-brand-purple hover:underline ml-1">
                    Resend verification link
                </button>
            </p>
        </div>
    );
};

export default VerifyEmailPage;