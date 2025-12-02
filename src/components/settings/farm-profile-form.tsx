"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save } from "lucide-react"
import { createFarmProfile, updateFarmProfile } from "@/app/actions/farm-actions"
import { toast } from "sonner"
import { FarmProfile, LivestockType } from "@/types"
import { useAuth } from "@/components/auth-provider"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
    farmName: z.string().min(2, "Le nom de la ferme est requis"),
    ownerName: z.string().min(2, "Le nom du propriétaire est requis"),
    phoneNumber: z.string().min(8, "Numéro de téléphone invalide"),
    location: z.string().min(2, "La localisation est requise"),
    farmingTypes: z.array(z.enum(["LAYER", "BROILER", "PIG"])).min(1, "Sélectionnez au moins un type d'élevage"),
    capacities: z.record(z.string(), z.coerce.number().min(0)),
})

interface FarmProfileFormProps {
    initialData?: FarmProfile | null
}

const farmingTypeOptions: { id: LivestockType; label: string }[] = [
    { id: "LAYER", label: "Poules Pondeuses" },
    { id: "BROILER", label: "Poulets de Chair" },
    { id: "PIG", label: "Porcs" },
]

export function FarmProfileForm({ initialData }: FarmProfileFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { user } = useAuth()

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            farmName: initialData?.farmName || "",
            ownerName: initialData?.ownerName || "",
            phoneNumber: initialData?.phoneNumber || user?.phoneNumber || "",
            location: initialData?.location || "",
            farmingTypes: initialData?.farmingTypes || [],
            capacities: initialData?.capacities || {},
        },
    })

    const selectedTypes = form.watch("farmingTypes")

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            toast.error("Vous devez être connecté.")
            return
        }

        setIsSubmitting(true)
        const formData = new FormData()
        if (initialData?.id) formData.append("id", initialData.id)
        formData.append("userId", user.uid)
        formData.append("farmName", values.farmName)
        formData.append("ownerName", values.ownerName)
        formData.append("phoneNumber", values.phoneNumber)
        formData.append("location", values.location)

        values.farmingTypes.forEach((type) => {
            formData.append("farmingTypes", type)
            if (values.capacities && values.capacities[type]) {
                formData.append(`capacity_${type}`, values.capacities[type].toString())
            }
        })

        const result = initialData
            ? await updateFarmProfile(null, formData)
            : await createFarmProfile(null, formData)

        setIsSubmitting(false)

        if (result?.success) {
            toast.success(initialData ? "Profil mis à jour" : "Profil créé")
        } else {
            toast.error(result?.message || "Une erreur est survenue")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Informations de la Ferme</CardTitle>
                <CardDescription>
                    Renseignez les informations générales sur votre exploitation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="farmName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom de la Ferme</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ma Ferme" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ownerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom du Propriétaire</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jean Kouassi" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Téléphone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+225 07..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Localisation (Ville/Quartier)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Abidjan, Cocody" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="farmingTypes"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Types d'Élevage</FormLabel>
                                        <FormDescription>
                                            Sélectionnez les types d'animaux élevés sur la ferme.
                                        </FormDescription>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {farmingTypeOptions.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="farmingTypes"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={item.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item.id)}
                                                                    onCheckedChange={(checked: boolean | string) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, item.id])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value: string) => value !== item.id
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">
                                                                {item.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {selectedTypes && selectedTypes.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Capacités par Type</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedTypes.map((type: string) => {
                                        const label = farmingTypeOptions.find(t => t.id === type)?.label || type
                                        return (
                                            <FormField
                                                key={type}
                                                control={form.control}
                                                name={`capacities.${type}`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Capacité ({label})</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
