"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Phone } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [otp, setOtp] = useState("")
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
                callback: () => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                },
            })
        }
    }, [])

    const requestOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 8) {
            toast.error("Veuillez entrer un numéro de téléphone valide.")
            return
        }

        setIsLoading(true)
        try {
            const appVerifier = window.recaptchaVerifier
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            setConfirmationResult(confirmation)
            toast.success("Code envoyé par SMS.")
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear()
                window.recaptchaVerifier = undefined
            }
        } catch (error: any) {
            console.error(error)
            if (error.code === 'auth/operation-not-allowed') {
                toast.error("L'authentification par téléphone n'est pas activée dans la console Firebase.")
            } else if (error.code === 'auth/invalid-app-credential') {
                toast.error("Erreur de configuration Firebase (Domaine non autorisé ou problème reCAPTCHA). Essayez un numéro de test.")
            } else if (error.code === 'auth/too-many-requests') {
                toast.error("Trop de tentatives. Veuillez réessayer plus tard.")
            } else {
                toast.error("Erreur lors de l'envoi du code: " + error.message)
            }
            // Reset recaptcha on error
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear()
                window.recaptchaVerifier = undefined
            }
        } finally {
            setIsLoading(false)
        }
    }

    const verifyOtp = async () => {
        if (!otp || !confirmationResult) return

        setIsLoading(true)
        try {
            await confirmationResult.confirm(otp)
            toast.success("Connexion réussie !")
            router.push("/")
        } catch (error) {
            console.error(error)
            toast.error("Code invalide.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Connexion</CardTitle>
                    <CardDescription>
                        Entrez votre numéro de téléphone pour accéder à votre espace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!confirmationResult ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium">
                                    Numéro de téléphone
                                </label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+225 07..."
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={requestOtp}
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Envoyer le code
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="otp" className="text-sm font-medium">
                                    Code de vérification
                                </label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={verifyOtp}
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Vérifier
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => setConfirmationResult(null)}
                                disabled={isLoading}
                            >
                                Changer de numéro
                            </Button>
                        </div>
                    )}
                    <div id="recaptcha-container"></div>
                </CardContent>
            </Card>
        </div>
    )
}

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier | undefined
    }
}
