import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './root-layout'
import ErrorPage from './error-page'
import Home from './home'

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      }
    ],
  },
])
