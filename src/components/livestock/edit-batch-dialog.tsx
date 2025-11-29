"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Pencil } from "lucide-react"
import { updateBatch } from "@/app/actions/batch-actions"
import { Batch } from "@/types"

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
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    type: z.enum(["LAYER", "BROILER", "PIG"]),
    startDate: z.string().min(1, "La date est requise"),
    initialCount: z.coerce.number().min(1, "L'effectif doit être positif"),
})

interface EditBatchDialogProps {
    batch: Batch
}

export function EditBatchDialog({ batch }: EditBatchDialogProps) {
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: batch.name,
            type: batch.type,
            startDate: new Date(batch.startDate).toISOString().split('T')[0],
            initialCount: batch.initialCount,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append("name", values.name)
        formData.append("type", values.type)
        formData.append("startDate", values.startDate)
        formData.append("initialCount", values.initialCount.toString())

        const result = await updateBatch(batch.id, null, formData)

        if (result?.success) {
            setOpen(false)
            toast.success("Bande mise à jour avec succès")
        } else {
            console.error(result?.message)
            toast.error(result?.message || "Erreur lors de la mise à jour")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier la bande</DialogTitle>
                    <DialogDescription>
                        Modifiez les informations de la bande.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom de la bande</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex: Lot A-2024" {...field} />
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
                                    <FormLabel>Type d'élevage</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner le type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="LAYER">Poule Pondeuse</SelectItem>
                                            <SelectItem value="BROILER">Poulet de Chair</SelectItem>
                                            <SelectItem value="PIG">Porc</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date de début</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="initialCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Effectif initial</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
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
