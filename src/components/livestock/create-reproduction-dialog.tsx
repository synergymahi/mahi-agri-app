"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Calendar as CalendarIcon, Egg } from "lucide-react"
import { createReproductionRecord } from "@/app/actions/reproduction-actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

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
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    date: z.date(),
    quantityCollected: z.coerce.number().min(0, "La quantité ne peut pas être négative"),
    damagedQuantity: z.coerce.number().min(0, "La quantité ne peut pas être négative"),
    notes: z.string().min(1, "Les notes sont requises"),
})

interface CreateReproductionDialogProps {
    batchId: string
}

export function CreateReproductionDialog({ batchId }: CreateReproductionDialogProps) {
    const [open, setOpen] = useState(false)
    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date(),
            quantityCollected: 0,
            damagedQuantity: 0,
            notes: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append("batchId", batchId)
        formData.append("date", values.date.toISOString())
        formData.append("quantityCollected", values.quantityCollected.toString())
        formData.append("damagedQuantity", values.damagedQuantity.toString())
        if (values.notes) formData.append("notes", values.notes)

        const result = await createReproductionRecord(null, formData)

        if (result?.success) {
            setOpen(false)
            toast.success("Production enregistrée")
            form.reset()
        } else {
            toast.error(result?.message || "Erreur lors de l'enregistrement")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Egg className="mr-2 h-4 w-4" />
                    Ajouter Production
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Enregistrer une collecte</DialogTitle>
                    <DialogDescription>
                        Saisissez les détails de la collecte d'œufs.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: fr })
                                                    ) : (
                                                        <span>Choisir une date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantityCollected"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Collectés</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} value={field.value as number} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="damagedQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cassés/Perdus</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} value={field.value as number} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Observations..."
                                            {...field}
                                        />
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
