-- Migration to seed the default Luxury Real Estate template into the website_templates table
-- allowing users to edit and manage it directly from the UI.

INSERT INTO public.website_templates (name, description, html_content, is_active)
VALUES (
  'Luxury Real Estate',
  'Premium dark theme with gold accents, scroll animations, donut chart, and typewriter effect.',
  E'<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title id="page-title">Luxury Real Estate</title>
    <meta name="description" content="Exclusive luxury properties and personalized real estate services.">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@200;300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        luxury: {
                            black: \'#0a0a0a\',
                            charcoal: \'#1a1a1a\',
                            gold: \'#d4af37\',
                            cream: \'#f5f5f0\',
                            white: \'#ffffff\',
                            gray: \'#8a8a8a\'
                        }
                    },
                    fontFamily: {
                        serif: [\'"Cormorant Garamond"\', \'serif\'],
                        sans: [\'"Montserrat"\', \'sans-serif\'],
                    },
                    animation: {
                        \'fade-in\': \'fadeIn 1.2s ease-out forwards\',
                        \'slide-up\': \'slideUp 1s ease-out forwards\',
                    },
                    keyframes: {
                        fadeIn: { \'0%\': { opacity: \'0\' }, \'100%\': { opacity: \'1\' } },
                        slideUp: { \'0%\': { transform: \'translateY(30px)\', opacity: \'0\' }, \'100%\': { transform: \'translateY(0)\', opacity: \'1\' } }
                    }
                }
            }
        }
    </script>
    <style>
        .reveal-on-scroll { opacity: 0; transition: all 1s ease-out; transform: translateY(30px); }
        .reveal-on-scroll.visible { opacity: 1; transform: translateY(0); }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #d4af37; border-radius: 3px; }
        
        .hero-gradient { background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%); }
        
        /* Scroll Donut Chart */
        .donut-ring {
            transition: stroke-dashoffset 0.1s linear;
        }
        
        /* Typewriter Effect */
        .typewriter-cursor::after {
            content: \'|\';
            animation: cursor-blink 1s step-start infinite;
        }
        @keyframes cursor-blink {
            50% { opacity: 0; }
        }
    </style>
