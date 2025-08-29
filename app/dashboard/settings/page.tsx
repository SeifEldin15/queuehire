"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
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
    Check,
    X,
    AlertCircle,
} from "lucide-react";
import styles from "./page.module.css";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { 
    validateWebsite, 
    validatePhone, 
    validateLinkedIn, 
    validateInstagram 
} from "@/lib/validation";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
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
    const [saving, setSaving] = useState<{[key: string]: boolean}>({});
    const [savedFields, setSavedFields] = useState<{[key: string]: boolean}>({});
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const router = useRouter();
    const { user, profile, updateProfile: authUpdateProfile, refreshProfile } = useAuth();

    // Fetch profile on mount
    useEffect(() => {
        const initializeSettings = async () => {
            if (!user) {
                router.replace("/login");
                return;
            }
            
            if (profile) {
                // Set skills based on user type
                const skillsValue = profile?.user_type === "job_seeker" 
                    ? profile?.skills_expertise || ""
                    : profile?.required_skills || "";
                setSkillsInput(skillsValue);
                setContactForm({
                    phone: profile?.phone || "",
                    linkedin: profile?.linkedin || "",
                    instagram: profile?.instagram || "",
                    website: profile?.website || "",
                });
                setProfileForm({
                    full_name: profile?.full_name || "",
                    bio: profile?.professional_bio || "",
                });
                setLoading(false);
            }
        };
        initializeSettings();
    }, [user, profile, router]);

    // Helper to update profile with optimistic updates and sidebar refresh
    const updateProfile = useCallback(async (updates: any, fieldKey?: string) => {
        // // console.log('🔄 updateProfile called with:', updates);
        
        if (!user) {
            console.error('❌ updateProfile: No authenticated user found');
            return { error: new Error('No authenticated user found') };
        }

        // // console.log('✅ updateProfile: User authenticated:', user.id);

        // Set saving state for specific field
        if (fieldKey) {
            setSaving(prev => ({ ...prev, [fieldKey]: true }));
        }

        try {
            // // console.log('📡 updateProfile: Making database update...');
            
            // Use the auth context update method which will refresh the sidebar
            const result = await authUpdateProfile(updates);
            
            // // console.log('📊 updateProfile: Database result:', result);

            if (result.error) throw result.error;

            // Show success feedback
            if (fieldKey) {
                setSavedFields(prev => ({ ...prev, [fieldKey]: true }));
                
                // Clear saved indicator after 2 seconds
                setTimeout(() => {
                    setSavedFields(prev => ({ ...prev, [fieldKey]: false }));
                }, 2000);
            }
            
            toast({ 
                title: "✅ Saved successfully", 
                description: "Your changes have been saved.",
                duration: 2000
            });
            
            // // console.log('✅ updateProfile: Success');
            return { error: null };
        } catch (error: any) {
            console.error('❌ updateProfile: Error:', error);
            
            toast({ 
                title: "❌ Save failed", 
                description: error.message || "Failed to save changes. Please try again.",
                variant: "destructive",
                duration: 3000
            });
            
            return { error };
        } finally {
            if (fieldKey) {
                setSaving(prev => ({ ...prev, [fieldKey]: false }));
            }
        }
    }, [user, authUpdateProfile, toast]);

    // Skills logic
    const skillsValue = profile?.user_type === "job_seeker" 
        ? profile?.skills_expertise || ""
        : profile?.required_skills || "";
    const skillsArr = skillsValue.split(",").map((s: string) => s.trim()).filter(Boolean);

    const handleAddSkill = async () => {
        if (skillsArr.length >= 8 || !skillsInput.trim()) return;
        
        // Enforce skill character limit
        let skillValue = skillsInput.trim();
        if (skillValue.length > FIELD_LIMITS.skill) {
            skillValue = skillValue.substring(0, FIELD_LIMITS.skill);
        }
        
        const newSkills = [...skillsArr, skillValue];
        const updateField = profile?.user_type === "job_seeker" ? "skills_expertise" : "required_skills";
        await updateProfile({ [updateField]: newSkills.join(",") }, "skills");
        setSkillsInput("");
        setEditSkills(false);
    };

    const handleRemoveSkill = async (skill: string) => {
        const newSkills = skillsArr.filter((s: string) => s !== skill);
        const updateField = profile?.user_type === "job_seeker" ? "skills_expertise" : "required_skills";
        await updateProfile({ [updateField]: newSkills.join(",") }, "skills");
    };

    // Contact logic
    const handleContactSave = async () => {
        // Validate all contact fields before saving
        const fieldsToValidate = ['phone', 'website', 'linkedin', 'instagram'];
        let hasErrors = false;
        const newErrors: {[key: string]: string} = {};

        for (const field of fieldsToValidate) {
            const value = contactForm[field] || '';
            let validation: { isValid: boolean; error?: string } = { isValid: true };
            
            switch (field) {
                case 'phone':
                    validation = validatePhone(value);
                    break;
                case 'website':
                    validation = validateWebsite(value);
                    break;
                case 'linkedin':
                    validation = validateLinkedIn(value);
                    break;
                case 'instagram':
                    validation = validateInstagram(value);
                    break;
            }

            if (!validation.isValid && validation.error) {
                newErrors[field] = validation.error;
                hasErrors = true;
            }
        }

        setValidationErrors(newErrors);

        if (hasErrors) {
            toast({ 
                title: "❌ Validation Error", 
                description: "Please fix the validation errors before saving.",
                variant: "destructive",
                duration: 3000
            });
            return;
        }

        await updateProfile(contactForm, "contact");
        setEditContact(false);
    };

    // Real-time contact field updates with character limits and validation
    const handleContactFieldChange = async (field: string, value: string) => {
        const limits = {
            phone: FIELD_LIMITS.phone,
            linkedin: FIELD_LIMITS.linkedin,
            instagram: FIELD_LIMITS.instagram,
            website: FIELD_LIMITS.website
        };
        
        const limit = limits[field as keyof typeof limits];
        
        // Enforce character limit
        if (value.length > limit) {
            value = value.substring(0, limit);
        }
        
        // Validate the field
        let validation: { isValid: boolean; error?: string; formattedUrl?: string } = { isValid: true };
        switch (field) {
            case 'phone':
                validation = validatePhone(value);
                break;
            case 'website':
                validation = validateWebsite(value);
                break;
            case 'linkedin':
                validation = validateLinkedIn(value);
                break;
            case 'instagram':
                validation = validateInstagram(value);
                break;
        }

        // Update validation errors
        setValidationErrors(prev => ({
            ...prev,
            [field]: validation.error || ''
        }));
        
        setContactForm((prev: any) => ({ ...prev, [field]: value }));
        
        // Only auto-save if validation passes
        if (validation.isValid) {
            // Auto-save after user stops typing (debounced)
            clearTimeout((window as any)[`contactTimer_${field}`]);
            (window as any)[`contactTimer_${field}`] = setTimeout(async () => {
                // Use formatted URL for website field if available
                const valueToSave = field === 'website' && validation.formattedUrl ? validation.formattedUrl : value;
                await updateProfile({ [field]: valueToSave }, `contact_${field}`);
            }, 1000);
        }
    };

    // Profile logic
    const handleProfileSave = async () => {
        const updates = {
            full_name: profileForm.full_name,
            professional_bio: profileForm.bio
        };
        await updateProfile(updates, "profile");
        setEditProfile(false);
    };

    // Field limits
    const FIELD_LIMITS = {
        full_name: 100,
        bio: 1000,
        phone: 20,
        linkedin: 200,
        instagram: 100,
        website: 300,
        skill: 50
    };

    // Real-time profile field updates with character limits
    const handleProfileFieldChange = async (field: string, value: string) => {
        const limit = field === "bio" ? FIELD_LIMITS.bio : FIELD_LIMITS.full_name;
        
        // Enforce character limit
        if (value.length > limit) {
            value = value.substring(0, limit);
        }
        
        setProfileForm((prev: any) => ({ ...prev, [field]: value }));
        
        // Auto-save after user stops typing (debounced)
        clearTimeout((window as any)[`profileTimer_${field}`]);
        (window as any)[`profileTimer_${field}`] = setTimeout(async () => {
            const updateKey = field === "bio" ? "professional_bio" : field;
            await updateProfile({ [updateKey]: value }, `profile_${field}`);
        }, 1000);
    };

    // Preferences logic with real-time updates
    const handlePreferenceChange = async (field: string, value: string) => {
        await updateProfile({ [field]: value }, field);
    };

    // Security logic with real-time updates
    const handleToggle2FA = async () => {
        if (!profile) return;
        const profileAny = profile as any;
        await updateProfile({ two_factor_enabled: !profileAny.two_factor_enabled }, "two_factor");
    };

    // Notifications logic with real-time updates
    const handleNotificationChange = async (field: string, value: boolean) => {
        await updateProfile({ [field]: value }, field);
    };

    // Profile image upload logic
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({ 
                    title: "File too large", 
                    description: "Please select an image smaller than 5MB",
                    variant: "destructive" 
                });
                return;
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({ 
                    title: "Invalid file type", 
                    description: "Please select an image file (JPG, PNG, or WEBP)",
                    variant: "destructive" 
                });
                return;
            }
            
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            
            // Automatically upload the image
            // // console.log('🖼️ Auto-uploading image after selection...');
            await uploadProfileImageWithFile(file);
        }
    };

    const uploadProfileImageWithFile = async (file: File) => {
        setUploading(true);
        try {
            // // console.log('🖼️ Starting profile image upload...');
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);

            // // console.log('📤 Uploading file to API...');
            // Upload to our API endpoint
            const response = await fetch('/api/upload-profile-image', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            // // console.log('📥 Upload API response:', result);

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            if (result.success) {
                // // console.log('✅ File uploaded successfully, URL:', result.url);
                // // console.log('💾 Updating profile in database...');
                
                const updateResult = await updateProfile({ profile_image: result.url });
                // // console.log('📊 Profile update result:', updateResult);
                
                if (updateResult && updateResult.error) {
                    throw new Error(`Profile update failed: ${updateResult.error.message}`);
                }
                
                // // console.log('✅ Profile image updated successfully!');
                toast({ title: "✅ Profile image updated!" });
                setImageFile(null);
                setImagePreview(null);
            }
        } catch (err: any) {
            console.error('❌ Profile image upload error:', err);
            toast({ 
                title: "Image upload failed", 
                description: err.message, 
                variant: "destructive" 
            });
        }
        setUploading(false);
    };

    const uploadProfileImage = async () => {
        if (!imageFile) return;
        setUploading(true);
        try {
            // // console.log('🖼️ Starting profile image upload...');
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', imageFile);

            // // console.log('📤 Uploading file to API...');
            // Upload to our API endpoint
            const response = await fetch('/api/upload-profile-image', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            // // console.log('📥 Upload API response:', result);

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            if (result.success) {
                // // console.log('✅ File uploaded successfully, URL:', result.url);
                // // console.log('💾 Updating profile in database...');
                
                const updateResult = await updateProfile({ profile_image: result.url });
                // // console.log('📊 Profile update result:', updateResult);
                
                if (updateResult && updateResult.error) {
                    throw new Error(`Profile update failed: ${updateResult.error.message}`);
                }
                
                // // console.log('✅ Profile image updated successfully!');
                toast({ title: "Profile image updated!" });
                setImageFile(null);
                setImagePreview(null);
            }
        } catch (err: any) {
            console.error('❌ Profile image upload error:', err);
            toast({ 
                title: "Image upload failed", 
                description: err.message, 
                variant: "destructive" 
            });
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
                                            <label className={`${styles.cameraButton} ${uploading ? styles.uploading : ''}`}>
                                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera size={16} />}
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageChange}
                                                    disabled={uploading}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <div className={styles.avatarInfo}>
                                        <h3>Profile Picture</h3>
                                        <p>JPG, PNG, or WEBP. Max 5MB.</p>
                                        {uploading && (
                                            <p className="text-sm text-blue-600 mt-2">
                                                <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                                                Uploading image...
                                            </p>
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
                                        <div className="relative">
                                            <Input
                                                value={profileForm.full_name}
                                                onChange={e => {
                                                    setProfileForm({ ...profileForm, full_name: e.target.value });
                                                    handleProfileFieldChange("full_name", e.target.value);
                                                }}
                                                placeholder="Your full name"
                                                maxLength={FIELD_LIMITS.full_name}
                                            />
                                            <div className={styles.characterCount}>
                                                <span className="text-xs text-gray-500">
                                                    {profileForm.full_name?.length || 0}/{FIELD_LIMITS.full_name}
                                                </span>
                                                <div className={styles.fieldFeedback}>
                                                    {saving.profile_full_name && (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    )}
                                                    {savedFields.profile_full_name && (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <h2>{profile.full_name}</h2>
                                    )}
                                </div>
                                <div className={styles.bioSection}>
                                    <h4>Bio</h4>
                                    {editProfile ? (
                                        <div className="relative">
                                            <Textarea
                                                value={profileForm.bio}
                                                onChange={e => {
                                                    setProfileForm({ ...profileForm, bio: e.target.value });
                                                    handleProfileFieldChange("bio", e.target.value);
                                                }}
                                                placeholder="Tell others about yourself"
                                                maxLength={FIELD_LIMITS.bio}
                                                rows={4}
                                            />
                                            <div className={styles.characterCount}>
                                                <span className={`text-xs ${(profileForm.bio?.length || 0) > FIELD_LIMITS.bio * 0.9 ? 'text-orange-500' : 'text-gray-500'}`}>
                                                    {profileForm.bio?.length || 0}/{FIELD_LIMITS.bio}
                                                </span>
                                                <div className={styles.fieldFeedback}>
                                                    {saving.profile_bio && (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    )}
                                                    {savedFields.profile_bio && (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className={styles.bio}>{profile.professional_bio}</p>
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
                                                disabled={saving.skills}
                                            >
                                                {saving.skills ? <Loader2 className="h-3 w-3 animate-spin" /> : "×"}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {editSkills && skillsArr.length < 8 && (
                                    <div className={styles.addSkillCard}>
                                        <div className="flex-1">
                                            <Input
                                                value={skillsInput}
                                                onChange={e => {
                                                    const value = e.target.value;
                                                    if (value.length <= FIELD_LIMITS.skill) {
                                                        setSkillsInput(value);
                                                    }
                                                }}
                                                placeholder="Add skill"
                                                maxLength={FIELD_LIMITS.skill}
                                                disabled={saving.skills}
                                            />
                                            <span className={`text-xs mt-1 block ${skillsInput.length > FIELD_LIMITS.skill * 0.8 ? 'text-orange-500' : 'text-gray-500'}`}>
                                                {skillsInput.length}/{FIELD_LIMITS.skill}
                                            </span>
                                        </div>
                                        <Button 
                                            onClick={handleAddSkill}
                                            disabled={saving.skills || !skillsInput.trim()}
                                        >
                                            {saving.skills ? <Loader2 className="h-4 w-4 animate-spin" /> : "+ Add"}
                                        </Button>
                                    </div>
                                )}
                                {savedFields.skills && (
                                    <div className="flex items-center text-green-500 text-sm">
                                        <Check className="h-4 w-4 mr-1" />
                                        Skills updated
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
                                    <p>Your matches will see these contact details. All fields are optional.</p>
                                </div>
                                <button className={styles.editButton} onClick={() => {
                                    if (editContact) {
                                        // Clear validation errors when canceling
                                        setValidationErrors({});
                                    }
                                    setEditContact(!editContact);
                                }}>
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
                                                <div className="relative">
                                                    <Input
                                                        value={contactForm[key]}
                                                        onChange={e => {
                                                            setContactForm({ ...contactForm, [key]: e.target.value });
                                                            handleContactFieldChange(key, e.target.value);
                                                        }}
                                                        placeholder={
                                                            key === 'phone' ? 'e.g., +1 (555) 123-4567' :
                                                            key === 'linkedin' ? 'e.g., linkedin.com/in/yourname or yourname' :
                                                            key === 'instagram' ? 'e.g., instagram.com/yourname or @yourname' :
                                                            key === 'website' ? 'e.g., www.yourwebsite.com' :
                                                            `Your ${label}`
                                                        }
                                                        maxLength={key === 'phone' ? FIELD_LIMITS.phone : 
                                                                  key === 'linkedin' ? FIELD_LIMITS.linkedin :
                                                                  key === 'instagram' ? FIELD_LIMITS.instagram :
                                                                  FIELD_LIMITS.website}
                                                        className={validationErrors[key] ? styles.inputError : ''}
                                                    />
                                                    {validationErrors[key] && (
                                                        <div className={styles.validationError}>
                                                            <AlertCircle className="h-3 w-3" />
                                                            {validationErrors[key]}
                                                        </div>
                                                    )}
                                                    {!validationErrors[key] && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {key === 'phone' && 'Format: +1 (555) 123-4567 or 555-123-4567'}
                                                            {key === 'linkedin' && 'Format: linkedin.com/in/username or just username'}
                                                            {key === 'instagram' && 'Format: instagram.com/username or @username'}
                                                            {key === 'website' && 'Format: www.example.com or https://example.com'}
                                                        </div>
                                                    )}
                                                    <div className={styles.characterCount}>
                                                        <span className="text-xs text-gray-500">
                                                            {contactForm[key]?.length || 0}/{
                                                                key === 'phone' ? FIELD_LIMITS.phone : 
                                                                key === 'linkedin' ? FIELD_LIMITS.linkedin :
                                                                key === 'instagram' ? FIELD_LIMITS.instagram :
                                                                FIELD_LIMITS.website
                                                            }
                                                        </span>
                                                        <div className={styles.fieldFeedback}>
                                                            {saving[`contact_${key}`] && (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            )}
                                                            {savedFields[`contact_${key}`] && !validationErrors[key] && (
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            )}
                                                            {validationErrors[key] && (
                                                                <X className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p>{(profile as any)[key]}</p>
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
                                        value={(profile as any)?.theme || "system"}
                                        onChange={e => handlePreferenceChange("theme", e.target.value)}
                                        disabled={saving.theme}
                                    >
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                        <option value="system">System</option>
                                    </select>
                                    {saving.theme && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                    {savedFields.theme && <Check className="ml-2 h-4 w-4 text-green-500" />}
                                </div>
                                <div className={styles.preferenceItem}>
                                    <div>
                                        <h4>Language</h4>
                                        <p>Select your preferred language</p>
                                    </div>
                                    <select
                                        className={styles.select}
                                        value={(profile as any)?.language || "English"}
                                        onChange={e => handlePreferenceChange("language", e.target.value)}
                                        disabled={saving.language}
                                    >
                                        <option value="English">English</option>
                                        <option value="Arabic">Arabic</option>
                                        <option value="French">French</option>
                                    </select>
                                    {saving.language && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                    {savedFields.language && <Check className="ml-2 h-4 w-4 text-green-500" />}
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
                                    <button 
                                        className={styles.toggleButton} 
                                        onClick={handleToggle2FA}
                                        disabled={saving.two_factor}
                                    >
                                        {saving.two_factor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {(profile as any)?.two_factor_enabled ? "Disable" : "Enable"}
                                    </button>
                                    {savedFields.two_factor && <Check className="ml-2 h-4 w-4 text-green-500" />}
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
                                    <div className="flex items-center">
                                        <Switch
                                            checked={!!(profile as any)?.email_notifications}
                                            onCheckedChange={checked =>
                                                handleNotificationChange("email_notifications", checked)
                                            }
                                            disabled={saving.email_notifications}
                                        />
                                        {saving.email_notifications && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                        {savedFields.email_notifications && <Check className="ml-2 h-4 w-4 text-green-500" />}
                                    </div>
                                </div>
                                <div className={styles.notificationItem}>
                                    <div>
                                        <h4>Match Alerts</h4>
                                        <p>Get notified when you have new matches</p>
                                    </div>
                                    <div className="flex items-center">
                                        <Switch
                                            checked={!!(profile as any)?.match_alerts}
                                            onCheckedChange={checked =>
                                                handleNotificationChange("match_alerts", checked)
                                            }
                                            disabled={saving.match_alerts}
                                        />
                                        {saving.match_alerts && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                        {savedFields.match_alerts && <Check className="ml-2 h-4 w-4 text-green-500" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}