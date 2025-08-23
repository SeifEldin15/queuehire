"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
    Edit3,
    Phone,
    Mail,
    Linkedin,
    Instagram,
    Globe,
    Camera,
    Shield,
    Bell,
    Palette,
    User,
    Award,
    Star,
} from "lucide-react";
import styles from "./page.module.css";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editSkills, setEditSkills] = useState(false);
    const [skillsInput, setSkillsInput] = useState<string>("");
    const [editContact, setEditContact] = useState(false);
    const [contactForm, setContactForm] = useState<any>({});
    const [editProfile, setEditProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<any>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace("/login");
                return;
            }
            const { data } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();
            setProfile(data);
            setSkillsInput(data?.skills || "");
            setContactForm({
                phone: data?.phone || "",
                linkedin: data?.linkedin || "",
                instagram: data?.instagram || "",
                website: data?.website || "",
            });
            setProfileForm({
                full_name: data?.full_name || "",
                bio: data?.bio || "",
            });
            setLoading(false);
        };
        fetchProfile();
    }, [router]);

    // Helper to update profile
    const updateProfile = async (updates: Partial<typeof profile>) => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", user.id)
            .single();
        if (!error && data) setProfile(data);
        setLoading(false);
    };

    // Skills logic
    const skillsArr = (profile?.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean);

    const handleAddSkill = () => {
        if (skillsArr.length >= 8 || !skillsInput.trim()) return;
        const newSkills = [...skillsArr, skillsInput.trim()];
        updateProfile({ skills: newSkills.join(",") });
        setSkillsInput("");
        setEditSkills(false);
    };

    const handleRemoveSkill = (skill: string) => {
        const newSkills = skillsArr.filter((s: string) => s !== skill);
        updateProfile({ skills: newSkills.join(",") });
    };

    // Contact logic
    const handleContactSave = () => {
        updateProfile(contactForm);
        setEditContact(false);
    };

    // Profile logic
    const handleProfileSave = () => {
        updateProfile(profileForm);
        setEditProfile(false);
    };

    // Preferences logic
    const handlePreferenceChange = (field: string, value: string) => {
        updateProfile({ [field]: value });
    };

    // Security logic
    const handleToggle2FA = () => {
        updateProfile({ two_factor_enabled: !profile.two_factor_enabled });
    };

    // Notifications logic
    const handleNotificationChange = (field: string, value: boolean) => {
        updateProfile({ [field]: value });
    };

    // Profile image upload logic
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const uploadProfileImage = async () => {
        if (!imageFile) return;
        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");
            const ext = imageFile.name.split('.').pop();
            const filePath = `profile-images/${user.id}-${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, imageFile, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            await updateProfile({ profile_image: publicUrl });
            toast({ title: "Profile image updated!" });
            setImageFile(null);
            setImagePreview(null);
        } catch (err: any) {
            toast({ title: "Image upload failed", description: err.message, variant: "destructive" });
        }
        setUploading(false);
    };

    if (loading) return <div>Loading...</div>;
    if (!profile) return <div>Profile not found.</div>;

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "skills", label: "Skills", icon: Award },
        { id: "contact", label: "Contact", icon: Phone },
        { id: "preferences", label: "Preferences", icon: Palette },
        { id: "security", label: "Security", icon: Shield },
        { id: "notifications", label: "Notifications", icon: Bell },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Settings & Profile</h1>
                <p className={styles.pageSubtitle}>
                    Manage your account and customize your experience
                </p>
            </div>

            <div className={styles.tabsContainer}>
                <div className={styles.tabsList}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ""}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={20} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className={styles.tabContent}>
                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                        <div className={styles.profileTab}>
                            <div className={styles.profileHeader}>
                                <div className={styles.avatarSection}>
                                    <div className={styles.avatar}>
                                        {/* Use shadcn Avatar for preview */}
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={imagePreview || profile.profile_image} alt={profile.full_name} />
                                            <AvatarFallback>
                                                {profile.full_name?.[0] || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        {editProfile && (
                                            <label className={styles.cameraButton}>
                                                <Camera size={16} />
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <div className={styles.avatarInfo}>
                                        <h3>Profile Picture</h3>
                                        <p>JPG, PNG, or WEBP. Max 5MB.</p>
                                        {editProfile && imageFile && (
                                            <Button
                                                onClick={uploadProfileImage}
                                                disabled={uploading}
                                                className="mt-2"
                                            >
                                                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Image
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <button className={styles.editButton} onClick={() => setEditProfile(!editProfile)}>
                                    <Edit3 size={16} />
                                    {editProfile ? "Cancel" : "Edit Profile"}
                                </button>
                            </div>

                            <div className={styles.profileDetails}>
                                <div className={styles.nameSection}>
                                    {editProfile ? (
                                        <Input
                                            value={profileForm.full_name}
                                            onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                            placeholder="Your full name"
                                        />
                                    ) : (
                                        <h2>{profile.full_name}</h2>
                                    )}
                                    <div className={styles.rating}>
                                        <div className={styles.stars}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} size={16} className={styles.starFilled} />
                                            ))}
                                        </div>
                                        <span className={styles.ratingCount}>
                                            (12 reviews)
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.bioSection}>
                                    <h4>Bio</h4>
                                    {editProfile ? (
                                        <Textarea
                                            value={profileForm.bio}
                                            onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                                            placeholder="Tell others about yourself"
                                        />
                                    ) : (
                                        <p className={styles.bio}>{profile.bio}</p>
                                    )}
                                </div>
                                {editProfile && (
                                    <div className={styles.actionButtons}>
                                        <Button onClick={handleProfileSave}>Save</Button>
                                    </div>
                                )}
                                <div className={styles.actionButtons}>
                                    <button className={styles.primaryButton}>Change Password</button>
                                    <button className={styles.dangerButton}>Delete Profile</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Skills Tab */}
                    {activeTab === "skills" && (
                        <div className={styles.skillsTab}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h3>Your Skills</h3>
                                    <p>Select up to 8 skills that best represent your expertise</p>
                                </div>
                                <button className={styles.editButton} onClick={() => setEditSkills(!editSkills)}>
                                    <Edit3 size={16} />
                                    {editSkills ? "Cancel" : "Edit Skills"}
                                </button>
                            </div>
                            <div className={styles.skillsGrid}>
                                {skillsArr.map((skill: string) => (
                                    <div key={skill} className={styles.skillCard}>
                                        <span className={styles.skillName}>{skill}</span>
                                        {editSkills && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveSkill(skill)}
                                            >
                                                ×
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {editSkills && skillsArr.length < 8 && (
                                    <div className={styles.addSkillCard}>
                                        <Input
                                            value={skillsInput}
                                            onChange={e => setSkillsInput(e.target.value)}
                                            placeholder="Add skill"
                                        />
                                        <Button onClick={handleAddSkill}>+ Add</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contact Tab */}
                    {activeTab === "contact" && (
                        <div className={styles.contactTab}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h3>Contact Information</h3>
                                    <p>Your matches will see these contact details</p>
                                </div>
                                <button className={styles.editButton} onClick={() => setEditContact(!editContact)}>
                                    <Edit3 size={16} />
                                    {editContact ? "Cancel" : "Edit Contact"}
                                </button>
                            </div>
                            <div className={styles.contactGrid}>
                                {[
                                    { label: "Phone", icon: Phone, key: "phone" },
                                    { label: "LinkedIn", icon: Linkedin, key: "linkedin" },
                                    { label: "Instagram", icon: Instagram, key: "instagram" },
                                    { label: "Website", icon: Globe, key: "website" },
                                ].map(({ label, icon: Icon, key }) => (
                                    <div className={styles.contactCard} key={key}>
                                        <Icon size={20} className={styles.contactIcon} />
                                        <div>
                                            <h4>{label}</h4>
                                            {editContact ? (
                                                <Input
                                                    value={contactForm[key]}
                                                    onChange={e => setContactForm({ ...contactForm, [key]: e.target.value })}
                                                    placeholder={`Your ${label}`}
                                                />
                                            ) : (
                                                <p>{profile[key]}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className={styles.contactCard}>
                                    <Mail size={20} className={styles.contactIcon} />
                                    <div>
                                        <h4>Email</h4>
                                        <p>{profile.email || "Not available"}</p>
                                    </div>
                                </div>
                            </div>
                            {editContact && (
                                <div className={styles.actionButtons}>
                                    <Button onClick={handleContactSave}>Save</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === "preferences" && (
                        <div className={styles.preferencesTab}>
                            <h3>Preferences</h3>
                            <div className={styles.preferencesList}>
                                <div className={styles.preferenceItem}>
                                    <div>
                                        <h4>Theme</h4>
                                        <p>Choose your preferred theme</p>
                                    </div>
                                    <select
                                        className={styles.select}
                                        value={profile.theme || "system"}
                                        onChange={e => handlePreferenceChange("theme", e.target.value)}
                                    >
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                        <option value="system">System</option>
                                    </select>
                                </div>
                                <div className={styles.preferenceItem}>
                                    <div>
                                        <h4>Language</h4>
                                        <p>Select your preferred language</p>
                                    </div>
                                    <select
                                        className={styles.select}
                                        value={profile.language || "English"}
                                        onChange={e => handlePreferenceChange("language", e.target.value)}
                                    >
                                        <option value="English">English</option>
                                        <option value="Arabic">Arabic</option>
                                        <option value="French">French</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === "security" && (
                        <div className={styles.securityTab}>
                            <h3>Security Settings</h3>
                            <div className={styles.securityList}>
                                <div className={styles.securityItem}>
                                    <Shield size={20} />
                                    <div>
                                        <h4>Two-Factor Authentication</h4>
                                        <p>Add an extra layer of security to your account</p>
                                    </div>
                                    <button className={styles.toggleButton} onClick={handleToggle2FA}>
                                        {profile.two_factor_enabled ? "Disable" : "Enable"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === "notifications" && (
                        <div className={styles.notificationsTab}>
                            <h3>Notification Settings</h3>
                            <div className={styles.notificationsList}>
                                <div className={styles.notificationItem}>
                                    <div>
                                        <h4>Email Notifications</h4>
                                        <p>Receive updates via email</p>
                                    </div>
                                    <Switch
                                        checked={!!profile.email_notifications}
                                        onCheckedChange={checked =>
                                            handleNotificationChange("email_notifications", checked)
                                        }
                                    />
                                </div>
                                <div className={styles.notificationItem}>
                                    <div>
                                        <h4>Match Alerts</h4>
                                        <p>Get notified when you have new matches</p>
                                    </div>
                                    <Switch
                                        checked={!!profile.match_alerts}
                                        onCheckedChange={checked =>
                                            handleNotificationChange("match_alerts", checked)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}