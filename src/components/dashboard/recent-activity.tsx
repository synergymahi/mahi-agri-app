import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentActivity({ activities }: { activities: any[] }) {
    if (activities.length === 0) {
        return (
            <div className="text-sm text-muted-foreground">
                Aucune activité récente.
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {activities.map((activity) => (
                <div key={activity.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>
                            {activity.type === "SALE" ? "V" : "A"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">
                        +{activity.amount?.toLocaleString()} FCFA
                    </div>
                </div>
            ))}
        </div>
    )
}