</head>
<body class="bg-luxury-cream text-luxury-charcoal font-sans antialiased overflow-x-hidden selection:bg-luxury-gold selection:text-white">

    <!-- Navigation -->
    <nav id="navbar" class="fixed w-full z-50 px-6 py-6 transition-all duration-300">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <div class="flex flex-col text-white mix-blend-difference z-50">
                <div id="nav-agent-name" class="text-2xl font-serif font-bold tracking-widest uppercase">AGENT</div>
                <div id="nav-brokerage" class="text-[10px] tracking-[0.3em] uppercase opacity-80">BROKERAGE</div>
            </div>
            
            <div class="hidden md:flex space-x-12 text-xs font-medium tracking-[0.2em] text-white mix-blend-difference z-50">
                <a href="#hero" class="hover:text-luxury-gold transition-colors duration-300">HOME</a>
                <a href="#philosophy" class="hover:text-luxury-gold transition-colors duration-300">PHILOSOPHY</a>
                <a href="#portfolio" class="hover:text-luxury-gold transition-colors duration-300">PORTFOLIO</a>
                <a href="#contact" class="hover:text-luxury-gold transition-colors duration-300">CONTACT</a>
            </div>
            
            <button class="md:hidden text-white mix-blend-difference text-xl z-50" onclick="document.getElementById(\'mobile-menu\').classList.toggle(\'hidden\')">
                <i class="fas fa-bars"></i>
            </button>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden absolute top-0 left-0 w-full h-screen bg-luxury-black text-white flex flex-col items-center justify-center space-y-8 z-40">
            <a href="#hero" class="text-2xl font-serif" onclick="document.getElementById(\'mobile-menu\').classList.add(\'hidden\')">Home</a>
            <a href="#philosophy" class="text-2xl font-serif" onclick="document.getElementById(\'mobile-menu\').classList.add(\'hidden\')">Philosophy</a>
            <a href="#portfolio" class="text-2xl font-serif" onclick="document.getElementById(\'mobile-menu\').classList.add(\'hidden\')">Portfolio</a>
            <a href="#contact" class="text-2xl font-serif" onclick="document.getElementById(\'mobile-menu\').classList.add(\'hidden\')">Contact</a>
            <button class="absolute top-6 right-6 text-2xl" onclick="document.getElementById(\'mobile-menu\').classList.add(\'hidden\')"><i class="fas fa-times"></i></button>
        </div>
    </nav>

    <!-- Hero Section -->
    <header id="hero" class="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div id="hero-bg" class="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear hover:scale-105" style="background-image: url(\'https://images.unsplash.com/photo-1600596542815-2495db9dc2c3?q=80&w=2070&auto=format&fit=crop\');"></div>
        <div class="absolute inset-0 hero-gradient"></div>
        
        <div class="relative z-10 text-center px-4 max-w-5xl animate-slide-up">
            <div class="w-[1px] h-20 bg-luxury-gold mx-auto mb-8"></div>
            <h1 id="hero-headline" class="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-tight mb-6">
                Redefining<br><span class="italic text-luxury-gold">Luxury Living</span>
            </h1>
            <p class="text-white/80 text-sm md:text-base tracking-[0.2em] uppercase mb-12 max-w-2xl mx-auto">
                Exclusive Representation for Discerning Clients
            </p>
            <a href="#portfolio" class="inline-block border border-white/30 text-white px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-luxury-black transition-all duration-300">
                View Collection
            </a>
        </div>
    </header>

    <!-- Philosophy Section -->
    <section id="philosophy" class="py-32 bg-luxury-cream relative">
        <div class="container mx-auto px-6 max-w-7xl">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div class="relative reveal-on-scroll">
                    <div class="absolute -top-4 -left-4 w-full h-full border border-luxury-gold/30 z-0"></div>
                    <img id="phil-image" src="" alt="Agent" class="relative z-10 w-full h-[600px] object-cover shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
                    
                    <div class="absolute -bottom-8 -right-8 bg-luxury-black p-8 text-white z-20 shadow-xl hidden md:block">
                        <span id="phil-stat-producer" class="text-4xl font-serif text-luxury-gold block mb-1">Top 1%</span>
                        <span id="phil-label-producer" class="text-[10px] tracking-[0.2em] uppercase opacity-70">Producer</span>
                    </div>
                </div>
                
                <div class="reveal-on-scroll space-y-8">
                    <span class="text-luxury-gold tracking-[0.25em] text-xs font-bold uppercase block">The Philosophy</span>
                    <h2 id="phil-headline" class="font-serif text-5xl text-luxury-charcoal leading-tight">
                        Beyond the Transaction
                    </h2>
                    <p id="phil-text" class="text-luxury-charcoal/70 leading-relaxed font-light text-lg">
                        Real estate is not just about property; it\'s about lifestyle, legacy, and investment.
                    </p>
                    
                    <div class="grid grid-cols-2 gap-8 pt-8 border-t border-luxury-charcoal/10">
                        <div>
                            <span class="block text-3xl font-serif text-luxury-charcoal mb-2" id="stat-1-val">10+</span>
                            <span class="text-[10px] tracking-widest uppercase text-luxury-gray">Years Experience</span>
                        </div>
                        <div>
                            <span class="block text-3xl font-serif text-luxury-charcoal mb-2">24/7</span>
                            <span class="text-[10px] tracking-widest uppercase text-luxury-gray">Client Access</span>
                        </div>
                    </div>
                    
                    <a href="#contact" class="inline-block mt-4 text-luxury-charcoal border-b border-luxury-charcoal pb-1 text-xs tracking-[0.2em] uppercase hover:text-luxury-gold hover:border-luxury-gold transition-colors">
                        Connect With Me
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Portfolio Section -->
    <section id="portfolio" class="bg-luxury-charcoal text-white py-32 relative">
        <div class="container mx-auto px-6 max-w-7xl">
            <!-- Market Trends / Scroll Chart -->
            <div id="market-trends" class="mb-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div class="sticky top-32">
                    <div class="relative w-64 h-64 mx-auto">
                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#333" stroke-width="2" />
                            <circle id="scroll-ring" cx="50" cy="50" r="45" fill="none" stroke="#d4af37" stroke-width="4" stroke-dasharray="283" stroke-dashoffset="283" stroke-linecap="round" class="donut-ring" />
                        </svg>
                        <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span id="chart-percentage" class="text-4xl font-serif text-white">0%</span>
                            <span class="text-[10px] tracking-widest uppercase text-white/50 mt-2">Market<br>Growth</span>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-12">
                    <div class="reveal-on-scroll">
                        <h3 class="text-3xl font-serif mb-4 text-luxury-gold">Consistent Growth</h3>
                        <p class="text-white/70 leading-relaxed">
                            Our portfolio has consistently outperformed the market average, delivering exceptional returns for our investors year over year. The luxury sector remains resilient.
                        </p>
                    </div>
                    <div class="reveal-on-scroll">
                        <h3 class="text-3xl font-serif mb-4 text-luxury-gold">Global Reach</h3>
                        <p class="text-white/70 leading-relaxed">
                            With a network spanning 40+ countries, we connect sellers with qualified international buyers, ensuring maximum exposure for every listing.
                        </p>
                    </div>
                    <div class="reveal-on-scroll">
                        <h3 class="text-3xl font-serif mb-4 text-luxury-gold">Record Breaking</h3>
                        <p class="text-white/70 leading-relaxed">
                            We hold the record for the highest price per square foot in the district, setting new benchmarks for luxury real estate values.
                        </p>
                    </div>
                </div>
            </div>

            <div class="text-center mb-20 reveal-on-scroll">
                <h2 class="font-serif text-5xl md:text-6xl mb-4">Curated <span class="text-luxury-gold italic">Portfolio</span></h2>
                <p id="portfolio-location" class="text-white/50 text-xs tracking-widest uppercase">Exclusive Listings</p>
            </div>

            <!-- Featured Active Listing -->
            <div class="relative group cursor-pointer reveal-on-scroll mb-24">
                <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500 z-10"></div>
                <img id="active-img" src="" class="w-full h-[80vh] object-cover" alt="Featured Property">
                
                <div class="absolute bottom-0 left-0 w-full p-8 md:p-16 z-20 bg-gradient-to-t from-black/90 to-transparent">
                    <div class="flex flex-col md:flex-row justify-between items-end">
                        <div>
                            <span class="bg-luxury-gold text-luxury-black px-3 py-1 text-[10px] font-bold tracking-widest uppercase mb-4 inline-block">Featured</span>
                            <h3 id="active-title" class="text-4xl md:text-6xl font-serif mb-2"></h3>
                            <p id="active-specs" class="text-lg font-light opacity-90"></p>
                        </div>
                        <div class="mt-8 md:mt-0">
                             <button class="bg-white/10 backdrop-blur border border-white/30 px-8 py-3 text-xs tracking-widest uppercase hover:bg-luxury-gold hover:text-luxury-black hover:border-luxury-gold transition-all">
                                View Details
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sold Gallery (Grid) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 reveal-on-scroll">
                <div class="relative group overflow-hidden h-[400px]">
                    <img id="sold-img" src="" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Sold Property">
                    <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div class="text-center">
                            <h4 id="sold-title" class="text-3xl font-serif mb-2"></h4>
                            <span id="sold-status" class="text-luxury-gold text-xs tracking-widest uppercase">Sold</span>
                        </div>
                    </div>
                </div>
                
                <!-- Placeholder for second sold item if needed, or services promo -->
                <div class="bg-luxury-black p-12 flex flex-col justify-center items-center text-center border border-white/5">
                    <i class="fas fa-key text-4xl text-luxury-gold mb-6"></i>
                    <h4 class="text-3xl font-serif mb-4">Unlock Value</h4>
                    <p class="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
                        Let us help you find your next investment or dream home in the city\'s most coveted neighborhoods.
                    </p>
                    <a href="#contact" class="text-xs tracking-widest uppercase border-b border-white/30 pb-1 hover:text-luxury-gold hover:border-luxury-gold transition-colors">
                        Start Your Search
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Services / Advantage -->
    <section class="py-32 bg-white text-luxury-charcoal">
        <div class="container mx-auto px-6 max-w-7xl">
            <div class="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-200 pb-8">
                <h2 class="text-5xl font-serif">The <span class="italic text-luxury-gold">Advantage</span></h2>
                <p class="max-w-md text-sm text-gray-500 mt-4 md:mt-0 leading-relaxed">
                    Combining traditional brokerage with modern digital marketing strategies.
                </p>
            </div>
            
            <div id="services-grid" class="grid grid-cols-1 md:grid-cols-3 gap-12">
                <!-- Services injected via JS -->
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="bg-luxury-black text-white pt-24 pb-8 border-t border-white/10">
        <div class="container mx-auto px-6 max-w-7xl">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                <div class="lg:col-span-2">
                    <h2 id="footer-name" class="text-4xl font-serif mb-2"></h2>
                    <p id="footer-brokerage" class="text-luxury-gold text-sm tracking-widest uppercase mb-8"></p>
                    <p class="text-white/50 text-sm leading-relaxed max-w-md mb-8">
                        Elevating the real estate experience through integrity, innovation, and exclusive market access.
                    </p>
                </div>
                
                <div>
                    <h4 class="text-xs font-bold tracking-widest uppercase mb-6 text-white/40">Contact</h4>
                    <ul class="space-y-4 font-light">
                        <li><a id="footer-email" href="" class="hover:text-luxury-gold transition-colors"></a></li>
                        <li><a id="footer-phone" href="" class="hover:text-luxury-gold transition-colors"></a></li>
                        <li id="footer-note" class="text-white/50 text-sm pt-2"></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="text-xs font-bold tracking-widest uppercase mb-6 text-white/40">Social</h4>
                    <div class="flex space-x-6 text-xl">
                        <a id="link-insta" href="#" class="hover:text-luxury-gold transition-colors"><i class="fab fa-instagram"></i></a>
                        <a id="link-linkedin" href="#" class="hover:text-luxury-gold transition-colors"><i class="fab fa-linkedin"></i></a>
                        <a id="link-zillow" href="#" class="hover:text-luxury-gold transition-colors"><i class="fas fa-home"></i></a>
                    </div>
                </div>
            </div>
            
            <div class="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-[10px] tracking-widest uppercase text-white/30">
                <p>&copy; <span id="copyright-year"></span> <span id="copyright-name"></span></p>
                <p class="mt-2 md:mt-0">Luxury Real Estate Template</p>
            </div>
        </div>
    </footer>

    {{AGENT_CONFIG_SCRIPT}}
    
    <script>
        // --- Data Injection & Logic ---
        document.addEventListener("DOMContentLoaded", () => {
            if(typeof agentConfig === \'undefined\') return;

            // General
            document.title = agentConfig.name + " | Luxury Real Estate";
            document.getElementById(\'nav-agent-name\').innerText = agentConfig.name;
            document.getElementById(\'nav-brokerage\').innerText = agentConfig.brokerage;
            document.getElementById(\'footer-name\').innerText = agentConfig.name;
            document.getElementById(\'footer-brokerage\').innerText = agentConfig.brokerage;
            document.getElementById(\'copyright-name\').innerText = agentConfig.name;
            document.getElementById(\'copyright-year\').innerText = new Date().getFullYear();

            // Hero
            // document.getElementById(\'hero-headline\').innerHTML = agentConfig.hero.headline; // Replaced by typewriter
            document.getElementById(\'hero-bg\').style.backgroundImage = "url(\'" + agentConfig.hero.backgroundImage + "\')";

            // Typewriter Effect
            const headlineText = agentConfig.hero.headline.replace(/<br>/g, \' \'); // Strip HTML for typewriter, or handle differently
            const headlineEl = document.getElementById(\'hero-headline\');
            headlineEl.innerHTML = \'\'; // Clear initial text
            headlineEl.classList.add(\'typewriter-cursor\');
            
            let charIndex = 0;
            const fullText = "Redefining Luxury Living"; // Use static or dynamic text. 
            // Note: agentConfig.hero.headline might contain HTML like <span class="italic">. 
            // For true typewriter with HTML, we need a parser. 
            // For simplicity, let\'s type the plain text part or a fixed string, 
            // OR we can type into the element text content.
            
            // Let\'s type the first part, then fade in the second part?
            // Or just type the text content.
            
            // Better approach for this specific template which has "Redefining <br> <span...>Luxury Living</span>"
            // We will type the "Redefining" part, then reveal the rest?
            
            // Let\'s implement the generic requested function:
            function typeWriter(text, element, speed = 100) {
                let i = 0;
                element.innerHTML = \'\';
                function type() {
                    if (i < text.length) {
                        element.innerHTML += text.charAt(i);
                        i++;
                        setTimeout(type, Math.random() * (speed - 30) + 30);
                    }
                }
                type();
            }

            // Using the requested logic on the headline
            // We will clear the complex HTML and just type a simple version for this demo, 
            // OR we can type the first line "Redefining" and then fade in the rest.
            
            // Let\'s modify the hero HTML structure slightly to separate the typed part
            headlineEl.innerHTML = \'<span id="typed-text"></span><br><span class="italic text-luxury-gold opacity-0 transition-opacity duration-1000" id="fade-text">Luxury Living</span>\';
            
            const typedSpan = document.getElementById(\'typed-text\');
            const fadeSpan = document.getElementById(\'fade-text\');
            
            let i = 0;
            const textToType = "Redefining";
            
            function type() {
                if(i < textToType.length) { 
                    typedSpan.innerHTML += textToType.charAt(i); 
                    i++; 
                    setTimeout(type, Math.floor(Math.random() * (150 - 50 + 1) + 50)); 
                } else {
                    // Finished typing, show the rest
                    fadeSpan.classList.remove(\'opacity-0\');
                    headlineEl.classList.remove(\'typewriter-cursor\'); // Stop blinking cursor
                }
            }
            
            setTimeout(type, 1000); // Start after 1s

            // Philosophy
            document.getElementById(\'phil-headline\').innerHTML = agentConfig.philosophy.headline;
            document.getElementById(\'phil-text\').innerText = agentConfig.philosophy.text;
            document.getElementById(\'phil-stat-producer\').innerText = agentConfig.philosophy.stats.producer;
            document.getElementById(\'phil-label-producer\').innerText = agentConfig.philosophy.stats.producerLabel;
            document.getElementById(\'phil-image\').src = agentConfig.philosophy.image;
            document.getElementById(\'stat-1-val\').innerText = agentConfig.philosophy.stats.years;

            // Portfolio
            document.getElementById(\'portfolio-location\').innerText = "Exclusive Listings in " + agentConfig.location;
            
            // Active
            document.getElementById(\'active-title\').innerText = agentConfig.portfolio.active.title;
            document.getElementById(\'active-specs\').innerText = agentConfig.portfolio.active.price + " • " + agentConfig.portfolio.active.specs;
            document.getElementById(\'active-img\').src = agentConfig.portfolio.active.image;

            // Sold
            document.getElementById(\'sold-title\').innerText = agentConfig.portfolio.sold.title;
            document.getElementById(\'sold-status\').innerText = agentConfig.portfolio.sold.status;
            document.getElementById(\'sold-img\').src = agentConfig.portfolio.sold.image;

            // Services
            const servicesContainer = document.getElementById(\'services-grid\');
            servicesContainer.innerHTML = \'\'; // Clear defaults
            agentConfig.services.forEach((service) => {
                const html = \`
                    <div class="group p-6 hover:bg-gray-50 transition-colors duration-300 border-l-2 border-transparent hover:border-luxury-gold">
                        <div class="text-luxury-gold text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                            <i class="fas \${service.icon}"></i>
                        </div>
                        <h3 class="font-serif text-2xl mb-3 text-luxury-charcoal">\${service.title}</h3>
                        <p class="text-sm text-gray-500 leading-relaxed">\${service.desc}</p>
                    </div>
                \`;
                servicesContainer.innerHTML += html;
            });

            // Contact
            document.getElementById(\'footer-email\').innerText = agentConfig.email;
            document.getElementById(\'footer-email\').href = "mailto:" + agentConfig.email;
            document.getElementById(\'footer-phone\').innerText = agentConfig.phone;
            document.getElementById(\'footer-phone\').href = "tel:" + agentConfig.phoneClean;
            document.getElementById(\'footer-note\').innerHTML = agentConfig.location + "<br>" + agentConfig.brokerPageNote;
            
            document.getElementById(\'link-insta\').href = agentConfig.social.instagram;
            document.getElementById(\'link-linkedin\').href = agentConfig.social.linkedin;
            document.getElementById(\'link-zillow\').href = agentConfig.social.zillow;

            // Scroll Animation Observer
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(\'visible\');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll(\'.reveal-on-scroll\').forEach(el => observer.observe(el));
            
            // Navbar Scroll Effect
            window.addEventListener(\'scroll\', () => {
                const nav = document.getElementById(\'navbar\');
                if (window.scrollY > 50) {
                    nav.classList.add(\'bg-luxury-black/90\', \'backdrop-blur-md\', \'py-4\', \'shadow-lg\');
                    nav.classList.remove(\'py-6\');
                } else {
                    nav.classList.remove(\'bg-luxury-black/90\', \'backdrop-blur-md\', \'py-4\', \'shadow-lg\');
                    nav.classList.add(\'py-6\');
                }

                // Donut Chart Scroll Logic
                const section = document.getElementById(\'market-trends\');
                if (section) {
                    const rect = section.getBoundingClientRect();
                    const viewHeight = window.innerHeight;
                    const sectionHeight = section.offsetHeight;
                    
                    // Calculate how far we are into the section
                    // We start counting when top enters view, and finish when bottom leaves view?
                    // Or standard scrollytelling: 0% at top of viewport, 100% when scrolled past
                    
                    // Using the provided logic: Math.abs(rect.top) / (sectionHeight - viewHeight)
                    // This assumes the section is taller than the viewport and we want to track progress while it\'s passing through
                    
                    if (rect.top <= viewHeight / 2 && rect.bottom >= 0) {
                        let ratio = Math.abs(rect.top - (viewHeight / 2)) / (sectionHeight / 1.5);
                        
                        // Clamp ratio between 0 and 1
                        ratio = Math.max(0, Math.min(1, ratio));
                        
                        updateRing(ratio);
                    }
                }
            });

            function updateRing(percent) {
                const circle = document.getElementById(\'scroll-ring\');
                const text = document.getElementById(\'chart-percentage\');
                const circumference = 283;
                
                const offset = circumference - (percent * circumference);
                circle.style.strokeDashoffset = offset;
                text.innerText = Math.round(percent * 100) + \'%\';
            }
        });
    </script>
</body>
</html>',
  true
);
