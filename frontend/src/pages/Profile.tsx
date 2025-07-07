import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import Navigation from '../components/Navigation';
import Spinner from '../components/Spinner';
import { MdEdit } from 'react-icons/md';
import React from 'react';

interface Profile {
  id: number;
  user: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    place?: string;
  };
    xp: number;
  skills: string[];
  interests: string[];
  hobbies: string[];
  bio: string;
  profile_image: string | null;
  badges: string[];
  created_at: string;
  updated_at: string;
  daily_xp_earned: number;
  last_daily_reset: string;
  level: number;
  show_email: boolean;
}

interface XPLog {
  amount: number;
  reason: string;
  description: string;
  created_at: string;
}

interface ActivityStats {
  daily_xp_earned: number;
  daily_xp_remaining: number;
  today_minutes: number;
  today_sessions: number;
  has_active_session: boolean;
}

interface EditFormData {
  bio: string;
  skills: string[];
  interests: string[];
  hobbies: string[];
  profile_image: string | null;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
  { code: 'dz', name: 'الدارجة' },
  { code: 'qb', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' }
];

const translations = {
  en: {
    profile: 'Profile',
    bio: 'Bio',
    skills: 'Skills',
    interests: 'Interests',
    hobbies: 'Hobbies',
    badges: 'Badges',
    experience: 'Experience',
    none: 'None',
    noBadgesYet: 'No badges yet',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    addSkill: 'Add Skill',
    addInterest: 'Add Interest',
    addHobby: 'Add Hobby',
    tellUsAboutYourself: 'Tell us about yourself...',
    level: 'Level',
    xpToNext: 'XP to next level',
    dailyProgress: 'Daily Progress',
    xpRemaining: 'XP remaining today',
    activityStats: 'Activity Stats',
    todayMinutes: 'Minutes today',
    sessionsToday: 'Sessions today',
    startSession: 'Start Session',
    endSession: 'End Session',
    xpLogs: 'XP History'
  },
  fr: {
    profile: 'Profil',
    bio: 'Biographie',
    skills: 'Compétences',
    interests: 'Intérêts',
    hobbies: 'Loisirs',
    badges: 'Badges',
    experience: 'Expérience',
    none: 'Aucun',
    noBadgesYet: 'Aucun badge encore',
    editProfile: 'Modifier le Profil',
    saveChanges: 'Enregistrer',
    cancel: 'Annuler',
    addSkill: 'Ajouter une compétence',
    addInterest: 'Ajouter un intérêt',
    addHobby: 'Ajouter un loisir',
    tellUsAboutYourself: 'Parlez-nous de vous...',
    level: 'Niveau',
    xpToNext: 'XP pour le niveau suivant',
    dailyProgress: 'Progrès quotidien',
    xpRemaining: 'XP restant aujourd\'hui',
    activityStats: 'Statistiques d\'activité',
    todayMinutes: 'Minutes aujourd\'hui',
    sessionsToday: 'Sessions aujourd\'hui',
    startSession: 'Démarrer Session',
    endSession: 'Terminer Session',
    xpLogs: 'Historique XP'
  },
  ar: {
    profile: 'الملف الشخصي',
    bio: 'السيرة الذاتية',
    skills: 'المهارات',
    interests: 'الاهتمامات',
    hobbies: 'الهوايات',
    badges: 'الشارات',
    experience: 'الخبرة',
    none: 'لا شيء',
    noBadgesYet: 'لا توجد شارات بعد',
    editProfile: 'تعديل الملف الشخصي',
    saveChanges: 'حفظ التغييرات',
    cancel: 'إلغاء',
    addSkill: 'إضافة مهارة',
    addInterest: 'إضافة اهتمام',
    addHobby: 'إضافة هواية',
    tellUsAboutYourself: 'أخبرنا عن نفسك...',
    level: 'المستوى',
    xpToNext: 'XP للمستوى التالي',
    dailyProgress: 'التقدم اليومي',
    xpRemaining: 'XP المتبقي اليوم',
    activityStats: 'إحصائيات النشاط',
    todayMinutes: 'الدقائق اليوم',
    sessionsToday: 'الجلسات اليوم',
    startSession: 'بدء الجلسة',
    endSession: 'إنهاء الجلسة',
    xpLogs: 'سجل XP'
  },
  dz: {
    profile: 'البروفايل',
    bio: 'السيرة',
    skills: 'المهارات',
    interests: 'الاهتمامات',
    hobbies: 'الهوايات',
    badges: 'الشارات',
    experience: 'الخبرة',
    none: 'والو',
    noBadgesYet: 'ما عندكش شارات دابا',
    editProfile: 'عدل البروفايل',
    saveChanges: 'حفظ التغييرات',
    cancel: 'إلغاء',
    addSkill: 'زود مهارة',
    addInterest: 'زود اهتمام',
    addHobby: 'زود هواية',
    tellUsAboutYourself: 'قل لينا على نفسك...',
    level: 'المستوى',
    xpToNext: 'XP للمستوى الجاي',
    dailyProgress: 'التقدم اليومي',
    xpRemaining: 'XP المتبقي اليوم',
    activityStats: 'إحصائيات النشاط',
    todayMinutes: 'الدقائق اليوم',
    sessionsToday: 'الجلسات اليوم',
    startSession: 'بدء الجلسة',
    endSession: 'إنهاء الجلسة',
    xpLogs: 'سجل XP'
  },
  qb: {
    profile: 'Aɣbalu',
    bio: 'Tudert',
    skills: 'Tissin',
    interests: 'Iɣbula',
    hobbies: 'Urar',
    badges: 'Tizemmarin',
    experience: 'Tussna',
    none: 'Ula',
    noBadgesYet: 'Ulac tizemmarin daba',
    editProfile: 'Sefrek Aɣbalu',
    saveChanges: 'Sekles',
    cancel: 'Sefsex',
    addSkill: 'Rnu Tissin',
    addInterest: 'Rnu Iɣbula',
    addHobby: 'Rnu Urar',
    tellUsAboutYourself: 'Ini-aɣ ɣef iman-ik...',
    level: 'Aɣerfad',
    xpToNext: 'XP iɣerfad i d-itteddun',
    dailyProgress: 'Asnerni n wass',
    xpRemaining: 'XP i d-yeqqan ass-a',
    activityStats: 'Istatistik n urmud',
    todayMinutes: 'Ndaqat ass-a',
    sessionsToday: 'Iɣmisen ass-a',
    startSession: 'Bdu Iɣmis',
    endSession: 'Fakk Iɣmis',
    xpLogs: 'Amezruy XP'
  }
};

// Calculate level and XP progress
const calculateLevel = (xp: number) => {
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;
  const xpToNextLevel = 100 - xpInCurrentLevel;
  const progress = (xpInCurrentLevel / 100) * 100;
  return { level, xpInCurrentLevel, xpToNextLevel, progress };
};

// LiquidXPProgress: Circular liquid fill progress indicator
const LiquidXPProgress = ({ percent, size = 160, nextTitle }: { percent: number; size?: number; nextTitle: string }) => {
  // Animate percent from 0 to target
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const animationRef = useRef<number>();
  useEffect(() => {
    let start: number | null = null;
    const duration = 2500; // ms
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setAnimatedPercent(percent * progress);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedPercent(percent);
      }
    };
    setAnimatedPercent(0);
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [percent]);

