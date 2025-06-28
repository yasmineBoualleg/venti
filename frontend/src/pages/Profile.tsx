import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { userAPI } from '../api/api';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [language, setLanguage] = useState<'en' | 'fr' | 'ar'>('en');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [accentColor, setAccentColor] = useState<string>('#2563eb');
  const [fieldErrors, setFieldErrors] = useState<any>({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      userAPI.getProfile()
        .then(res => {
          setProfileData(res.data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [user]);

  // Comment: Poll for profile updates every 10 seconds for real-time updates
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getProfile();
        setProfileData(res.data);
      } catch (err) {
        // Optionally handle error
      }
    };
    const interval = setInterval(fetchProfile, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (profileData) {
      setEditForm({
        avatar: profileData.profile?.avatar || '',
        first_name: profileData.first_name || '',
        bio: profileData.profile?.bio || '',
        university: profileData.profile?.university || '',
        major: profileData.profile?.major || '',
        graduation_year: profileData.profile?.graduation_year || '',
        location: profileData.profile?.location || '',
        github_url: profileData.profile?.github_url || '',
        linkedin_url: profileData.profile?.linkedin_url || '',
        website: profileData.profile?.website || '',
        accent: profileData.profile?.accent || '#2563eb',
      });
      setAccentColor(profileData.profile?.accent || '#2563eb');
      setAvatarPreview(null);
    }
  }, [profileData]);

  useEffect(() => {
    if (!showEditModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowEditModal(false);
      if (e.key === 'Enter' && !saving) {
        const form = document.getElementById('edit-profile-form');
        if (form) (form as HTMLFormElement).requestSubmit();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showEditModal, saving]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!user || !profileData) return null;

  const profile = profileData.profile;
  const userInfo = profileData;

  const SocialInput = ({ icon, ...props }: any) => (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <input {...props} className="pl-10 px-4 py-2 rounded-xl border border-gray-200 w-full" />
    </div>
  );

  const accentColors = ['#2563eb', '#f59e42', '#10b981', '#f43f5e', '#a21caf', '#fbbf24'];

    return (
    <div className={`min-h-screen p-4 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} ${fontSize === 'large' ? 'text-lg' : 'text-base'}`}
      style={{ '--profile-accent': accentColor } as React.CSSProperties}
    >
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
      <section className="bg-white/80 rounded-2xl shadow-lg p-8 max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 mb-8 relative">
        <button
          className="absolute top-4 right-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors z-10"
          onClick={() => setShowEditModal(true)}
        >
          Edit Profile
        </button>
        <img
          src={profile?.avatar || '/default-avatar.png'}
          alt={userInfo.displayName || userInfo.username || 'User'}
          className="w-32 h-32 rounded-full border-4 border-primary/30 shadow mb-4 md:mb-0"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-poppins mb-1">{userInfo.first_name || userInfo.username || 'No Name'}</h1>
          <p className="text-gray-600 mb-2">{profile?.bio || ''}</p>
          <p className="text-xs text-gray-500 mb-2">Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : 'N/A'}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">{profile?.university || 'No University'}</span>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{profile?.major || 'No Major'}</span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">{profile?.graduation_year || 'No Year'}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-map-marker-alt text-primary"></i>
            <span>{profile?.location || 'No Location'}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">Student</span>
            </div>
          <div className="flex gap-4 mt-2">
            <a href={`mailto:${userInfo.email}`} className="text-gray-500 hover:text-primary" title="Email"><i className="fas fa-envelope"></i></a>
            {profile?.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary" title="GitHub"><i className="fab fa-github"></i></a>}
            {profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary" title="LinkedIn"><i className="fab fa-linkedin"></i></a>}
            {profile?.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary" title="Portfolio"><i className="fas fa-globe"></i></a>}
          </div>
        </div>
      </section>

      <section className="bg-white/80 rounded-2xl shadow-lg p-6 max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xl font-bold">XP:</span>
          <span className="text-xl">{profile?.xp || 0}</span>
          <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden mx-4">
            <div
              className="h-4 bg-primary transition-all"
              style={{ width: `${(profile?.xp % 500) / 5}%` }}
            ></div>
          </div>
          <span className="font-semibold">Level {profile?.level || 0}</span>
        </div>
        <div className="flex flex-wrap gap-4 mb-2">
          {profile?.xpBreakdown?.map((xp: any) => (
            <span key={xp.label} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">+{xp.value} {xp.label}</span>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          {profile?.levelBadges?.map((badge: any) => (
            <span key={badge.name} className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
              <span>{badge.icon}</span> {badge.name}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-white/80 rounded-2xl shadow-lg p-6 max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">Badges</h2>
        <div className="flex flex-wrap gap-3">
          {profile?.badges?.map((badge: any) => (
            <div
              key={badge.name}
              className="relative group bg-gray-100 rounded-xl px-4 py-2 flex flex-col items-center shadow hover:shadow-md cursor-pointer"
            >
              <span className="text-2xl mb-1">🏅</span>
              <span className="font-medium">{badge.name}</span>
              <span className="text-xs text-gray-500">{badge.category}</span>
              {badge.verified && (
                <span className="absolute top-1 right-1 bg-green-400 text-white rounded-full px-2 text-xs">✔</span>
              )}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {badge.proof}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/80 rounded-2xl shadow-lg p-6 max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">Social</h2>
        <div className="flex gap-8 mb-4">
          <div><span className="font-bold">{profile?.followers || 0}</span> Followers</div>
          <div><span className="font-bold">{profile?.following || 0}</span> Following</div>
          <div><span className="font-bold">{profile?.mutuals || 0}</span> Mutuals</div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {profile?.recentPosts?.map((post: any) => (
              <li key={post.title}>{post.title} <span className="text-xs text-gray-400">({post.date})</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white/80 rounded-2xl shadow-lg p-6 max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">Clubs & Events</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          {profile?.clubs?.map((club: any) => (
            <div key={club.name} className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <img src={club.logo} alt={club.name} className="w-6 h-6 rounded-full" />
              <span>{club.name}</span>
            </div>
          ))}
        </div>
        <div className="mb-2">
          <h3 className="font-semibold">Past Events</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {profile?.events?.map((event: any) => (
              <li key={event.title}>{event.title} <span className="text-xs text-gray-400">({event.date})</span></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Upcoming Events</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {profile?.upcomingEvents?.map((event: any) => (
              <li key={event.title}>{event.title} <span className="text-xs text-gray-400">({event.date})</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white/80 rounded-2xl shadow-lg p-6 max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">Internships & Projects</h2>
        <div className="mb-2">
          <h3 className="font-semibold">Internships</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {profile?.internships?.map((intern: any) => (
              <li key={intern.company}>{intern.role} at {intern.company} <span className="text-xs text-gray-400">({intern.year})</span></li>
            ))}
          </ul>
        </div>
        <div className="mb-2">
          <h3 className="font-semibold">Projects</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {profile?.projects?.map((project: any) => (
              <li key={project.name}>{project.name} <span className="text-xs text-gray-400">[{project.tags.join(', ')}]</span></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Recommendations</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {profile?.recommendations?.map((rec: any) => (
              <li key={rec.from}><span className="font-bold">{rec.from}:</span> {rec.text}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white/80 rounded-2xl shadow-lg p-6 max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">Interests & Goals</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {profile?.interests?.map((interest: any) => (
            <span key={interest} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">{interest}</span>
          ))}
        </div>
        <div>
          <h3 className="font-semibold">Goals</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {profile?.goals?.map((goal: any) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white/80 rounded-2xl shadow-lg p-6 max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">Testimonials</h2>
        <div className="flex flex-col gap-2">
          {profile?.testimonials?.map((testimonial: any) => (
            <div key={testimonial.from} className="bg-gray-50 rounded-xl px-4 py-2 shadow">
              <span className="font-bold">{testimonial.from}:</span> {testimonial.text}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/80 rounded-2xl shadow-lg p-6 max-w-3xl mx-auto mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2 items-center">
          <span className="font-semibold">Languages:</span>
          <button onClick={() => setLanguage('fr')} className={language === 'fr' ? 'ring-2 ring-primary rounded' : ''}>🇫🇷</button>
          <button onClick={() => setLanguage('en')} className={language === 'en' ? 'ring-2 ring-primary rounded' : ''}>🇬🇧</button>
          <button onClick={() => setLanguage('ar')} className={language === 'ar' ? 'ring-2 ring-primary rounded' : ''}>🇩🇿</button>
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-semibold">Theme:</span>
          <button onClick={() => setTheme('light')} className={theme === 'light' ? 'ring-2 ring-primary rounded' : ''}><i className="fas fa-sun"></i></button>
          <button onClick={() => setTheme('dark')} className={theme === 'dark' ? 'ring-2 ring-primary rounded' : ''}><i className="fas fa-moon"></i></button>
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-semibold">Font Size:</span>
          <button onClick={() => setFontSize('normal')} className={fontSize === 'normal' ? 'ring-2 ring-primary rounded' : ''}>A</button>
          <button onClick={() => setFontSize('large')} className={fontSize === 'large' ? 'ring-2 ring-primary rounded' : ''}>A+</button>
        </div>
        <button className="ml-auto px-3 py-1 bg-primary text-white rounded-lg"><i className="fas fa-volume-up"></i> Read</button>
      </section>

      <section className="bg-white/80 rounded-2xl shadow-lg p-6 max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">Creative Extras</h2>
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">🔥 {profile?.streak || 0} days active this week!</span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Quiz Score: {profile?.quizScore || 0}%</span>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">Mentor: {profile?.mentorship?.mentor || 'No Mentor'} | Mentees: {profile?.mentorship?.mentees || 0}</span>
        </div>
        <div className="flex gap-1 mb-2">
          {profile?.heatmap?.map((val: any, idx: any) => (
            <div key={idx} className={`w-6 h-6 rounded ${val === 0 ? 'bg-gray-200' : val === 1 ? 'bg-green-200' : 'bg-green-500'}`}></div>
          ))}
        </div>
        <div className="italic text-gray-500 mt-2">"{profile?.quote || 'No quote available'}"</div>
      </section>

      <section className="bg-white/80 rounded-2xl shadow-lg p-6 max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">Customization</h2>
        <div className="flex gap-4 items-center mb-2">
          <span className="font-semibold">Theme:</span>
          <select value={profile?.theme || 'Minimal'} className="px-3 py-1 rounded-lg border border-gray-200">
            <option>Minimal</option>
            <option>Gamer</option>
            <option>Student Pro</option>
            <option>Developer</option>
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-semibold">Reorder blocks (coming soon!)</span>
      </div>
      </section>

      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-lg relative animate-scale-in max-h-[90vh] flex flex-col"
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:bg-gray-100 rounded-full p-2 z-10"
              onClick={() => setShowEditModal(false)}
              aria-label="Close edit profile modal"
            >
              <i className="fas fa-times"></i>
            </button>
            <div
              className="overflow-y-auto flex-1 pr-2"
              style={{ maxHeight: '70vh' }}
            >
              <form
                id="edit-profile-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const errors: any = {};
                  if (!editForm.first_name.trim()) errors.first_name = 'Name is required.';
                  if (editForm.linkedin_url && !/^https?:\/\/(www\.)?linkedin\.com\//.test(editForm.linkedin_url)) errors.linkedin_url = 'Enter a valid LinkedIn URL.';
                  if (editForm.github_url && !/^https?:\/\/(www\.)?github\.com\//.test(editForm.github_url)) errors.github_url = 'Enter a valid GitHub URL.';
                  if (editForm.website && !/^https?:\/\//.test(editForm.website)) errors.website = 'Enter a valid website URL.';
                  if (editForm.bio.length > 500) errors.bio = 'Bio must be 500 characters or less.';
                  setFieldErrors(errors);
                  if (Object.keys(errors).length > 0) return;
                  setSaving(true);
                  const formData = new FormData();
                  if (editForm.avatar && typeof editForm.avatar !== 'string') {
                    formData.append('profile.avatar', editForm.avatar);
                  }
                  formData.append('first_name', editForm.first_name);
                  formData.append('profile.bio', editForm.bio);
                  formData.append('profile.university', editForm.university);
                  formData.append('profile.major', editForm.major);
                  formData.append('profile.graduation_year', editForm.graduation_year);
                  formData.append('profile.location', editForm.location);
                  formData.append('profile.github_url', editForm.github_url);
                  formData.append('profile.linkedin_url', editForm.linkedin_url);
                  formData.append('profile.website', editForm.website);
                  formData.append('profile.accent', accentColor);
                  try {
                    const res = await userAPI.updateProfile(formData);
                    setProfileData(res.data);
                    setShowEditModal(false);
                    setToast('Profile updated successfully!');
                  } catch (err: any) {
                    setToast('Failed to update profile');
                  }
                  setSaving(false);
                }}
                className="flex flex-col gap-4"
                aria-label="Edit profile form"
              >
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={
                      avatarPreview ||
                      (editForm.avatar && typeof editForm.avatar === 'string'
                        ? editForm.avatar
                        : profile?.avatar || '/default-avatar.png')
                    }
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border-2 border-primary/30 object-cover"
                    onClick={() => avatarInputRef.current?.click()}
                    style={{ cursor: 'pointer' }}
                    aria-label="Change avatar"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={avatarInputRef}
                    className="hidden"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target?.files?.[0];
                      if (file) {
                        setEditForm((prev: any) => ({ ...prev, avatar: file }));
                        const reader = new FileReader();
                        reader.onload = ev => setAvatarPreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    aria-label="Upload avatar"
                  />
                  <span className="text-xs text-gray-500">Tap to change photo</span>
                </div>
                <input
                  type="text"
                  className={`px-4 py-2 rounded-xl border ${fieldErrors.first_name ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="Name"
                  value={editForm.first_name}
                  onChange={e => setEditForm((prev: any) => ({ ...prev, first_name: e.target.value }))}
                  aria-label="Name"
                />
                {fieldErrors.first_name && <span className="text-xs text-red-500">{fieldErrors.first_name}</span>}
                <div className="relative">
                  <textarea
                    className={`px-4 py-2 rounded-xl border w-full ${fieldErrors.bio ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="Bio (max 500 chars)"
                    value={editForm.bio}
                    onChange={e => setEditForm((prev: any) => ({ ...prev, bio: e.target.value }))}
                    maxLength={500}
                    aria-label="Bio"
                  />
                  <span className="absolute bottom-2 right-4 text-xs text-gray-400">{editForm.bio.length}/500</span>
                </div>
                {fieldErrors.bio && <span className="text-xs text-red-500">{fieldErrors.bio}</span>}
                <input
                  type="text"
                  className="px-4 py-2 rounded-xl border border-gray-200"
                  placeholder="University"
                  value={editForm.university}
                  onChange={e => setEditForm((prev: any) => ({ ...prev, university: e.target.value }))}
                  aria-label="University"
                />
                <input
                  type="text"
                  className="px-4 py-2 rounded-xl border border-gray-200"
                  placeholder="Major"
                  value={editForm.major}
                  onChange={e => setEditForm((prev: any) => ({ ...prev, major: e.target.value }))}
                  aria-label="Major"
                />
                <input
                  type="number"
                  className="px-4 py-2 rounded-xl border border-gray-200"
                  placeholder="Graduation Year"
                  value={editForm.graduation_year}
                  onChange={e => setEditForm((prev: any) => ({ ...prev, graduation_year: e.target.value }))}
                  aria-label="Graduation Year"
                />
                <input
                  type="text"
                  className="px-4 py-2 rounded-xl border border-gray-200"
                  placeholder="Location"
                  value={editForm.location}
                  onChange={e => setEditForm((prev: any) => ({ ...prev, location: e.target.value }))}
                  aria-label="Location"
                />
                <SocialInput
                  icon={<i className="fab fa-github"></i>}
                  type="url"
                  placeholder="GitHub URL"
                  value={editForm.github_url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((prev: any) => ({ ...prev, github_url: e.target.value }))}
                  aria-label="GitHub URL"
                />
                {fieldErrors.github_url && <span className="text-xs text-red-500">{fieldErrors.github_url}</span>}
                <SocialInput
                  icon={<i className="fab fa-linkedin"></i>}
                  type="url"
                  placeholder="LinkedIn URL"
                  value={editForm.linkedin_url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((prev: any) => ({ ...prev, linkedin_url: e.target.value }))}
                  aria-label="LinkedIn URL"
                />
                {fieldErrors.linkedin_url && <span className="text-xs text-red-500">{fieldErrors.linkedin_url}</span>}
                <SocialInput
                  icon={<i className="fas fa-globe"></i>}
                  type="url"
                  placeholder="Website/Portfolio URL"
                  value={editForm.website}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((prev: any) => ({ ...prev, website: e.target.value }))}
                  aria-label="Website/Portfolio URL"
                />
                {fieldErrors.website && <span className="text-xs text-red-500">{fieldErrors.website}</span>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-semibold">Accent Color:</span>
                  {accentColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 ${accentColor === color ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => { setAccentColor(color); setEditForm((prev: any) => ({ ...prev, accent: color })); }}
                      aria-label={`Set accent color ${color}`}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className={`w-full py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors mt-2 flex items-center justify-center ${saving ? 'opacity-60' : ''}`}
                  disabled={saving}
                  aria-busy={saving}
                >
                  {saving ? (
                    <span className="flex items-center gap-2"><i className="fas fa-spinner fa-spin"></i> Saving...</span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;