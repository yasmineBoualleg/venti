import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
  { code: 'dz', name: 'الدارجة' },
  { code: 'qb', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' }
];

// Memoized translations to prevent re-creation on every render
const translations = {
  en: {
    title: 'From Chaos to Focus',
    description: 'One unified platform for your academic life. Combine your social connections, communications, resources, and classroom activities in one place.',
    getStarted: 'Get Started',
    features: {
      socialConnect: 'Social Connect',
      socialConnectDesc: 'Share moments and stay connected with your academic community',
      instantMessaging: 'Instant Messaging',
      instantMessagingDesc: 'Direct communication with classmates and professors',
      virtualClassroom: 'Virtual Classroom',
      virtualClassroomDesc: 'Manage assignments, discussions, and course materials',
      teacherCourses: 'Teacher Courses',
      teacherCoursesDesc: 'Access specialized courses and materials from your professors',
      clubsManagement: 'Clubs Management',
      clubsManagementDesc: 'Create, join, and manage academic and social clubs',
      studyGroups: 'Study Groups',
      studyGroupsDesc: 'Create and join study groups with your peers',
      xpRewards: 'XP Rewards',
      xpRewardsDesc: 'Earn XP and achievements for your academic progress',
      eventCalendar: 'Event Calendar',
      eventCalendarDesc: 'Stay updated with academic events and deadlines',
      brandsHub: 'Brands Hub',
      brandsHubDesc: 'Connect with educational brands and access exclusive offers',
      institutions: 'Institutions',
      institutionsDesc: 'Access resources and connect with educational institutions'
    }
  },
  fr: {
    title: 'Du Chaos à la Concentration',
    description: 'Une plateforme unifiée pour votre vie académique. Combinez vos connexions sociales, communications, ressources et activités en classe en un seul endroit.',
    getStarted: 'Commencer',
    features: {
      socialConnect: 'Connexion Sociale',
      socialConnectDesc: 'Partagez des moments et restez connecté avec votre communauté académique',
      instantMessaging: 'Messagerie Instantanée',
      instantMessagingDesc: 'Communication directe avec les camarades et les professeurs',
      virtualClassroom: 'Classe Virtuelle',
      virtualClassroomDesc: 'Gérez les devoirs, discussions et supports de cours',
      teacherCourses: 'Cours des Professeurs',
      teacherCoursesDesc: 'Accédez aux cours et supports spécialisés de vos professeurs',
      clubsManagement: 'Gestion des Clubs',
      clubsManagementDesc: 'Créez, rejoignez et gérez des clubs académiques et sociaux',
      studyGroups: 'Groupes d\'Étude',
      studyGroupsDesc: 'Créez et rejoignez des groupes d\'étude avec vos pairs',
      xpRewards: 'Récompenses XP',
      xpRewardsDesc: 'Gagnez des XP et des réalisations pour vos progrès académiques',
      eventCalendar: 'Calendrier des Événements',
      eventCalendarDesc: 'Restez informé des événements et échéances académiques',
      brandsHub: 'Espace Marques',
      brandsHubDesc: 'Connectez-vous avec des marques éducatives et accédez à des offres exclusives',
      institutions: 'Institutions',
      institutionsDesc: 'Accédez aux ressources et connectez-vous avec les institutions éducatives'
    }
  },
  ar: {
    title: 'من الفوضى إلى التركيز',
    description: 'منصة موحدة لحياتك الأكاديمية. اجمع بين تواصلك الاجتماعي واتصالاتك ومواردك وأنشطتك الصفية في مكان واحد.',
    getStarted: 'ابدأ الآن',
    features: {
      socialConnect: 'التواصل الاجتماعي',
      socialConnectDesc: 'شارك اللحظات وابق على اتصال مع مجتمعك الأكاديمي',
      instantMessaging: 'المراسلة الفورية',
      instantMessagingDesc: 'تواصل مباشر مع الزملاء والأساتذة',
      virtualClassroom: 'الفصل الافتراضي',
      virtualClassroomDesc: 'إدارة المهام والمناقشات ومواد الدورة',
      teacherCourses: 'دورات الأساتذة',
      teacherCoursesDesc: 'الوصول إلى الدورات والمواد المتخصصة من أساتذتك',
      clubsManagement: 'إدارة الأندية',
      clubsManagementDesc: 'إنشاء والانضمام وإدارة الأندية الأكاديمية والاجتماعية',
      studyGroups: 'مجموعات الدراسة',
      studyGroupsDesc: 'إنشاء والانضمام إلى مجموعات الدراسة مع أقرانك',
      xpRewards: 'مكافآت الخبرة',
      xpRewardsDesc: 'كسب نقاط الخبرة والإنجازات لتقدمك الأكاديمي',
      eventCalendar: 'تقويم الأحداث',
      eventCalendarDesc: 'ابق على اطلاع على الأحداث والمواعيد النهائية الأكاديمية',
      brandsHub: 'مركز العلامات التجارية',
      brandsHubDesc: 'تواصل مع العلامات التجارية التعليمية واحصل على عروض حصرية',
      institutions: 'المؤسسات',
      institutionsDesc: 'الوصول إلى الموارد والتواصل مع المؤسسات التعليمية'
    }
  },
  dz: {
    title: 'من الفوضى للتركيز',
    description: 'بلاتفورم موحدة لحياتك الدراسية. اجمع بين التواصل الاجتماعي، المراسلات، الموارد ونشاطات القسم في مكان واحد.',
    getStarted: 'ابدا دروك',
    features: {
      socialConnect: 'التواصل الاجتماعي',
      socialConnectDesc: 'شارك اللحظات وابقى متصل مع مجتمعك الدراسي',
      instantMessaging: 'المراسلة الفورية',
      instantMessagingDesc: 'تواصل مباشر مع الزملاء والأساتذة',
      virtualClassroom: 'القسم الافتراضي',
      virtualClassroomDesc: 'سير المهام، النقاشات ومواد الدورة',
      teacherCourses: 'دورات الأساتذة',
      teacherCoursesDesc: 'الوصول للدورات والمواد المتخصصة من أساتذتك',
      clubsManagement: 'تدبير النوادي',
      clubsManagementDesc: 'سوي، انضم وسير النوادي الدراسية والاجتماعية',
      studyGroups: 'مجموعات الدراسة',
      studyGroupsDesc: 'سوي وانضم لمجموعات الدراسة مع زملائك',
      xpRewards: 'مكافآت الخبرة',
      xpRewardsDesc: 'كسب نقاط الخبرة والإنجازات لتقدمك الدراسي',
      eventCalendar: 'تقويم النشاطات',
      eventCalendarDesc: 'ابقى على اطلاع على النشاطات والمواعيد الدراسية',
      brandsHub: 'مركز العلامات',
      brandsHubDesc: 'تواصل مع العلامات التعليمية واحصل على عروض حصرية',
      institutions: 'المؤسسات',
      institutionsDesc: 'الوصول للموارد والتواصل مع المؤسسات التعليمية'
    }
  },
  qb: {
    title: 'Seg Uɣerif ɣer Uɣerfad',
    description: 'Aɣbalu yettwasegded i tudert-ik n tmusni. Sseddu tdukli-ik timettant, timsizlit, tiɣbula d urar n tɣawsiwin deg yiwen n umkan.',
    getStarted: 'Bdu',
    features: {
      socialConnect: 'Tdukli Timettant',
      socialConnectDesc: 'Bḍu tikkal d tɣawsiwin d tdukli-ik n tmusni',
      instantMessaging: 'Timsizlit Srid',
      instantMessagingDesc: 'Timsizlit srid d imdukal d imsseḥḥa',
      virtualClassroom: 'Tɣawsa Tuzvirt',
      virtualClassroomDesc: 'Sefrek tizmilin, tameslayt d tiɣbula n tɣawsiwin',
      teacherCourses: 'Tɣawsiwin n Imsseḥḥa',
      teacherCoursesDesc: 'Kcem ɣer tɣawsiwin d tiɣbula n imsseḥḥa-ik',
      clubsManagement: 'Tasefsit n Tdukliwin',
      clubsManagementDesc: 'Rnu, ɣer d ssefrek tdukliwin n tmusni d timettant',
      studyGroups: 'Tdukliwin n Uɣerfad',
      studyGroupsDesc: 'Rnu d ɣer tdukliwin n uɣerfad d imdukal-ik',
      xpRewards: 'Arraz n Uɣerfad',
      xpRewardsDesc: 'Kkes arraz d tikkal n uɣerfad-ik',
      eventCalendar: 'Azwel n Urar',
      eventCalendarDesc: 'Qqim ɣef urar d tizemmarin n tmusni',
      brandsHub: 'Aɣbalu n Tizemmarin',
      brandsHubDesc: 'Qqim ɣef tizemmarin n tmusni d tɣawsiwin',
      institutions: 'Tiddukla',
      institutionsDesc: 'Kcem ɣer tiɣbula d tiddukla n tmusni'
    }
  }
};

