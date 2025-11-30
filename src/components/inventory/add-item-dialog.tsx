"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"
import { createInventoryItem } from "@/app/actions/inventory-actions"
import { toast } from "sonner"

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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    type: z.enum(["FEED", "MEDICATION", "EQUIPMENT", "OTHER"]),
    quantity: z.coerce.number().min(0, "La quantité ne peut pas être négative"),
    unit: z.string().min(1, "L'unité est requise"),
    minThreshold: z.coerce.number().min(0, "Le seuil ne peut pas être négatif"),
    currentMarketPrice: z.coerce.number().optional(),
})

export function AddItemDialog() {
    const [open, setOpen] = useState(false)
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "FEED" as const,
            quantity: 0,
            unit: "kg",
            minThreshold: 10,
            currentMarketPrice: 0,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append("name", values.name)
        formData.append("type", values.type)
        formData.append("quantity", values.quantity.toString())
        formData.append("unit", values.unit)
        formData.append("minThreshold", values.minThreshold.toString())
        if (values.currentMarketPrice) formData.append("currentMarketPrice", values.currentMarketPrice.toString())

        const result = await createInventoryItem(null, formData)

        if (result?.success) {
            setOpen(false)
            form.reset()
            toast.success("Article ajouté avec succès")
        } else {
            console.error(result?.message)
            toast.error(result?.message || "Erreur lors de l'ajout")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvel Article
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter un article</DialogTitle>
                    <DialogDescription>
                        Créez une nouvelle fiche de stock pour le suivi.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom de l'article</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Aliment Démarrage" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="FEED">Aliment</SelectItem>
                                            <SelectItem value="MEDICATION">Médicament</SelectItem>
                                            <SelectItem value="EQUIPMENT">Matériel</SelectItem>
                                            <SelectItem value="OTHER">Autre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock Initial</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} value={field.value as number} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unité</FormLabel>
                                        <FormControl>
                                            <Input placeholder="kg, L, sac..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="minThreshold"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Seuil d'alerte</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="0" {...field} value={field.value as number} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="currentMarketPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prix du marché (FCFA)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="0" step="100" {...field} value={field.value as number} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
