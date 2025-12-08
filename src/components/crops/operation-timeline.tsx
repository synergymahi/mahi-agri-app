import { CropOperation } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    CheckCircle2,
    Circle,
    Tractor,
    Sprout,
    Droplet,
    Syringe,
    Scissors,
    MoreHorizontal
} from "lucide-react"

interface OperationTimelineProps {
    operations: CropOperation[]
}

const getIcon = (type: string) => {
    switch (type) {
        case "PLOUGHING": return Tractor;
        case "SOWING": return Sprout;
        case "FERTILIZATION": return Droplet; // Or something else
        case "IRRIGATION": return Droplet;
        case "TREATMENT": return Syringe;
        case "HARVEST": return Scissors;
        default: return MoreHorizontal;
    }
}

export function OperationTimeline({ operations }: OperationTimelineProps) {
    if (operations.length === 0) {
        return <div className="text-center text-muted-foreground py-8">Aucune opération enregistrée.</div>
    }

    return (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {operations.map((op) => {
                const Icon = getIcon(op.type)

                return (
                    <div key={op.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:static">
                            <Icon className="w-5 h-5" />
                        </div>

                        {/* Mobile: Content pushes right. Desktop: Alternates */}
                        <div className="w-[calc(100%-3.5rem)] ml-auto md:ml-0 md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow bg-white relative">
                            {/* Arrow for mobile/desktop logic could be added here, simplified for now */}
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-bold text-slate-900 line-clamp-1">{op.description}</div>
                                <time className="font-caveat font-medium text-emerald-600 text-xs whitespace-nowrap ml-2">
                                    {format(op.date, "d MMM", { locale: fr })}
                                </time>
                            </div>
                            <div className="text-slate-500 text-xs">
                                <span className="font-medium">{op.type}</span>
                                {op.cost && <span className="ml-2 text-slate-700 font-semibold block sm:inline sm:mt-0 mt-1">{op.cost.toLocaleString()} FCFA</span>}
                            </div>
                            {op.notes && (
                                <div className="text-slate-500 text-xs mt-2 italic line-clamp-2">
                                    "{op.notes}"
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
