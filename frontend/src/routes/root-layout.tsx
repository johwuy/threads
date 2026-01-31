import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { Github, Linkedin, User, LogOut } from 'lucide-react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ContactsProvider } from '@/contexts/ContactsContext'
import { useAuth } from '@/hooks/useAuth'

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold hover:scale-105 transition-transform duration-200 inline-block">
          Threads
        </Link>

        <div className="flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                  active={location.pathname === '/'}
                >
                  <Link to="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              {user && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                    active={location.pathname.startsWith('/contacts')}
                  >
                    <Link to="/contacts">Contacts</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ContactsProvider>
        <div className="min-h-screen flex flex-col">
          <Toaster />
          <Header />

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
    </AuthProvider>
  )
}
