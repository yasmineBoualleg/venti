import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdHome, MdGroups, MdMenuBook, MdNote, MdForum, MdChat, MdEmojiEvents, MdPerson, MdMenu, MdClose } from 'react-icons/md';

const Navigation = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/', icon: <MdHome size={24} />, label: 'Homepage', name: 'homepage' },
    { path: '/clubs', icon: <MdGroups size={24} />, label: 'Clubs', name: 'clubs' },
    { path: '/courses', icon: <MdMenuBook size={24} />, label: 'Courses', name: 'courses' },
    { path: '/notebooks', icon: <MdNote size={24} />, label: 'My Notebooks', name: 'notebooks' },
    { path: '/community', icon: <MdChat size={24} />, label: 'Community', name: 'community' },
    { path: '/chat', icon: <MdForum size={24} />, label: 'Chat', name: 'chat' },
    { path: '/study-arena', icon: <MdEmojiEvents size={24} />, label: 'Study Arena', name: 'study-arena' },
    { path: '/profile', icon: <MdPerson size={24} />, label: 'Profile', name: 'profile' },
  ];

  const ORANGE = '#FFA726';
  const BLUE = 'var(--color-primary, #2563eb)';

  // Animation variants for staggered pop-in
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.7 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Sidebar for desktop/tablet
  const sidebar = (
    <nav className="fixed top-0 left-0 h-full w-16 flex-col items-center justify-center z-50 hidden sm:flex">
      <div className="flex flex-col items-center h-full w-full overflow-y-auto py-6 px-2 bg-white/80 backdrop-blur-xl shadow-2xl rounded-r-3xl mt-8 mb-8">
        <motion.div
          className="flex flex-col items-center justify-center h-full w-full space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {navItems.map((item) => (
            <motion.div key={item.path} variants={itemVariants} className="w-full">
              <Link
                to={item.path}
                className="relative group w-full flex flex-col items-center"
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                aria-label={item.label}
              >
                <div className="relative flex flex-col items-center w-full">
                  <span>
                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full shadow-md transition-all duration-300 bg-white/0 hover:bg-white/20 active:bg-white/30`} style={{ minWidth: 36, minHeight: 36, margin: '0.5rem' }}>
                      {React.cloneElement(item.icon, {
                        color: isActive(item.path) || hoveredItem === item.name ? ORANGE : BLUE,
                        size: 20,
                        style: { transition: 'color 0.3s ease-in-out' }
                      })}
                    </span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </nav>
  );

  // Hamburger and mobile menu (fan-out animation)
  const mobileNav = (
    <>
      {/* Hamburger button */}
      <button
        className="fixed bottom-6 left-6 z-50 sm:hidden bg-white/80 backdrop-blur-xl shadow-xl rounded-full p-3 flex items-center justify-center"
        onClick={() => setMobileOpen((open) => !open)}
        aria-label="Open navigation menu"
      >
        {mobileOpen ? <MdClose size={28} color={BLUE} /> : <MdMenu size={28} color={BLUE} />}
      </button>
      {/* Fan-out icons */}
      <motion.div
        className="fixed bottom-6 left-6 z-40 flex flex-col items-center sm:hidden"
        initial={false}
        animate={mobileOpen ? 'open' : 'closed'}
        variants={{}}
      >
        <motion.ul
          className="flex flex-col items-center space-y-2"
          initial="closed"
          animate={mobileOpen ? 'open' : 'closed'}
          variants={{}}
        >
          {navItems.map((item, idx) => (
            <motion.li
              key={item.path}
              initial={{ opacity: 0, y: 0 }}
              animate={mobileOpen ? { opacity: 1, y: -((idx + 1) * 60) } : { opacity: 0, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                delay: mobileOpen ? idx * 0.06 : 0,
              }}
              style={{ pointerEvents: mobileOpen ? 'auto' : 'none', position: 'absolute', left: 0, right: 0 }}
            >
              <Link
                to={item.path}
                className="flex items-center justify-center w-14 h-14 rounded-full shadow-md transition-all duration-300 bg-white/0 hover:bg-white/20 active:bg-white/30"
                style={{ minWidth: 48, minHeight: 48 }}
                aria-label={item.label}
                onClick={() => setMobileOpen(false)}
              >
                {React.cloneElement(item.icon, {
                  color: isActive(item.path) ? ORANGE : BLUE,
                  size: 28,
                  style: { transition: 'color 0.3s ease-in-out' }
                })}
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </>
  );

  return (
    <>
      {sidebar}
      {mobileNav}
    </>
  );
};

export default Navigation; 