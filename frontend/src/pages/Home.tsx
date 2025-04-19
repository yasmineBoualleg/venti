import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useRef } from 'react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
  { code: 'dz', name: 'الدارجة' },
  { code: 'qb', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' }
];

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

const socialIcons = [
  { name: 'facebook', src: '/icons/facebook.svg' },
  { name: 'instagram', src: '/icons/instagram.svg' },
  { name: 'twitter', src: '/icons/twitter.svg' }
];

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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    title: (lang: string) => translations[lang as keyof typeof translations].features.xpRewards,
    description: (lang: string) => translations[lang as keyof typeof translations].features.xpRewardsDesc,
    icon: (
      <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  }
];

const Home = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.2, 0.8]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-white to-blue-400"
        style={{ y: backgroundY, opacity }}
      />

      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 backdrop-blur-glass bg-glass-gradient" />

      {/* Language Bar - Centered */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center bg-white/20 backdrop-blur-xl rounded-full shadow-lg border border-white/30 px-2 py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setCurrentLang(lang.code)}
              className={`px-4 py-2 text-sm rounded-full transition-all ${
                currentLang === lang.code
                  ? 'text-white bg-primary/80 shadow-lg backdrop-blur-lg'
                  : 'text-gray-700 hover:text-primary hover:bg-white/30'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Algeria Flag - Next to profile picture */}
      <div className="fixed top-20 right-4 z-50 flex items-center gap-2">
        <img
          src="/icons/algeria-flag.svg"
          alt="Algeria Flag"
          className="w-6 h-4 shadow-lg rounded"
        />
      </div>

      {/* Main Content */}
      <div className="relative px-4 pt-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <img
              src="/venti-icon.svg"
              alt="Venti"
              className="h-24 mx-auto mb-8"
            />
            
            <div className="relative inline-block mb-12">
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
                {translations[currentLang as keyof typeof translations].title}
              </h1>

              {/* Floating Social Icons */}
              <div className="absolute inset-0 -z-10">
                {socialIcons.map((icon, index) => (
                  <motion.img
                    key={icon.name}
                    src={icon.src}
                    alt={icon.name}
                    className="absolute w-8 h-8 opacity-30"
                    style={{
                      filter: 'invert(1)',
                      top: `${Math.sin(index) * 50}%`,
                      left: `${Math.cos(index) * 50 + 50}%`,
                    }}
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>

            <motion.p
              className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto"
              style={{
                opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0.5]),
                y: useTransform(scrollYProgress, [0, 1], [0, 50]),
              }}
            >
              {translations[currentLang as keyof typeof translations].description}
            </motion.p>

            {/* Feature Grid - All 4 cards visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group relative overflow-hidden rounded-2xl"
                >
                  {/* Glass Background */}
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-xl border border-white/30 group-hover:bg-white/30 transition-all duration-300" />
                  
                  {/* Content */}
                  <div className="relative p-6">
                    <div className="text-primary mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title(currentLang)}</h3>
                    <p className="text-gray-600">{feature.description(currentLang)}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              to="/login"
              className="relative inline-flex items-center px-8 py-3 text-base font-medium rounded-xl text-white overflow-hidden group"
            >
              {/* Glass Background */}
              <div className="absolute inset-0 bg-primary/80 backdrop-blur-xl group-hover:bg-primary transition-all duration-300" />
              
              {/* Button Text */}
              <span className="relative px-8 py-3 md:py-4 md:text-lg md:px-10">
                {translations[currentLang as keyof typeof translations].getStarted}
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home; 