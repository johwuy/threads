interface InteractionsTabProps {
  contactId: string
  contactName: string
}

export function InteractionsTab({ contactName }: InteractionsTabProps) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p className="text-lg font-medium mb-2">Interactions Coming Soon</p>
      <p className="text-sm">
        Create an interactions table in your database to start tracking your communication history with {contactName}.
      </p>
    </div>
  )
}
