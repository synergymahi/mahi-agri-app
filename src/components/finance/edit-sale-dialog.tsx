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
import { updateSale } from "@/app/actions/finance-actions"
import { useFormStatus } from "react-dom"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { Sale } from "@/types"
import { useAuth } from "@/components/auth-provider"
import { format } from "date-fns"

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

interface EditSaleDialogProps {
    sale: Sale
}

export function EditSaleDialog({ sale }: EditSaleDialogProps) {
    const [open, setOpen] = useState(false)
    const [state, formAction] = useActionState(updateSale, initialState)
    const { user } = useAuth()

    useEffect(() => {
        if (state.success) {
            setOpen(false)
            toast.success("Vente modifiée avec succès")
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
                    <DialogTitle>Modifier la vente</DialogTitle>
                    <DialogDescription>
                        Modifiez les détails de la vente ici.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="id" value={sale.id} />
                    <input type="hidden" name="userId" value={user?.uid || ""} />
                    <input type="hidden" name="batchId" value={sale.batchId || ""} />

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Date
                            </Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                defaultValue={sale.date ? format(sale.date, "yyyy-MM-dd") : ""}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="item" className="text-right">
                                Article
                            </Label>
                            <Input
                                id="item"
                                name="item"
                                defaultValue={sale.item}
                                className="col-span-3"
                            />
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
                                defaultValue={sale.quantity}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="unitPrice" className="text-right">
                                Prix Unitaire
                            </Label>
                            <Input
                                id="unitPrice"
                                name="unitPrice"
                                type="number"
                                step="0.01"
                                defaultValue={sale.unitPrice}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">
                                Notes
                            </Label>
                            <Input
                                id="notes"
                                name="notes"
                                defaultValue={sale.notes || ""}
                                className="col-span-3"
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
