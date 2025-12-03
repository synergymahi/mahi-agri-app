"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Calendar as CalendarIcon, CreditCard, Upload, X } from "lucide-react"
import { createExpense } from "@/app/actions/finance-actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useAuth } from "@/components/auth-provider"

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
    date: z.date(),
    category: z.string().min(1, "La catégorie est requise"),
    amount: z.coerce.number().min(0, "Le montant ne peut pas être négatif"),
    notes: z.string().optional(),
    invoiceUrl: z.string().optional(),
})

interface CreateExpenseDialogProps {
    batchId?: string
}

export function CreateExpenseDialog({ batchId }: CreateExpenseDialogProps) {
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null)

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date(),
            category: "",
            amount: 0,
            notes: "",
            invoiceUrl: "",
        },
    })

    async function handleFileUpload(file: File) {
        if (!file) return null

        try {
            const storageRef = ref(storage, `invoices/${Date.now()}_${file.name}`)
            const snapshot = await uploadBytes(storageRef, file)
            const downloadURL = await getDownloadURL(snapshot.ref)
            return downloadURL
        } catch (error) {
            console.error("Error uploading file:", error)
            toast.error("Erreur lors du téléchargement de la facture")
            return null
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            toast.error("Vous devez être connecté pour enregistrer une dépense.")
            return
        }

        setUploading(true)
        let invoiceUrl = values.invoiceUrl

        if (invoiceFile) {
            const url = await handleFileUpload(invoiceFile)
            if (url) {
                invoiceUrl = url
            } else {
                setUploading(false)
                return // Stop if upload failed
            }
        }

        const formData = new FormData()
        formData.append("userId", user.uid)
        if (batchId) formData.append("batchId", batchId)
        formData.append("date", values.date.toISOString())
        formData.append("category", values.category)
        formData.append("amount", values.amount.toString())
        if (values.notes) formData.append("notes", values.notes)
        if (invoiceUrl) formData.append("invoiceUrl", invoiceUrl)

        const result = await createExpense(null, formData)

        setUploading(false)
        if (result?.success) {
            setOpen(false)
            toast.success("Dépense enregistrée")
            form.reset()
            setInvoiceFile(null)
        } else {
            toast.error(result?.message || "Erreur lors de l'enregistrement")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Enregistrer Dépense
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nouvelle Dépense</DialogTitle>
                    <DialogDescription>
                        Enregistrer une dépense (hors stock/santé).
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
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Catégorie</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une catégorie" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="LABOR">Main d'œuvre</SelectItem>
                                            <SelectItem value="UTILITIES">Électricité/Eau</SelectItem>
                                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                            <SelectItem value="TRANSPORT">Transport</SelectItem>
                                            <SelectItem value="OTHER">Autre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Montant</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="0" {...field} value={field.value as number} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormLabel>Facture (Optionnel)</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) setInvoiceFile(file)
                                        }}
                                        className="cursor-pointer"
                                    />
                                    {invoiceFile && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setInvoiceFile(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </FormControl>
                            {invoiceFile && (
                                <p className="text-sm text-muted-foreground">
                                    Fichier sélectionné: {invoiceFile.name}
                                </p>
                            )}
                        </FormItem>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Détails supplémentaires..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={uploading}>
                                {uploading && <Upload className="mr-2 h-4 w-4 animate-spin" />}
                                {uploading ? "Enregistrement..." : "Enregistrer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
