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
import { createCustomer } from "@/app/actions/commerce-actions"
import { useFormStatus } from "react-dom"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const initialState = {
    message: "",
    errors: {},
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Ajout..." : "Ajouter le client"}
        </Button>
    )
}

export function AddCustomerDialog() {
    const [open, setOpen] = useState(false)
    const [state, formAction] = useActionState(createCustomer, initialState)
    const { user } = useAuth()

    useEffect(() => {
        if (state.success) {
            setOpen(false)
            toast.success("Client ajouté avec succès")
        } else if (state.message && state.message !== "") {
            toast.error(state.message)
        }
    }, [state])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Nouveau Client
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter un client</DialogTitle>
                    <DialogDescription>
                        Enregistrez un nouveau client dans votre carnet d'adresses.
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
                                placeholder="Nom complet ou entreprise"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Select name="type">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Type de client" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WHOLESALER">Grossiste</SelectItem>
                                    <SelectItem value="RETAILER">Détaillant</SelectItem>
                                    <SelectItem value="RESTAURANT">Restaurant / Maquis</SelectItem>
                                    <SelectItem value="INDIVIDUAL">Particulier</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Téléphone
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                className="col-span-3"
                                placeholder="Numéro de contact"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">
                                Adresse
                            </Label>
                            <Input
                                id="address"
                                name="address"
                                className="col-span-3"
                                placeholder="Localisation"
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
