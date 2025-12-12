"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createCrop } from "@/app/actions/crop-actions"
import { useFormStatus } from "react-dom"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Sprout } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Parcel } from "@/types"

const initialState = {
    message: "",
    errors: {},
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Planification..." : "Planifier la culture"}
        </Button>
    )
}

interface AddCropDialogProps {
    parcels: Parcel[]
    onSuccess?: () => void
}

export function AddCropDialog({ parcels, onSuccess }: AddCropDialogProps) {
    const [open, setOpen] = useState(false)
    const [state, formAction] = useActionState(createCrop, initialState)
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (state.success) {
            setOpen(false)
            toast.success("Culture planifiée avec succès")
            router.refresh()
            if (onSuccess) onSuccess()
        } else if (state.message && state.message !== "") {
            toast.error(state.message)
        }
    }, [state])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Sprout className="mr-2 h-4 w-4" />
                    Nouvelle Culture
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Planifier une culture</DialogTitle>
                    <DialogDescription>
                        Lancez ou planifiez une nouvelle saison de culture sur une parcelle.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="userId" value={user?.uid || ""} />
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="parcelId" className="text-right">
                                Parcelle
                            </Label>
                            <Select name="parcelId">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Sélectionner une parcelle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {parcels.map((parcel) => (
                                        <SelectItem key={parcel.id} value={parcel.id}>
                                            {parcel.name} ({parcel.area} {parcel.unit})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nom
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                className="col-span-3"
                                placeholder="ex: Maïs Saison Sèche"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="variety" className="text-right">
                                Variété
                            </Label>
                            <Input
                                id="variety"
                                name="variety"
                                className="col-span-3"
                                placeholder="ex: Espoir 2000"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right">
                                Date début
                            </Label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="expectedYield" className="text-right">
                                Obj. Rdmt
                            </Label>
                            <Input
                                id="expectedYield"
                                name="expectedYield"
                                type="number"
                                step="0.01"
                                className="col-span-3"
                                placeholder="Tonnes estimées"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">
                                Notes
                            </Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                className="col-span-3"
                                placeholder="Observations..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
