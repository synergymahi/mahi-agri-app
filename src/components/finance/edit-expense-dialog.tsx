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
import { updateExpense } from "@/app/actions/finance-actions"
import { useFormState, useFormStatus } from "react-dom"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { Expense } from "@/types"
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

interface EditExpenseDialogProps {
    expense: Expense
}

export function EditExpenseDialog({ expense }: EditExpenseDialogProps) {
    const [open, setOpen] = useState(false)
    const [state, formAction] = useFormState(updateExpense, initialState)
    const { user } = useAuth()

    useEffect(() => {
        if (state.success) {
            setOpen(false)
            toast.success("Dépense modifiée avec succès")
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
                    <DialogTitle>Modifier la dépense</DialogTitle>
                    <DialogDescription>
                        Modifiez les détails de la dépense ici.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="id" value={expense.id} />
                    <input type="hidden" name="userId" value={user?.uid || ""} />

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Date
                            </Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                defaultValue={expense.date ? format(expense.date, "yyyy-MM-dd") : ""}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Catégorie
                            </Label>
                            <Select name="category" defaultValue={expense.category}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Sélectionner une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FEED">Aliment</SelectItem>
                                    <SelectItem value="MEDICATION">Médicament</SelectItem>
                                    <SelectItem value="EQUIPMENT">Matériel</SelectItem>
                                    <SelectItem value="LABOR">Main d'oeuvre</SelectItem>
                                    <SelectItem value="UTILITIES">Factures (Eau/Élec)</SelectItem>
                                    <SelectItem value="OTHER">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Montant
                            </Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                defaultValue={expense.amount}
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
                                defaultValue={expense.notes || ""}
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
