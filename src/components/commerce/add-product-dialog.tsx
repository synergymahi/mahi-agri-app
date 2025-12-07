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
import { createProduct } from "@/app/actions/commerce-actions"
import { useFormStatus } from "react-dom"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { ImageUpload } from "@/components/common/image-upload"
import { useAuth } from "@/components/auth-provider"

const initialState = {
    message: "",
    errors: {},
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Ajout..." : "Ajouter le produit"}
        </Button>
    )
}

export function AddProductDialog() {
    const [open, setOpen] = useState(false)
    const [state, formAction] = useActionState(createProduct, initialState)
    const { user } = useAuth()
    const [images, setImages] = useState<string[]>([])

    useEffect(() => {
        if (state.success) {
            setOpen(false)
            setImages([]) // Reset images on success
            toast.success("Produit ajouté avec succès")
        } else if (state.message && state.message !== "") {
            toast.error(state.message)
        }
    }, [state])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau Produit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Mise en vente</DialogTitle>
                    <DialogDescription>
                        Ajoutez un produit à votre catalogue de vente.
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
                                placeholder="ex: Œufs Frais (Plateau)"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Catégorie
                            </Label>
                            <Select name="category">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Choisir..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CROP">Cultures</SelectItem>
                                    <SelectItem value="LIVESTOCK">Élevage</SelectItem>
                                    <SelectItem value="PROCESSED">Transformé</SelectItem>
                                    <SelectItem value="OTHER">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Prix (FCFA)
                            </Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                className="col-span-3"
                                placeholder="Prix unitaire"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="unit" className="text-right">
                                Unité
                            </Label>
                            <Input
                                id="unit"
                                name="unit"
                                className="col-span-3"
                                placeholder="ex: kg, plateau, tête"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="region" className="text-right">
                                Région
                            </Label>
                            <Input
                                id="region"
                                name="region"
                                className="col-span-3"
                                placeholder="Optionnel : Prix régional ?"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                className="col-span-3"
                                placeholder="Détails du produit..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">
                                Images
                            </Label>
                            <div className="col-span-3">
                                <ImageUpload
                                    userId={user?.uid || "temp"}
                                    onImagesUploaded={(urls) => setImages(urls)}
                                />
                                <input type="hidden" name="images" value={JSON.stringify(images)} />
                            </div>
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
