"use client"

import * as React from "react"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const indicators = [
  {
    title: "EMAE",
    href: "/indicadores/emae",
    description: "Estimador Mensual de Actividad Económica",
  },
  {
    title: "IPC",
    href: "/indicadores/ipc",
    description: "Índice de Precios al Consumidor",
  },
  {
    title: "Pobreza e Indigencia",
    href: "/indicadores/pobreza",
    description: "Indicadores de pobreza e indigencia por regiones",
  },
  {
    title: "Riesgo País",
    href: "/indicadores/riesgo-pais",
    description: "Indicador de riesgo soberano argentino",
  },
  {
    title: "Mercado de Trabajo",
    href: "/indicadores/empleo",
    description: "Índice de Empleo y Mercado Laboral",
  }, 
]

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
      <a
              ref={ref}
              className={cn(
                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                className
              )}
              {...props}
            >
              <div className="text-sm font-medium leading-none">{title}</div>
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground font-clear-sans font-light">
                {children}
              </p>
            </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export function MainNavigation() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="">Indicadores</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[300px] lg:w-[400px] lg:grid-cols-2">
              {indicators.map((indicator) => (
                <ListItem
                  key={indicator.title}
                  title={indicator.title}
                  href={indicator.href}
                >
                  {indicator.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/dolar">
              Dólar
            </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/conversor-dolar-peso-argentino">
              Conversor USD/ARS
            </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/calendario">
              Calendario INDEC
            </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/documentacion">
              API Docs
            </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}