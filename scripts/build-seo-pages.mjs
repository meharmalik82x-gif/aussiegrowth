// Builds the search landing pages, sitemap.xml, llms.txt and llms-full.txt.
// Run after editing the page data below:  node scripts/build-seo-pages.mjs   (idempotent)
// The shell (loader, header, menu, footer, scripts) is copied from growth/index.html so it never drifts.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { faqs as homeFaqs } from '../js/content.js';

const SITE = 'https://www.aussiegrowth.agency';
const ORG_ID = SITE + '/#organization';
const TODAY = '2026-10-16';
const PHONE = '+61 493 721 273';
const EMAIL = 'meharmalik2026@gmail.com';
const root = (p) => new URL('../' + p, import.meta.url);
const read = (p) => readFileSync(root(p), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (h) => h.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

const IMG = {
  ads: { webp: ['/assets/images/services/aussie-growth-paid-ads-800.webp 800w', '/assets/images/services/aussie-growth-paid-ads-1600.webp 1600w'], jpg: '/assets/images/services/aussie-growth-paid-ads-800.jpg', w: 1600, h: 893, alt: 'Someone on their couch in the evening, scrolling on their phone' },
  auto: { webp: ['/assets/images/services/aussie-growth-automation-800.webp 800w', '/assets/images/services/aussie-growth-automation-1600.webp 1600w'], jpg: '/assets/images/services/aussie-growth-automation-800.jpg', w: 1600, h: 893, alt: 'A phone lighting up with a new notification on a workbench while a tradie keeps working behind it' },
  trades: { webp: ['/assets/images/about/aussie-growth-tradies-800.webp 800w', '/assets/images/about/aussie-growth-tradies-1400.webp 1400w'], jpg: '/assets/images/about/aussie-growth-tradies-800.jpg', w: 1400, h: 781, alt: 'A builder marking up plans on a workbench inside a timber house frame' },
  local: { webp: ['/assets/images/about/aussie-growth-local-business-800.webp 800w', '/assets/images/about/aussie-growth-local-business-1400.webp 1400w'], jpg: '/assets/images/about/aussie-growth-local-business-800.jpg', w: 1400, h: 781, alt: 'A cafe owner carrying the footpath sign out as the shop opens for the morning' },
  street: { webp: ['/assets/images/brand/aussie-growth-morning-street-800.webp 800w', '/assets/images/brand/aussie-growth-morning-street-1600.webp 1600w'], jpg: '/assets/images/brand/aussie-growth-morning-street-800.jpg', w: 1600, h: 893, alt: 'A quiet Australian main street early in the morning' },
  silk: { webp: ['/assets/projects/silk-sm.webp 640w', '/assets/projects/silk.webp 1200w'], jpg: '/assets/projects/silk.jpg', w: 1200, h: 750, alt: 'Silk Building Group website homepage, built by Aussie Growth', tag: 'Silk Building Group · one of ours' },
  solar: { webp: ['/assets/projects/capital-solar-sm.webp 640w', '/assets/projects/capital-solar.webp 1200w'], jpg: '/assets/projects/capital-solar.jpg', w: 1200, h: 750, alt: 'Capital Solar Energy website, built by Aussie Growth', tag: 'Capital Solar Energy · one of ours' },
};

const FAQ_COMMON = {
  contract: { q: 'Do I need a long contract?', a: 'No. We would rather keep you because it is working than because a contract says so. We are upfront about terms before anything starts.' },
  budget: { q: 'How much should I spend on ads?', a: 'It depends on your industry, your area and how many jobs you can take on. We give you a realistic starting budget, not a made-up number designed to sound impressive.' },
  guarantee: { q: 'Do you guarantee leads or sales?', a: 'No, and be careful with anyone who does. We track enquiries, calls and bookings, tell you what we see, and keep improving the campaign.' },
};

const PAGES = [
  {
    slug: 'digital-agency',
    crumb: 'Digital Agency',
    title: 'Digital Agency in Australia | Websites, Ads & AI | Aussie Growth',
    desc: 'Aussie Growth is an Australian digital agency. We build websites, run Google and Meta ads and automate follow-up for tradies and local businesses.',
    ogDesc: 'An Australian digital agency: websites, paid ads and AI automation for tradies, home-service and local businesses.',
    h1: 'A digital agency that gets you <span class="serif">booked.</span>',
    lede: 'Aussie Growth is an Australian digital agency for tradies, home-service and local businesses. One team builds your website, runs your ads and automates your follow-up.',
    img: IMG.silk,
    schema: { type: 'WebPage', name: 'Digital agency in Australia' },
    sections: [
      { label: 'What we do', h2: 'One team. <span class="serif">Three jobs.</span>',
        paras: ['A digital agency looks after the online side of a business. For most small businesses that means three things: a website people trust, ads that put you in front of people who are looking, and a system that follows up every enquiry.', 'Aussie Growth does all three. You deal with one team, not three agencies passing the blame around.'],
        cards: [
          { n: '01 / Get seen', t: 'Web development', p: 'Custom websites, landing pages and quote forms. Mobile-first, and built to make the next step obvious.', href: '/web-development/' },
          { n: '02 / Get booked', t: 'Paid ads', p: 'Google, Meta and Instagram ads that reach people already looking, with tracking so you can see what works.', href: '/google-ads/' },
          { n: '03 / Get paid', t: 'AI and automations', p: 'CRM, instant replies, follow-up and booking automation, so good leads do not go cold.', href: '/ai-automation/' },
        ] },
      { label: 'How it works', h2: 'From first message <span class="serif">to live.</span>',
        steps: [
          ['Tell us what is going on', 'Fill in the five-question quote form. It takes about a minute.'],
          ['Get a clear recommendation', 'A real person replies with what we would do first, and a quote. No 40-slide deck.'],
          ['We build and launch', 'A website, ads, automation, or a mix. You review it before it goes live.'],
          ['We measure what happens', 'We track enquiries, calls and bookings, and tell you what we see. No made-up numbers.'],
        ] },
      { label: 'Who we help', h2: 'Built for people who <span class="serif">actually do stuff.</span>',
        paras: ['We work best with tradies and home-service businesses (builders, electricians, plumbers, landscapers, roofers, solar, HVAC and renovators) and with local businesses such as clinics, gyms, hospitality, automotive, retail and professional services. If you answer your own phone, you are our people.'],
        links: [['/tradie-websites/', 'Websites for tradies'], ['/local-business-marketing/', 'Marketing for local businesses']] },
      { label: 'Digital agency or marketing agency?', h2: 'What is the <span class="serif">difference?</span>',
        paras: ['The names overlap. A digital marketing agency usually focuses on promotion: ads, social media and content. A digital agency also builds the thing people land on: the website, the forms and the booking flow.', 'We do both sides on purpose. Ads are wasted if the website does not turn clicks into calls, and a good website does little if nobody finds it.'] },
    ],
    faqs: [
      { q: 'What does a digital agency do?', a: 'A digital agency builds and runs the online side of a business. At Aussie Growth that means websites, paid ads on Google, Meta and Instagram, and AI and automation such as CRM, instant replies and follow-up.' },
      { q: 'Is Aussie Growth a digital marketing agency?', a: 'Yes, and a bit more. We run paid ads and automation, and we also build the websites those ads send people to. Everything sits under one team.' },
      { q: 'Who does Aussie Growth work with?', a: 'Australian tradies, home-service businesses and local businesses. If you answer your own phone, you are who we build for.' },
      { q: 'How much does a digital agency cost?', a: 'It depends on what you need. Tell us what you are trying to achieve and we give you a clear quote. Two Australian businesses also get a professional website for $0 every Monday, with a short video testimonial as the one catch.' },
      FAQ_COMMON.contract,
      { q: 'Can I get just a website, or just ads?', a: 'Yes. Most people start with one thing. The three services work best together, but you can use them separately.' },
    ],
    related: ['google-ads', 'meta-ads', 'ai-automation', 'tradie-websites', 'about'],
  },
  {
    slug: 'google-ads',
    crumb: 'Google Ads',
    title: 'Google Ads Management for Tradies & Local Businesses | Aussie Growth',
    desc: 'Google Ads management for Australian tradies and local businesses. We set up, run and track campaigns that bring in calls and quote requests.',
    ogDesc: 'Google Ads for Australian tradies and local businesses. Be the business they call when they search.',
    h1: 'Google Ads that <span class="serif">ring the phone.</span>',
    lede: 'When someone searches for what you do, you want to be the business they call. We set up and run Google Ads that put you in front of people already looking.',
    img: IMG.ads,
    service: 'Google Ads management',
    sections: [
      { label: 'Why Google Ads', h2: 'Be there when they <span class="serif">search.</span>',
        paras: ['Google Ads shows your business to people at the moment they search, for example "plumber near me" or "roof repairs". People who search are usually ready to act.', 'That is why Google Ads suits tradies, home-service businesses and local operators who need the phone to ring.'] },
      { label: 'What is included', h2: 'Setup, running <span class="serif">and tracking.</span>',
        grid: [
          ['What we set up', ['Campaign strategy and structure', 'Keywords and area targeting', 'Ad copy that sounds like you', 'Conversion tracking for calls and form enquiries', 'A landing page that matches the ad', 'Ongoing optimisation']],
          ['What you get back', ['Reporting in plain English', 'Enquiries, calls and bookings tracked, not just clicks', 'A realistic starting budget', 'No long contract', 'A real person to talk to']],
        ] },
      { label: 'The landing page', h2: 'Clicks are easy. <span class="serif">Calls are the point.</span>',
        paras: ['A click costs money whether or not the visitor calls. So we send ad traffic to a page built to turn visitors into enquiries: a clear service, a clear next step, and a call button or quote form that works on a phone.', 'If you do not have that page yet, we build it.'],
        links: [['/web-development/', 'Web development'], ['/free-website/', 'The $0 website offer']] },
      { label: 'Straight talk', h2: 'No guaranteed sales. <span class="serif">No made-up numbers.</span>',
        paras: ['Nobody can honestly promise a set number of leads. We measure what happens, tell you what we see, and adjust. We would rather spend less and get more jobs than burn budget on vanity clicks.'] },
    ],
    faqs: [
      { q: 'What is Google Ads management?', a: 'It is the setup and ongoing running of your Google ads: choosing what to target, writing the ads, tracking results and improving the campaign over time.' },
      FAQ_COMMON.guarantee,
      FAQ_COMMON.budget,
      { q: 'Do I need a website first?', a: 'You need a page that turns clicks into calls. If your site does not do that, we can build one, including a $0 website for two Australian businesses every Monday.' },
      { q: 'Can you run Google Ads and Facebook ads together?', a: 'Yes. Google catches people who are searching now. Meta ads reach people before they search. Many businesses use both.' },
      FAQ_COMMON.contract,
    ],
    related: ['meta-ads', 'ai-automation', 'digital-agency', 'tradie-websites'],
  },
  {
    slug: 'meta-ads',
    crumb: 'Facebook & Instagram Ads',
    title: 'Facebook & Instagram Ads Management | Meta Ads | Aussie Growth',
    desc: 'Meta ads for Australian tradies and local businesses. We run Facebook and Instagram ads that get you known locally and bring in enquiries.',
    ogDesc: 'Facebook and Instagram ads for Australian tradies and local businesses. Get known locally, get the enquiry.',
    h1: 'Get known locally. <span class="serif">Get the enquiry.</span>',
    lede: 'Meta ads put your business in front of local people on Facebook and Instagram, before they even start searching.',
    img: IMG.solar,
    service: 'Facebook and Instagram ads management',
    sections: [
      { label: 'Facebook and Instagram', h2: 'Reach people <span class="serif">before they search.</span>',
        paras: ['Meta runs Facebook and Instagram ads. People are not looking for you yet, so the ads work by getting your business in front of the right local people at the right time.', 'That makes Meta good for getting known in your area, and for jobs people plan ahead, like renovations and fit-outs.'] },
      { label: 'What is included', h2: 'Setup, running <span class="serif">and tracking.</span>',
        grid: [
          ['What we set up', ['Campaign strategy and setup', 'Audience targeting by location and interest', 'Ad copy and layout for Facebook and Instagram', 'Conversion tracking', 'A landing page or quote form behind the ad', 'Ongoing optimisation']],
          ['What you get back', ['Reporting in plain English', 'Enquiries and bookings tracked, not just likes', 'A realistic starting budget', 'No long contract', 'A real person to talk to']],
        ] },
      { label: 'Meta or Google?', h2: 'Which one do you <span class="serif">need?</span>',
        paras: ['Google Ads reaches people who are searching right now and ready to call. Meta ads reach people who are scrolling, which builds awareness and suits planned jobs.', 'Many businesses get the best result using both, with the same landing page behind them. If you are not sure, tell us what you do and we will say what we would try first.'],
        links: [['/google-ads/', 'Google Ads management'], ['/#quote', 'Get a quote']] },
    ],
    faqs: [
      { q: 'What are Meta ads?', a: 'Meta ads are paid ads on Facebook and Instagram, run through the Meta advertising platform.' },
      { q: 'Do you run Instagram ads as well as Facebook ads?', a: 'Yes. We run Facebook and Instagram ads together or separately, depending on where your customers are.' },
      { q: 'Are Meta ads good for tradies?', a: 'They can be, especially for planned work like renovations and fit-outs, and for getting known in your local area. For urgent jobs, Google Ads usually does more of the work.' },
      FAQ_COMMON.guarantee,
      FAQ_COMMON.budget,
      FAQ_COMMON.contract,
    ],
    related: ['google-ads', 'ai-automation', 'digital-agency', 'local-business-marketing'],
  },
  {
    slug: 'ai-automation',
    crumb: 'AI & Automation',
    title: 'AI & Business Automation for Small Business | Aussie Growth',
    desc: 'CRM setup, instant replies, follow-ups and booking automation for Australian small businesses. Let software handle the repetitive stuff.',
    ogDesc: 'AI and automation for Australian small businesses: CRM, instant replies, follow-up and booking.',
    h1: 'Let software deal with <span class="serif">the repetitive stuff.</span>',
    lede: 'Practical AI and automation for tradies and local businesses: instant replies, follow-ups, bookings and CRM, so good leads do not go cold while you are on the job.',
    img: IMG.auto,
    service: 'AI and business automation',
    sections: [
      { label: 'The problem', h2: 'Leads go cold <span class="serif">fast.</span>',
        paras: ['You are on a roof or behind the counter. An enquiry comes in. By the time you reply, the customer may have already called someone else.', 'Automation handles the first reply, the follow-up and the booking, so you do not have to do it by hand.'] },
      { label: 'What is included', h2: 'Front of house. <span class="serif">Behind the scenes.</span>',
        grid: [
          ['Front of house', ['AI website assistants and chat', 'Lead capture and qualification', 'Instant automatic replies', 'Booking automation and reminders']],
          ['Behind the scenes', ['CRM setup', 'Follow-up by email and SMS', 'Workflow automation', 'Connecting your business tools']],
        ] },
      { label: 'A typical enquiry, handled', h2: 'From enquiry <span class="serif">to booking.</span>',
        steps: [
          ['New enquiry', 'A customer sends a form or message.'],
          ['Captured', 'The details land in one place, not in five inboxes.'],
          ['CRM updated', 'The lead is logged so nothing gets lost.'],
          ['Instant response', 'The customer gets a reply straight away.'],
          ['Follow-up', 'Email and SMS follow-ups go out until they answer.'],
          ['Booking', 'They pick a time, and you get the booking.'],
        ],
        note: 'Illustrative workflow. Exactly what gets automated depends on your business.' },
      { label: 'Straight answer', h2: 'Is it worth it <span class="serif">for you?</span>',
        paras: ['Sometimes yes, sometimes no. We tell you honestly if automation is worth it for your setup. No robots, no gimmicks, and only what actually saves you time.'] },
    ],
    faqs: [
      { q: 'What can a small business automate?', a: 'Common examples are instant replies to new enquiries, follow-up emails and SMS, booking confirmations and reminders, and CRM updates. Exactly what we automate depends on your business.' },
      { q: 'What is a CRM?', a: 'A CRM is a system that keeps track of your customers and enquiries in one place, so nothing gets lost. We set it up and connect it to your website and follow-up.' },
      { q: 'Do I need to be technical?', a: 'No. We set it up, explain it in plain English and show you what you control.' },
      { q: 'Will automation make me sound like a robot?', a: 'Not if it is done properly. We write replies that sound like you, and a real person stays in charge of the conversations that matter.' },
      { q: 'Can you automate my existing business?', a: 'Often, yes. The repetitive stuff that eats your evenings is usually a good place to start. We tell you honestly if it is worth it.' },
      FAQ_COMMON.contract,
    ],
    related: ['google-ads', 'meta-ads', 'digital-agency', 'local-business-marketing'],
  },
  {
    slug: 'tradie-websites',
    crumb: 'Tradie Websites',
    title: 'Websites for Tradies in Australia | Aussie Growth',
    desc: 'Websites, Google Ads and follow-up automation for Australian tradies: builders, electricians, plumbers, landscapers, roofers, solar, HVAC and renovators.',
    ogDesc: 'Websites for Australian tradies that work the phones. Builders, electricians, plumbers, landscapers, roofers, solar, HVAC and renovators.',
    h1: 'Websites for tradies that <span class="serif">work the phones.</span>',
    lede: 'You are on the tools all day. Your website should be on the phones. We build websites, run ads and automate follow-up for Australian tradies and home-service businesses.',
    img: IMG.trades,
    service: 'Websites and marketing for tradies',
    sections: [
      { label: 'Built for the trade', h2: 'Your site should look <span class="serif">credible.</span>',
        paras: ['Most people check a tradie online before they call. If the website is slow, old or hard to use on a phone, they move on.', 'We build fast, mobile-first sites with a clear service list and a quote button that never wanders off.'] },
      { label: 'Trades we work with', h2: 'Every trade <span class="serif">is different.</span>',
        cards: [
          { t: 'Builders', p: 'Show real projects, explain your services clearly and make the quote request easy.' },
          { t: 'Electricians', p: 'Make your services and service area clear, and put the call button where a thumb can reach it.' },
          { t: 'Plumbers', p: 'Fast on mobile, clear about what you cover, with an obvious way to call or book.' },
          { t: 'Landscapers', p: 'Let your work speak with project photos, and keep quote requests simple.' },
          { t: 'Roofers', p: 'Show your work and your service area, with an easy way to ask for a quote.' },
          { t: 'Solar', p: 'Explain the offer simply and turn "just looking" into a quote request.' },
          { t: 'HVAC', p: 'Make it easy to book a visit or ask for a quote.' },
          { t: 'Renovations', p: 'Showcase projects and ask the right questions in a short quote form.' },
        ] },
      { label: 'Real work', h2: 'Real sites <span class="serif">we built.</span>',
        paras: ['Silk Building Group is a premium site for a Canberra builder: big imagery, clear services and a quote button that never wanders off. Capital Solar Energy is a home-services site built to turn "just looking" into "can you come out Thursday?".'],
        extLinks: [['https://silk-building-group-vercel-v3.vercel.app/', 'Visit Silk Building Group'], ['https://www.capitalsolarenergy.com.au/', 'Visit Capital Solar Energy']] },
      { label: 'The $0 website', h2: '$0 website. <span class="serif">Yes, really.</span>',
        paras: ['Two Australian businesses get a professional website for $0 every Monday. We design it, we build it, and you pick the Monday we start. It is live in about a month, with 3 revisions.', 'The catch is a short video testimonial once your site is finished and you have seen it. A $1,500 fast-track gets it live in about a week.'],
        links: [['/free-website/', 'Get your slot']] },
    ],
    faqs: [
      { q: 'Do you build websites for tradies?', a: 'Yes. Builders, electricians, plumbers, landscapers, roofers, solar, HVAC and renovators are who we build for.' },
      { q: 'How much does a tradie website cost?', a: 'It depends on what you need. Tell us what you want to achieve and we give you a clear quote. Two Australian businesses also get a website for $0 every Monday.' },
      { q: 'How long does a website take?', a: 'Most small business sites take a few weeks, and bigger builds take longer. The biggest variable is usually content: photos, copy and sign-off. The $0 website goes live in about a month, and the $1,500 fast-track in about a week.' },
      { q: 'Can you help people find my tradie business on Google?', a: 'We run Google Ads that put you in front of people searching for your trade, and we build the site those ads send people to.' },
      { q: 'Can the website take quote requests?', a: 'Yes. We build quote forms and booking requests into the site, so enquiries come straight to you.' },
    ],
    related: ['digital-agency', 'google-ads', 'ai-automation', 'local-business-marketing'],
  },
  {
    slug: 'local-business-marketing',
    crumb: 'Local Business Marketing',
    title: 'Websites, Ads & Automation for Local Businesses | Aussie Growth',
    desc: 'Websites, Google and Meta ads and automation for Australian local businesses: clinics, gyms, hospitality, automotive, retail and professional services.',
    ogDesc: 'Websites, ads and automation for Australian local businesses. Being the best in the suburb only counts if the suburb knows.',
    h1: 'Be the best in the suburb. <span class="serif">Make sure it knows.</span>',
    lede: 'Being the best in the suburb only counts if the suburb knows. We help Australian local businesses get found, get booked and stop chasing admin.',
    img: IMG.local,
    service: 'Websites, ads and automation for local businesses',
    sections: [
      { label: 'Local business', h2: 'Found locally. <span class="serif">Booked easily.</span>',
        paras: ['Local customers search on their phone, compare a few options and choose the one that looks credible and is easy to contact.', 'We build the website, run the ads and set up the follow-up, so that business comes to you.'] },
      { label: 'Who we help', h2: 'Local businesses <span class="serif">we work with.</span>',
        cards: [
          { t: 'Clinics', p: 'Make services and booking requests clear, and follow up enquiries quickly.' },
          { t: 'Gyms', p: 'Turn website visits into trial and membership enquiries.' },
          { t: 'Hospitality', p: 'Make bookings and enquiries easy, and keep the personality of the venue.' },
          { t: 'Automotive', p: 'Make it easy to request a quote or book a service.' },
          { t: 'Retail', p: 'Show what you sell and give people a reason to visit or enquire.' },
          { t: 'Professional services', p: 'Look credible, explain what you do in plain language and make the first conversation easy.' },
        ] },
      { label: 'Real work', h2: 'Sites and systems <span class="serif">we built.</span>',
        paras: ['Mazzia Resorts is a slow, cinematic site for a resort brand. Harborview is a hotel-and-cafe operations prototype that handles bookings, housekeeping, orders and follow-ups in one place. Hartwell Media is a loud, playful agency site with personality in every scroll.'],
        extLinks: [['https://mazzia.netlify.app/', 'Visit Mazzia Resorts'], ['https://harborview-v1.netlify.app/', 'Visit Harborview'], ['https://hulululu-five.vercel.app/', 'Visit Hartwell Media']] },
      { label: 'What a good local site has', h2: 'The short <span class="serif">checklist.</span>',
        grid: [
          ['On the site', ['What you do, in plain language', 'Where you are and who you serve', 'Real photos and real projects', 'A call button and a quote or booking form', 'Fast and easy on a phone']],
          ['Behind the site', ['Ads that reach people in your area', 'Tracking for calls and enquiries', 'Instant replies to new enquiries', 'Follow-up so leads do not go cold']],
        ] },
    ],
    faqs: [
      { q: 'What kinds of local businesses do you work with?', a: 'Clinics, gyms, hospitality, automotive, retail and professional services, as well as tradies and home-service businesses.' },
      { q: 'What should a local business website include?', a: 'A clear description of what you do, where you are, real photos or projects, a call button, a quote or booking form, and a site that loads fast and works well on a phone.' },
      { q: 'Do you run ads for local businesses?', a: 'Yes. We run Google, Meta and Instagram ads aimed at people in your area, and we track the enquiries they bring in.' },
      { q: 'Can you set up automatic replies and bookings?', a: 'Yes. We set up instant replies, follow-up by email and SMS, and booking automation, so new enquiries get an answer straight away.' },
      FAQ_COMMON.contract,
    ],
    related: ['digital-agency', 'google-ads', 'meta-ads', 'ai-automation'],
  },
  {
    slug: 'about',
    crumb: 'About',
    title: 'About Aussie Growth | Australian Digital Agency',
    desc: 'About Aussie Growth, an Australian digital agency that builds websites, runs Google and Meta ads and automates follow-up for tradies and local businesses.',
    ogDesc: 'Aussie Growth is an Australian digital agency: websites, paid ads and AI automation for tradies and local businesses.',
    h1: 'About <span class="serif">Aussie Growth.</span>',
    lede: 'Aussie Growth is an Australian digital agency. We build websites, run paid ads and set up AI and automation for tradies, home-service businesses and local businesses.',
    img: IMG.street,
    about: true,
    sections: [
      { label: 'At a glance', h2: 'The facts, <span class="serif">no waffle.</span>',
        facts: [
          ['Name', 'Aussie Growth'],
          ['Also written as', 'Aussie Growth Digital Marketing, Aussie Growth Agency, aussiegrowth.agency'],
          ['What it is', 'An Australian digital agency'],
          ['Services', 'Web development, paid ads (Google Ads, Meta Ads, Instagram Ads), and AI and automations (CRM, instant replies, follow-up, booking)'],
          ['Who it helps', 'Tradies, home-service businesses and local businesses in Australia'],
          ['Website', SITE + '/'],
          ['Phone', PHONE],
          ['Email', EMAIL],
          ['Offer', 'A professional website for $0, for two Australian businesses every Monday'],
        ] },
      { label: 'How we work', h2: 'Clear. Practical. <span class="serif">Measurable. Human.</span>',
        cards: [
          { t: 'Clear', p: 'You always know what we are doing and why.' },
          { t: 'Practical', p: 'We build things people actually use.' },
          { t: 'Measurable', p: 'We care about enquiries, bookings and useful business outcomes.' },
          { t: 'Human', p: 'No disappearing into an agency black hole.' },
        ] },
      { label: 'Our work', h2: 'Real websites <span class="serif">we built.</span>',
        paras: ['Portfolio projects shown on this site are real websites built by Aussie Growth: Silk Building Group, Hartwell Media, Mazzia Resorts, Holarize, Capital Solar Energy and Harborview.'],
        links: [['/#work', 'See the work']] },
      { label: 'Honesty notes', h2: 'What we <span class="serif">do not claim.</span>',
        paras: ['This site publishes no client testimonials, ratings or performance statistics. The brand film and some of the photography are illustrative, not client footage. We do not guarantee sales. We track what happens and tell you what we see.'] },
    ],
    faqs: [
      { q: 'What is Aussie Growth?', a: 'Aussie Growth is an Australian digital agency. It builds websites, runs paid ads on Google, Meta and Instagram, and sets up AI and automation for tradies, home-service businesses and local businesses.' },
      { q: 'What does Aussie Growth do?', a: 'Three things: web development (websites, landing pages, quote forms), paid ads (Google Ads, Meta Ads, Instagram Ads) and AI and automations (CRM, instant replies, follow-up, booking automation).' },
      { q: 'Is aussiegrowth.agency the official website?', a: 'Yes. ' + SITE + '/ is the official website of Aussie Growth.' },
      { q: 'How do I contact Aussie Growth?', a: 'Call ' + PHONE + ', email ' + EMAIL + ', or use the quote form at ' + SITE + '/#quote. A real person replies.' },
      { q: 'What is the $0 website offer?', a: 'Two Australian businesses get a professional website for $0 every Monday. It is live in about a month, with 3 revisions. The catch is a short video testimonial once the site is finished. A $1,500 fast-track gets it live in about a week.' },
    ],
    related: ['digital-agency', 'google-ads', 'meta-ads', 'ai-automation', 'tradie-websites', 'local-business-marketing'],
  },
];
const byslug = Object.fromEntries(PAGES.map((p) => [p.slug, p]));
const url = (p) => `${SITE}/${p.slug}/`;

const orgRef = { '@type': 'ProfessionalService', '@id': ORG_ID, name: 'Aussie Growth', url: SITE + '/', telephone: PHONE };

function schemaFor(p) {
  const graph = [];
  if (p.about) {
    graph.push({ '@type': 'AboutPage', '@id': url(p) + '#webpage', url: url(p), name: strip(p.title), inLanguage: 'en-AU', mainEntity: { '@id': ORG_ID }, about: { '@id': ORG_ID } });
    graph.push({
      '@type': 'ProfessionalService', '@id': ORG_ID, name: 'Aussie Growth',
      alternateName: ['Aussie Growth Digital Marketing', 'Aussie Growth Agency', 'aussiegrowth.agency'],
      url: SITE + '/', telephone: PHONE, email: EMAIL,
      description: 'Aussie Growth is an Australian digital agency. It builds websites, runs paid ads and sets up AI automations for tradies, home-service businesses and local businesses.',
      areaServed: { '@type': 'Country', name: 'Australia' },
      knowsAbout: ['Digital agency services', 'Web development', 'Google Ads', 'Meta Ads', 'Instagram Ads', 'CRM', 'Marketing automation'],
    });
  } else if (p.service) {
    graph.push({
      '@type': 'Service', '@id': url(p) + '#service', name: p.service, serviceType: p.service, description: p.desc, url: url(p),
      areaServed: { '@type': 'Country', name: 'Australia' }, provider: orgRef,
    });
  } else {
    graph.push({ '@type': 'WebPage', '@id': url(p) + '#webpage', url: url(p), name: strip(p.title), description: p.desc, inLanguage: 'en-AU', about: { '@id': ORG_ID }, isPartOf: { '@id': SITE + '/#website' } });
    graph.push({
      '@type': 'Service', '@id': url(p) + '#service', name: 'Digital agency services', serviceType: ['Web development', 'Paid advertising management', 'AI and marketing automation'], description: p.desc, url: url(p),
      areaServed: { '@type': 'Country', name: 'Australia' }, provider: orgRef,
    });
  }
  graph.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: p.crumb, item: url(p) },
  ] });
  graph.push({ '@type': 'FAQPage', mainEntity: p.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  return { '@context': 'https://schema.org', '@graph': graph };
}

const picture = (i, eager) => `<picture><source type="image/webp" srcset="${i.webp.join(', ')}" sizes="(min-width: 1000px) 45vw, 100vw"><img src="${i.jpg}" alt="${esc(i.alt)}" width="${i.w}" height="${i.h}"${eager ? ' fetchpriority="high"' : ''}></picture>`;

function sectionHTML(s, idx) {
  const id = `s${idx}`;
  let h = `    <section class="seo-sec" aria-labelledby="${id}">\n      <p class="label">${esc(s.label)}</p>\n      <h2 class="h2" id="${id}">${s.h2}</h2>\n`;
  if (s.paras) h += `      <div class="seo-prose">${s.paras.map((t) => `<p>${esc(t)}</p>`).join('')}</div>\n`;
  if (s.facts) h += `      <dl class="seo-facts">${s.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>\n`;
  if (s.cards) h += `      <div class="seo-cards">${s.cards.map((c) => `<article class="seo-card">${c.n ? `<p class="n">${esc(c.n)}</p>` : ''}<h3>${esc(c.t)}</h3><p>${esc(c.p)}</p>${c.href ? `<a class="seo-link" href="${c.href}">Learn more <span aria-hidden="true">→</span></a>` : ''}</article>`).join('')}</div>\n`;
  if (s.grid) h += `      <div class="split-grid seo-grid">${s.grid.map(([t, items]) => `<div class="split-col"><p class="n">${esc(t)}</p><ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>\n`;
  if (s.steps) h += `      <ol class="seo-steps">${s.steps.map(([t, d], i) => `<li><span class="seo-step-n">${String(i + 1).padStart(2, '0')}</span><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('')}</ol>\n`;
  if (s.note) h += `      <p class="seo-note">${esc(s.note)}</p>\n`;
  if (s.links) h += `      <p class="seo-links">${s.links.map(([href, t]) => `<a class="btn btn-ghost" href="${href}">${esc(t)} <span class="arrow" aria-hidden="true">→</span></a>`).join(' ')}</p>\n`;
  if (s.extLinks) h += `      <p class="seo-links">${s.extLinks.map(([href, t]) => `<a class="btn btn-ghost" href="${href}" target="_blank" rel="noopener">${esc(t)} ↗<span class="sr"> (opens in a new tab)</span></a>`).join(' ')}</p>\n`;
  return h + '    </section>\n';
}

const growth = read('growth/index.html');
const shellTop = growth.slice(growth.indexOf('<div class="loader"'), growth.indexOf('<main id="main">'));
const shellBottom = growth.slice(growth.indexOf('<footer class="foot">'));

const MORE_NAV = `    <nav class="foot-links foot-more" aria-label="More from Aussie Growth">
      <a href="/digital-agency/">Digital Agency</a><a href="/google-ads/">Google Ads</a><a href="/meta-ads/">Facebook &amp; Instagram Ads</a><a href="/ai-automation/">AI &amp; Automation</a><a href="/tradie-websites/">Tradie Websites</a><a href="/local-business-marketing/">Local Business Marketing</a><a href="/about/">About Aussie Growth</a>
    </nav>
`;

function pageHTML(p) {
  const head = `<!doctype html>
<html lang="en-AU">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.desc)}">
  <link rel="canonical" href="${url(p)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#080808">
  <meta name="color-scheme" content="dark">

  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_AU">
  <meta property="og:site_name" content="Aussie Growth">
  <meta property="og:title" content="${esc(p.title)}">
  <meta property="og:description" content="${esc(p.ogDesc)}">
  <meta property="og:url" content="${url(p)}">
  <meta property="og:image" content="${SITE}/assets/og.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Aussie Growth: web development, paid ads and AI automations">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(p.title)}">
  <meta name="twitter:description" content="${esc(p.ogDesc)}">
  <meta name="twitter:image" content="${SITE}/assets/og.jpg">

  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/assets/aussie-growth-mark-512.png" sizes="512x512" type="image/png">
  <link rel="apple-touch-icon" href="/assets/aussie-growth-mark-180.png">
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/archivo-var.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/caveat-var.woff2" crossorigin>
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/story.css">
  <link rel="stylesheet" href="/css/sections.css">
  <link rel="stylesheet" href="/css/work.css">
  <link rel="stylesheet" href="/css/quote.css">
  <link rel="stylesheet" href="/css/pages.css">
  <link rel="stylesheet" href="/css/seo.css">
  <link rel="stylesheet" href="/css/theme.css">

  ${ld(schemaFor(p))}
  <script>(function(d,n,c){try{n=navigator.connection||{};c=sessionStorage.getItem('ag-seen')||n.saveData||/2g/.test(n.effectiveType)?'js':'js is-loading'}catch(e){c='js'}d.className=c})(document.documentElement)</script>
</head>
<body>
  `;
  const hero = `<main id="main">
    <section class="page-hero">
      <div>
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <i aria-hidden="true">/</i> <span aria-current="page">${esc(p.crumb)}</span></nav>
        <h1>${p.h1}</h1>
        <p class="lede">${esc(p.lede)}</p>
        <div class="page-ctas">
          <a class="btn btn-gold magnetic" href="/#quote">Get a quote <span class="arrow" aria-hidden="true">→</span></a>
          <a class="btn btn-ghost" href="tel:+61493721273" data-phone>Call us <span class="arrow" aria-hidden="true">→</span></a>
        </div>
      </div>
      <div class="page-media">
        ${picture(p.img, true)}${p.img.tag ? `\n        <span class="tag">${esc(p.img.tag)}</span>` : ''}
      </div>
    </section>

`;
  const body = p.sections.map(sectionHTML).join('\n');
  const faq = `
    <section class="seo-sec seo-faq" aria-labelledby="faq-t">
      <p class="label">Questions</p>
      <h2 class="h2" id="faq-t">Things you are <span class="serif">probably</span> wondering.</h2>
      <div class="seo-faq-list">
${p.faqs.map((f) => `        <details class="seo-q"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n')}
      </div>
    </section>

    <section class="seo-sec seo-related" aria-labelledby="rel-t">
      <p class="label">Keep reading</p>
      <h2 class="h2" id="rel-t">More from <span class="serif">Aussie Growth.</span></h2>
      <ul class="seo-related-list">
${p.related.map((s) => `        <li><a href="/${s}/">${esc(byslug[s].crumb)}</a></li>`).join('\n')}
        <li><a href="/web-development/">Web Development</a></li>
        <li><a href="/free-website/">$0 Website offer</a></li>
      </ul>
    </section>

    <section class="page-cta" id="quote-cta">
      <p class="label">Ready when you are</p>
      <h2>Let’s get the phone<br><span class="gold">doing some work.</span></h2>
      <p>Tell us what’s going on and we’ll tell you what we’d try first.</p>
      <div class="final-ctas">
        <a class="btn btn-gold btn-lg magnetic" href="/#quote">Get a quote <span class="arrow" aria-hidden="true">→</span></a>
        <a class="btn btn-ghost btn-lg" href="tel:+61493721273" data-phone>Call us <span class="arrow" aria-hidden="true">→</span></a>
      </div>
    </section>
  </main>

  `;
  return head + shellTop.replace(/^\s+/, '') + hero + body + faq + shellBottom;
}

// ---- patch the footer of the three older pages so every page links to every new page
for (const f of ['index.html', 'web-development/index.html', 'growth/index.html']) {
  let html = read(f);
  if (!html.includes('foot-more')) {
    html = html.replace(/(    <nav class="foot-links foot-services" aria-label="Services">[\s\S]*?<\/nav>\n)/, (m) => m + MORE_NAV);
    writeFileSync(root(f), html);
  }
}
// the new pages copy the (already patched) footer from growth/index.html
const growth2 = read('growth/index.html');
const shellBottom2 = growth2.slice(growth2.indexOf('<footer class="foot">'));

for (const p of PAGES) {
  mkdirSync(root(p.slug), { recursive: true });
  writeFileSync(root(`${p.slug}/index.html`), pageHTML(p).replace(shellBottom, shellBottom2));
}

// ---- sitemap
const urls = [
  [SITE + '/', TODAY], [SITE + '/web-development/', TODAY], [SITE + '/growth/', TODAY], [SITE + '/free-website/', '2026-10-10'],
  ...PAGES.map((p) => [url(p), TODAY]),
];
writeFileSync(root('sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d]) => `  <url><loc>${u}</loc><lastmod>${d}</lastmod></url>`).join('\n')}\n</urlset>\n`);

// ---- llms.txt (short index) and llms-full.txt (everything, in plain text)
const llms = `# Aussie Growth

> Aussie Growth is an Australian digital agency. It builds websites, runs paid ads (Google, Meta, Instagram) and sets up AI and automation (CRM, instant replies, follow-up, booking) for tradies, home-service businesses and local businesses.

Also written as: Aussie Growth Digital Marketing, Aussie Growth Agency, aussiegrowth.agency
Official website: ${SITE}/
Phone: ${PHONE}
Email: ${EMAIL}
Country served: Australia
Language: English (Australia)

## What Aussie Growth does

- Web development: custom business websites, redesigns, landing pages, quote forms and booking systems. Mobile-first.
- Paid ads: Google Ads, Meta Ads and Instagram Ads, with tracking, sent to pages built to turn clicks into calls.
- AI and automation: CRM, instant replies, follow-up, booking automation, email and SMS workflows.
- The three services work as one process: Get seen (website), Get booked (ads), Get paid (automation).

## Who Aussie Growth helps

- Tradies and home services: builders, electricians, plumbers, landscapers, roofers, solar, HVAC, renovations.
- Local businesses: clinics, gyms, hospitality, automotive, retail, professional services.

## Pages

- [Home](${SITE}/): what Aussie Growth does, featured work, FAQs and the quote form
- [About Aussie Growth](${SITE}/about/): the facts about the business in one place
- [Digital agency](${SITE}/digital-agency/): what a digital agency does and how Aussie Growth works
- [Web Development](${SITE}/web-development/): business websites, redesigns, landing pages, quote and booking systems, and the build process
- [Growth](${SITE}/growth/): paid ads management and AI/automation services
- [Google Ads](${SITE}/google-ads/): Google Ads management for tradies and local businesses
- [Facebook and Instagram ads](${SITE}/meta-ads/): Meta ads management for local reach and planned jobs
- [AI and automation](${SITE}/ai-automation/): CRM, instant replies, follow-up and booking automation
- [Websites for tradies](${SITE}/tradie-websites/): builders, electricians, plumbers, landscapers, roofers, solar, HVAC, renovations
- [Local business marketing](${SITE}/local-business-marketing/): clinics, gyms, hospitality, automotive, retail, professional services
- [$0 Website offer](${SITE}/free-website/): two Australian businesses get a professional website for $0 every Monday (live in about a month, 3 revisions, a short video testimonial once it is finished). Optional $1,500 fast-track gets it in about a week.

## Full text

- [llms-full.txt](${SITE}/llms-full.txt): the full text of every page above, in one file

## Common questions

- How do I get a quote? Use the five-question quote form on the home page (about a minute). A real person replies with a recommendation and a quote.
- Is there a long contract? No. Terms are explained before any work starts.
- Does Aussie Growth build the website and run the ads? Yes. One team does both.
- How long does a website take? Most small-business sites take a few weeks. Content (photos, copy, sign-off) is the main variable.

## Notes

- Portfolio projects shown on the site are real websites built by Aussie Growth.
- Photography and the brand film on the site are illustrative, not client footage.
- The site publishes no client testimonials, ratings or performance statistics.
- Aussie Growth does not guarantee sales or leads.
`;
writeFileSync(root('llms.txt'), llms);

const full = [llms.replace('## Full text\n\n- [llms-full.txt](' + SITE + '/llms-full.txt): the full text of every page above, in one file\n\n', '')];
full.push('\n# Full page text\n');
for (const p of PAGES) {
  full.push(`\n## ${strip(p.title)}\nURL: ${url(p)}\n\n${strip(p.h1)}\n${p.lede}\n`);
  for (const s of p.sections) {
    full.push(`\n### ${strip(s.h2)}\n`);
    (s.paras || []).forEach((t) => full.push(t + '\n'));
    (s.facts || []).forEach(([k, v]) => full.push(`- ${k}: ${v}`));
    (s.cards || []).forEach((c) => full.push(`- ${c.t}: ${c.p}`));
    (s.grid || []).forEach(([t, items]) => { full.push(`\n${t}:`); items.forEach((x) => full.push(`- ${x}`)); });
    (s.steps || []).forEach(([t, d], i) => full.push(`${i + 1}. ${t}: ${d}`));
    if (s.note) full.push(s.note);
  }
  full.push('\n### Questions and answers\n');
  p.faqs.forEach((f) => full.push(`Q: ${f.q}\nA: ${f.a}\n`));
}
full.push('\n## Home page questions and answers\nURL: ' + SITE + '/\n');
const LONG_DASHES = new RegExp('\\s*[' + String.fromCharCode(8212, 8213) + ']\\s*', 'g');
const plain = (t) => t.replace(LONG_DASHES, ' - ');
homeFaqs.forEach((f) => full.push(`Q: ${plain(f.question)}\nA: ${plain(f.answer)}\n`));
writeFileSync(root('llms-full.txt'), full.join('\n') + '\n');

console.log(`built ${PAGES.length} pages, sitemap (${urls.length} urls), llms.txt, llms-full.txt`);
