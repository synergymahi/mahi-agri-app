"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Phone, Lock, MessageSquare } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [otp, setOtp] = useState("")
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [authMode, setAuthMode] = useState<"sms" | "pin">("sms") // 'sms' or 'pin'
    const [pin, setPin] = useState("")
    const [isSignUp, setIsSignUp] = useState(false) // Toggle between Sign In and Sign Up for PIN mode
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
        // Basic cleaning: remove all non-digits
        let cleanNumber = phoneNumber.replace(/\D/g, '')

        // If it looks like a local number (10 digits starting with 0), add +225
        if (cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
            cleanNumber = '+225' + cleanNumber
        } else if (!cleanNumber.startsWith('+')) {
            if (cleanNumber.length === 10) {
                cleanNumber = '+225' + cleanNumber
            } else {
                cleanNumber = '+' + cleanNumber
            }
        }

        // Final check: should look like E.164 (e.g. +2250707070707)
        if (!cleanNumber.startsWith('+')) {
            cleanNumber = '+' + cleanNumber
        }

        if (cleanNumber.length < 12) {
            toast.error("Veuillez entrer un numéro valide (ex: 0707... ou +225...)")
            return
        }

        setIsLoading(true)
        try {
            const appVerifier = window.recaptchaVerifier
            const confirmation = await signInWithPhoneNumber(auth, cleanNumber, appVerifier)
            setConfirmationResult(confirmation)
            toast.success("Code envoyé par SMS.")
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear()
                window.recaptchaVerifier = undefined
            }
        } catch (error: any) {
            console.error("Auth Error:", error)

            // Handle specific -39 / 503 error
            if (error.message.includes("503") || error.message.includes("error-code:-39")) {
                toast.error("Service SMS indisponible. Essayez l'onglet 'Code Secret'.", {
                    description: "Les SMS semblent bloqués. Créez un compte avec code secret.",
                    duration: 10000,
                })
            } else if (error.code === 'auth/operation-not-allowed') {
                toast.error("L'authentification par téléphone n'est pas activée dans la console Firebase.")
            } else if (error.code === 'auth/invalid-app-credential') {
                toast.error("Erreur de configuration Firebase (Domaine non autorisé ou problème reCAPTCHA).")
            } else if (error.code === 'auth/too-many-requests') {
                toast.error("Trop de tentatives. Veuillez réessayer plus tard.")
            } else {
                toast.error("Erreur: " + error.message)
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

    const handlePinAuth = async () => {
        // Cleaning
        let cleanNumber = phoneNumber.replace(/\D/g, '')

        // Ensure standard format for best uniqueness
        if (cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
            cleanNumber = '+225' + cleanNumber
        } else if (!cleanNumber.startsWith('+')) {
            if (cleanNumber.length === 10) {
                cleanNumber = '+225' + cleanNumber
            } else {
                cleanNumber = '+' + cleanNumber
            }
        }

        if (cleanNumber.length < 8) {
            toast.error("Numéro de téléphone invalide.")
            return
        }
        if (pin.length < 4) {
            toast.error("Le code secret doit contenir au moins 4 chiffres.")
            return
        }

        const fakeEmail = `${cleanNumber.replace('+', '')}@mahi.internal`

        setIsLoading(true)
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, fakeEmail, pin)
                toast.success("Compte créé avec succès !")
                // Optionally sign in directly, createUser usually signs in automatically
            } else {
                await signInWithEmailAndPassword(auth, fakeEmail, pin)
                toast.success("Connexion réussie !")
            }
            router.push("/")
        } catch (error: any) {
            console.error(error)
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                if (!isSignUp) {
                    toast.error("Compte introuvable ou Code incorrect.", {
                        description: "N'oubliez pas de créer votre compte si c'est votre première fois.",
                        action: {
                            label: "Créer un compte",
                            onClick: () => setIsSignUp(true)
                        }
                    })
                } else {
                    toast.error("Erreur lors de la création du compte.")
                }
            } else if (error.code === 'auth/email-already-in-use') {
                toast.error("Ce numéro a déjà un compte actif.", {
                    description: "Connectez-vous avec votre code secret.",
                    action: {
                        label: "Se connecter",
                        onClick: () => setIsSignUp(false)
                    }
                })
            } else if (error.code === 'auth/weak-password') {
                toast.error("Le code secret est trop faible.", { description: "Utilisez au moins 6 chiffres." })
            } else {
                toast.error("Erreur: " + error.message)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {authMode === "sms" ? <Phone className="h-6 w-6 text-primary" /> : <Lock className="h-6 w-6 text-primary" />}
                    </div>
                    <CardTitle className="text-2xl">
                        {authMode === "sms" ? "Connexion SMS" : (isSignUp ? "Créer Code Secret" : "Connexion Code Secret")}
                    </CardTitle>
                    <CardDescription>
                        {authMode === "sms"
                            ? "Code unique envoyé par SMS."
                            : "Connexion sécurisée sans SMS."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Tabs for Auth Mode */}
                    {!confirmationResult && (
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            <Button
                                variant={authMode === "sms" ? "default" : "outline"}
                                onClick={() => setAuthMode("sms")}
                                className="w-full"
                                type="button"
                            >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                SMS
                            </Button>
                            <Button
                                variant={authMode === "pin" ? "default" : "outline"}
                                onClick={() => setAuthMode("pin")}
                                className="w-full"
                                type="button"
                            >
                                <Lock className="mr-2 h-4 w-4" />
                                Code Secret
                            </Button>
                        </div>
                    )}

                    {authMode === "sms" ? (
                        /* SMS FLOW */
                        !confirmationResult ? (
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
                        )) : (
                        /* PIN FLOW */
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="phone-pin" className="text-sm font-medium">
                                    Numéro de téléphone
                                </label>
                                <Input
                                    id="phone-pin"
                                    type="tel"
                                    placeholder="+225 07..."
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="pin-code" className="text-sm font-medium">
                                    Code Secret (PIN)
                                </label>
                                <Input
                                    id="pin-code"
                                    type="password"
                                    inputMode="numeric"
                                    placeholder="••••"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                />
                            </div>

                            <Button
                                className="w-full"
                                onClick={handlePinAuth}
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSignUp ? "Créer mon espace" : "Se connecter"}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    className="text-sm text-primary hover:underline"
                                    onClick={() => setIsSignUp(!isSignUp)}
                                >
                                    {isSignUp
                                        ? "J'ai déjà un compte ? Me connecter"
                                        : "Nouveau ? Créer un code secret"}
                                </button>
                            </div>
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
