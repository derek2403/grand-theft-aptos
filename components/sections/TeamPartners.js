import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';

export default function TeamPartners() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });

  const teamMembers = [
    {
      name: "Alex Chen",
      role: "Lead AI Engineer",
      image: "/team/alex.jpg",
      description: "Former AI researcher with expertise in autonomous agents",
      links: {
        linkedin: "https://linkedin.com/in/alexchen",
        github: "https://github.com/alexchen"
      }
    },
    {
      name: "Sarah Johnson",
      role: "Blockchain Architect",
      image: "/team/sarah.jpg",
      description: "Blockchain veteran with experience in gaming ecosystems",
      links: {
        linkedin: "https://linkedin.com/in/sarahjohnson",
        github: "https://github.com/sarahj"
      }
    },
    {
      name: "Mike Williams",
      role: "Game Director",
      image: "/team/mike.jpg",
      description: "15+ years in AAA game development",
      links: {
        linkedin: "https://linkedin.com/in/mikewilliams",
        twitter: "https://twitter.com/mikew"
      }
    }
  ];

  const partners = [
    {
      name: "Aptos Labs",
      logo: "/partners/aptos.png",
      description: "Blockchain infrastructure partner",
      link: "https://aptoslabs.com"
    },
    {
      name: "Epic Games",
      logo: "/partners/epic.svg",
      description: "Unreal Engine technology partner",
      link: "https://epicgames.com"
    },
    {
      name: "AI Institute",
      logo: "/partners/ai-institute.svg",
      description: "Research and development partner",
      link: "https://ai-institute.org"
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
            Meet the Team
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Passionate innovators pushing the boundaries of gaming technology
          </p>
        </motion.div>

        {/* Team Members */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-background/90 backdrop-blur-sm rounded-xl p-6 hover:bg-background/95 transition-all duration-300"
            >
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">{member.name}</h3>
              <p className="text-gray-700 font-medium">{member.role}</p>
              <p className="text-gray-600">{member.description}</p>
              <div className="flex justify-center space-x-4">
                {Object.entries(member.links).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    <SocialIcon platform={platform} className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partners Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-3xl font-bold text-center mb-12">Our Partners</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {partners.map((partner, index) => (
              <a
                key={partner.name}
                href={partner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="bg-background/90 backdrop-blur-sm rounded-xl p-6 hover:bg-background/95 transition-all duration-300"
                >
                  <div className="h-16 relative mb-4">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h4 className="text-xl font-bold text-center mb-2">{partner.name}</h4>
                  <p className="text-gray-600 text-center">{partner.description}</p>
                </motion.div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Social Icon Component
const SocialIcon = ({ platform, className }) => {
  const icons = {
    linkedin: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    github: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    ),
    twitter: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    )
  };

  return icons[platform] || null;
}; 