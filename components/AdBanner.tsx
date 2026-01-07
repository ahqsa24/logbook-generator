'use client';

import { useState, useEffect } from 'react';
import { X, Github, Terminal, Megaphone, Instagram } from 'lucide-react';
import Image from 'next/image';

interface AdBannerProps {
    onClose?: () => void;
}

// Banner type: 'text' for text-based banner, 'image' for image-based banner
type BannerType = 'text' | 'image';
type BannerTheme = 'github' | 'partner' | 'default';

interface BannerConfig {
    id: number;
    type: BannerType;
    theme?: BannerTheme; // Visual theme for the banner
    icon?: 'github' | 'megaphone' | 'terminal'; // Icon to display
    // For text-based banners
    title?: string;
    subtitle?: string;
    description?: string;
    features?: string[];
    ctaText?: string;
    ctaLink?: string;
    // For image-based banners
    imageUrl?: string;
    imageMobileUrl?: string; // Optional: different image for mobile
    imageAlt?: string;
    clickUrl?: string;
}

export default function AdBanner({ onClose }: AdBannerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [currentBanner, setCurrentBanner] = useState(0);

    // Banner content configuration
    const banners: BannerConfig[] = [
        // Banner 1: Media Partner Opportunity (Shows on EVEN hours: 0,2,4,6,8,10,12,14,16,18,20,22)
        {
            id: 1,
            type: 'text',
            theme: 'partner',
            icon: 'megaphone',
            title: 'Become a Media Partner',
            subtitle: 'Advertise your brand to IPB students',
            description: 'Limited slots available! Reach thousands of IPB students using this logbook generator.',
            features: [
                'Targeted audience: IPB students & developers',
                'High visibility with modal banner ads',
                'Flexible banner formats (text or image)',
                'Affordable rates for students & startups'
            ],
            ctaText: 'Contact via Instagram',
            ctaLink: 'https://instagram.com/adidsadida24',
        },
        // Banner 2: Terminal Version (GitHub) (Shows on ODD hours: 1,3,5,7,9,11,13,15,17,19,21,23)
        {
            id: 2,
            type: 'text',
            theme: 'github',
            icon: 'github',
            title: 'Terminal Version Available',
            subtitle: 'Generate logbook from command line',
            description: 'Faster and more efficient CLI tool for developers',
            features: [
                'Generate logbook in seconds',
                'Batch processing for multiple files',
                'Automation-friendly for your workflow',
                'Cross-platform: Windows, Mac, Linux'
            ],
            ctaText: 'View on GitHub',
            ctaLink: 'https://github.com/Anro128/IPB-Student-Portal-Logbook-Bot',
        },
        // Example: Image-based banner (uncomment and configure when needed)
        // {
        //     id: 3,
        //     type: 'image',
        //     imageUrl: '/banners/partner-desktop.png',
        //     imageMobileUrl: '/banners/partner-mobile.png', // Optional
        //     imageAlt: 'Partner Advertisement',
        //     clickUrl: 'https://partner-website.com',
        // },
    ];

    useEffect(() => {
        // Check if user has seen the banner in this session
        const hasSeenBanner = sessionStorage.getItem('hasSeenAdBanner');

        if (!hasSeenBanner) {
            // Determine which banner to show based on time/rotation
            const bannerIndex = getBannerRotation();
            setCurrentBanner(bannerIndex);

            // Show banner after a short delay for better UX
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, []);

    // Rotation logic: changes banner based on hour of day
    // Banners rotate every hour in sequence
    // Example with 2 banners:
    //   - Hour 0, 2, 4, 6, ... (even) -> Banner 1 (index 0)
    //   - Hour 1, 3, 5, 7, ... (odd)  -> Banner 2 (index 1)
    // Example with 3 banners:
    //   - Hour 0, 3, 6, 9, ...  -> Banner 1 (index 0)
    //   - Hour 1, 4, 7, 10, ... -> Banner 2 (index 1)
    //   - Hour 2, 5, 8, 11, ... -> Banner 3 (index 2)
    const getBannerRotation = (): number => {
        const hour = new Date().getHours(); // 0-23
        return hour % banners.length; // Rotate based on total number of banners
    };

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenAdBanner', 'true');
        if (onClose) onClose();
    };

    const handleCTAClick = () => {
        const banner = banners[currentBanner];
        const url = banner.type === 'text' ? banner.ctaLink : banner.clickUrl;
        if (url) {
            window.open(url, '_blank');
            handleClose();
        }
    };

    const handleImageClick = () => {
        const banner = banners[currentBanner];
        if (banner.type === 'image' && banner.clickUrl) {
            window.open(banner.clickUrl, '_blank');
            handleClose();
        }
    };

    if (!isVisible) return null;

    const banner = banners[currentBanner];

    // Get theme colors based on banner theme
    const getThemeColors = (theme?: BannerTheme) => {
        switch (theme) {
            case 'github':
                return {
                    iconBg: 'bg-gray-900 dark:bg-white',
                    iconColor: 'text-white dark:text-gray-900',
                    buttonBg: 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700',
                    buttonText: 'text-white',
                    indicatorActive: 'bg-green-600 dark:bg-green-500',
                    headerBg: 'bg-gray-50 dark:bg-gray-800',
                    borderColor: 'border-gray-200 dark:border-gray-700',
                };
            case 'partner':
                return {
                    iconBg: 'bg-purple-600',
                    iconColor: 'text-white',
                    buttonBg: 'bg-purple-600 hover:bg-purple-700',
                    buttonText: 'text-white',
                    indicatorActive: 'bg-purple-600',
                    headerBg: 'bg-purple-600',
                    borderColor: 'border-gray-200 dark:border-gray-700',
                };
            default:
                return {
                    iconBg: 'bg-gray-900 dark:bg-white',
                    iconColor: 'text-white dark:text-gray-900',
                    buttonBg: 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200',
                    buttonText: 'text-white dark:text-gray-900',
                    indicatorActive: 'bg-gray-900 dark:bg-gray-100',
                    headerBg: 'bg-gray-50 dark:bg-gray-800',
                    borderColor: 'border-gray-200 dark:border-gray-700',
                };
        }
    };

    // Get icon component based on banner icon
    const getIconComponent = (iconType?: string) => {
        switch (iconType) {
            case 'github':
                return Github;
            case 'megaphone':
                return Megaphone;
            case 'terminal':
                return Terminal;
            default:
                return Github;
        }
    };

    const themeColors = getThemeColors(banner.theme);
    const IconComponent = getIconComponent(banner.icon);

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
                onClick={handleClose}
            />

            {/* Banner modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                {banner.type === 'text' ? (
                    // Text-based banner
                    <div
                        className={`relative w-full max-w-md bg-white dark:bg-gray-900 rounded-lg border ${themeColors.borderColor} shadow-2xl overflow-hidden pointer-events-auto animate-slideUp`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className={`absolute top-3 right-3 z-10 p-1.5 rounded-md transition-colors ${banner.theme === 'partner'
                                ? 'hover:bg-purple-700 text-white'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                            aria-label="Close banner"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header with dynamic styling */}
                        <div className={`${themeColors.headerBg} ${banner.theme === 'partner' ? '' : `border-b ${themeColors.borderColor}`} px-6 py-4`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 ${themeColors.iconBg} rounded-lg`}>
                                    <IconComponent className={`w-6 h-6 ${themeColors.iconColor}`} />
                                </div>
                                <div className="flex-1">
                                    <h2 className={`text-lg font-semibold ${banner.theme === 'partner'
                                        ? 'text-white'
                                        : 'text-gray-900 dark:text-gray-100'
                                        }`}>
                                        {banner.title}
                                    </h2>
                                    <p className={`text-sm ${banner.theme === 'partner'
                                        ? 'text-purple-100'
                                        : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {banner.subtitle}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-5">
                            {/* Description */}
                            <div className="flex items-start gap-3 mb-5">
                                {banner.theme === 'partner' ? (
                                    <Megaphone className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                    <Terminal className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                )}
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {banner.description}
                                </p>
                            </div>

                            {/* Features list */}
                            <div className="space-y-2.5 mb-6">
                                {banner.features?.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        <svg
                                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${banner.theme === 'partner'
                                                ? 'text-purple-600'
                                                : 'text-green-600 dark:text-green-500'
                                                }`}
                                            fill="currentColor"
                                            viewBox="0 0 16 16"
                                        >
                                            <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                                        </svg>
                                        <span className="leading-relaxed">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button with dynamic styling */}
                            <button
                                onClick={handleCTAClick}
                                className={`w-full ${themeColors.buttonBg} ${themeColors.buttonText} font-medium py-2.5 px-4 rounded-md transition-colors duration-150 text-sm flex items-center justify-center gap-2 shadow-sm`}
                            >
                                {banner.theme === 'partner' ? (
                                    <Instagram className="w-4 h-4" />
                                ) : (
                                    <IconComponent className="w-4 h-4" />
                                )}
                                {banner.ctaText}
                            </button>

                            {/* Skip text */}
                            <button
                                onClick={handleClose}
                                className="w-full mt-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm transition-colors duration-150"
                            >
                                Skip
                            </button>
                        </div>

                        {/* Bottom indicator dots */}
                        {banners.length > 1 && (
                            <div className="flex justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                {banners.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentBanner
                                            ? `${themeColors.indicatorActive} w-6`
                                            : 'bg-gray-300 dark:bg-gray-600 w-1.5'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Image-based banner (for media partners)
                    <div
                        className="relative w-full max-w-2xl pointer-events-auto animate-slideUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow-lg hover:scale-110 transition-transform"
                            aria-label="Close banner"
                        >
                            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>

                        {/* Image container with responsive sizing */}
                        <div
                            className="relative rounded-lg overflow-hidden shadow-2xl cursor-pointer hover:shadow-3xl transition-shadow duration-300"
                            onClick={handleImageClick}
                        >
                            {/* Desktop image */}
                            <div className="hidden md:block relative w-full aspect-[4/3]">
                                <Image
                                    src={banner.imageUrl || ''}
                                    alt={banner.imageAlt || 'Advertisement'}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Mobile image (use mobile-specific image if provided, otherwise use desktop image) */}
                            <div className="block md:hidden relative w-full aspect-[3/4]">
                                <Image
                                    src={banner.imageMobileUrl || banner.imageUrl || ''}
                                    alt={banner.imageAlt || 'Advertisement'}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Bottom indicator dots */}
                        {banners.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {banners.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-2 rounded-full transition-all duration-300 ${index === currentBanner
                                            ? 'bg-white w-8'
                                            : 'bg-white/50 w-2'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .animate-slideUp {
            max-height: 90vh;
            overflow-y: auto;
          }
        }
      `}</style>
        </>
    );
}
