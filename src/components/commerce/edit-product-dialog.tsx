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
import { updateProduct } from "@/app/actions/commerce-actions"
import { useFormStatus } from "react-dom"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { ImageUpload } from "@/components/common/image-upload"
import { useAuth } from "@/components/auth-provider"
import { Product } from "@/types"

const initialState = {
    message: "",
    errors: {},
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement..." : "Enregistrer"}
        </Button>
    )
}

interface EditProductDialogProps {
    product: Product
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children?: React.ReactNode
}

export function EditProductDialog({ product, children, open: controlledOpen, onOpenChange }: EditProductDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? onOpenChange! : setInternalOpen

    const [state, formAction] = useActionState(updateProduct, initialState)
    const { user } = useAuth()
    const [images, setImages] = useState<string[]>(product.images || (product.imageUrl ? [product.imageUrl] : []))

    useEffect(() => {
        if (state.success) {
            setOpen(false)
            toast.success("Produit mis à jour")
        } else if (state.message && state.message !== "") {
            toast.error(state.message)
        }
    }, [state, setOpen])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier le produit</DialogTitle>
                    <DialogDescription>
                        Modifiez les informations de votre produit.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="userId" value={user?.uid || ""} />
                    <input type="hidden" name="id" value={product.id} />

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nom
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={product.name}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Catégorie
                            </Label>
                            <Select name="category" defaultValue={product.category}>
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
                                defaultValue={product.price}
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
                                defaultValue={product.unit}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="region" className="text-right">
                                Région
                            </Label>
                            <Input
                                id="region"
                                name="region"
                                defaultValue={product.region}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={product.description}
                                className="col-span-3"
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
                                    initialImages={product.images || (product.imageUrl ? [product.imageUrl] : [])}
                                />
                                <input type="hidden" name="images" value={JSON.stringify(images)} />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Ajoutez ou supprimez des images.
                                </p>
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
