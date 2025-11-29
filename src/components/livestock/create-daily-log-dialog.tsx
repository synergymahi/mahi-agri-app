"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Calendar as CalendarIcon } from "lucide-react"
import { createDailyLog } from "@/app/actions/daily-log-actions"
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
import { toast } from "sonner"

const formSchema = z.object({
    date: z.date({
        required_error: "La date est requise",
    } as any),
    mortality: z.coerce.number().min(0),
    feedConsumed: z.coerce.number().min(0),
    waterConsumed: z.coerce.number().min(0),
    temperature: z.string().optional(), // Input type="number" returns string initially
    weight: z.string().optional(),
    notes: z.string().optional(),
})

interface CreateDailyLogDialogProps {
    batchId: string
    batchName: string
}

export function CreateDailyLogDialog({ batchId, batchName }: CreateDailyLogDialogProps) {
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            date: new Date(),
            mortality: 0,
            feedConsumed: 0,
            waterConsumed: 0,
            temperature: "",
            weight: "",
            notes: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append("batchId", batchId)
        formData.append("date", values.date.toISOString())
        formData.append("mortality", values.mortality.toString())
        formData.append("feedConsumed", values.feedConsumed.toString())
        formData.append("waterConsumed", values.waterConsumed.toString())
        if (values.temperature) formData.append("temperature", values.temperature)
        if (values.weight) formData.append("weight", values.weight)
        if (values.notes) formData.append("notes", values.notes)

        const result = await createDailyLog(null, formData)

        if (result?.success) {
            setOpen(false)
            form.reset()
            toast.success("Suivi enregistré avec succès")
        } else {
            console.error(result?.message)
            toast.error(result?.message || "Erreur lors de l'enregistrement")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un suivi
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Suivi Quotidien - {batchName}</DialogTitle>
                    <DialogDescription>
                        Enregistrez les données du jour pour cette bande.
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
                                name="mortality"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mortalité (têtes)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Poids Moyen (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="Optionnel" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="feedConsumed"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Aliment (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="waterConsumed"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Eau (L)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="temperature"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Température (°C)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.1" placeholder="Optionnel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes / Observations</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="R.A.S" {...field} />
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
