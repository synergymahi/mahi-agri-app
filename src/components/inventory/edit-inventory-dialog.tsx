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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateInventoryItem } from "@/app/actions/inventory-actions"
import { useFormStatus } from "react-dom"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { InventoryItem } from "@/types"
import { useAuth } from "@/components/auth-provider"

const initialState = {
    message: "",
    errors: {},
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Modification..." : "Modifier"}
        </Button>
    )
}

interface EditInventoryDialogProps {
    item: InventoryItem
}

export function EditInventoryDialog({ item }: EditInventoryDialogProps) {
    const [open, setOpen] = useState(false)
    const [state, formAction] = useActionState(updateInventoryItem, initialState)
    const { user } = useAuth()

    useEffect(() => {
        if (state.success) {
            setOpen(false)
            toast.success("Article modifié avec succès")
        } else if (state.message && state.message !== "") {
            toast.error(state.message)
        }
    }, [state])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier l'article</DialogTitle>
                    <DialogDescription>
                        Modifiez les détails de l'article ici.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="userId" value={user?.uid || ""} />
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nom
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={item.name}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Select name="type" defaultValue={item.type}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FEED">Aliment</SelectItem>
                                    <SelectItem value="MEDICATION">Médicament</SelectItem>
                                    <SelectItem value="EQUIPMENT">Matériel</SelectItem>
                                    <SelectItem value="OTHER">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quantity" className="text-right">
                                Quantité
                            </Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                step="0.01"
                                defaultValue={item.quantity}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="unit" className="text-right">
                                Unité
                            </Label>
                            <Input
                                id="unit"
                                name="unit"
                                defaultValue={item.unit}
                                className="col-span-3"
                                placeholder="kg, L, unités..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="minThreshold" className="text-right">
                                Seuil min.
                            </Label>
                            <Input
                                id="minThreshold"
                                name="minThreshold"
                                type="number"
                                step="0.01"
                                defaultValue={item.minThreshold}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="currentMarketPrice" className="text-right">
                                Prix (FCFA)
                            </Label>
                            <Input
                                id="currentMarketPrice"
                                name="currentMarketPrice"
                                type="number"
                                step="0.01"
                                defaultValue={item.currentMarketPrice || ""}
                                className="col-span-3"
                                placeholder="Optionnel"
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
