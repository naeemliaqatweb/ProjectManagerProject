"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useTheme } from "next-themes"

import {
    User,
    Lock,
    Bell,
    Palette,
    Shield,
    Mail,
    User as UserIcon,
    Save,
    CheckCircle2,
    AlertCircle,
    Camera,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

interface SessionUser {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
}

export default function SettingsPage() {
    const { data: session, status, update: updateSession } = useSession()
    const user = session?.user as SessionUser
    const router = useRouter()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [twoFactorToken, setTwoFactorToken] = useState("")
    const [qrCodeData, setQrCodeData] = useState<{ secret: string; qrCode: string } | null>(null)
    const [is2faEnabled, setIs2faEnabled] = useState(false)

    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const { theme, setTheme, resolvedTheme } = useTheme()
    const [accentColor, setAccentColor] = useState("#6366f1")
    const [mounted, setMounted] = useState(false)

    // Ensure we only render theme-dependent UI on the client
    useEffect(() => {
        setMounted(true)
        const savedColor = localStorage.getItem("accent-color")
        if (savedColor) {
            setAccentColor(savedColor)
            applyAccentColor(savedColor)
        }
    }, [])

    const applyAccentColor = (color: string) => {
        const root = document.documentElement
        // For oklch variables, we might need a converter if the user expects hex
        // But for simplicity, we can just use the hex directly in a style tag or override the variable
        // Since primary is oklch in globals.css, we can override it with any valid color
        root.style.setProperty("--primary", color)
        // Also update ring for consistency
        root.style.setProperty("--ring", color)
        localStorage.setItem("accent-color", color)
    }

    const handleAccentColorChange = (color: string) => {
        setAccentColor(color)
        applyAccentColor(color)
    }

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (status === "authenticated" && user) {
            setName(user.name || "")
            setEmail(user.email || "")
            fetchUserInfo()
        }
    }, [status, user])

    const fetchUserInfo = async () => {
        if (!user?.id) return
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/users/${user.id}`)
            setIs2faEnabled(response.data.twoFactorEnabled)
        } catch (error) {
            console.error("Failed to fetch user info:", error)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setSuccessMessage("")
        setErrorMessage("")

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/users/${user.id}/update`, {
                name,
                email
            })
            setSuccessMessage("Profile updated successfully!")
            // Update next-auth session
            await updateSession({
                ...session,
                user: {
                    ...session?.user,
                    name,
                    email
                }
            })
        } catch (error: any) {
            console.error("Failed to update profile:", error)
            setErrorMessage(error.response?.data?.message || "Failed to update profile.")
        } finally {
            setLoading(false)
        }
    }

    const getImageUrl = (imagePath: string | null | undefined) => {
        if (!imagePath) return ""
        if (imagePath.startsWith("http")) return imagePath
        return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}${imagePath}`
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user?.id) return

        // Create preview using FileReader for better reliability
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreviewImage(reader.result as string)
        }
        reader.readAsDataURL(file)

        setLoading(true)
        setSuccessMessage("")
        setErrorMessage("")

        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/users/${user.id}/avatar`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            const imageUrl = response.data.image
            setSuccessMessage("Avatar updated successfully!")

            // Short delay to ensure backend has finished writing and static serving is ready
            setTimeout(async () => {
                await updateSession({
                    ...session,
                    user: {
                        ...session?.user,
                        image: imageUrl
                    }
                })
                setPreviewImage(null)
            }, 500);

        } catch (error: any) {
            console.error("Failed to upload avatar:", error)
            setErrorMessage(error.response?.data?.message || "Failed to upload avatar.")
            setPreviewImage(null)
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.")
            return
        }

        setLoading(true)
        setSuccessMessage("")
        setErrorMessage("")

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/users/${user.id}/password`, {
                password
            })
            setSuccessMessage("Password changed successfully!")
            setPassword("")
            setConfirmPassword("")
        } catch (error: any) {
            console.error("Failed to change password:", error)
            setErrorMessage(error.response?.data?.message || "Failed to change password.")
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate2fa = async () => {
        setLoading(true)
        setSuccessMessage("")
        setErrorMessage("")
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/users/${user.id}/2fa/generate`)
            setQrCodeData(response.data)
        } catch (error: any) {
            setErrorMessage("Failed to generate 2FA secret.")
        } finally {
            setLoading(false)
        }
    }

    const handleEnable2fa = async () => {
        if (!qrCodeData) return
        setLoading(true)
        setSuccessMessage("")
        setErrorMessage("")
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/users/${user.id}/2fa/enable`, {
                secret: qrCodeData.secret,
                token: twoFactorToken
            })
            setSuccessMessage("2FA enabled successfully!")
            setIs2faEnabled(true)
            setQrCodeData(null)
            setTwoFactorToken("")
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || "Invalid 2FA token.")
        } finally {
            setLoading(false)
        }
    }

    const handleDisable2fa = async () => {
        setLoading(true)
        setSuccessMessage("")
        setErrorMessage("")
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/users/${user.id}/2fa/disable`)
            setSuccessMessage("2FA disabled.")
            setIs2faEnabled(false)
        } catch (error: any) {
            setErrorMessage("Failed to disable 2FA.")
        } finally {
            setLoading(false)
        }
    }

    if (status === "loading") {
        return <div className="p-8 animate-pulse text-muted-foreground">Loading settings...</div>
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 p-1">
                    <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <UserIcon className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Shield className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Palette className="h-4 w-4" />
                        Appearance
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <p className="text-sm font-medium">{successMessage}</p>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="h-5 w-5" />
                            <p className="text-sm font-medium">{errorMessage}</p>
                        </div>
                    )}

                    <TabsContent value="profile" className="space-y-6">
                        <Card className="border-muted/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">Public Profile</CardTitle>
                                <CardDescription>This information will be visible to other members.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleUpdateProfile}>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <Avatar className="h-28 w-28 border-4 border-background ring-4 ring-primary/5 shadow-xl transition-all group-hover:ring-primary/20">
                                                <AvatarImage
                                                    src={previewImage || getImageUrl(user?.image)}
                                                    alt={name}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold uppercase transition-colors group-hover:bg-primary/20">
                                                    {name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                                                </AvatarFallback>
                                                {loading && (
                                                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-[1px] animate-in fade-in">
                                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                    </div>
                                                )}
                                            </Avatar>
                                            <label className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all z-10 border-4 border-background">
                                                <Camera className="h-5 w-5" />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleAvatarUpload}
                                                    disabled={loading}
                                                />
                                            </label>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-semibold text-lg">{name || "Your Name"}</h4>
                                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                                            <p className="text-xs text-muted-foreground mt-1">JPG, GIF or PNG. 1MB Max.</p>
                                        </div>
                                    </div>

                                    <Separator className="bg-muted/60" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Display Name</Label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="pl-9 h-11"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="pl-9 h-11"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/10 border-t border-muted/60 px-6 py-4 justify-end">
                                    <Button type="submit" disabled={loading} className="gap-2 h-10 px-6 font-semibold">
                                        <Save className="h-4 w-4" />
                                        {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                        <Card className="border-muted/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">Account Security</CardTitle>
                                <CardDescription>Update your password to keep your account secure.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleChangePassword}>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-password" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="new-password"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="pl-9 h-11"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1 px-1">Must be at least 8 characters long.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="confirm-password"
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="pl-9 h-11"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="bg-muted/60" />
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                                <Shield className="h-4 w-4" />
                                                Two-Factor Authentication
                                                {is2faEnabled && <Badge variant="secondary" className="bg-green-500/10 text-green-500 ml-2 border-green-500/20">Enabled</Badge>}
                                            </div>
                                            {is2faEnabled && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    type="button"
                                                    onClick={handleDisable2fa}
                                                    className="text-xs h-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    Disable
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Add an extra layer of security to your account by requiring more than just a password to log in.
                                        </p>
                                        {!is2faEnabled && !qrCodeData && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                type="button"
                                                onClick={handleGenerate2fa}
                                                className="text-xs h-8 border-primary/20 text-primary hover:bg-primary/5"
                                            >
                                                Setup 2FA
                                            </Button>
                                        )}

                                        {qrCodeData && (
                                            <div className="space-y-4 pt-2 border-t border-primary/10 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm border border-muted ring-4 ring-primary/5">
                                                        <img src={qrCodeData.qrCode} alt="2FA QR Code" className="h-32 w-32" />
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-foreground">1. Scan QR Code</p>
                                                            <p className="text-[10px] text-muted-foreground">Use an authenticator app (e.g. Google Authenticator) to scan the code.</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="2fa-token" className="text-[10px] uppercase font-bold text-muted-foreground">2. Enter 6-digit Code</Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    id="2fa-token"
                                                                    value={twoFactorToken}
                                                                    onChange={(e) => setTwoFactorToken(e.target.value)}
                                                                    className="h-9 max-w-[120px] text-center font-mono text-lg tracking-widest"
                                                                    placeholder="000000"
                                                                    maxLength={6}
                                                                />
                                                                <Button
                                                                    onClick={handleEnable2fa}
                                                                    disabled={loading || twoFactorToken.length !== 6}
                                                                    size="sm"
                                                                    className="h-9 px-4"
                                                                >
                                                                    Verify & Enable
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setQrCodeData(null)
                                                                        setTwoFactorToken("")
                                                                    }}
                                                                    className="h-9 px-2 text-muted-foreground"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/10 border-t border-muted/60 px-6 py-4 justify-end">
                                    <Button type="submit" disabled={loading} className="gap-2 h-10 px-6 font-semibold">
                                        <Save className="h-4 w-4" />
                                        {loading ? "Update Password" : "Update Password"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-6">
                        {!mounted ? (
                            <div className="p-8 animate-pulse text-muted-foreground">Loading appearance...</div>
                        ) : (
                            <Card className="border-muted/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl">Appearance</CardTitle>
                                    <CardDescription>Customize how the application looks for you.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 pb-10">
                                    <div className="space-y-4">
                                        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Interface Theme</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div
                                                onClick={() => setTheme("light")}
                                                className={`space-y-2 cursor-pointer group transition-all ${theme === "light" ? "ring-2 ring-primary ring-offset-2 rounded-xl" : ""}`}
                                            >
                                                <div className={`aspect-video rounded-xl bg-white border-2 flex items-center justify-center overflow-hidden ${theme === "light" ? "border-primary shadow-md" : "border-muted"}`}>
                                                    <div className="space-y-2 w-full px-4">
                                                        <div className="h-2 w-1/2 bg-slate-200 rounded" />
                                                        <div className="h-2 w-full bg-slate-100 rounded" />
                                                    </div>
                                                </div>
                                                <p className={`text-xs font-semibold text-center transition-colors ${theme === "light" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>Light Mode</p>
                                            </div>
                                            <div
                                                onClick={() => setTheme("dark")}
                                                className={`space-y-2 cursor-pointer group transition-all ${theme === "dark" ? "ring-2 ring-primary ring-offset-2 rounded-xl" : ""}`}
                                            >
                                                <div className={`aspect-video rounded-xl bg-slate-950 border-2 flex items-center justify-center overflow-hidden ${theme === "dark" ? "border-primary shadow-md" : "border-muted"}`}>
                                                    <div className="space-y-2 w-full px-4">
                                                        <div className="h-2 w-1/2 bg-slate-800 rounded" />
                                                        <div className="h-2 w-full bg-slate-900 rounded" />
                                                    </div>
                                                </div>
                                                <p className={`text-xs font-semibold text-center transition-colors ${theme === "dark" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>Dark Mode</p>
                                            </div>
                                            <div
                                                onClick={() => setTheme("system")}
                                                className={`space-y-2 cursor-pointer group transition-all ${theme === "system" ? "ring-2 ring-primary ring-offset-2 rounded-xl" : ""}`}
                                            >
                                                <div className={`aspect-video rounded-xl bg-slate-100 border-2 flex items-center justify-center overflow-hidden relative ${theme === "system" ? "border-primary shadow-md" : "border-muted"}`}>
                                                    <div className="absolute inset-0 bg-slate-950 w-1/2" />
                                                    <div className="z-10 h-8 w-8 bg-background rounded-full border shadow-sm flex items-center justify-center">
                                                        <Palette className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                </div>
                                                <p className={`text-xs font-semibold text-center transition-colors ${theme === "system" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>System</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="bg-muted/60" />

                                    <div className="space-y-4">
                                        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Accent Color</Label>
                                        <div className="flex flex-wrap gap-4">
                                            {["#6366f1", "#ec4899", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#06b6d4"].map((color) => (
                                                <div
                                                    key={color}
                                                    onClick={() => handleAccentColorChange(color)}
                                                    className={`h-10 w-10 rounded-full border-2 border-background ring-2 transition-all hover:scale-110 active:scale-95 shadow-sm cursor-pointer ${accentColor === color ? "ring-primary scale-110" : "ring-transparent hover:ring-muted-foreground/20"}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                            <div className="relative group">
                                                <input
                                                    type="color"
                                                    value={accentColor}
                                                    onChange={(e) => handleAccentColorChange(e.target.value)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                                <div className="h-10 w-10 rounded-full border-2 border-background ring-2 ring-muted/20 flex items-center justify-center bg-muted/30 group-hover:ring-primary transition-all">
                                                    <Palette className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/10 border-t border-muted/60 px-6 py-4 italic text-xs text-muted-foreground">
                                    Some appearance settings may require a page refresh.
                                </CardFooter>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <Card className="border-muted/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">Notification Preferences</CardTitle>
                                <CardDescription>Decide how you want to be notified about project updates.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {[
                                    { title: "Task Assignments", desc: "When someone assigns a new task to you." },
                                    { title: "Status Changes", desc: "When a task in your project changes columns." },
                                    { title: "Project Invitations", desc: "When someone shares a project with you." },
                                    { title: "Mentions", desc: "When someone tags you in a task description." }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-muted/60 group">
                                        <div className="space-y-1">
                                            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{item.title}</h4>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                        <div className="h-6 w-11 rounded-full bg-primary p-1 flex justify-end cursor-pointer shadow-inner">
                                            <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="bg-muted/10 border-t border-muted/60 px-6 py-4 justify-between items-center">
                                <span className="text-xs text-muted-foreground">Notifications are currently enabled via email.</span>
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold">Reset to Defaults</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
