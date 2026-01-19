
export const LUXURY_REAL_ESTATE_TEMPLATE = `<html lang="en" class="scroll-smooth"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KONTAKO | Future Living</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest"></script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600&display=swap');
body { font-family: 'Manrope', sans-serif; }
/* Hide scrollbar for clean UI */
::-webkit-scrollbar { width: 0px; background: transparent; }
/* Custom Checkbox/Radio Styles */
.custom-radio:checked + div {
background-color: white;
color: black;
border-color: white;
}
/* Form Autofill Styling Fix for Dark Mode */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
textarea:-webkit-autofill,
textarea:-webkit-autofill:hover,
textarea:-webkit-autofill:focus {
-webkit-text-fill-color: white;
-webkit-box-shadow: 0 0 0px 1000px #1a1a1a inset;
transition: background-color 5000s ease-in-out 0s;
}
</style></head>
<body class="bg-[#0f0f0f] text-white antialiased selection:bg-[#ff4d1c] selection:text-white overflow-x-hidden">

    <!-- 1. Header -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 transition-all duration-300 backdrop-blur-sm bg-gradient-to-b from-black/50 to-transparent">
        <!-- Left -->
        <button class="group flex items-center gap-2 text-xs uppercase tracking-widest hover:text-[#ff4d1c] transition-colors">
            <span class="block w-6 h-[1.5px] bg-white group-hover:bg-[#ff4d1c] transition-colors"></span>
            Menu
        </button>

        <!-- Center -->
        <div class="absolute left-1/2 -translate-x-1/2 font-semibold tracking-[0.2em] text-sm uppercase">
            Kontako
        </div>

        <!-- Right -->
        <a href="#contact" class="bg-[#ff4d1c] hover:bg-[#ff3300] text-white text-xs font-semibold px-6 py-3 rounded-full uppercase tracking-wider transition-transform hover:scale-105">
            Contact Us
        </a>
    </header>

    <!-- 2. Hero Section -->
    <section class="relative h-screen w-full overflow-hidden flex flex-col justify-end pb-12 md:pb-24">
        <!-- Background Image -->
        <div class="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&amp;w=2070&amp;auto=format&amp;fit=crop" alt="Luxury Glass House" class="w-full h-full object-cover brightness-[0.7]">
            <div class="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent"></div>
        </div>

        <!-- Content -->
        <div class="relative z-10 px-6 md:px-12 w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8">
            <div class="max-w-4xl">
                <h1 class="text-5xl md:text-7xl lg:text-8xl font-semibold uppercase leading-[0.9] tracking-tighter text-white mb-6">
                    The Future <br>
                    of Home Living<span class="text-[#ff4d1c]">.</span>
                </h1>
                <p class="text-neutral-300 text-sm md:text-base max-w-md font-light leading-relaxed">
                    Trust us with your dreams! We are ready to help you build the dream property that will be your future sanctuary.
                </p>
            </div>
            
            <!-- Circular Button -->
            <a href="#vision" class="group relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-[#ff4d1c] rounded-full transition-transform hover:scale-110 hover:rotate-45">
                <i data-lucide="arrow-up-right" class="w-8 h-8 text-white stroke-[1.5]"></i>
            </a>
        </div>
    </section>

    <!-- 3. Vision / Quote Section -->
    <section id="vision" class="bg-[#f5f5f5] text-[#0f0f0f] py-24 md:py-32 px-6 md:px-12">
        <div class="max-w-4xl mx-auto text-center">
            <span class="text-[#ff4d1c] text-xs font-semibold tracking-widest uppercase mb-8 block">Fulfil Your Dreams</span>
            
            <h2 class="text-2xl md:text-4xl lg:text-5xl font-medium leading-tight tracking-tight mb-12">
                “Kontako is committed to providing the best service in meeting your property needs for your future.”
            </h2>

            <div class="flex flex-col items-center gap-4">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&amp;fit=crop&amp;q=80&amp;w=200&amp;h=200" alt="Founder" class="w-16 h-16 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500">
                <div class="text-center">
                    <p class="text-sm font-semibold text-[#0f0f0f]">Kianna Curtis</p>
                    <p class="text-xs text-neutral-500 uppercase tracking-wide mt-1">Founder of Kontako</p>
                </div>
            </div>
        </div>
    </section>

    <!-- 4. Advantages Section -->
    <section class="bg-[#f5f5f5] text-[#0f0f0f] pb-24 md:pb-32 px-6 md:px-12">
        <div class="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            
            <!-- Left: List -->
            <div class="lg:col-span-4 flex flex-col pt-12">
                <p class="text-[#ff4d1c] text-xs font-semibold tracking-widest uppercase mb-8">Our Advantages</p>
                
                <div class="flex flex-col border-t border-neutral-300">
                    <div class="group py-6 border-b border-neutral-300 flex justify-between items-center cursor-pointer hover:pl-4 transition-all duration-300">
                        <span class="text-xs md:text-sm font-medium uppercase text-neutral-400 group-hover:text-black">Modern Architecture &amp; Tech</span>
                    </div>
                    <div class="group py-6 border-b border-neutral-300 flex justify-between items-center cursor-pointer hover:pl-4 transition-all duration-300">
                        <span class="text-xs md:text-sm font-medium uppercase text-neutral-400 group-hover:text-black">Efficient Layout Design</span>
                    </div>
                    <div class="py-6 border-b border-neutral-300 flex justify-between items-center bg-neutral-100 -mx-4 px-4 shadow-sm">
                        <span class="text-xs md:text-sm font-semibold uppercase text-black">Short Implementation Time</span>
                        <i data-lucide="arrow-right" class="w-4 h-4 text-[#ff4d1c]"></i>
                    </div>
                    <div class="group py-6 border-b border-neutral-300 flex justify-between items-center cursor-pointer hover:pl-4 transition-all duration-300">
                        <span class="text-xs md:text-sm font-medium uppercase text-neutral-400 group-hover:text-black">Years of Guarantee</span>
                    </div>
                    <div class="group py-6 border-b border-neutral-300 flex justify-between items-center cursor-pointer hover:pl-4 transition-all duration-300">
                        <span class="text-xs md:text-sm font-medium uppercase text-neutral-400 group-hover:text-black">Modular Architecture</span>
                    </div>
                </div>
            </div>

            <!-- Right: Image -->
            <div class="lg:col-span-8 relative group overflow-hidden">
                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&amp;w=2053&amp;auto=format&amp;fit=crop" alt="Modern House Detail" class="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <h3 class="absolute top-12 right-12 text-white text-3xl md:text-5xl font-semibold uppercase text-right leading-none tracking-tight max-w-lg">
                    Take a big step<br>into the future<br>of living
                </h3>
                <div class="absolute bottom-12 left-12 w-16 h-16 border border-white/30 flex items-center justify-center backdrop-blur-md">
                     <span class="text-white text-xs font-mono">04</span>
                </div>
            </div>
        </div>
    </section>

    <!-- 5. Innovation Section -->
    <section class="bg-[#141414] py-24 md:py-32 px-6 md:px-12 border-t border-white/5">
        <div class="max-w-screen-2xl mx-auto">
            <span class="text-[#ff4d1c] text-xs font-semibold tracking-widest uppercase mb-12 block">Innovation On Multiple Levels</span>
            
            <div class="flex flex-col lg:flex-row h-auto lg:h-[600px] gap-0 border-t border-b border-white/10">
                
                <!-- Active Panel (Expanded) -->
                <div class="flex-1 border-r border-white/10 p-8 md:p-12 flex flex-col justify-between relative group">
                    <div>
                        <h3 class="text-3xl md:text-5xl font-semibold uppercase leading-none tracking-tight mb-4 text-white">Comfort <br>&amp; Space</h3>
                    </div>
                    
                    <div class="relative w-full h-64 mt-8 overflow-hidden">
                         <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&amp;fit=crop&amp;q=80&amp;w=800" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                    </div>

                    <div class="flex justify-between items-end mt-8">
                        <span class="text-white/40 text-sm font-mono">01</span>
                        <p class="text-xs text-white/60 max-w-[200px] text-right">Alkan house is an 84 m2 residential space with optimal layout.</p>
                    </div>
                </div>

                <!-- Inactive Strips -->
                <div class="w-full lg:w-20 border-b lg:border-b-0 lg:border-r border-white/10 relative hover:bg-white/5 transition-colors cursor-pointer group flex lg:block justify-between items-center p-6 lg:p-0">
                    <span class="lg:absolute lg:top-8 lg:left-1/2 lg:-translate-x-1/2 text-white/40 font-mono text-sm">02</span>
                    <span class="lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:-rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors">Quality &amp; Craftsmanship</span>
                </div>

                <div class="w-full lg:w-20 border-b lg:border-b-0 lg:border-r border-white/10 relative hover:bg-white/5 transition-colors cursor-pointer group flex lg:block justify-between items-center p-6 lg:p-0">
                    <span class="lg:absolute lg:top-8 lg:left-1/2 lg:-translate-x-1/2 text-white/40 font-mono text-sm">03</span>
                    <span class="lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:-rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors">Web3 Ownership</span>
                </div>

                <div class="w-full lg:w-20 border-b lg:border-b-0 lg:border-r border-white/10 relative hover:bg-white/5 transition-colors cursor-pointer group flex lg:block justify-between items-center p-6 lg:p-0">
                    <span class="lg:absolute lg:top-8 lg:left-1/2 lg:-translate-x-1/2 text-white/40 font-mono text-sm">04</span>
                    <span class="lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:-rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors">Energy Net Zero</span>
                </div>

                <div class="w-full lg:w-20 border-b lg:border-b-0 lg:border-r border-white/10 relative hover:bg-white/5 transition-colors cursor-pointer group flex lg:block justify-between items-center p-6 lg:p-0">
                    <span class="lg:absolute lg:top-8 lg:left-1/2 lg:-translate-x-1/2 text-white/40 font-mono text-sm">05</span>
                    <span class="lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:-rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors">Marketplace</span>
                </div>
                 <div class="w-full lg:w-20 relative hover:bg-white/5 transition-colors cursor-pointer group flex lg:block justify-between items-center p-6 lg:p-0">
                    <span class="lg:absolute lg:top-8 lg:left-1/2 lg:-translate-x-1/2 text-white/40 font-mono text-sm">06</span>
                    <span class="lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:-rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors">Affordable Prices</span>
                </div>

            </div>
        </div>
    </section>

    <!-- 6. Projects Section -->
    <section class="bg-[#f5f5f5] text-[#0f0f0f] py-24 md:py-32 px-6 md:px-12">
        <div class="max-w-screen-2xl mx-auto">
            <span class="text-[#ff4d1c] text-xs font-semibold tracking-widest uppercase mb-12 block">Our Projects</span>

            <!-- Main Project Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-300 pb-8 mb-12">
                <h2 class="text-4xl md:text-6xl font-medium uppercase tracking-tight">Pedro Residence</h2>
                <div class="mt-6 md:mt-0 flex gap-6 items-center">
                    <p class="text-xs md:text-sm text-neutral-500 max-w-xs text-right">
                        Pedro Residence is a comfortable and elegant residence, offering spectacular views from its windows.
                    </p>
                    <div class="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-[#ff4d1c] hover:border-[#ff4d1c] hover:text-white transition-all cursor-pointer">
                        <i data-lucide="arrow-up-right" class="w-5 h-5"></i>
                    </div>
                </div>
            </div>

            <!-- Image Gallery Grid -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 mb-24">
                <div class="md:col-span-3 h-64 md:h-96 relative overflow-hidden group">
                     <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&amp;fit=crop&amp;q=80&amp;w=800" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                     <span class="absolute top-4 left-4 text-xs font-mono text-white mix-blend-difference">01</span>
                </div>
                <div class="md:col-span-4 h-64 md:h-96 relative overflow-hidden mt-0 md:mt-12 group">
                     <img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&amp;fit=crop&amp;q=80&amp;w=800" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0">
                      <span class="absolute top-4 left-4 text-xs font-mono text-white mix-blend-difference">02</span>
                </div>
                 <div class="md:col-span-5 h-64 md:h-96 relative overflow-hidden group">
                     <img src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&amp;fit=crop&amp;q=80&amp;w=800" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                      <span class="absolute top-4 left-4 text-xs font-mono text-white mix-blend-difference">03</span>
                </div>
            </div>

            <!-- List of other projects -->
            <div class="flex flex-col border-t border-neutral-300">
                <a href="#" class="group py-10 border-b border-neutral-300 flex justify-between items-center">
                    <h3 class="text-2xl md:text-4xl font-light text-neutral-400 uppercase group-hover:text-black group-hover:font-normal transition-all tracking-tight">Sunset Plaza Drive</h3>
                    <span class="text-sm font-mono text-neutral-400">02</span>
                </a>
                
                <a href="#" class="group relative py-10 border-b border-neutral-300 flex justify-between items-center overflow-hidden">
                    <h3 class="relative z-10 text-2xl md:text-4xl font-light text-neutral-400 uppercase group-hover:text-white group-hover:font-normal transition-all tracking-tight mix-blend-difference">High-End Villa Overlooking</h3>
                    <span class="relative z-10 text-sm font-mono text-neutral-400 group-hover:text-white mix-blend-difference">03</span>
                    <div class="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <img src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&amp;fit=crop&amp;q=80&amp;w=2000" class="w-full h-full object-cover object-center">
                         <div class="absolute inset-0 bg-black/40"></div>
                    </div>
                </a>

                <a href="#" class="group py-10 border-b border-neutral-300 flex justify-between items-center">
                    <h3 class="text-2xl md:text-4xl font-light text-neutral-400 uppercase group-hover:text-black group-hover:font-normal transition-all tracking-tight">Cliffwood Avenue</h3>
                    <span class="text-sm font-mono text-neutral-400">04</span>
                </a>
            </div>
        </div>
    </section>

    <!-- 7. FAQ Section -->
    <section class="bg-[#f5f5f5] text-[#0f0f0f] pb-24 md:pb-32 px-6 md:px-12">
        <div class="max-w-3xl mx-auto">
            <div class="text-center mb-16">
                 <span class="text-[#ff4d1c] text-xs font-semibold tracking-widest uppercase mb-4 block">FAQs</span>
                 <h2 class="text-3xl md:text-4xl font-medium uppercase tracking-tight">Common Questions</h2>
            </div>

            <div class="space-y-4">
                <details class="group border-b border-neutral-300 pb-4">
                    <summary class="flex justify-between items-center cursor-pointer py-4 list-none">
                        <span class="text-lg md:text-xl font-light group-hover:text-[#ff4d1c] transition-colors">Can the house be modified?</span>
                        <span class="transition group-open:rotate-180">
                            <i data-lucide="chevron-down" class="w-5 h-5 text-neutral-400"></i>
                        </span>
                    </summary>
                    <div class="text-neutral-500 text-sm md:text-base leading-relaxed mt-2 pl-0">
                        No. Without losing the warranty, modifications are not allowed and any modifications made will void the warranty on our workmanship. However, custom furniture can be installed.
                    </div>
                </details>

                <details class="group border-b border-neutral-300 pb-4">
                    <summary class="flex justify-between items-center cursor-pointer py-4 list-none">
                        <span class="text-lg md:text-xl font-light group-hover:text-[#ff4d1c] transition-colors">How does the construction process work?</span>
                        <span class="transition group-open:rotate-180">
                            <i data-lucide="chevron-down" class="w-5 h-5 text-neutral-400"></i>
                        </span>
                    </summary>
                    <div class="text-neutral-500 text-sm md:text-base leading-relaxed mt-2">
                        We begin with site analysis, followed by modular fabrication in our facility, and finally, rapid on-site assembly.
                    </div>
                </details>

                <details class="group border-b border-neutral-300 pb-4">
                    <summary class="flex justify-between items-center cursor-pointer py-4 list-none">
                        <span class="text-lg md:text-xl font-light group-hover:text-[#ff4d1c] transition-colors">Does the building site need to be equipped?</span>
                        <span class="transition group-open:rotate-180">
                            <i data-lucide="chevron-down" class="w-5 h-5 text-neutral-400"></i>
                        </span>
                    </summary>
                    <div class="text-neutral-500 text-sm md:text-base leading-relaxed mt-2">
                        Yes, basic foundation and utility connections must be prepared according to our technical specifications before delivery.
                    </div>
                </details>
            </div>
        </div>
    </section>

    <!-- 8. Contact Form Section -->
    <section id="contact" class="bg-[#141414] py-24 md:py-32 px-6 md:px-12 relative overflow-hidden border-t border-white/5">
        <div class="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            <!-- Left: Info -->
            <div class="flex flex-col justify-between">
                <div>
                    <h2 class="text-4xl md:text-6xl lg:text-7xl font-semibold uppercase leading-[0.9] tracking-tighter text-white mb-8">
                        Let's build <br> your future<span class="text-[#ff4d1c]">.</span>
                    </h2>
                    <p class="text-neutral-400 text-sm md:text-base font-light leading-relaxed max-w-md">
                        Have a project in mind? Fill out the form and our team of architects and engineers will get back to you within 24 hours.
                    </p>
                </div>
                
                <div class="space-y-6 mt-12 lg:mt-0">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#ff4d1c]">
                            <i data-lucide="mail" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <p class="text-xs text-neutral-500 uppercase tracking-widest">Email Us</p>
                            <a href="mailto:hello@kontako.com" class="text-white hover:text-[#ff4d1c] transition-colors">hello@kontako.com</a>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#ff4d1c]">
                            <i data-lucide="phone" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <p class="text-xs text-neutral-500 uppercase tracking-widest">Call Us</p>
                            <a href="tel:+1234567890" class="text-white hover:text-[#ff4d1c] transition-colors">+1 (555) 123-4567</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Form -->
            <div class="bg-[#1a1a1a] p-8 md:p-10 border border-white/5 rounded-2xl shadow-2xl">
                <form onsubmit="handleForm(event)" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Name -->
                        <div class="space-y-2">
                            <label for="name" class="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Name</label>
                            <input type="text" id="name" required="" class="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4d1c] focus:ring-1 focus:ring-[#ff4d1c] transition-all placeholder:text-neutral-600" placeholder="John Doe">
                        </div>
                        <!-- Email -->
                        <div class="space-y-2">
                            <label for="email" class="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Email</label>
                            <input type="email" id="email" required="" class="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4d1c] focus:ring-1 focus:ring-[#ff4d1c] transition-all placeholder:text-neutral-600" placeholder="john@example.com">
                        </div>
                    </div>

                    <!-- Phone -->
                    <div class="space-y-2">
                        <label for="phone" class="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Phone</label>
                        <input type="tel" id="phone" class="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4d1c] focus:ring-1 focus:ring-[#ff4d1c] transition-all placeholder:text-neutral-600" placeholder="+1 (555) 000-0000">
                    </div>

                    <!-- Project Type (Custom Radio) -->
                    <div class="space-y-3">
                        <span class="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Project Type</span>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <label class="cursor-pointer">
                                <input type="radio" name="project_type" value="residential" class="custom-radio hidden" checked="">
                                <div class="text-center py-2 px-1 border border-white/10 rounded-md text-xs text-neutral-400 hover:border-white/30 transition-all">Residential</div>
                            </label>
                            <label class="cursor-pointer">
                                <input type="radio" name="project_type" value="commercial" class="custom-radio hidden">
                                <div class="text-center py-2 px-1 border border-white/10 rounded-md text-xs text-neutral-400 hover:border-white/30 transition-all">Commercial</div>
                            </label>
                            <label class="cursor-pointer">
                                <input type="radio" name="project_type" value="renovation" class="custom-radio hidden">
                                <div class="text-center py-2 px-1 border border-white/10 rounded-md text-xs text-neutral-400 hover:border-white/30 transition-all">Renovation</div>
                            </label>
                            <label class="cursor-pointer">
                                <input type="radio" name="project_type" value="other" class="custom-radio hidden">
                                <div class="text-center py-2 px-1 border border-white/10 rounded-md text-xs text-neutral-400 hover:border-white/30 transition-all">Other</div>
                            </label>
                        </div>
                    </div>

                    <!-- Message -->
                    <div class="space-y-2">
                        <label for="message" class="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Message</label>
                        <textarea id="message" required="" rows="4" class="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4d1c] focus:ring-1 focus:ring-[#ff4d1c] transition-all placeholder:text-neutral-600 resize-none" placeholder="Tell us about your project details..."></textarea>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" id="submitBtn" class="w-full bg-[#ff4d1c] hover:bg-[#ff3300] text-white font-semibold py-4 rounded-lg uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 mt-4 group">
                        <span>Send Message</span>
                        <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </form>
            </div>
        </div>
    </section>

    <!-- 9. Footer -->
    <footer class="bg-[#0f0f0f] border-t border-white/10 pt-16 pb-8 px-6 md:px-12 text-white">
        <div class="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            
            <div class="max-w-sm">
                <p class="font-semibold tracking-[0.2em] text-sm uppercase mb-6">Kontako</p>
                <h3 class="text-2xl font-medium uppercase text-neutral-400 leading-tight">
                    The Future of <br> <span class="text-white">Home Living</span>
                </h3>
            </div>

            <div class="flex gap-8 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" class="hover:text-white transition-colors">Terms &amp; Condition</a>
                <a href="#" class="hover:text-white transition-colors">About Us</a>
                <a href="#" class="hover:text-white transition-colors">FAQ</a>
            </div>

            <div class="flex gap-4">
                <a href="#" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#ff4d1c] transition-colors group">
                    <i data-lucide="instagram" class="w-4 h-4 text-white/60 group-hover:text-white"></i>
                </a>
                <a href="#" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#ff4d1c] transition-colors group">
                    <i data-lucide="facebook" class="w-4 h-4 text-white/60 group-hover:text-white"></i>
                </a>
                <a href="#" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#ff4d1c] transition-colors group">
                    <i data-lucide="twitter" class="w-4 h-4 text-white/60 group-hover:text-white"></i>
                </a>
                <a href="#" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#ff4d1c] transition-colors group">
                    <i data-lucide="youtube" class="w-4 h-4 text-white/60 group-hover:text-white"></i>
                </a>
            </div>
        </div>

        <div class="max-w-screen-2xl mx-auto mt-16 pt-8 border-t border-white/5 text-center md:text-right">
            <p class="text-[10px] text-neutral-600 uppercase tracking-wider">© 2023 Skywinks Inc. All Rights Reserved.</p>
        </div>
    </footer>

    <script>
        lucide.createIcons();

        function handleForm(e) {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const originalContent = btn.innerHTML;
            
            // Loading State
            btn.innerHTML = '<span class="animate-pulse">Sending...</span>';
            btn.classList.add('opacity-75', 'cursor-not-allowed');
            
            // Simulate API Call
            setTimeout(() => {
                // Success State
                btn.innerHTML = `
    < span > Message Sent</span>
        < svg xmlns = "http://www.w3.org/2000/svg" width = "16" height = "16" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" stroke - width="2" stroke - linecap="round" stroke - linejoin="round" > <polyline points="20 6 9 17 4 12" > </polyline></svg >
                `;
                btn.classList.remove('bg-[#ff4d1c]', 'hover:bg-[#ff3300]', 'opacity-75', 'cursor-not-allowed');
                btn.classList.add('bg-green-600', 'hover:bg-green-700');

                // Reset form
                e.target.reset();

                // Reset Button after delay
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.classList.remove('bg-green-600', 'hover:bg-green-700');
                    btn.classList.add('bg-[#ff4d1c]', 'hover:bg-[#ff3300]');
                    lucide.createIcons(); // Re-init icon inside button
                }, 3000);
            }, 1500);
        }
    </script>

</body></html>
