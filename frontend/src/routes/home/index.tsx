import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, MessageCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center py-12 mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome to Friend Tracker
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Keep track of your friends and stay connected
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/contacts">
            <Button size="lg">
              <Users className="mr-2 h-5 w-5" />
              View Contacts
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Users className="h-10 w-10 mb-2 text-primary" />
            <CardTitle>Manage Contacts</CardTitle>
            <CardDescription>
              Keep all your friends' information in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Store names, emails, phone numbers, and more
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Calendar className="h-10 w-10 mb-2 text-primary" />
            <CardTitle>Track Birthdays</CardTitle>
            <CardDescription>
              Never miss an important date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get reminders for birthdays and special occasions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageCircle className="h-10 w-10 mb-2 text-primary" />
            <CardTitle>Stay Connected</CardTitle>
            <CardDescription>
              Keep notes about your conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Remember what matters to your friends
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
