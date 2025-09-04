"use client"

import { SignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Bienvenido a ArgenStats
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Inicia sesión o crea una cuenta para continuar
          </p>
        </div>
        <SignIn 
          signUpUrl="/sign-up"
          forceRedirectUrl={redirectUrl || undefined}
          appearance={{
            elements: {
              formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200',
              footerActionLink: 'text-blue-600 hover:text-indigo-600 font-medium',
              card: 'shadow-xl border-0',
              socialButtonsBlockButton: 'border-2 hover:bg-gray-50 transition-colors duration-200',
              socialButtonsBlockButtonText: 'font-medium',
              formFieldLabel: 'text-gray-700 font-medium',
              formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              identityPreviewEditButtonIcon: 'text-blue-600',
              formHeaderTitle: 'text-2xl font-bold text-gray-900',
              formHeaderSubtitle: 'text-gray-600',
              dividerLine: 'bg-gray-300',
              dividerText: 'text-gray-500 bg-white px-4'
            },
            layout: {
              socialButtonsPlacement: 'top',
              socialButtonsVariant: 'blockButton'
            },
            variables: {
              colorPrimary: '#2563eb',
              borderRadius: '0.5rem'
            }
          }}
        />
      </div>
    </div>
  )
}