  // Clamp percent
  const pct = Math.max(0, Math.min(100, animatedPercent));
  // Wave parameters
  const waveAmplitude = size * 0.04;
  const waveLength = size * 0.9;
  const waveCount = 1.5;
  const centerY = size / 2;
  const radius = size / 2 - 2;
  // Calculate wave path
  const waveHeight = size * (1 - pct / 100);
  let wavePath = '';
  for (let x = 0; x <= size; x += 1) {
    const y = waveHeight + waveAmplitude * Math.sin((x / waveLength) * waveCount * 2 * Math.PI);
    wavePath += x === 0 ? `M${x},${y}` : ` L${x},${y}`;
  }
  wavePath += ` L${size},${size} L0,${size} Z`;
  // Determine text color: white if >= 50%, blue otherwise
  const textColor = pct >= 50 ? '#fff' : '#2563eb';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} style={{ display: 'block' }}>
        {/* Outer circle */}
        <circle
          cx={centerY}
          cy={centerY}
          r={radius}
          fill="#f8faff"
          stroke="#e0e7ff"
          strokeWidth={2}
        />
        {/* Liquid wave fill */}
        <clipPath id="liquid-clip">
          <circle cx={centerY} cy={centerY} r={radius} />
        </clipPath>
        <g clipPath="url(#liquid-clip)">
          <path
            d={wavePath}
            fill="url(#liquid-gradient)"
            style={{ opacity: 0.92, transition: 'd 2.5s cubic-bezier(.4,2,.6,1)' }}
          />
        </g>
        {/* Gradient definition */}
        <defs>
          <linearGradient id="liquid-gradient" x1="0" y1="0" x2="0" y2={size} gradientUnits="userSpaceOnUse">
            <stop stopColor="#b7aaff" />
            <stop offset="1" stopColor="#7fd7ff" />
          </linearGradient>
        </defs>
        {/* Next title floating inside the circle, color depends on fill */}
        <text
          x="50%"
          y={size * 0.48}
          textAnchor="middle"
          fontSize={size * 0.18}
          fontWeight={700}
          fill={textColor}
          style={{ textShadow: textColor === '#fff' ? '0 1px 8px #b7aaff88' : '0 1px 8px #fff' }}
        >
          {nextTitle}
        </text>
        {/* Percentage below the title, small */}
        <text
          x="50%"
          y={size * 0.62}
          textAnchor="middle"
          fontSize={size * 0.11}
          fontWeight={500}
          fill={textColor}
          style={{ opacity: 0.85, textShadow: textColor === '#fff' ? '0 1px 8px #b7aaff88' : '0 1px 8px #fff' }}
        >
          {Math.round(pct)}%
        </text>
      </svg>
    </div>
  );
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentLang, setCurrentLang] = useState('en');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    bio: '',
    skills: [],
    interests: [],
    hobbies: [],
    profile_image: null
  });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [showEmail, setShowEmail] = useState(true);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [animatedXP, setAnimatedXP] = useState(0);
  const [xpBarAnimated, setXpBarAnimated] = useState(false);
  const [animatedProfileXP, setAnimatedProfileXP] = useState(0);
  const [xp, setXP] = useState(0);
  const [xpPulse, setXpPulse] = useState(false);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [xpLogs, setXpLogs] = useState<XPLog[]>([]);
  const [showXPLogs, setShowXPLogs] = useState(false);
  const navigate = useNavigate();
  const currentTranslation = translations[currentLang as keyof typeof translations];
  const xpBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('users/profiles/me/');
        setProfile(res.data);
        setShowEmail(res.data.show_email);
        setXP(res.data.xp);
        // Initialize edit form data
        setEditFormData({
          bio: res.data.bio || '',
          skills: res.data.skills || [],
          interests: res.data.interests || [],
          hobbies: res.data.hobbies || [],
          profile_image: res.data.profile_image
        });
      } catch (err: any) {
        setError('Failed to load profile. Please try again.');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchActivityStats = async () => {
      try {
        const res = await api.get('users/profiles/activity_stats/');
        setActivityStats(res.data);
      } catch (err) {
        console.error('Failed to fetch activity stats:', err);
      }
    };
    fetchActivityStats();
  }, []);

  useEffect(() => {
    const fetchXPLogs = async () => {
      try {
        const res = await api.get('users/profiles/xp_logs/');
        setXpLogs(res.data.logs);
      } catch (err) {
        console.error('Failed to fetch XP logs:', err);
      }
    };
    fetchXPLogs();
  }, []);

  useEffect(() => {
    // Show level up modal only once per session
    if (profile && !localStorage.getItem('profileLevelUpShown')) {
      setShowLevelUpModal(true);
      localStorage.setItem('profileLevelUpShown', 'true');
      setAnimatedXP(0);
      setTimeout(() => {
        setAnimatedXP(profile.xp > 500 ? 500 : profile.xp);
      }, 500);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setXP(profile.xp > 100 ? 100 : profile.xp);
      if (!localStorage.getItem('profileXPBarAnimated')) {
        setXpBarAnimated(true);
        setAnimatedProfileXP(0);
        setTimeout(() => {
          let start = 0;
          const end = profile.xp > 100 ? 100 : profile.xp;
          const duration = 1800; // ms
          const startTime = performance.now();
          function animateXPBar(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setAnimatedProfileXP(Math.floor(progress * end));
            if (progress < 1) {
              requestAnimationFrame(animateXPBar);
            } else {
              setAnimatedProfileXP(end);
              localStorage.setItem('profileXPBarAnimated', 'true');
            }
          }
          requestAnimationFrame(animateXPBar);
        }, 400);
      } else {
        setAnimatedProfileXP(profile.xp > 100 ? 100 : profile.xp);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (animatedProfileXP !== xp) {
      setXpPulse(true);
      let start = animatedProfileXP;
      const end = xp;
      const duration = 1200;
      const startTime = performance.now();
      function animateXP(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setAnimatedProfileXP(Math.floor(start + (end - start) * progress));
        if (progress < 1) {
          requestAnimationFrame(animateXP);
        } else {
          setAnimatedProfileXP(end);
          setTimeout(() => setXpPulse(false), 600);
        }
      }
      requestAnimationFrame(animateXP);
    }
  }, [xp]);

  useEffect(() => {
    if (!profile || !xpBarRef.current) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setXpBarAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(xpBarRef.current);
    return () => observer.disconnect();
  }, [profile, xpBarRef]);

  // Fallback: always animate in after profile loads
  useEffect(() => {
    if (profile) {
      setTimeout(() => setXpBarAnimated(true), 300);
    }
  }, [profile]);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      setEditLoading(true);
      const res = await api.patch(`/users/profiles/${profile?.id}/`, editFormData);
      setProfile(res.data);
      setShowEditModal(false);
      
      // Refresh activity stats and XP logs after profile update
      const [statsRes, logsRes] = await Promise.all([
        api.get('users/profiles/activity_stats/'),
        api.get('users/profiles/xp_logs/')
      ]);
      setActivityStats(statsRes.data);
      setXpLogs(logsRes.data.logs);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const addItem = (type: 'skills' | 'interests' | 'hobbies', value: string) => {
    if (value.trim()) {
      setEditFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
      // Clear the input
      if (type === 'skills') setNewSkill('');
      if (type === 'interests') setNewInterest('');
      if (type === 'hobbies') setNewHobby('');
    }
  };

  const removeItem = (type: 'skills' | 'interests' | 'hobbies', index: number) => {
    setEditFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditFormData(prev => ({
          ...prev,
          profile_image: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartActivity = async () => {
    try {
      await api.post('users/profiles/start_activity/');
      // Refresh activity stats
      const res = await api.get('users/profiles/activity_stats/');
      setActivityStats(res.data);
    } catch (err) {
      console.error('Failed to start activity session:', err);
    }
  };

  const handleEndActivity = async () => {
    try {
      const res = await api.post('users/profiles/end_activity/');
      // Refresh activity stats and XP logs
      const [statsRes, logsRes] = await Promise.all([
        api.get('users/profiles/activity_stats/'),
        api.get('users/profiles/xp_logs/')
      ]);
      setActivityStats(statsRes.data);
      setXpLogs(logsRes.data.logs);
      
      // Show XP gained notification if applicable
      if (res.data.xp_earned) {
        setXpPulse(true);
        setTimeout(() => setXpPulse(false), 2000);
      }
    } catch (err) {
      console.error('Failed to end activity session:', err);
    }
  };

  const handleAddXP = () => {
    setXP(prev => Math.min(prev + 10, 100));
  };

  const handleShowEmailToggle = async () => {
    const newValue = !showEmail;
    setShowEmail(newValue);
    try {
      await api.patch('users/profiles/me/', { show_email: newValue });
    } catch (err) {
      // Optionally show error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="glass-effect p-8 rounded-2xl shadow-lg">
          <p className="text-red-600 text-lg font-semibold text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const { level, xpInCurrentLevel, xpToNextLevel, progress } = calculateLevel(profile.xp);
  let xpNeeded = 100;
  let xpInLevel = 0;
  let xpPercent = 0;
  if (profile && typeof profile.xp === 'number') {
    xpNeeded = 100;
    xpInLevel = profile.xp % xpNeeded;
    xpPercent = Math.max(0, Math.min(100, (xpInLevel / xpNeeded) * 100));
  }
  console.log('xpBarAnimated:', xpBarAnimated, 'xpPercent:', xpPercent, 'profile.xp:', profile?.xp);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: '#2563eb' }}>
      <svg className="absolute inset-0 w-full h-full z-0" style={{ pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" fill="none" viewBox="0 0 1440 900">
        <g stroke="white" strokeWidth="1.2" opacity="0.18">
          <path d="M0 100 Q360 200 720 100 T1440 100" />
          <path d="M0 300 Q360 400 720 300 T1440 300" />
          <path d="M0 500 Q360 600 720 500 T1440 500" />
          <path d="M0 700 Q360 800 720 700 T1440 700" />
          <path d="M0 200 Q180 100 360 200 T720 200 T1080 200 T1440 200" />
          <path d="M0 400 Q180 300 360 400 T720 400 T1080 400 T1440 400" />
          <path d="M0 600 Q180 500 360 600 T720 600 T1080 600 T1440 600" />
          <path d="M0 800 Q180 700 360 800 T720 800 T1080 800 T1440 800" />
        </g>
      </svg>
      {/* Main Content Card */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-2 sm:px-8 flex flex-col items-center justify-center min-h-[800px] mt-8 mb-16">
        <div className="bg-white rounded-3xl shadow-2xl p-14 sm:p-20 flex flex-col items-center w-full">
          {/* Language Bar - glassmorphised, at top of card */}
          <div className="flex items-center glass-effect rounded-full shadow-lg px-1 sm:px-2 py-1 max-w-full overflow-x-auto mt-2 mb-8">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full transition-all whitespace-nowrap ${
                    currentLang === lang.code
                      ? 'text-white bg-primary/80 shadow-lg'
                      : 'text-gray-700 hover:text-primary hover:bg-white/30'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          {/* Edit Button - inside card, not cut off */}
          <button
            onClick={handleEditProfile}
            className="absolute top-4 right-4 z-40 bg-white border border-white/40 shadow-lg rounded-full p-4 hover:bg-primary/10 transition-all flex items-center justify-center"
            style={{ boxShadow: '0 4px 24px 0 rgba(80,80,180,0.10)' }}
            aria-label="Edit Profile"
          >
            <MdEdit size={28} color="#2563eb" />
          </button>
                {/* Avatar */}
          <div className="relative inline-block mb-6 mt-6">
                  {profile.profile_image ? (
                    <img
                      src={profile.profile_image}
                      alt="Profile"
                      className="w-24 sm:w-32 h-24 sm:h-32 rounded-full border-4 border-white/50 shadow-2xl object-cover bg-white/40"
                    />
                  ) : (
                    <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-gradient-to-br from-primary/80 to-blue-600 border-4 border-white/50 flex items-center justify-center text-3xl sm:text-4xl text-white font-bold shadow-2xl">
                      {profile.user.first_name?.[0] || profile.user.username?.[0]}
                    </div>
                  )}
                </div>
          {/* User Info - name and email directly under avatar */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {profile.user.first_name} {profile.user.last_name}
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            {showEmail && <p className="text-primary text-lg">{profile.user.email}</p>}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-500">
              <span>Show email</span>
              <span className="relative inline-block w-10 h-6 align-middle select-none">
                <input
                  type="checkbox"
                  checked={showEmail}
                  onChange={handleShowEmailToggle}
                  className="sr-only peer"
                />
                <span className="block w-10 h-6 bg-gray-300 rounded-full transition peer-checked:bg-primary/80"></span>
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4"></span>
              </span>
            </label>
          </div>
          {/* Current title pill under email */}
          <div style={{
            display: 'inline-block',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 999,
            padding: '3px 16px',
            marginBottom: 8,
            textAlign: 'center',
            boxShadow: '0 2px 8px #2563eb22',
          }}>
            {level === 1 ? 'Gnome' : 'Warrior'}
          </div>
          
          {/* Activity Controls */}
          {activityStats && (
            <div className="mb-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setShowXPLogs(!showXPLogs)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
              >
                {currentTranslation.xpLogs}
              </button>
            </div>
          )}

                {/* XP and Level System */}
          <div className="mb-10 w-3/4 mx-auto">
            <div className="rounded-3xl p-8 sm:p-12">
              <div className="flex flex-col items-center mb-4">
                <span className="text-3xl font-extrabold text-primary drop-shadow-lg mb-2 tracking-wide animate-pulse">{profile.xp} XP</span>
                      <span className="text-lg font-bold text-gray-900">{currentTranslation.level} {level}</span>
                    </div>
              {profile && !isNaN(xpPercent) && (
                <div className="w-full flex flex-col items-center" style={{ maxWidth: 400 }}>
                  {/* ... XP bar ... */}
                  <div className="relative w-full flex flex-col items-center mb-6">
                    {/* Flat, minimalist XP Bar */}
                    <div
                      className="relative w-full"
                      style={{
                        background: '#f4f6fa',
                        borderRadius: 8,
                        border: '1.5px solid #2563eb',
                        height: 20,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Progress fill */}
                      <div
                        style={{
                          width: xpBarAnimated ? `${xpPercent}%` : 0,
                          height: '100%',
                          background: 'linear-gradient(90deg, #2563eb 0%, #38a3fd 100%)',
                          borderRadius: 8,
                          transition: 'width 1.2s cubic-bezier(.4,2,.6,1)',
                        }}
                      />
                      {/* Percentage floating center inside the bar, color adapts for contrast */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14,
                          color: xpPercent >= 50 ? '#fff' : '#2563eb',
                          textShadow: xpPercent >= 50 ? '0 1px 8px #2563eb88' : '0 1px 8px #fff',
                          pointerEvents: 'none',
                          zIndex: 3,
                        }}
                      >
                        {Math.round(xpPercent)}%
                      </div>
                      {/* Optional: tick marks */}
                      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
                        {[0, 25, 50, 75, 100].map((tick) => (
                          <div
                            key={tick}
                            style={{
                              position: 'absolute',
                              left: `calc(${tick}% - 1px)`,
                              top: 0,
                              width: 2,
                              height: '100%',
                              background: '#e0e7ef',
                              opacity: tick === 0 || tick === 100 ? 0.7 : 0.4,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Liquid circle with percentage and next title inside */}
                  <div className="mb-4">
                    <LiquidXPProgress percent={xpPercent} size={160} nextTitle={level === 1 ? 'Warrior' : 'Mage'} />
                  </div>
                </div>
              )}
              <div className="flex justify-between text-base text-gray-500 mt-2 font-semibold">
                <span>0</span>
                <span>100</span>
                </div>

              {/* Daily Progress */}
              {activityStats && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{currentTranslation.dailyProgress}</h3>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{currentTranslation.xpRemaining}: {activityStats.daily_xp_remaining}</span>
                    <span>{currentTranslation.todayMinutes}: {activityStats.today_minutes}</span>
                  </div>
                </div>
              )}
            </div>
              </div>

          {/* XP Logs Modal */}
          {showXPLogs && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">{currentTranslation.xpLogs}</h3>
                  <button
                    onClick={() => setShowXPLogs(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-3">
                  {xpLogs.map((log, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-green-600">+{log.amount} XP</div>
                        <div className="text-sm text-gray-600">{log.description}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {xpLogs.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No XP logs yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="px-2 sm:px-4 pt-8 sm:pt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Profile Header */}
              <div className="mb-8 sm:mb-12">
              {/* Bio */}
              {profile.bio && (
                <div className="mb-8 sm:mb-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{currentTranslation.bio}</h2>
                  <div className="glass-effect rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto">
                    <p className="text-gray-700 italic leading-relaxed">{profile.bio}</p>
                  </div>
                </div>
              )}

              {/* Skills, Interests, Hobbies Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div className="glass-effect rounded-2xl p-4 sm:p-6 text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{currentTranslation.skills}</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {profile.skills.length ? profile.skills.map((skill, i) => (
                      <span key={i} className="bg-primary/80 text-white px-3 py-1 rounded-full text-xs sm:text-sm shadow-lg">
                        {skill}
                      </span>
                    )) : <span className="text-gray-400">{currentTranslation.none}</span>}
                  </div>
                </div>

                <div className="glass-effect rounded-2xl p-4 sm:p-6 text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{currentTranslation.interests}</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {profile.interests.length ? profile.interests.map((interest, i) => (
                      <span key={i} className="bg-primary/80 text-white px-3 py-1 rounded-full text-xs sm:text-sm shadow-lg">
                        {interest}
                      </span>
                    )) : <span className="text-gray-400">{currentTranslation.none}</span>}
                  </div>
                </div>

                <div className="glass-effect rounded-2xl p-4 sm:p-6 text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{currentTranslation.hobbies}</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {profile.hobbies.length ? profile.hobbies.map((hobby, i) => (
                      <span key={i} className="bg-primary/80 text-white px-3 py-1 rounded-full text-xs sm:text-sm shadow-lg">
                        {hobby}
                      </span>
                    )) : <span className="text-gray-400">{currentTranslation.none}</span>}
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{currentTranslation.badges}</h2>
                <div className="flex flex-wrap gap-3 justify-center">
                  {profile.badges.length ? profile.badges.map((badge, i) => (
                    <span key={i} className="bg-primary/80 text-white px-4 py-2 rounded-full text-sm shadow-lg font-semibold">
                      🏆 {badge}
                    </span>
                  )) : <span className="text-gray-400">{currentTranslation.noBadgesYet}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/30 shadow-2xl p-8 bg-white/80 glass-effect"
              style={{ boxShadow: '0 8px 40px 0 rgba(80,80,180,0.13)', background: 'rgba(255,255,255,0.92)', border: '1.5px solid rgba(255,255,255,0.25)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{currentTranslation.editProfile}</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/80 to-blue-600 border-2 border-white/50 flex items-center justify-center overflow-hidden">
                      {editFormData.profile_image ? (
                        <img
                          src={editFormData.profile_image}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {profile.user.first_name?.[0] || profile.user.username?.[0]}
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{currentTranslation.bio}</label>
                  <textarea
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary profile-edit-input"
                    placeholder={currentTranslation.tellUsAboutYourself}
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{currentTranslation.skills}</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skills', newSkill))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary profile-edit-input"
                      placeholder={currentTranslation.addSkill}
                    />
                    <button
                      onClick={() => addItem('skills', newSkill)}
                      className="px-4 py-2 bg-primary/80 text-white rounded-lg hover:bg-primary transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editFormData.skills.map((skill, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => removeItem('skills', index)}
                          className="text-primary hover:text-primary/70 transition-colors"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{currentTranslation.interests}</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('interests', newInterest))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary profile-edit-input"
                      placeholder={currentTranslation.addInterest}
                    />
                    <button
                      onClick={() => addItem('interests', newInterest)}
                      className="px-4 py-2 bg-primary/80 text-white rounded-lg hover:bg-primary transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editFormData.interests.map((interest, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {interest}
                        <button
                          onClick={() => removeItem('interests', index)}
                          className="text-primary hover:text-primary/70 transition-colors"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Hobbies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{currentTranslation.hobbies}</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newHobby}
                      onChange={(e) => setNewHobby(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('hobbies', newHobby))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary profile-edit-input"
                      placeholder={currentTranslation.addHobby}
                    />
                    <button
                      onClick={() => addItem('hobbies', newHobby)}
                      className="px-4 py-2 bg-primary/80 text-white rounded-lg hover:bg-primary transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editFormData.hobbies.map((hobby, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {hobby}
                        <button
                          onClick={() => removeItem('hobbies', index)}
                          className="text-primary hover:text-primary/70 transition-colors"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {currentTranslation.cancel}
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={editLoading}
                  className="px-6 py-2 bg-primary/80 text-white rounded-lg hover:bg-primary transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {editLoading && <div className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  {editLoading ? 'Saving...' : currentTranslation.saveChanges}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center relative"
            >
              {/* Confetti or Sparkle effect (simple SVG or emoji for now) */}
              <div className="absolute top-0 left-0 w-full flex justify-center mt-[-2.5rem]">
                <span className="text-5xl animate-bounce">🎉✨</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 mt-2">Welcome! Level 1 Unlocked</h2>
              <p className="text-lg text-gray-700 mb-8">You've started your journey. Here's your XP progress:</p>
              {/* Animated XP Bar */}
              <div className="w-full max-w-md mx-auto mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-lg font-bold text-gray-900">Level 1</span>
                  <span className="text-sm text-gray-600">{animatedXP} / 500 XP</span>
                </div>
                <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-6 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(animatedXP / 500) * 100}%` }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                    style={{
                      background: 'linear-gradient(90deg, #ffe259 0%, #bc6ff1 50%, #2563eb 100%)',
                      boxShadow: '0 2px 12px 0 #ffe25955',
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>500</span>
                </div>
              </div>
              <button
                onClick={() => setShowLevelUpModal(false)}
                className="mt-4 px-6 py-2 bg-primary/80 text-white rounded-xl font-semibold shadow hover:bg-primary transition-all"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage; 