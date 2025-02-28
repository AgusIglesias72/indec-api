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
    title: "EMAE por Actividad",
    href: "/indicadores/emae-por-actividad",
    description: "Actividad económica por sectores",
  },
  {
    title: "Comparativas",
    href: "/indicadores/comparativas",
    description: "Análisis comparativos de indicadores",
  },
]

const apiLinks = [
  {
    title: "Documentación",
    href: "/api-docs",
    description: "Guías y referencias completas",
  },
  {
    title: "Ejemplos de Código",
    href: "/api-docs/ejemplos",
    description: "Ejemplos prácticos de implementación",
  },
  {
    title: "Referencias de Endpoints",
    href: "/api-docs/endpoints",
    description: "Detalles técnicos de cada endpoint",
  },
  {
    title: "Playground",
    href: "/api-docs/playground",
    description: "Prueba la API interactivamente",
  },
]

export function MainNavigation() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Indicadores</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
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
          <NavigationMenuTrigger>API</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              {apiLinks.map((link) => (
                <ListItem
                  key={link.title}
                  title={link.title}
                  href={link.href}
                >
                  {link.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/documentacion" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Documentación
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/acerca-de" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Acerca de
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string
  href: string
}

const ListItem = React.forwardRef<React.ElementRef<"a">, ListItemProps>(
  ({ className, title, children, href, ...props }, ref) => {
    return (
      <li>
        <Link href={href} legacyBehavior passHref>
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
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                {children}
              </p>
            </a>
          </NavigationMenuLink>
        </Link>
      </li>
    )
  }
)
ListItem.displayName = "ListItem"