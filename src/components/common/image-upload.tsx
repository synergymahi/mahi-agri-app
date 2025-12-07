"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { storage } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { Camera, Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface ImageUploadProps {
    userId: string
    onImagesUploaded: (urls: string[]) => void
    maxImages?: number
    initialImages?: string[]
}

export function ImageUpload({ userId, onImagesUploaded, maxImages = 5, initialImages = [] }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [imageUrls, setImageUrls] = useState<string[]>(initialImages)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        if (imageUrls.length + files.length > maxImages) {
            toast.error(`Maximum ${maxImages} images autorisées.`)
            return
        }

        setUploading(true)
        const newUrls: string[] = []

        // Parallel uploads
        const uploadPromises = Array.from(files).map(async (file) => {
            // Validation (Size < 5MB, Type Image)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`Le fichier ${file.name} est trop volumineux (max 5MB)`)
                return null
            }
            if (!file.type.startsWith("image/")) {
                toast.error(`Le fichier ${file.name} n'est pas une image`)
                return null
            }

            try {
                // Create logic path: products/{userId}/{timestamp}_{filename}
                const storageRef = ref(storage, `products/${userId}/${Date.now()}_${file.name}`)
                const uploadTask = await uploadBytesResumable(storageRef, file)
                const url = await getDownloadURL(uploadTask.ref)
                return url
            } catch (error) {
                console.error("Upload failed", error)
                toast.error(`Échec de l'envoi de ${file.name}`)
                return null
            }
        })

        const results = await Promise.all(uploadPromises)
        const successfulUrls = results.filter((url): url is string => url !== null)

        const updatedUrls = [...imageUrls, ...successfulUrls]
        setImageUrls(updatedUrls)
        onImagesUploaded(updatedUrls)
        setUploading(false)

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const removeImage = (index: number) => {
        const newUrls = [...imageUrls]
        newUrls.splice(index, 1)
        setImageUrls(newUrls)
        onImagesUploaded(newUrls)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {imageUrls.map((url, index) => (
                    <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                        <Image
                            src={url}
                            alt={`Produit ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}

                {imageUrls.length < maxImages && (
                    <div
                        className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {uploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                                <span className="text-xs text-muted-foreground">Ajouter</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={uploading}
            />

            <p className="text-xs text-muted-foreground">
                {imageUrls.length} / {maxImages} images. Cliquez pour prendre une photo ou choisir un fichier.
            </p>
        </div>
    )
}
