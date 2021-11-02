import { ClockIcon, LockClosedIcon } from '@heroicons/react/solid'
import { login, resetPassword, useUser } from '../data/auth';
import { useState, useEffect } from 'react';
import { ShowFor } from './Elements';
import { useForm } from 'react-hook-form';
import { supabase } from '../data/supabase';
import Link from 'next/link';
import { useRouter } from 'next/dist/client/router';

type RedirectTo = undefined | string

type ViewType =
  | 'sign_in'
  | 'sign_up'
  | 'forgotten_password'
  | 'magic_link'
  | 'update_password'

const VIEWS: {
  [key: string]: ViewType
} = {
  SIGN_IN: 'sign_in',
  SIGN_UP: 'sign_up',
  FORGOTTEN_PASSWORD: 'forgotten_password',
  MAGIC_LINK: 'magic_link',
  UPDATE_PASSWORD: 'update_password',
}

export default function Auth({ view, redirectTo }: { view?: ViewType, redirectTo?: RedirectTo }) {
  const [authView, setAuthView] = useState<ViewType>(view || 'sign_in')
  const [defaultEmail, setDefaultEmail] = useState('')
  const [defaultPassword, setDefaultPassword] = useState('')
  const [hasSent, setHasSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, signOut } = useUser()
  const router = useRouter()

  if (isLoggedIn) {
    return (
      <div className='text-center'>
        <span data-attr='auth-sign-out' className='text-adhdBlue bg-adhdDarkPurple hover:bg-adhdPurple p-2 px-3 rounded-lg cursor-pointer inline-block' onClick={() => signOut()}>
          Sign out
        </span>
      </div>
    )
  }

  switch (authView) {
    case 'sign_in':
    case 'sign_up':
      return (
        <EmailAuth
          id={authView === 'sign_up' ? 'auth-sign-up' : 'auth-sign-in'}
          authView={authView}
          setAuthView={setAuthView}
          defaultEmail={defaultEmail}
          defaultPassword={defaultPassword}
          setDefaultEmail={setDefaultEmail}
          setDefaultPassword={setDefaultPassword}
          redirectTo={redirectTo}
          // magicLink={magicLink}
        />
      )
    case 'forgotten_password':
      return (
        <ForgottenPassword
          setAuthView={setAuthView}
          redirectTo={redirectTo}
          defaultEmail={defaultEmail}
          setDefaultEmail={setDefaultEmail}
        />
      )

    case 'update_password':
      return (
        <UpdatePassword />
      )

    default:
      return null
  }
}

function EmailAuth({
  authView,
  defaultEmail,
  defaultPassword,
  id,
  setAuthView,
  setDefaultEmail,
  setDefaultPassword,
  redirectTo,
  // magicLink,
}: {
  authView: ViewType
  defaultEmail: string
  defaultPassword: string
  id: 'auth-sign-up' | 'auth-sign-in'
  setAuthView: any
  setDefaultEmail: (email: string) => void
  setDefaultPassword: (password: string) => void
  redirectTo?: RedirectTo
  // magicLink?: boolean
}) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const defaultValues = { email: defaultEmail, password: defaultPassword, }
  const { register, handleSubmit, watch } = useForm({ defaultValues });
  const { password, email } = watch();

  const onSubmit = async ({ email, password }: typeof defaultValues) => {
    try {
      setError('')
      setLoading(true)
      switch (authView) {
        case 'sign_in':
          const { error: signInError } = await supabase.auth.signIn(
            {
              email,
              password,
            },
            { redirectTo }
          )
          if (signInError) setError(signInError.message)
          break
        case 'sign_up':
          const { error: signUpError, data: signUpData } =
            await supabase.auth.signUp(
              {
                email,
                password,
              },
              { redirectTo }
            )
          if (signUpError) setError(signUpError.message)
          // checking if it has access_token to know if email verification is disabled
          else if (signUpData?.hasOwnProperty('confirmation_sent_at'))
            setMessage('Check your email for the confirmation link.')
          break
      }
      setLoading(false)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const handleViewChange = (newView: ViewType) => {
    setDefaultEmail(email)
    setDefaultPassword(password)
    setAuthView(newView)
  }

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)}>
      <input
        autoComplete="email"
        defaultValue={email}
        {...register('email', { required: true })}
      />
      <input
        type="password"
        defaultValue={password}
        autoComplete="current-password"
        {...register('password', { required: true })}
      />
      {authView === VIEWS.SIGN_IN && (
        <button onClick={() => { setAuthView(VIEWS.FORGOTTEN_PASSWORD) }} >
          Forgot your password?
        </button>
      )}
      <button type="submit">
        {loading ? "Loading..." : authView === VIEWS.SIGN_IN ? 'Sign in' : 'Sign up'}
      </button>
      {/* {authView === VIEWS.SIGN_IN && magicLink && (
        <button onClick={(e) => { setAuthView(VIEWS.MAGIC_LINK) }}>
          Sign in with magic link
        </button>
      )} */}
      {authView === VIEWS.SIGN_IN ? (
        <button onClick={(e) => { handleViewChange(VIEWS.SIGN_UP) }}>
          Don&apos;t have an account? Sign up
        </button>
      ) : (
        <button onClick={(e) => { handleViewChange(VIEWS.SIGN_IN) }}>
          Do you have an account? Sign in
        </button>
      )}
      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </form>
  )
}

/////

function ForgottenPassword({
  setAuthView,
  redirectTo,
  defaultEmail,
  setDefaultEmail,
}: {
  setAuthView: any
  redirectTo?: RedirectTo
  defaultEmail: string
  setDefaultEmail: (email: string) => void
}) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const defaultValues = { email: defaultEmail }
  const { register, handleSubmit, watch } = useForm({ defaultValues });
  const { email } = watch();

  const onSubmit = async ({ email }: typeof defaultValues) => {
    try {
      setError('')
      setLoading(true)
      resetPassword(email, redirectTo)
    } catch (e) {
      setError(String(e))
    } finally {
      if (!error) setMessage('Check your email for the confirmation link.')
      setLoading(false)
    }
  }

  const handleViewChange = (newView: ViewType) => {
    setDefaultEmail(email)
    setAuthView(newView)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        autoComplete="email"
        defaultValue={email}
        {...register('email', { required: true })}
      />
      <button type="submit">
        {loading ? "Loading..." : 'Send reset password instructions'}
      </button>
      <button onClick={(e) => { handleViewChange(VIEWS.SIGN_IN) }}>
        Go back to sign in
      </button>
      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </form>
  )
}

/////

function UpdatePassword({}: {}) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const defaultValues = { password: '' }
  const { register, handleSubmit, watch } = useForm({ defaultValues });
  const { password } = watch();

  const onSubmit = async ({ password }: typeof defaultValues) => {
    try {
      setError('')
      setMessage('')
      setLoading(true)
      const { error } = await resetPassword(password)
      if (error) setError(error.message)
    } catch (e) {
      setError(String(e))
    } finally {
      if (!error) {
        setMessage('Your password has been updated')
        setLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        autoComplete="password"
        defaultValue={password}
        {...register('password', { required: true })}
      />
      <button type="submit">
        {loading ? "Loading..." : 'Update password'}
      </button>
      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </form>
  )
}