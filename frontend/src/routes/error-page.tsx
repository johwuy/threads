import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home } from 'lucide-react'

function ErrorPage() {
  const error = useRouteError()

  let errorMessage: string
  let errorStatus: number | undefined

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || 'An error occurred'
    errorStatus = error.status
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else {
    errorMessage = 'An unknown error occurred'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/20">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          {errorStatus && (
            <CardTitle className="text-5xl font-bold mb-2">
              {errorStatus}
            </CardTitle>
          )}
          <CardTitle>Oops! Something went wrong</CardTitle>
          <CardDescription className="text-base">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link to="/">
            <Button className="w-full" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Go back home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorPage