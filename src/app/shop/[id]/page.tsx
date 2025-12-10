"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getProductById } from "@/app/actions/commerce-actions"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, MessageCircle, ArrowLeft, Tag, Info } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import ReactMarkdown from "react-markdown"

export default function ProductDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            if (id) {
                const data = await getProductById(id)
                setProduct(data)
                if (data && (data.imageUrl || (data.images && data.images.length > 0))) {
                    setSelectedImage(data.imageUrl || data.images![0])
                }
            }
            setLoading(false)
        }
        load()
    }, [id])

    const handleWhatsApp = () => {
        if (!product) return
        const phoneNumber = "+33769890974" // Replace with dynamic seller phone
        const message = `Bonjour, je suis intéressé par votre produit: ${product.name} sur Lafermedemahi.`
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
    }

    if (loading) return <div className="container py-10"><Skeleton className="h-[500px] w-full" /></div>
    if (!product) return (
        <div className="container py-20 text-center">
            <h1 className="text-2xl font-bold">Produit introuvable</h1>
            <Link href="/shop">
                <Button variant="link" className="mt-4">Retour à la boutique</Button>
            </Link>
        </div>
    )

    const allImages = product.images && product.images.length > 0
        ? product.images
        : (product.imageUrl ? [product.imageUrl] : [])

    return (
        <div className="container mx-auto py-8">
            <Link href="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux produits
            </Link>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                        {selectedImage ? (
                            <Image
                                src={selectedImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                <span className="text-6xl font-black opacity-10">{product.name.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                    {allImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${selectedImage === img ? "border-primary" : "border-transparent"
                                        }`}
                                >
                                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <Badge className="mb-2">{product.category}</Badge>
                        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                        <div className="flex items-center text-muted-foreground mt-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {product.region || "Localisation non spécifiée"}
                        </div>
                    </div>

                    <div className="text-4xl font-bold text-emerald-600">
                        {product.price.toLocaleString()} FCFA <span className="text-lg text-muted-foreground font-normal">/ {product.unit}</span>
                    </div>

                    <div className="prose prose-stone max-w-none text-muted-foreground bg-muted/20 p-4 rounded-lg">
                        <ReactMarkdown>{product.description || "Aucune description disponible."}</ReactMarkdown>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                        <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg" onClick={handleWhatsApp}>
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Commander sur WhatsApp
                        </Button>
                        <Button size="lg" variant="outline" className="w-full h-12 text-lg">
                            <Phone className="mr-2 h-5 w-5" />
                            Appeler le vendeur
                        </Button>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-muted-foreground pt-4">
                        <Info className="h-4 w-4" />
                        <p>
                            Lafermedemahi agit en tant qu'intermédiaire de mise en relation.
                            Vérifiez toujours la qualité du produit avant le paiement final.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
