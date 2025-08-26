"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    Heart,
    Flag,
    User,
    Mail,
    MapPin,
    Clock,
    MessageCircle,
    Settings,
    Monitor,
    MoreVertical,
    Award,
    Briefcase,
    Calendar,
    Phone,
} from "lucide-react";
import styles from "./[id]/page.module.css";

type CallStatus = "active" | "ended";

interface Contact {
    name: string;
    email: string;
    phone: string;
    location: string;
    company: string;
    position: string;
    experience: string;
    skills: string[];
    bio: string;
    joinedDate: string;
}

export default function MeetingPage() {
    const params = useParams();
    const router = useRouter();
    const meetingId = params.id as string;

    // Call states
    const [callStatus, setCallStatus] = useState<CallStatus>("active");
    const [callDuration, setCallDuration] = useState(0);

    // Media states
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Modal states
    const [showEndCallModal, setShowEndCallModal] = useState(false);
    const [showSaveContactModal, setShowSaveContactModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");

    // Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Mock contact data
    const matchedContact: Contact = {
        name: "Sarah Johnson",
        email: "sarah.johnson@techcorp.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        company: "TechCorp Solutions",
        position: "Senior Full Stack Developer",
        experience: "5+ years",
        skills: [
            "React",
            "Node.js",
            "TypeScript",
            "UI/UX Design",
            "Python",
            "AWS",
            "GraphQL",
        ],
        bio: "Passionate full-stack developer with expertise in modern web technologies. I love building scalable applications and mentoring junior developers. Always excited to work on innovative projects that make a real impact.",
        joinedDate: "March 2023",
    };

    // Initialize camera and microphone
    useEffect(() => {
        const initializeMedia = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                setStream(mediaStream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = mediaStream;
                }
            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        };

        initializeMedia();

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Call duration timer
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (callStatus === "active") {
            interval = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [callStatus]);

    // Media control functions
    const toggleMute = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
            }
        }
    };

    const handleEndCall = () => {
        setShowEndCallModal(true);
    };

    const confirmEndCall = () => {
        setCallStatus("ended");
        setShowEndCallModal(false);
        router.push("/dashboard");
    };

    const handleSaveContact = () => {
        setShowSaveContactModal(true);
    };

    const confirmSaveContact = () => {
        setShowSaveContactModal(false);
    };

    const handleReport = () => {
        setShowReportModal(true);
    };

    const submitReport = () => {
        if (reportReason.trim()) {
            setShowReportModal(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <div className={styles.meetingContainer}>
            {/* Top Header */}
            <div className={styles.topHeader}>
                <div className={styles.meetingInfo}>
                    <div className={styles.meetingTitle}>
                        <h2>Meeting with {matchedContact.name}</h2>
                        <div className={styles.meetingMeta}>
                            <div className={styles.callDuration}>
                                <Clock size={16} />
                                <span>{formatTime(callDuration)}</span>
                            </div>
                            <div className={styles.meetingId}>
                                ID: {meetingId}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.actionBtn}
                        onClick={handleSaveContact}
                    >
                        <Heart size={18} />
                    </button>
                    <button className={styles.actionBtn} onClick={handleReport}>
                        <Flag size={18} />
                    </button>
                    <button className={styles.actionBtn}>
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={styles.mainContent}>
                {/* Video Section */}
                <div className={styles.videoSection}>
                    <div className={styles.remoteVideoContainer}>
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className={styles.remoteVideo}
                        />
                        <div className={styles.videoOverlay}>
                            <div className={styles.participantInfo}>
                                <div className={styles.participantAvatar}>
                                    {matchedContact.name.charAt(0)}
                                </div>
                                <div className={styles.participantDetails}>
                                    <h3>{matchedContact.name}</h3>
                                    <p>{matchedContact.position}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.localVideoContainer}>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`${styles.localVideo} ${
                                !isVideoOn ? styles.videoOff : ""
                            }`}
                        />
                        {!isVideoOn && (
                            <div className={styles.videoPlaceholder}>
                                <User size={32} />
                            </div>
                        )}
                        <div className={styles.localVideoLabel}>You</div>
                    </div>
                </div>

                {/* Profile Panel */}
                <div className={styles.profilePanel}>
                    <div className={styles.profileHeader}>
                        <div className={styles.profileAvatar}>
                            {matchedContact.name.charAt(0)}
                        </div>
                        <div className={styles.profileBasicInfo}>
                            <h3>{matchedContact.name}</h3>
                            <p className={styles.position}>
                                {matchedContact.position}
                            </p>
                        </div>
                    </div>

                    <div className={styles.profileStats}>
                        <div className={styles.statItem}>
                            <Briefcase size={16} />
                            <div>
                                <span className={styles.statLabel}>
                                    Experience
                                </span>
                                <span className={styles.statValue}>
                                    {matchedContact.experience}
                                </span>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <Calendar size={16} />
                            <div>
                                <span className={styles.statLabel}>Joined</span>
                                <span className={styles.statValue}>
                                    {matchedContact.joinedDate}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.contactInfo}>
                        <div className={styles.contactItem}>
                            <Mail size={16} />
                            <span>{matchedContact.email}</span>
                        </div>
                        <div className={styles.contactItem}>
                            <Phone size={16} />
                            <span>{matchedContact.phone}</span>
                        </div>
                        <div className={styles.contactItem}>
                            <MapPin size={16} />
                            <span>{matchedContact.location}</span>
                        </div>
                        <div className={styles.contactItem}>
                            <Award size={16} />
                            <span>{matchedContact.company}</span>
                        </div>
                    </div>

                    <div className={styles.skillsContainer}>
                        <h4>Skills & Expertise</h4>
                        <div className={styles.skillsGrid}>
                            {matchedContact.skills.map((skill, index) => (
                                <span key={index} className={styles.skillChip}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.bioContainer}>
                        <h4>About</h4>
                        <p>{matchedContact.bio}</p>
                    </div>

                    <div className={styles.profileActions}>
                        <button
                            className={styles.primaryAction}
                            onClick={handleSaveContact}
                        >
                            <Heart size={16} />
                            Save Contact
                        </button>
                        <button className={styles.secondaryAction}>
                            <MessageCircle size={16} />
                            Message
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className={styles.controlsBar}>
                <div className={styles.controlsGroup}>
                    <button
                        className={`${styles.controlButton} ${
                            isMuted ? styles.active : ""
                        }`}
                        onClick={toggleMute}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <button
                        className={`${styles.controlButton} ${
                            !isVideoOn ? styles.active : ""
                        }`}
                        onClick={toggleVideo}
                    >
                        {isVideoOn ? (
                            <Video size={20} />
                        ) : (
                            <VideoOff size={20} />
                        )}
                    </button>
                    <button className={styles.controlButton}>
                        <Monitor size={20} />
                    </button>
                    <button className={styles.controlButton}>
                        <MessageCircle size={20} />
                    </button>
                    <button className={styles.controlButton}>
                        <Settings size={20} />
                    </button>
                </div>

                <button
                    className={styles.endCallButton}
                    onClick={handleEndCall}
                >
                    <PhoneOff size={20} />
                    End Call
                </button>
            </div>

            {/* Modals */}
            {showEndCallModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalIcon}>
                            <PhoneOff size={32} />
                        </div>
                        <h3>End Call?</h3>
                        <p>
                            Are you sure you want to end this call with{" "}
                            {matchedContact.name}?
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowEndCallModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={confirmEndCall}
                            >
                                End Call
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSaveContactModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalIcon}>
                            <Heart size={32} />
                        </div>
                        <h3>Save Contact</h3>
                        <div className={styles.contactPreview}>
                            <div className={styles.previewAvatar}>
                                {matchedContact.name.charAt(0)}
                            </div>
                            <div className={styles.previewInfo}>
                                <h4>{matchedContact.name}</h4>
                                <p>{matchedContact.position}</p>
                                <p>{matchedContact.email}</p>
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowSaveContactModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={confirmSaveContact}
                            >
                                Save Contact
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReportModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalIcon}>
                            <Flag size={32} />
                        </div>
                        <h3>Report User</h3>
                        <p>{`Please tell us why you're reporting this user:`}</p>
                        <textarea
                            className={styles.reportTextarea}
                            placeholder="Describe the issue..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            rows={4}
                        />
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowReportModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`${styles.confirmButton} ${
                                    !reportReason.trim() ? styles.disabled : ""
                                }`}
                                onClick={submitReport}
                                disabled={!reportReason.trim()}
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
