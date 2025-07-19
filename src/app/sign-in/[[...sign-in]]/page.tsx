"use client"

import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Inicia sesión en tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede a funciones exclusivas y personaliza tu experiencia
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-indec-blue hover:bg-indec-blue-dark text-white',
              footerActionLink: 'text-indec-blue hover:text-indec-blue-dark'
            }
          }}
        />
      </div>
    </div>
  )
}


