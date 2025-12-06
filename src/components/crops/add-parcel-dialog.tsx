"use client"

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
import { createParcel } from "@/app/actions/crop-actions"
import { useFormStatus } from "react-dom"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const initialState = {
    message: "",
    errors: {},
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Ajout..." : "Ajouter la parcelle"}
        </Button>
    )
}

export function AddParcelDialog() {
    const [open, setOpen] = useState(false)
    const [state, formAction] = useActionState(createParcel, initialState)
    const { user } = useAuth()

    useEffect(() => {
        if (state.success) {
            setOpen(false)
            toast.success("Parcelle ajoutée avec succès")
        } else if (state.message && state.message !== "") {
            toast.error(state.message)
        }
    }, [state])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle Parcelle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter une parcelle</DialogTitle>
                    <DialogDescription>
                        Renseignez les détails de votre nouvelle parcelle.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="userId" value={user?.uid || ""} />
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nom
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                className="col-span-3"
                                placeholder="ex: Champ Nord"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="area" className="text-right">
                                Surface
                            </Label>
                            <Input
                                id="area"
                                name="area"
                                type="number"
                                step="0.01"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="unit" className="text-right">
                                Unité
                            </Label>
                            <Select name="unit" defaultValue="HA">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Unité" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HA">Hectares (ha)</SelectItem>
                                    <SelectItem value="M2">Mètres carrés (m²)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="soilType" className="text-right">
                                Sol (Optionnel)
                            </Label>
                            <Input
                                id="soilType"
                                name="soilType"
                                className="col-span-3"
                                placeholder="ex: Argileux, Sablonneux"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="location" className="text-right">
                                Lieu (Optionnel)
                            </Label>
                            <Input
                                id="location"
                                name="location"
                                className="col-span-3"
                                placeholder="ex: Zone A"
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
                                placeholder="Informations supplémentaires..."
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
