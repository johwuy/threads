import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './root-layout'
import ErrorPage from './error-page'
import Home from './home'
import Contacts from './contacts'
import ContactDetail from './contacts/[id]'
import Login from './login'
import Signup from './signup'
import { AuthGuard } from '@/components/AuthGuard'

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/contacts",
        element: <AuthGuard><Contacts /></AuthGuard>,
      },
      {
        path: "/contacts/:id",
        element: <AuthGuard><ContactDetail /></AuthGuard>,
      }
    ],
  },
])