// Optimized social icons with reduced animation complexity
const socialIcons = [
  { name: 'facebook', src: '/icons/facebook.svg' },
  { name: 'instagram', src: '/icons/instagram.svg' },
  { name: 'twitter', src: '/icons/twitter.svg' }
];

// Memoized features array to prevent re-creation
const features = [
  {
    title: (lang: string) => translations[lang as keyof typeof translations].features.socialConnect,
    description: (lang: string) => translations[lang as keyof typeof translations].features.socialConnectDesc,
    icon: (
      <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    )
  },
  {
    title: (lang: string) => translations[lang as keyof typeof translations].features.instantMessaging,
    description: (lang: string) => translations[lang as keyof typeof translations].features.instantMessagingDesc,
    icon: (
      <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )
  },
  {
    title: (lang: string) => translations[lang as keyof typeof translations].features.virtualClassroom,
    description: (lang: string) => translations[lang as keyof typeof translations].features.virtualClassroomDesc,
    icon: (
      <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    title: (lang: string) => translations[lang as keyof typeof translations].features.teacherCourses,
    description: (lang: string) => translations[lang as keyof typeof translations].features.teacherCoursesDesc,
    icon: (
      <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      </svg>
    )
  },
  {
    title: (lang: string) => translations[lang as keyof typeof translations].features.clubsManagement,
    description: (lang: string) => translations[lang as keyof typeof translations].features.clubsManagementDesc,
    icon: (
      <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    title: (lang: string) => translations[lang as keyof typeof translations].features.studyGroups,
    description: (lang: string) => translations[lang as keyof typeof translations].features.studyGroupsDesc,
    icon: (
      <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  {
    title: (lang: string) => translations[lang as keyof typeof translations].features.xpRewards,
    description: (lang: string) => translations[lang as keyof typeof translations].features.xpRewardsDesc,
    icon: (
      <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  },
  {
    title: (lang: string) => translations[lang as keyof typeof translations].features.eventCalendar,
    description: (lang: string) => translations[lang as keyof typeof translations].features.eventCalendarDesc,
    icon: (
      <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: (lang: string) => translations[lang as keyof typeof translations].features.brandsHub,
    description: (lang: string) => translations[lang as keyof typeof translations].features.brandsHubDesc,
    icon: (
      <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    title: (lang: string) => translations[lang as keyof typeof translations].features.institutions,
    description: (lang: string) => translations[lang as keyof typeof translations].features.institutionsDesc,
    icon: (
      <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    )
  }
];

// Memoized components for better performance
const FloatingIcon = ({ icon, index }: { icon: { name: string; src: string }; index: number }) => (
  <img
    src={icon.src}
    alt={icon.name}
    className={`absolute w-8 h-8 opacity-30 float-animation ${
      index === 1 ? 'float-animation-delay-1' : index === 2 ? 'float-animation-delay-2' : ''
    }`}
    style={{
      filter: 'invert(1)',
      top: `${Math.sin(index) * 50}%`,
      left: `${Math.cos(index) * 50 + 50}%`,
    }}
  />
);

// Optimized Feature Card Component
const FeatureCard = ({ feature, index, currentLang }: { feature: any; index: number; currentLang: string }) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.05 }}
    className="group relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-blue-100"
  >
    {/* Glass Background */}
    <div className="absolute inset-0 glass-effect group-hover:glass-effect-hover transition-all duration-300" />
    
    {/* Content */}
    <div className="relative p-4 sm:p-6">
      <div className="text-primary mb-3 sm:mb-4">
        {feature.icon}
      </div>
      <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title(currentLang)}</h3>
      <p className="text-sm sm:text-base text-gray-600">{feature.description(currentLang)}</p>
    </div>
  </motion.div>
);

const Landing = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Check if user is already authenticated
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      // User is already authenticated, redirect to welcome page
      navigate('/welcome');
    }
  }, [navigate]);
  
  // Optimized scroll handling with throttling
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Memoized transforms to prevent recalculation
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 0.7]);

  // Memoized language change handler
  const handleLanguageChange = useCallback((langCode: string) => {
    setCurrentLang(langCode);
  }, []);

  // Memoized current translation
  const currentTranslation = useMemo(() => 
    translations[currentLang as keyof typeof translations], 
    [currentLang]
  );

  // Memoized feature cards to prevent re-creation
  const featureCards = useMemo(() => 
    features.map((feature, index) => (
      <FeatureCard 
        key={index} 
        feature={feature} 
        index={index} 
        currentLang={currentLang} 
      />
    )), 
    [currentLang]
  );

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden pt-4">
      {/* Optimized Parallax Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-white to-blue-400"
        style={{ y: backgroundY, opacity }}
      />

      {/* Simplified Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

      {/* Main Content Card */}
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4">
        <div className="glass-effect rounded-2xl shadow-lg pt-2 sm:pt-4 pb-4 sm:pb-8">
          <Navbar />

          {/* Language Bar - Centered */}
          <div className="mt-8 sm:mt-12 md:mt-20 flex justify-center px-2">
            <div className="flex items-center glass-effect rounded-full shadow-lg px-1 sm:px-2 py-1 max-w-full overflow-x-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
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

          {/* Algeria Flag */}
          <div className="fixed top-4 sm:top-8 md:top-20 right-2 sm:right-4 z-50 flex items-center gap-2">
            <img
              src="/icons/algeria-flag.svg"
              alt="Algeria Flag"
              className="w-4 h-3 sm:w-6 sm:h-4 shadow-lg rounded"
              loading="lazy"
            />
          </div>

          {/* Main Content */}
          <div className="px-2 sm:px-4 pt-8 sm:pt-12 md:pt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <img
                src="/venti-icon.svg"
                alt="Venti"
                className="h-16 sm:h-20 md:h-24 mx-auto mb-4 sm:mb-6 md:mb-8"
                loading="lazy"
              />
              
              <div className="relative inline-block mb-6 sm:mb-8 md:mb-12">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {currentTranslation.title}
                </h1>

                {/* Optimized Floating Social Icons */}
                <div className="absolute inset-0 -z-10">
                  {socialIcons.map((icon, index) => (
                    <img
                      key={icon.name}
                      src={icon.src}
                      alt={icon.name}
                      className={`absolute w-6 h-6 sm:w-8 sm:h-8 opacity-30 float-animation ${
                        index === 1 ? 'float-animation-delay-1' : index === 2 ? 'float-animation-delay-2' : ''
                      }`}
                      style={{
                        filter: 'invert(1)',
                        top: `${Math.sin(index) * 50}%`,
                        left: `${Math.cos(index) * 50 + 50}%`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <motion.p
                className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-2"
                style={{
                  opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0.7]),
                  y: useTransform(scrollYProgress, [0, 1], [0, 30]),
                }}
              >
                {currentTranslation.description}
              </motion.p>

              {/* Optimized Feature Grid */}
              <div id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 px-2">
                {featureCards}
              </div>

              {/* How It Works Section */}
              <div id="how-it-works" className="max-w-4xl mx-auto mb-16 sm:mb-24 md:mb-32 px-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {/* Step 1 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative shadow-lg ring-1 ring-blue-100"
                  >
                    <div className="glass-effect rounded-2xl p-4 sm:p-6 text-center">
                      <div className="absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/80 rounded-full flex items-center justify-center text-white text-sm sm:text-xl font-bold">
                          ①
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">Sign Up</h3>
                      <p className="text-sm sm:text-base text-gray-600">Create your free account</p>
                    </div>
                  </motion.div>

                  {/* Step 2 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="relative shadow-lg ring-1 ring-blue-100"
                  >
                    <div className="glass-effect rounded-2xl p-4 sm:p-6 text-center">
                      <div className="absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/80 rounded-full flex items-center justify-center text-white text-sm sm:text-xl font-bold">
                          ②
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">Explore Spaces</h3>
                      <p className="text-sm sm:text-base text-gray-600">Join your university space</p>
                    </div>
                  </motion.div>

                  {/* Step 3 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="relative shadow-lg ring-1 ring-blue-100"
                  >
                    <div className="glass-effect rounded-2xl p-4 sm:p-6 text-center">
                      <div className="absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/80 rounded-full flex items-center justify-center text-white text-sm sm:text-xl font-bold">
                          ③
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">Join. Learn. Win.</h3>
                      <p className="text-sm sm:text-base text-gray-600">Discover clubs, events, and level up 🎮</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mb-32 sm:mb-48 md:mb-64 px-2">
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-xl text-white bg-primary/80 hover:bg-primary transition-all duration-300"
                >
                  <span className="px-4 sm:px-8 py-2 sm:py-3 md:py-4 md:text-lg md:px-10">
                    {currentTranslation.getStarted}
                  </span>
                </Link>
              </div>

              {/* Footer Card */}
              <div className="max-w-7xl mx-auto px-2 sm:px-4 mb-4 sm:mb-8">
                <div className="glass-effect rounded-2xl shadow-lg p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <img
                        src="/venti-icon.svg"
                        alt="Venti"
                        className="h-6 w-6 sm:h-8 sm:w-8"
                        loading="lazy"
                      />
                      <span className="text-sm sm:text-base text-gray-700">© 2024 Venti. All rights reserved.</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-6 text-sm sm:text-base">
                      <a href="#" className="text-gray-700 hover:text-primary">Terms</a>
                      <a href="#" className="text-gray-700 hover:text-primary">Privacy</a>
                      <div className="flex items-center gap-1 sm:gap-2 text-gray-700">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a 
                          href="mailto:airijapan1@gmail.com" 
                          className="text-gray-700 hover:text-primary whitespace-nowrap text-xs sm:text-sm"
                        >
                          airijapan1@gmail.com
                        </a>
                      </div>
                      <a 
                        href="/admin/logs" 
                        className="text-gray-500 hover:text-gray-700 text-xs opacity-60 hover:opacity-100 transition-opacity"
                        title="Admin Access"
                      >
                        Admin
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 