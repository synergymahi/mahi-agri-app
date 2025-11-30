"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowRightLeft, Calendar as CalendarIcon } from "lucide-react"
import { createTransaction } from "@/app/actions/inventory-actions"
import { getBatches } from "@/app/actions/batch-actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { InventoryItem, Batch } from "@/types"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    type: z.enum(["IN", "OUT"]),
    quantity: z.coerce.number().positive("La quantité doit être positive"),
    date: z.date(),
    batchId: z.string().optional(),
    cost: z.coerce.number().optional(),
    notes: z.string().optional(),
})

interface StockTransactionDialogProps {
    item: InventoryItem
}

export function StockTransactionDialog({ item }: StockTransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const [batches, setBatches] = useState<Batch[]>([])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "IN" as const,
            quantity: 0,
            date: new Date(),
            cost: 0,
            notes: "",
        },
    })

    const transactionType = form.watch("type")

    useEffect(() => {
        if (open && transactionType === "OUT") {
            const fetchBatches = async () => {
                const data = await getBatches()
                setBatches(data.filter(b => b.status === "ACTIVE"))
            }
            fetchBatches()
        }
    }, [open, transactionType])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append("itemId", item.id)
        formData.append("type", values.type)
        formData.append("quantity", values.quantity.toString())
        formData.append("date", values.date.toISOString())
        if (values.batchId) formData.append("batchId", values.batchId)
        if (values.cost) formData.append("cost", values.cost.toString())
        if (values.notes) formData.append("notes", values.notes)

        const result = await createTransaction(null, formData)

        if (result?.success) {
            setOpen(false)
            form.reset()
            toast.success("Transaction enregistrée")
        } else {
            console.error(result?.message)
            toast.error(result?.message || "Erreur lors de l'enregistrement")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <ArrowRightLeft className="mr-2 h-3 w-3" />
                    Mouvement
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Mouvement de Stock - {item.name}</DialogTitle>
                    <DialogDescription>
                        Enregistrer une entrée ou une sortie de stock.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type de mouvement</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="IN">Entrée (Achat/Retour)</SelectItem>
                                            <SelectItem value="OUT">Sortie (Consommation/Perte)</SelectItem>
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
                                        <FormLabel>Quantité ({item.unit})</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" {...field} value={field.value as number} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Coût Total (FCFA)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="100" {...field} value={field.value as number} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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

                        {transactionType === "OUT" && (
                            <FormField
                                control={form.control}
                                name="batchId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Affecter à une bande (Optionnel)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner une bande" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {batches.map((batch) => (
                                                    <SelectItem key={batch.id} value={batch.id}>
                                                        {batch.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Fournisseur, raison de la sortie, etc."
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
