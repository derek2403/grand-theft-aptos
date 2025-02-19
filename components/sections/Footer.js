import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Footer() {
  const socialLinks = [
    {
      platform: "Discord",
      icon: "/icons/discord.svg",
      link: "https://discord.gg/grandtheftaptos"
    },
    {
      platform: "Twitter",
      icon: "/icons/twitter.svg",
      link: "https://twitter.com/grandtheftaptos"
    },
    {
      platform: "GitHub",
      icon: "/icons/github.svg",
      link: "https://github.com/grandtheftaptos"
    },
    {
      platform: "LinkedIn",
      icon: "/icons/linkedin.svg",
      link: "https://linkedin.com/company/grandtheftaptos"
    }
  ];

  const legalLinks = [
    {
      title: "Terms of Service",
      link: "/legal/terms"
    },
    {
      title: "Privacy Policy",
      link: "/legal/privacy"
    },
    {
      title: "Cookie Policy",
      link: "/legal/cookies"
    }
  ];

  const contactOptions = [
    {
      title: "Support",
      description: "Get help with technical issues",
      link: "mailto:support@grandtheftaptos.com"
    },
    {
      title: "Business",
      description: "Partnership inquiries",
      link: "mailto:business@grandtheftaptos.com"
    },
    {
      title: "Press",
      description: "Media inquiries",
      link: "mailto:press@grandtheftaptos.com"
    }
  ];

  return (
    <footer className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <Image
              src="/logo.png"
              alt="GTA Logo"
              width={120}
              height={120}
              className="mb-6"
            />
            <p className="text-gray-400 mb-6">
              The future of gaming where AI meets blockchain technology.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.platform}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-background/50 rounded-full flex items-center justify-center hover:bg-background/70 transition-colors"
                  >
                    <Image
                      src={social.icon}
                      alt={social.platform}
                      width={24}
                      height={24}
                    />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold mb-6">Legal</h3>
            <ul className="space-y-4">
              {legalLinks.map((legal) => (
                <li key={legal.title}>
                  <Link
                    href={legal.link}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    {legal.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2">
            <h3 className="text-xl font-bold mb-6">Contact Us</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactOptions.map((option) => (
                <Link
                  key={option.title}
                  href={option.link}
                  className="group"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-background/30 backdrop-blur-sm rounded-xl p-4 hover:bg-background/50 transition-all duration-300"
                  >
                    <h4 className="text-lg font-bold mb-2">{option.title}</h4>
                    <p className="text-gray-400 text-sm">{option.description}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Grand Theft Aptos. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Built with ❤️ for the Aptos Hackathon
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 