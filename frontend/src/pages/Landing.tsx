import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 right-0 p-4 flex items-center space-x-4">
        <select className="bg-transparent text-muted text-sm focus:outline-none">
          <option value="en">EN</option>
          <option value="fr">FR</option>
          <option value="es">ES</option>
        </select>
        <Link
          to="/login"
          className="text-muted hover:text-header text-sm"
        >
          Log in
        </Link>
        <Link
          to="/login"
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
        >
          Sign up
        </Link>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Left Side - Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 inline-block"
            >
              <Link to="/" className="flex items-center">
                <span className="text-5xl font-bold text-primary">Venti</span>
                <span className="text-5xl font-bold text-accent">20/20</span>
              </Link>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl font-bold text-header mb-6"
            >
              Make<br />learning fun!
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted mb-8"
            >
              Any subject, in any language, on any<br />device, for all ages!
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/login"
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Sign up for free
              </Link>
            </motion.div>

            {/* App Store Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <p className="text-muted mb-4">Or download the app:</p>
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <a
                  href="#"
                  className="transition-transform hover:scale-105"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/app-store-badge.png"
                    alt="Download on App Store"
                    className="h-10"
                  />
                </a>
                <a
                  href="#"
                  className="transition-transform hover:scale-105"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/google-play-badge.png"
                    alt="Get it on Google Play"
                    className="h-10"
                  />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Images */}
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              {/* Calculator/Device Image */}
              <motion.img
                src="/assets/calculator.svg"
                alt="Learning Device"
                className="w-64 absolute top-0 right-0"
                initial={{ y: 0 }}
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
              />
              
              {/* Notebook Image */}
              <motion.img
                src="/assets/notebook.svg"
                alt="Notebook"
                className="w-72 absolute bottom-0 right-20"
                initial={{ y: 0 }}
                animate={{ y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 5, delay: 0.5 }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 