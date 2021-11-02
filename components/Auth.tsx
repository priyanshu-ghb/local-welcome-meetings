import { ClockIcon, LockClosedIcon } from '@heroicons/react/solid'
import { login, resetPassword, updatePassword, useUser } from '../data/auth';
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

export default function Auth({ view, redirectTo = '/' }: { view?: ViewType, redirectTo?: RedirectTo }) {
  return (
    <section className="flex items-center justify-center bg-white rounded-lg p-4 sm:p-5">
      <div className="max-w-md w-full">
        <AuthView view={view} redirectTo={redirectTo} />
      </div>
    </section>
  )
}

export function AuthView({ view, redirectTo }: { view?: ViewType, redirectTo?: RedirectTo }) {
  const [authView, setAuthView] = useState<ViewType>(view || 'sign_in')
  const [defaultEmail, setDefaultEmail] = useState('')
  const [defaultPassword, setDefaultPassword] = useState('')

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
  const router = useRouter()
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
          if (redirectTo) router.push(redirectTo)
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
    <form id={id} onSubmit={handleSubmit(onSubmit)} className='space-y-2 flex flex-col'>
      <header className='text-center space-y-2 pb-2'>
        <h2 className="max-w-sm mx-auto text-2xl font-extrabold text-gray-900 leading-tight">
          Sign in
        </h2>
        <p className='text-gray-600'>Use the same email address you receive ADHD Together reminders from.</p>
      </header>
      <label htmlFor="email" className="sr-only">
        Your ADHD Together email address
      </label>
      <input
        type="email"
        id='email'
        className='input'
        autoComplete="email"
        defaultValue={email}
        placeholder='Email address'
        {...register('email', { required: true })}
      />
      <input
        className='input'
        type="password"
        defaultValue={password}
        autoComplete="current-password"
        placeholder='Password'
        {...register('password', { required: true })}
      />
      <button className='submit' type="submit">
        {loading ? "Loading..." : authView === VIEWS.SIGN_IN ? 'Sign in' : 'Sign up'}
      </button>
      {message && !error &&  <ShowFor seconds={10000000}>
        <div className='text-center text-adhdPurple bg-green-100 px-4 py-2 mt-2 rounded-lg'>
          {message}
        </div>
      </ShowFor>}
      {error && <ShowFor seconds={10000000}>
        <div className='text-center text-adhdPurple bg-red-100 px-4 py-2 mt-2 rounded-lg'>
          {error}
        </div>
      </ShowFor>}
      {/* {authView === VIEWS.SIGN_IN && magicLink && (
        <button className='button' onClick={(e) => { setAuthView(VIEWS.MAGIC_LINK) }}>
          Sign in with magic link
        </button>
      )} */}
      {authView === VIEWS.SIGN_IN && (
        <button className='' onClick={() => { setAuthView(VIEWS.FORGOTTEN_PASSWORD) }} >
          Forgot your password, or don't have one yet?
        </button>
      )}
      {/* {authView === VIEWS.SIGN_IN ? (
        <button className='' onClick={(e) => { handleViewChange(VIEWS.SIGN_UP) }}>
          Don&apos;t have an account? Sign up
        </button>
      ) : (
        <button className='' onClick={(e) => { handleViewChange(VIEWS.SIGN_IN) }}>
          Do you have an account? Sign in
        </button>
      )} */}
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
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-2 flex flex-col'>
      <header className='text-center space-y-2 pb-2'>
        <h2 className="max-w-sm mx-auto text-2xl font-extrabold text-gray-900 leading-tight">
          Reset your password
        </h2>
        <p className='text-gray-600'>You'll get an email with a link to reset it.</p>
      </header>
      <input
        type="email"
        className='input'
        autoComplete="email"
        defaultValue={email}
        placeholder='Email address'
        {...register('email', { required: true })}
      />
      <button className='submit' type="submit">
        {loading ? "Loading..." : 'Send reset password instructions'}
      </button>
      {message && !error &&  <ShowFor seconds={10000000}>
        <div className='text-center text-adhdPurple bg-green-100 px-4 py-2 mt-2 rounded-lg'>
          {message}
        </div>
      </ShowFor>}
      {error && <ShowFor seconds={10000000}>
        <div className='text-center text-adhdPurple bg-red-100 px-4 py-2 mt-2 rounded-lg'>
          {error}
        </div>
      </ShowFor>}
      <button onClick={(e) => { handleViewChange(VIEWS.SIGN_IN) }}>
        Go back to sign in
      </button>
    </form>
  )
}

/////

function UpdatePassword({ }: {}) {
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
      const { error } = await updatePassword(password)
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

  const user = useUser()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-2 flex flex-col'>
      <header className='text-center space-y-2 pb-2'>
        <h2 className="max-w-sm mx-auto text-2xl font-extrabold text-gray-900 leading-tight">
          Update your password
        </h2>
      </header>
      <input
        type='password'
        className='input'
        autoComplete="password"
        defaultValue={password}
        placeholder='Password'
        {...register('password', { required: true })}
      />
      <button className='submit' type="submit">
        {loading ? "Loading..." : 'Update password'}
      </button>
      {message && !error && <ShowFor seconds={10000000}>
        <div className='text-center text-adhdPurple bg-green-100 px-4 py-2 mt-2 rounded-lg'>
          {message}
        </div>
      </ShowFor>}
      {error && <ShowFor seconds={10000000}>
        <div className='text-center text-adhdPurple bg-red-100 px-4 py-2 mt-2 rounded-lg'>
          {error}
        </div>
      </ShowFor>}
    </form>
  )
}