
export const KONTAKO_TEMPLATE = `<!DOCTYPE html> 
 <html lang="en" class="scroll-smooth"> 
 <head> 
     <meta charset="UTF-8"> 
     <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
     <title>{{site_title}} | {{tagline}}</title> 
     <meta name="description" content="{{meta_description}}"> 
     <script src="https://cdn.tailwindcss.com"></script> 
     <script src="https://unpkg.com/lucide@latest"></script> 
     </head> 
 <body class="bg-[#0f0f0f] text-white antialiased"> 
  
     <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 backdrop-blur-sm"> 
         <button class="group flex items-center gap-2 text-xs uppercase tracking-widest hover:text-[{{accent_color}}]"> 
             <span class="block w-6 h-[1.5px] bg-white group-hover:bg-[{{accent_color}}]"></span> 
             Menu 
         </button> 
         <div class="absolute left-1/2 -translate-x-1/2 font-semibold tracking-[0.2em] text-sm uppercase"> 
             {{brand_name}} 
         </div> 
         <a href="#contact" class="bg-[{{accent_color}}] hover:opacity-90 text-white text-xs font-semibold px-6 py-3 rounded-full uppercase tracking-wider"> 
             Contact Us 
         </a> 
     </header> 
  
     <section class="relative h-screen w-full overflow-hidden flex flex-col justify-end pb-12 md:pb-24"> 
         <div class="absolute inset-0 z-0"> 
             <img src="{{hero_image}}" alt="Hero" class="w-full h-full object-cover brightness-[0.7]"> 
             <div class="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent"></div> 
         </div> 
         <div class="relative z-10 px-6 md:px-12 w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8"> 
             <div class="max-w-4xl"> 
                 <h1 class="text-5xl md:text-7xl lg:text-8xl font-semibold uppercase leading-[0.9] tracking-tighter text-white mb-6"> 
                     {{{hero_headline}}} <span class="text-[{{accent_color}}]">.</span> 
                 </h1> 
                 <p class="text-neutral-300 text-sm md:text-base max-w-md font-light leading-relaxed"> 
                     {{hero_subtext}} 
                 </p> 
             </div> 
         </div> 
     </section> 
  
     <section class="bg-[#f5f5f5] text-[#0f0f0f] py-24 md:py-32 px-6 md:px-12"> 
         <div class="max-w-screen-2xl mx-auto"> 
             <span class="text-[{{accent_color}}] text-xs font-semibold tracking-widest uppercase mb-12 block">Our Projects</span> 
              
             <div class="grid grid-cols-1 md:grid-cols-12 gap-6 mb-24"> 
                 {{#each projects}} 
                 <div class="{{this.grid_class}} h-64 md:h-96 relative overflow-hidden group"> 
                      <img src="{{this.image}}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"> 
                      <span class="absolute top-4 left-4 text-xs font-mono text-white mix-blend-difference">{{this.number}}</span> 
                      <div class="absolute bottom-4 left-4 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity"> 
                         {{this.title}} 
                      </div> 
                 </div> 
                 {{/each}} 
             </div> 
         </div> 
     </section> 
  
     <section id="contact" class="bg-[#141414] py-24 border-t border-white/5"> 
         <div class="max-w-screen-2xl mx-auto"> 
             <h2 class="text-4xl font-semibold uppercase text-white mb-8"> 
                 Let's build <br> your future<span class="text-[{{accent_color}}]">.</span> 
             </h2> 
             <div class="flex flex-col gap-4"> 
                 <a href="mailto:{{contact_email}}" class="text-white hover:text-[{{accent_color}}]">{{contact_email}}</a> 
                 <a href="tel:{{contact_phone}}" class="text-white hover:text-[{{accent_color}}]">{{contact_phone}}</a> 
             </div> 
         </div> 
     </section> 
  
     <script>lucide.createIcons();</script> 
 </body> 
 </html>`;
