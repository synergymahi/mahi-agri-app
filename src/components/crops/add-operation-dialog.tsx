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
import { createOperation } from "@/app/actions/crop-actions"
import { useFormStatus } from "react-dom"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Crop } from "@/types"

const initialState = {
    message: "",
    errors: {},
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Ajout..." : "Ajouter l'opération"}
        </Button>
    )
}

interface AddOperationDialogProps {
    crop: Crop
}

export function AddOperationDialog({ crop }: AddOperationDialogProps) {
    const [open, setOpen] = useState(false)
    const [state, formAction] = useActionState(createOperation, initialState)
    const { user } = useAuth()

    useEffect(() => {
        if (state.success) {
            setOpen(false)
            toast.success("Opération ajoutée avec succès")
        } else if (state.message && state.message !== "") {
            toast.error(state.message)
        }
    }, [state])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une opération
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter une opération</DialogTitle>
                    <DialogDescription>
                        Enregistrez une activité réalisée sur cette culture.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="userId" value={user?.uid || ""} />
                    <input type="hidden" name="cropId" value={crop.id} />

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Date
                            </Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Select name="type">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Type d'opération" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PLOUGHING">Labour</SelectItem>
                                    <SelectItem value="SOWING">Semis</SelectItem>
                                    <SelectItem value="FERTILIZATION">Fertilisation</SelectItem>
                                    <SelectItem value="IRRIGATION">Irrigation</SelectItem>
                                    <SelectItem value="TREATMENT">Traitement</SelectItem>
                                    <SelectItem value="HARVEST">Récolte</SelectItem>
                                    <SelectItem value="OTHER">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                className="col-span-3"
                                placeholder="Détails..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cost" className="text-right">
                                Coût (FCFA)
                            </Label>
                            <Input
                                id="cost"
                                name="cost"
                                type="number"
                                step="0.01"
                                className="col-span-3"
                                placeholder="Optionnel"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Statut
                            </Label>
                            <Select name="status" defaultValue="COMPLETED">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COMPLETED">Terminé</SelectItem>
                                    <SelectItem value="PENDING">À venir</SelectItem>
                                </SelectContent>
                            </Select>
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
