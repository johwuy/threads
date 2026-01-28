import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './root-layout'
import ErrorPage from './error-page'
import Home from './home'
import Contacts from './contacts'
import ContactDetail from './contacts/[id]'

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
        path: "/contacts",
        element: <Contacts />,
      },
      {
        path: "/contacts/:id",
        element: <ContactDetail />,
      }     
    ],
  },
])
