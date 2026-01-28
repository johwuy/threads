import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Toaster } from '@/components/ui/sonner'
import { Github, Linkedin } from 'lucide-react'
import { ContactsProvider } from '@/contexts/ContactsContext'

export default function RootLayout() {
  const location = useLocation()

  return (
    <ContactsProvider>
      <div className="min-h-screen flex flex-col">
      <Toaster />
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold hover:scale-105 transition-transform duration-200 inline-block">
            Threads
          </Link>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle()}
                    active={location.pathname === '/'}
                  >
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/contacts">
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle()}
                    active={location.pathname.startsWith('/contacts')}
                  >
                    Contacts
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-2">
            <a
              href="https://github.com/johwuy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/johwuy/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
          <p>© {new Date().getFullYear()} Threads. Built with love.</p>
        </div>
      </footer>
      </div>
    </ContactsProvider>
  )
}
