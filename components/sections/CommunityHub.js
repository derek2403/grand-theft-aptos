import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function CommunityHub() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });

  const socialStats = [
    {
      platform: "Discord",
      count: "50K+",
      label: "Community Members",
      icon: "/icons/discord.svg",
      link: "https://discord.gg/grandtheftaptos"
    },
    {
      platform: "Twitter",
      count: "25K+",
      label: "Followers",
      icon: "/icons/twitter.svg",
      link: "https://twitter.com/grandtheftaptos"
    },
    {
      platform: "Telegram",
      count: "15K+",
      label: "Active Users",
      icon: "/icons/telegram.svg",
      link: "https://t.me/grandtheftaptos"
    }
  ];

  const upcomingEvents = [
    {
      title: "Community AMA",
      date: "2024-04-15",
      time: "18:00 UTC",
      description: "Live Q&A session with the development team",
      platform: "Discord"
    },
    {
      title: "Gameplay Preview",
      date: "2024-04-20",
      time: "20:00 UTC",
      description: "First look at the new mission system",
      platform: "YouTube"
    },
    {
      title: "Hackathon Workshop",
      date: "2024-04-25",
      time: "16:00 UTC",
      description: "Learn how to build on our platform",
      platform: "Discord"
    }
  ];

  return (
    <section ref={sectionRef} className="section-spacing relative">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary via-background to-background opacity-80" />
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Join the Revolution
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Be part of a thriving community shaping the future of gaming
          </p>
        </motion.div>

        {/* Social Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {socialStats.map((stat, index) => (
            <motion.div
              key={stat.platform}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-background/90 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-background/95 transition-all duration-300"
            >
              <Link href={stat.link} target="_blank" rel="noopener noreferrer">
                <div className="flex flex-col items-center">
                  <Image
                    src={stat.icon}
                    alt={stat.platform}
                    width={48}
                    height={48}
                    className="mb-4"
                  />
                  <h3 className="text-3xl font-bold mb-2 text-gray-800">{stat.count}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold mb-6 text-center">Upcoming Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="bg-background/90 backdrop-blur-sm rounded-xl p-6 hover:bg-background/95 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <CalendarIcon className="w-5 h-5 text-primary mr-2" />
                  <span className="text-gray-300">{event.date} {event.time}</span>
                </div>
                <h4 className="text-xl font-bold mb-2">{event.title}</h4>
                <p className="text-gray-300 mb-4">{event.description}</p>
                <div className="flex items-center">
                  <PlatformIcon className="w-5 h-5 text-primary mr-2" />
                  <span className="text-gray-300">{event.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Icon Components
const CalendarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PlatformIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
); 