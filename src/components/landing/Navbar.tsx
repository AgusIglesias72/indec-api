"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, DollarSign, TrendingUp, BarChart3, Globe, Calendar, FileText, Users, Mail, User, LogOut, Key, Settings, LogIn, Calculator } from "lucide-react"
import { useUser, useClerk, SignInButton, SignUpButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { MainNavigation } from "@/components/NavigationMenu"
import { cn } from "@/lib/utils"
import Logo from "../Logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Datos de navegación sincronizados con MainNavigation
const indicators = [
  {
    title: "EMAE",
    href: "/indicadores/emae",
    description: "Estimador Mensual de Actividad Económica",
    icon: BarChart3,
  },
  {
    title: "IPC",
    href: "/indicadores/ipc",
    description: "Índice de Precios al Consumidor",
    icon: TrendingUp,
  },
  {
    title: "Pobreza e Indigencia",
    href: "/indicadores/pobreza",
    description: "Indicadores de pobreza e indigencia por regiones",
    icon: Users,
  },
  {
    title: "Riesgo País",
    href: "/indicadores/riesgo-pais",
    description: "Indicador de riesgo soberano argentino",
    icon: Globe,
  },
  {
    title: "Mercado de Trabajo",
    href: "/indicadores/empleo",
    description: "Índice de Empleo y Mercado Laboral",
    icon: Users,
  },
]

const mainNavItems = [
  { title: "Dólar", href: "/dolar", icon: DollarSign },
  { title: "IPC", href: "/ipc", icon: TrendingUp },
  { title: "Conversor USD/ARS", href: "/conversor-dolar-peso-argentino", icon: Calculator },
  { title: "Calendario INDEC", href: "/calendario", icon: Calendar },
  { title: "API Docs", href: "/documentacion", icon: FileText },
]

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Clerk hooks
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  
  // Evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Manejar scroll para efectos visuales
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Cerrar menú móvil al navegar
  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false)
  }
  
  // Render consistent structure for SSR
  const authButtons = isMounted && isSignedIn ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
            <AvatarFallback>
              {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Mi Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/api-keys" className="cursor-pointer">
            <Key className="mr-2 h-4 w-4" />
            <span>API Keys</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : isMounted ? (
    <>
      <SignInButton mode="modal" fallbackRedirectUrl="/">
        <Button variant="ghost" size="sm" className="text-indec-blue hover:bg-indec-blue hover:text-white transition-colors">
          <LogIn className="h-4 w-4" />
        </Button>
      </SignInButton>
      <SignUpButton mode="modal" fallbackRedirectUrl="/">
        <Button size="sm" className="bg-indec-blue text-white hover:bg-indec-blue-dark transition-colors">
          <User className="h-4 w-4" />
        </Button>
      </SignUpButton>
    </>
  ) : null;
  
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-300",
      isScrolled 
        ? "bg-white/95 backdrop-blur-sm border-b border-indec-gray-medium shadow-sm" 
        : "bg-white border-b border-white"
    )}>
      {/* Grid layout - móvil: 2 columnas, desktop: 3 columnas */}
      <div className="mx-auto h-16 px-4 xl:px-12 grid grid-cols-2 md:grid-cols-3 items-center">
        {/* Logo - columna izquierda */}
        <div className="flex items-center justify-start">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation - columna central, solo visible en desktop */}
        <div className="hidden md:flex justify-center font-clear-sans font-extrabold">
          <MainNavigation />
        </div>
          
        {/* Contact button, auth buttons and mobile menu - columna derecha */}
        <div className="flex items-center justify-end gap-2">
          {/* Desktop buttons */}
          <div className="hidden md:flex md:items-center md:gap-2">
            <Button 
              asChild
              variant="ghost" 
              size="sm"
              className="text-indec-blue hover:bg-indec-blue hover:text-white transition-colors"
            >
              <Link href="/contacto" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
              </Link>
            </Button>
            
            {/* Auth section */}
            {authButtons}
          </div>
          
          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-indec-blue hover:bg-indec-blue/10"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                {/* Título accesible oculto */}
                <SheetTitle className="sr-only">
                  Menú de navegación principal
                </SheetTitle>
                
                <div className="flex flex-col h-full">
                  {/* Header del menú móvil */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-2">
                      <Logo />
                    </div>
                  </div>
                  
                  {/* Contenido de navegación */}
                  <div className="flex-1 overflow-y-auto py-6 px-6">
                    <nav className="space-y-6">
                      {/* Sección Indicadores */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-indec-blue uppercase tracking-wider">
                          Indicadores
                        </h3>
                        <div className="space-y-1">
                          {indicators.map((indicator) => {
                            const IconComponent = indicator.icon;
                            return (
                              <Link
                                key={indicator.title}
                                href={indicator.href}
                                onClick={handleMobileNavClick}
                                className="flex items-start gap-3 rounded-lg p-3 hover:bg-indec-blue/5 transition-colors group"
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  <IconComponent className="h-5 w-5 text-indec-blue group-hover:text-indec-blue-dark transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 group-hover:text-indec-blue transition-colors">
                                    {indicator.title}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1 font-clear-sans font-light">
                                    {indicator.description}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Separador */}
                      <div className="border-t border-gray-200"></div>
                      
                      {/* Sección Principal */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-indec-blue uppercase tracking-wider">
                          Navegación
                        </h3>
                        <div className="space-y-1">
                          {mainNavItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                onClick={handleMobileNavClick}
                                className="flex items-center gap-3 rounded-lg p-3 hover:bg-indec-blue/5 transition-colors group"
                              >
                                <div className="flex-shrink-0">
                                  <IconComponent className="h-5 w-5 text-indec-blue group-hover:text-indec-blue-dark transition-colors" />
                                </div>
                                <div className="font-medium text-gray-900 group-hover:text-indec-blue transition-colors">
                                  {item.title}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Separador */}
                      <div className="border-t border-gray-200"></div>
                      
                      {/* Enlaces adicionales y auth */}
                      <div className="space-y-1">
                        {isMounted && isSignedIn ? (
                          <>
                            <Link 
                              href="/profile"
                              onClick={handleMobileNavClick}
                              className="flex items-center gap-3 rounded-lg p-3 hover:bg-indec-blue/5 transition-colors group"
                            >
                              <div className="flex-shrink-0">
                                <User className="h-5 w-5 text-indec-blue group-hover:text-indec-blue-dark transition-colors" />
                              </div>
                              <div className="font-medium text-gray-900 group-hover:text-indec-blue transition-colors">
                                Mi Perfil
                              </div>
                            </Link>
                            
                            <button
                              onClick={() => {
                                signOut()
                                handleMobileNavClick()
                              }}
                              className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-red-50 transition-colors group text-left"
                            >
                              <div className="flex-shrink-0">
                                <LogOut className="h-5 w-5 text-red-600 group-hover:text-red-700 transition-colors" />
                              </div>
                              <div className="font-medium text-red-600 group-hover:text-red-700 transition-colors">
                                Cerrar sesión
                              </div>
                            </button>
                          </>
                        ) : isMounted ? (
                          <div className="space-y-2 pt-2">
                            <SignInButton mode="modal" fallbackRedirectUrl="/">
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={handleMobileNavClick}
                              >
                                Iniciar sesión
                              </Button>
                            </SignInButton>
                            <SignUpButton mode="modal" fallbackRedirectUrl="/">
                              <Button 
                                className="w-full"
                                onClick={handleMobileNavClick}
                              >
                                Registrarse
                              </Button>
                            </SignUpButton>
                          </div>
                        ) : null}
                        
                        <div className="pt-2 space-y-1">
                          <Link 
                            href="/contacto"
                            onClick={handleMobileNavClick}
                            className="flex items-center gap-3 rounded-lg p-3 hover:bg-indec-blue/5 transition-colors group"
                          >
                            <div className="flex-shrink-0">
                              <Mail className="h-5 w-5 text-indec-blue group-hover:text-indec-blue-dark transition-colors" />
                            </div>
                            <div className="font-medium text-gray-900 group-hover:text-indec-blue transition-colors">
                              Contacto
                            </div>
                          </Link>
                          
                          <Link 
                            href="/documentacion"
                            onClick={handleMobileNavClick}
                            className="flex items-center gap-3 rounded-lg p-3 hover:bg-indec-blue/5 transition-colors group"
                          >
                            <div className="flex-shrink-0">
                              <FileText className="h-5 w-5 text-indec-blue group-hover:text-indec-blue-dark transition-colors" />
                            </div>
                            <div className="font-medium text-gray-900 group-hover:text-indec-blue transition-colors">
                              Documentación
                            </div>
                          </Link>
                        </div>
                      </div>
                    </nav>
                  </div>
                  
                  {/* Footer del menú móvil */}
                  <div className="p-6 border-t bg-gray-50/80">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        ArgenStats • Datos económicos en tiempo real
                      </p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}