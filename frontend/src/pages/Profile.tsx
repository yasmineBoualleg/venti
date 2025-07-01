import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import Navigation from '../components/Navigation';
import Spinner from '../components/Spinner';
import { MdEdit } from 'react-icons/md';
import './ProfileGlass.css';

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
    xpToNext: 'XP to next level'
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
    xpToNext: 'XP pour le niveau suivant'
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
    xpToNext: 'XP للمستوى التالي'
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
    xpToNext: 'XP للمستوى الجاي'
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
    xpToNext: 'XP iɣerfad i d-itteddun'
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
  const navigate = useNavigate();
  const currentTranslation = translations[currentLang as keyof typeof translations];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('users/profiles/me/');
        setProfile(res.data);
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

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      setEditLoading(true);
      const res = await api.patch(`/users/profiles/${profile?.id}/`, editFormData);
      setProfile(res.data);
      setShowEditModal(false);
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

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-blue-glass-bg overflow-hidden">
      {/* Blue glassmorphism background with abstract lines */}
      <div className="absolute inset-0 z-0 bg-blue-glass-bg pointer-events-none" />
      {/* Main Content Card */}
      <div className="relative z-10 max-w-xl w-full mx-auto px-2 sm:px-4 flex flex-col items-center justify-center min-h-[600px]">
        <div className="profile-glass-card rounded-3xl shadow-2xl p-10 sm:p-12 flex flex-col items-center w-full">
          {/* Floating Edit Button */}
          <button
            onClick={handleEditProfile}
            className="absolute -top-6 -left-6 z-10 bg-white/40 backdrop-blur-xl border border-white/40 shadow-lg rounded-full p-3 hover:bg-white/70 transition-all flex items-center justify-center"
            style={{ boxShadow: '0 4px 24px 0 rgba(80,80,180,0.10)' }}
            aria-label="Edit Profile"
          >
            <MdEdit size={22} color="#2563eb" />
          </button>

          {/* Language Bar - Centered */}
          <div className="mt-8 sm:mt-12 flex justify-center px-2">
            <div className="flex items-center glass-effect rounded-full shadow-lg px-1 sm:px-2 py-1 max-w-full overflow-x-auto">
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
          </div>

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
                {/* Avatar */}
                <div className="relative inline-block mb-6">
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

                {/* XP and Level System */}
                <div className="mb-6 max-w-md mx-auto">
                  <div className="glass-effect rounded-2xl p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-gray-900">{currentTranslation.level} {level}</span>
                      <span className="text-sm text-gray-600">{profile.xp} XP</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          className="bg-gradient-to-r from-primary/80 to-blue-600 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{xpInCurrentLevel}/100</span>
                        <span>{currentTranslation.xpToNext}: {xpToNextLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {profile.user.first_name} {profile.user.last_name}
                </h1>
                <p className="text-primary text-lg mb-1">{profile.user.email}</p>
                {profile.user.place && (
                  <p className="text-gray-600 text-sm">{profile.user.place}</p>
                )}
              </div>

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
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/30 shadow-2xl p-8 bg-white/30 backdrop-blur-2xl"
              style={{ boxShadow: '0 8px 40px 0 rgba(80,80,180,0.13)', background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.25)' }}
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
    </div>
  );
};

export default ProfilePage; 