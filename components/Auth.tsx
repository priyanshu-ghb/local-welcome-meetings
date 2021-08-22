import { LockClosedIcon } from '@heroicons/react/solid'

async function sendMagicLink (email: string) {
  await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ email }) })
}

export default function Auth() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // @ts-ignore
    if (!event.target.email) return
    // @ts-ignore
    const email = event.target.email.value
    // Validate
    await sendMagicLink(email)
  }

  return (
    <div className="flex items-center justify-center bg-gray-50 py-12 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-5">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Log in via email address
          </h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon className="h-4 w-4 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
              </span>
              Send magic link to your email address
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}