import { useEffect, useState } from 'react';
import DashboardPage, { DashboardHeader } from './DashboardPage.jsx';
import LoginPage from './LoginPage.jsx';
import ProfilePage from './ProfilePage.jsx';
import UploadShotPage from './UploadShotPage.jsx';

function getCurrentPath() {
  if (typeof window === 'undefined') {
    return '/';
  }

  const hashPath = window.location.hash.startsWith('#/')
    ? window.location.hash.slice(1)
    : '';

  return (hashPath || window.location.pathname).replace(/\/+$/, '') || '/';
}

function toAppHref(path) {
  if (path === '/') {
    return '/#/';
  }

  if (path.startsWith('/#')) {
    return path;
  }

  return `/#${path}`;
}
const navigationItems = [
  { label: 'Explore', href: '/' },
  { label: 'Showcases', href: '/showcases' },
  { label: 'Contributors', href: '/contributors' },
];

const homeFilterItems = ['Popular', 'Recent', 'Followed'];
const footerItems = [
  { label: 'Work', href: '/' },
  { label: 'Projects', href: '/#community' },
  { label: 'Archive', href: '/' },
  { label: 'Stack', href: '/' },
];

const trustLogos = [
  { src: '/withintech.png', alt: 'Withintech' },
  { src: '/academicbridge.png', alt: 'Academic Bridge' },
  { src: '/irembo.png', alt: 'Irembo' },
];

const legacyFeaturedProjects = [
  {
    title: 'Obsidian Core',
    stack: 'React ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Rust ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ WASM',
    image: '/1.png',
    imageAlt: 'Obsidian Core preview',
    tag: 'NEW',
  },
  {
    title: 'Lumina Dev',
    stack: 'Next.js ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ three.js',
    image: '/2.png',
    imageAlt: 'Lumina Dev preview',
  },
  {
    title: 'alow State',
    stack: 'Node ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ GraphÃƒÆ’Ã‚Â© L',
    image: '/3.png',
    imageAlt: 'alow State preview',
  },
  {
    title: 'Synthetix',
    stack: 'Svelte ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Tailwind',
    image: '/4.png',
    imageAlt: 'Synthetix preview',
  },
  {
    title: 'Monolith Infrastructure',
    stack: 'Go ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Kubernetes ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Docker',
    image: '/5.png',
    imageAlt: 'Monolith Infrastructure preview',
    tag: 'FEATURED',
    wide: true,
  },
  {
    title: 'Vortex AI',
    stack: 'Python ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ PyTorch',
    image: '/6.png',
    imageAlt: 'Vortex AI preview',
  },
  {
    title: 'Sonic Labs',
    stack: 'Vue ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ WebAudio',
    image: '/7.png',
    imageAlt: 'Sonic Labs preview',
  },
  {
    title: 'Aether Stream',
    stack: 'D3.js ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ WebGL',
    image: '/8.png',
    imageAlt: 'Aether Stream preview',
  },
  {
    title: 'Minimal Script',
    stack: 'TypeScript ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Bun',
    image: '/9.png',
    imageAlt: 'Minimal Script preview',
  },
  {
    title: 'Metric Pro',
    stack: 'Grafana ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Prometheus',
    image: '/10.png',
    imageAlt: 'Metric Pro preview',
  },
  {
    title: 'Atomic UI',
    stack: 'React ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Storybook',
    image: '/11.png',
    imageAlt: 'Atomic UI preview',
  },
];

const projectTeamProfiles = {
  elena: { name: 'Elena Rostova', image: '/contributors/elena-rostova.jpg' },
  marcus: { name: 'Marcus Chen', image: '/contributors/marcus-chen.jpg' },
  sarah: { name: 'Sarah Jenkins', image: '/contributors/sarah-jenkins.jpg' },
  david: { name: 'David Kim', image: '/contributors/david-kim.jpg' },
  priya: { name: 'Priya Patel', image: '/contributors/priya-patel.jpg' },
  james: { name: 'James Wilson', image: '/contributors/james-wilson.jpg' },
  nina: { name: 'Nina Gonzalez', image: '/contributors/nina-gonzalez.jpg' },
  alex: { name: 'Alex Thorne', image: '/contributors/alex-thorne.jpg' },
};

const projectGalleryFallbackPool = [
  '/12.png',
  '/13.png',
  '/14.png',
  '/15.png',
  '/16.png',
  '/19.png',
  '/20.png',
  '/21.png',
  '/22.png',
  '/23.png',
];

function createProjectTeamMember(profileKey, role) {
  return {
    ...projectTeamProfiles[profileKey],
    role,
  };
}

function getProjectGalleryImages(project) {
  const initialImages = project.gallery?.length ? project.gallery : [project.image];
  const images = [...new Set(initialImages)];
  let poolIndex =
    project.slug.split('').reduce((total, character) => total + character.charCodeAt(0), 0) %
    projectGalleryFallbackPool.length;

  while (images.length < 4) {
    const nextImage = projectGalleryFallbackPool[poolIndex % projectGalleryFallbackPool.length];

    if (!images.includes(nextImage)) {
      images.push(nextImage);
    }

    poolIndex += 1;
  }

  return images;
}

const projectRecords = [
  {
    slug: 'obsidian-core',
    title: 'Obsidian Core',
    stack: 'React - Rust - WASM',
    techStack: ['React', 'Rust', 'WASM', 'Grafana'],
    summary: 'A resilient control surface for inspecting distributed systems in real time.',
    image: '/1.png',
    imageAlt: 'Obsidian Core preview',
    gallery: ['/1.png', '/5.png'],
    tag: 'NEW',
    status: 'Completed',
    cohort: 'Fall 2025',
    course: 'CS410: Distributed Systems Studio',
    problem: [
      'Legacy observability tools forced platform teams to jump between dashboards, terminal sessions, and brittle alert feeds before they could understand a production incident.',
      'The challenge was to compress a noisy, high-stakes debugging workflow into a single interface that remained fast even when services, logs, and traces all updated at once.',
    ],
    solution: [
      'We paired a React shell with a Rust and WASM processing layer so heavy filtering, aggregation, and anomaly detection could happen in the browser without blocking the UI.',
      'The final experience gives teams a stable, glanceable operations surface that keeps the most important signals visible while preserving deep drill-down paths.',
    ],
    innovations: [
      'Stream-aware layout that reprioritizes cards as system risk changes.',
      'WASM-powered trace processing for low-latency incident triage.',
      'Context-preserving drill-down panels that avoid full page refreshes.',
    ],
    team: [
      createProjectTeamMember('elena', 'Lead Engineer'),
      createProjectTeamMember('james', 'Systems Architect'),
      createProjectTeamMember('nina', 'Frontend Engineer'),
      createProjectTeamMember('alex', 'Security Engineer'),
    ],
  },
  {
    slug: 'lumina-dev',
    title: 'Lumina Dev',
    stack: 'Next.js - three.js',
    techStack: ['Next.js', 'three.js', 'Framer Motion', 'Vercel'],
    summary: 'A cinematic developer portfolio platform built around spatial storytelling.',
    image: '/2.png',
    imageAlt: 'Lumina Dev preview',
    gallery: ['/2.png', '/11.png'],
    status: 'Live',
    cohort: 'Spring 2025',
    course: 'CS335: Immersive Interface Design',
    problem: [
      'Most portfolio sites flattened sophisticated engineering work into identical grids and generic hero sections, making every creator feel interchangeable.',
      'We needed a way to showcase code, motion, and narrative together without sacrificing performance or readability on smaller screens.',
    ],
    solution: [
      'Lumina Dev uses layered 3D scenes, editorial pacing, and progressive content reveals to make technical case studies feel immersive while still remaining easy to navigate.',
      'We treated every section like an exhibit, balancing visual drama with accessible typography and strong fallback states.',
    ],
    innovations: [
      'Scene budgeting system that swaps between rich and lightweight 3D states.',
      'Story-driven scroll choreography tuned for portfolio case studies.',
      'Responsive lighting presets that preserve contrast across devices.',
    ],
    team: [
      createProjectTeamMember('nina', 'Experience Designer'),
      createProjectTeamMember('sarah', 'Motion Designer'),
      createProjectTeamMember('marcus', 'Rendering Engineer'),
      createProjectTeamMember('david', 'Mobile QA Lead'),
    ],
  },
  {
    slug: 'flow-state',
    title: 'Flow State',
    stack: 'Node - GraphQL',
    techStack: ['Node.js', 'GraphQL', 'Prisma', 'Redis'],
    summary: 'A calm coordination hub for managing large product delivery pipelines.',
    image: '/3.png',
    imageAlt: 'Flow State preview',
    gallery: ['/3.png', '/10.png'],
    status: 'Completed',
    cohort: 'Fall 2024',
    course: 'CS320: Product Systems',
    problem: [
      'Planning tools often punished cross-functional teams with fragmented views, slow filtering, and too many context switches between roadmaps, issues, and docs.',
      'As teams scaled, the lack of a single operational source of truth created duplicated effort and conflicting project status updates.',
    ],
    solution: [
      'Flow State centralizes planning, delivery, and reporting into a graph-backed workspace that keeps relationships between teams, milestones, and blockers visible.',
      'We optimized the interaction model for speed first, making multi-team planning feel lightweight instead of administrative.',
    ],
    innovations: [
      'Graph-based dependency explorer for roadmap and sprint planning.',
      'Instant cross-team search with Redis-backed activity snapshots.',
      'Progressive disclosure patterns that keep dense boards readable.',
    ],
    team: [
      createProjectTeamMember('elena', 'Product Engineer'),
      createProjectTeamMember('priya', 'Data Systems Engineer'),
      createProjectTeamMember('sarah', 'Interaction Designer'),
      createProjectTeamMember('james', 'Platform Lead'),
    ],
  },
  {
    slug: 'synthetix',
    title: 'Synthetix',
    stack: 'Svelte - Tailwind',
    techStack: ['Svelte', 'Tailwind CSS', 'Supabase', 'TypeScript'],
    summary: 'A modular design system workspace for shipping consistent product surfaces faster.',
    image: '/4.png',
    imageAlt: 'Synthetix preview',
    gallery: ['/4.png', '/11.png'],
    status: 'Completed',
    cohort: 'Spring 2025',
    course: 'CS360: Design Systems Engineering',
    problem: [
      'Teams were rebuilding the same interface patterns in parallel, which caused visual drift and costly design reviews before every release.',
      'The missing piece was a shared environment where design tokens, components, and implementation guidance lived together.',
    ],
    solution: [
      'Synthetix combines a living component library with token governance and usage analytics so teams can ship faster without losing brand consistency.',
      'Every component entry includes implementation notes, accessibility guidance, and usage examples that reduce handoff friction.',
    ],
    innovations: [
      'Token propagation workflow with instant preview diffs.',
      'Component health scoring based on adoption and drift metrics.',
      'Design-to-code docs that stay in sync with source changes.',
    ],
    team: [
      createProjectTeamMember('sarah', 'Design Systems Lead'),
      createProjectTeamMember('nina', 'Frontend Engineer'),
      createProjectTeamMember('marcus', 'Tooling Engineer'),
      createProjectTeamMember('elena', 'Implementation Partner'),
    ],
  },
  {
    slug: 'monolith-infrastructure',
    title: 'Monolith Infrastructure',
    stack: 'Go - Kubernetes - Docker',
    techStack: ['Go', 'Kubernetes', 'Docker', 'Prometheus'],
    summary: 'A hardened infrastructure console for orchestrating complex internal platforms.',
    image: '/5.png',
    imageAlt: 'Monolith Infrastructure preview',
    gallery: ['/5.png', '/10.png'],
    tag: 'FEATURED',
    wide: true,
    status: 'Completed',
    cohort: 'Fall 2025',
    course: 'CS450: Cloud Infrastructure',
    problem: [
      'Infrastructure teams were maintaining critical services across clusters, yet visibility into rollout health, capacity, and failure domains lived in disconnected tools.',
      'That fragmentation slowed incident response and made routine platform maintenance feel riskier than it should have been.',
    ],
    solution: [
      'Monolith Infrastructure unifies deployment controls, cluster health, and cost intelligence in a single operational dashboard built for platform teams.',
      'We emphasized legibility under pressure, making every critical action obvious, confirmable, and reversible.',
    ],
    innovations: [
      'Cluster-aware rollout planner with safe-change simulations.',
      'Live resource overlays that combine health, cost, and ownership data.',
      'Opinionated command palette for frequent operator workflows.',
    ],
    team: [
      createProjectTeamMember('james', 'Platform Architect'),
      createProjectTeamMember('alex', 'Reliability Engineer'),
      createProjectTeamMember('priya', 'Telemetry Engineer'),
      createProjectTeamMember('elena', 'Full-Stack Engineer'),
    ],
  },
  {
    slug: 'vortex-ai',
    title: 'Vortex AI',
    stack: 'Python - PyTorch',
    techStack: ['Python', 'PyTorch', 'FastAPI', 'NumPy'],
    summary: 'A visual experimentation lab for rapid model iteration and insight tracking.',
    image: '/6.png',
    imageAlt: 'Vortex AI preview',
    gallery: ['/6.png', '/8.png'],
    status: 'In Review',
    cohort: 'Spring 2026',
    course: 'CS470: Applied Machine Learning',
    problem: [
      'Researchers had strong training pipelines, but poor tooling for comparing experiments, annotating findings, and presenting model behavior to non-ML stakeholders.',
      'Important insights were trapped inside notebooks and one-off scripts that could not scale across a team.',
    ],
    solution: [
      'Vortex AI turns experiments into navigable narratives, combining training metrics, embedding views, and human-readable notes inside a collaborative workspace.',
      'The interface helps teams move from raw results to decisions faster by making comparisons visible and sharable.',
    ],
    innovations: [
      'Experiment timeline that merges metrics, checkpoints, and commentary.',
      'Drill-down views for comparing inference behavior across model runs.',
      'Shareable evaluation snapshots for technical and non-technical review.',
    ],
    team: [
      createProjectTeamMember('marcus', 'ML Lead'),
      createProjectTeamMember('priya', 'Data Engineer'),
      createProjectTeamMember('sarah', 'Visualization Designer'),
      createProjectTeamMember('nina', 'Interface Engineer'),
    ],
  },
  {
    slug: 'sonic-labs',
    title: 'Sonic Labs',
    stack: 'Vue - WebAudio',
    techStack: ['Vue', 'WebAudio API', 'Tone.js', 'Canvas'],
    summary: 'An audio prototyping studio for shaping reactive sound experiences in the browser.',
    image: '/7.png',
    imageAlt: 'Sonic Labs preview',
    gallery: ['/7.png', '/8.png'],
    status: 'Live',
    cohort: 'Fall 2024',
    course: 'CS305: Creative Coding Systems',
    problem: [
      'Audio tooling on the web often separated synthesis, sequencing, and visual feedback into different contexts, making iteration slow and opaque.',
      'Creators needed a way to hear, see, and tune interactions from one environment without extra setup.',
    ],
    solution: [
      'Sonic Labs combines an interactive signal graph, real-time waveform monitors, and preset libraries into a browser-native audio studio.',
      'The experience is optimized for experimentation, encouraging teams to move quickly from idea to playable prototype.',
    ],
    innovations: [
      'Patch graph that visualizes sound routing and timing dependencies.',
      'Low-latency waveform views synchronized with playback events.',
      'Preset capture system for saving and comparing sonic explorations.',
    ],
    team: [
      createProjectTeamMember('nina', 'Creative Technologist'),
      createProjectTeamMember('marcus', 'Audio Systems Engineer'),
      createProjectTeamMember('sarah', 'Interaction Designer'),
      createProjectTeamMember('david', 'Performance QA'),
    ],
  },
  {
    slug: 'aether-stream',
    title: 'Aether Stream',
    stack: 'D3.js - WebGL',
    techStack: ['D3.js', 'WebGL', 'TypeScript', 'Worker Threads'],
    summary: 'A high-density visualization surface for understanding streaming datasets at scale.',
    image: '/8.png',
    imageAlt: 'Aether Stream preview',
    gallery: ['/8.png', '/6.png'],
    status: 'Completed',
    cohort: 'Fall 2025',
    course: 'CS480: Advanced Data Visualization',
    problem: [
      'Teams working with fast-moving behavioral data struggled to separate signal from noise once charts became dense, animated, and deeply layered.',
      'Traditional dashboards were not built to support both rapid pattern scanning and precise analytical inspection.',
    ],
    solution: [
      'Aether Stream uses worker-driven data prep and GPU-assisted rendering to keep visualizations fluid while preserving analytical depth.',
      'We designed the layout to help users move from overview to anomaly to explanation without losing their place.',
    ],
    innovations: [
      'Multi-resolution rendering pipeline for dense streaming charts.',
      'Cross-filtered annotation layer for correlating spikes and events.',
      'Interaction model that balances exploration with presentation readiness.',
    ],
    team: [
      createProjectTeamMember('priya', 'Data Visualization Engineer'),
      createProjectTeamMember('marcus', 'Rendering Engineer'),
      createProjectTeamMember('elena', 'Application Engineer'),
      createProjectTeamMember('sarah', 'Information Designer'),
    ],
  },
  {
    slug: 'minimal-script',
    title: 'Minimal Script',
    stack: 'TypeScript - Bun',
    techStack: ['TypeScript', 'Bun', 'Zod', 'CLI UX'],
    summary: 'A stripped-down automation toolkit for developer workflows that value clarity.',
    image: '/9.png',
    imageAlt: 'Minimal Script preview',
    gallery: ['/9.png', '/3.png'],
    status: 'Completed',
    cohort: 'Spring 2025',
    course: 'CS300: Developer Tooling',
    problem: [
      'Automation scripts tend to sprawl over time, leaving teams with fragile commands, unclear configuration, and poor onboarding for new contributors.',
      'We wanted to prove that developer tooling could stay powerful while remaining readable and pleasant to use.',
    ],
    solution: [
      'Minimal Script packages common automation tasks behind a clear CLI, typed configuration, and opinionated defaults that keep complexity under control.',
      'The interface favors fast understanding, reducing the time it takes to trust and extend team tooling.',
    ],
    innovations: [
      'Type-safe command configuration with inline validation feedback.',
      'Readable execution traces for debugging failed automation runs.',
      'Small-footprint runtime built for quick local and CI execution.',
    ],
    team: [
      createProjectTeamMember('alex', 'Tooling Engineer'),
      createProjectTeamMember('elena', 'Developer Experience Lead'),
      createProjectTeamMember('james', 'Infrastructure Partner'),
      createProjectTeamMember('nina', 'Interface Designer'),
    ],
  },
  {
    slug: 'metric-pro',
    title: 'Metric Pro',
    stack: 'Grafana - Prometheus',
    techStack: ['Grafana', 'Prometheus', 'Alertmanager', 'Go'],
    summary: 'An analytics cockpit for turning noisy telemetry into confident decisions.',
    image: '/10.png',
    imageAlt: 'Metric Pro preview',
    gallery: ['/10.png', '/5.png'],
    status: 'Completed',
    cohort: 'Fall 2025',
    course: 'CS430: Reliability Engineering',
    problem: [
      'Telemetry platforms often reward power users but overwhelm everyone else, especially when alerts, thresholds, and ownership paths are poorly organized.',
      'As a result, important performance signals were ignored until issues escalated into customer-facing incidents.',
    ],
    solution: [
      'Metric Pro reframes monitoring around story-driven context, grouping related metrics and alerts into interpretable operational narratives.',
      'That structure makes it easier for engineers and stakeholders to align around what changed, why it matters, and what to do next.',
    ],
    innovations: [
      'Narrative alert grouping that ties incidents to system context.',
      'Role-based dashboard layers for engineers, operators, and leads.',
      'Fast anomaly review views for postmortem and planning workflows.',
    ],
    team: [
      createProjectTeamMember('james', 'Reliability Lead'),
      createProjectTeamMember('priya', 'Telemetry Analyst'),
      createProjectTeamMember('alex', 'Platform Security Engineer'),
      createProjectTeamMember('sarah', 'Product Designer'),
    ],
  },
  {
    slug: 'atomic-ui',
    title: 'Atomic UI',
    stack: 'React - Storybook',
    techStack: ['React', 'Storybook', 'TypeScript', 'Chromatic'],
    summary: 'A polished component workshop for building and reviewing interface systems.',
    image: '/11.png',
    imageAlt: 'Atomic UI preview',
    gallery: ['/11.png', '/4.png'],
    status: 'Live',
    cohort: 'Spring 2026',
    course: 'CS340: Frontend Architecture',
    problem: [
      'Component libraries frequently stop at documentation, leaving teams without a strong review space for states, accessibility, and product-level composition.',
      'That gap made it difficult to evaluate whether a component was truly ready for production.',
    ],
    solution: [
      'Atomic UI adds review workflows, visual regression context, and composition sandboxes on top of a traditional component library.',
      'The result is a design-engineering workspace that helps teams validate quality before shipping.',
    ],
    innovations: [
      'Composition playgrounds for testing components in realistic scenarios.',
      'Built-in accessibility review panels alongside component states.',
      'Release workflows that package docs, tokens, and QA evidence together.',
    ],
    team: [
      createProjectTeamMember('nina', 'Frontend Lead'),
      createProjectTeamMember('sarah', 'UI Designer'),
      createProjectTeamMember('elena', 'Component Engineer'),
      createProjectTeamMember('marcus', 'QA Automation Engineer'),
    ],
  },
];

const featuredProjects = projectRecords.map(
  ({ slug, title, stack, image, imageAlt, tag, wide }) => ({
    slug,
    title,
    stack,
    image,
    imageAlt,
    tag,
    wide,
  })
);

void legacyFeaturedProjects;

const showcaseCollections = [
  {
    title: 'remindful',
    author: 'Alex Chen',
    platform: 'mobile',
    featured: true,
    publishedAt: '2026-04-18',
    image: '/12.png',
    imageAlt: 'remindful project preview',
    avatar: 'linear-gradient(135deg, #d8f0ff 0%, #91cadb 100%)',
  },
  {
    title: 'Vibecheck',
    author: 'Jordan Lee',
    platform: 'mobile',
    featured: false,
    publishedAt: '2026-04-16',
    image: '/13.png',
    imageAlt: 'Vibecheck project preview',
    avatar: 'linear-gradient(135deg, #d0f1e9 0%, #72b2a6 100%)',
  },
  {
    title: 'Connectr',
    author: 'Sam Taylor',
    platform: 'web',
    featured: true,
    publishedAt: '2026-04-17',
    image: '/14.png',
    imageAlt: 'Connectr project preview',
    avatar: 'linear-gradient(135deg, #dcefff 0%, #8bb5d3 100%)',
  },
  {
    title: 'Thread',
    author: 'Studio M',
    platform: 'web',
    featured: false,
    publishedAt: '2026-04-12',
    image: '/15.png',
    imageAlt: 'Thread project preview',
    avatar: 'linear-gradient(135deg, #111111 0%, #545454 100%)',
  },
  {
    title: 'Vault',
    author: 'Chris Wong',
    platform: 'mobile',
    featured: true,
    publishedAt: '2026-04-14',
    image: '/16.png',
    imageAlt: 'Vault project preview',
    avatar: 'linear-gradient(135deg, #d4f6f1 0%, #7ab8b4 100%)',
  },
  {
    title: 'Aura',
    author: 'Elena K.',
    platform: 'mobile',
    featured: true,
    publishedAt: '2026-04-20',
    image: '/17.png',
    imageAlt: 'Aura project preview',
    avatar: 'linear-gradient(135deg, #f4d9d1 0%, #c37d6d 100%)',
    fallbackPreview: 'aura',
  },
  {
    title: 'Flowstate',
    author: 'Mario G',
    platform: 'web',
    featured: true,
    publishedAt: '2026-04-19',
    image: '/18.png',
    imageAlt: 'Flowstate project preview',
    avatar: 'linear-gradient(135deg, #d9f6ef 0%, #74b89f 100%)',
    fallbackPreview: 'flowstate',
  },
  {
    title: 'Nexus',
    author: 'Derek L',
    platform: 'web',
    featured: false,
    publishedAt: '2026-04-15',
    image: '/19.png',
    imageAlt: 'Nexus project preview',
    avatar: 'linear-gradient(135deg, #c6e8f1 0%, #6ca3ba 100%)',
  },
  {
    title: 'Zenith',
    author: 'Sara W',
    platform: 'mobile',
    featured: false,
    publishedAt: '2026-04-11',
    image: '/20.png',
    imageAlt: 'Zenith project preview',
    avatar: 'linear-gradient(135deg, #d7f1e4 0%, #5ca985 100%)',
  },
  {
    title: 'Orbit',
    author: 'James L.',
    platform: 'web',
    featured: true,
    publishedAt: '2026-04-13',
    image: '/21.png',
    imageAlt: 'Orbit project preview',
    avatar: 'linear-gradient(135deg, #151515 0%, #555555 100%)',
  },
  {
    title: 'Lumina',
    author: 'Emily R.',
    platform: 'mobile',
    featured: false,
    publishedAt: '2026-04-10',
    image: '/22.png',
    imageAlt: 'Lumina project preview',
    avatar: 'linear-gradient(135deg, #f8d9cf 0%, #b55f4c 100%)',
  },
  {
    title: 'Pulse',
    author: 'Michael B.',
    platform: 'web',
    featured: false,
    publishedAt: '2026-04-09',
    image: '/23.png',
    imageAlt: 'Pulse project preview',
    avatar: 'linear-gradient(135deg, #f8d6d9 0%, #bf6c78 100%)',
  },
];

const showcasePlatformOptions = [
  { label: 'Mobile', value: 'mobile' },
  { label: 'Web', value: 'web' },
];

const showcaseSortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Recent', value: 'recent' },
];

const contributorFilterOptions = [
  { label: 'All Contributors', value: 'all' },
  { label: 'Web Devs', value: 'web' },
  { label: 'Mobile Devs', value: 'mobile' },
  { label: 'AI Engineers', value: 'ai' },
];

const contributors = [
  {
    name: 'Elena Rostova',
    role: 'Full-Stack Engineer',
    specialties: ['web'],
    skills: ['React', 'Node.js', 'AWS'],
    image: '/contributors/elena-rostova.jpg',
  },
  {
    name: 'Marcus Chen',
    role: 'AI Researcher',
    specialties: ['ai'],
    skills: ['Python', 'PyTorch', 'C++'],
    image: '/contributors/marcus-chen.jpg',
  },
  {
    name: 'Sarah Jenkins',
    role: 'UI/UX Designer',
    specialties: ['web'],
    skills: ['Figma', 'Framer', 'CSS'],
    image: '/contributors/sarah-jenkins.jpg',
  },
  {
    name: 'David Kim',
    role: 'Mobile Architect',
    specialties: ['mobile'],
    skills: ['Swift', 'Kotlin', 'GraphQL'],
    image: '/contributors/david-kim.jpg',
  },
  {
    name: 'Priya Patel',
    role: 'Data Engineer',
    specialties: ['ai'],
    skills: ['Spark', 'Kafka', 'SQL'],
    image: '/contributors/priya-patel.jpg',
  },
  {
    name: 'James Wilson',
    role: 'DevOps Lead',
    specialties: ['web', 'ai'],
    skills: ['Kubernetes', 'Terraform', 'CI/CD'],
    image: '/contributors/james-wilson.jpg',
  },
  {
    name: 'Nina Gonzalez',
    role: 'Frontend Specialist',
    specialties: ['web'],
    skills: ['Vue', 'Nuxt', 'Tailwind'],
    image: '/contributors/nina-gonzalez.jpg',
  },
  {
    name: 'Alex Thorne',
    role: 'Security Engineer',
    specialties: ['mobile', 'ai'],
    skills: ['Rust', 'Go', 'Cryptography'],
    image: '/contributors/alex-thorne.jpg',
  },
];

function getVisibleShowcaseCollections(activePlatform, activeSort) {
  const filteredCollections = showcaseCollections.filter(
    (collection) => collection.platform === activePlatform
  );

  return filteredCollections.sort((firstCollection, secondCollection) => {
    const recentDifference =
      Date.parse(secondCollection.publishedAt) - Date.parse(firstCollection.publishedAt);

    if (activeSort === 'recent') {
      return recentDifference;
    }

    if (firstCollection.featured === secondCollection.featured) {
      return recentDifference;
    }

    return Number(secondCollection.featured) - Number(firstCollection.featured);
  });
}

function getVisibleContributors(activeContributorFilter) {
  if (activeContributorFilter === 'all') {
    return contributors;
  }

  return contributors.filter((contributor) =>
    contributor.specialties.includes(activeContributorFilter)
  );
}

function getProjectRecord(projectSlug) {
  return projectRecords.find((project) => project.slug === projectSlug) || null;
}

function CodeMark() {
  return (
    <svg
      aria-hidden="true"
      className="brand__icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.2 7.1 2.3 12l3.9 4.9" />
      <path d="M13.2 4.1 10 19.9" />
      <path d="m17.8 7.1 3.9 4.9-3.9 4.9" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="button__icon"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="project-detail__gallery-nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m14.5 6-6 6 6 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="project-detail__gallery-nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg
      aria-hidden="true"
      className="footer__icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.41-4.04-1.41-.55-1.38-1.34-1.74-1.34-1.74-1.1-.76.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.08 1.83 2.82 1.3 3.5.99.1-.77.42-1.3.77-1.6-2.67-.3-5.47-1.31-5.47-5.86 0-1.3.47-2.37 1.24-3.2-.12-.3-.53-1.52.12-3.16 0 0 1.01-.32 3.3 1.22a11.52 11.52 0 0 1 6 0c2.29-1.54 3.3-1.22 3.3-1.22.65 1.64.24 2.86.12 3.16.77.83 1.24 1.9 1.24 3.2 0 4.56-2.81 5.55-5.49 5.85.43.37.82 1.09.82 2.2v3.27c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="heart-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 20.4c-4.98-3.1-8-5.92-8-9.5a4.72 4.72 0 0 1 4.8-4.8c1.54 0 2.76.65 3.2 1.3.44-.65 1.66-1.3 3.2-1.3a4.72 4.72 0 0 1 4.8 4.8c0 3.58-3.02 6.4-8 9.5Z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="project-detail__author-action-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 5.5h8a1 1 0 0 1 1 1v12.2l-5-3.2-5 3.2V6.5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="check-circle-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.2 2.2 2.3 4.8-5.2" />
    </svg>
  );
}

function Header({ activePath }) {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a className="brand" href="/" aria-label="Codefolio home">
          <CodeMark />
          <span>Codefolio</span>
        </a>

        <nav className="site-nav" aria-label="Primary">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              className={`site-nav__link ${activePath === item.href ? 'site-nav__link--active' : ''}`}
              href={toAppHref(item.href)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-actions">
          <a className="site-actions__login" href={toAppHref("/login")}>
            Login
          </a>
          <a className="pill-button pill-button--dark pill-button--small" href="/">
            Sign up
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="container">
        <div className="site-footer__top">
          <a className="brand brand--footer" href="/">
            <span>Codefolio</span>
          </a>

          <nav className="site-footer__nav" aria-label="Footer">
            {footerItems.map((item) => (
              <a key={item.label} className="site-footer__link" href={toAppHref(item.href)}>
                {item.label}
              </a>
            ))}
          </nav>

          <a className="site-footer__github" href="/" aria-label="GitHub">
            <GithubIcon />
          </a>
        </div>

        <div className="site-footer__bottom">COPYRIGHT 2026 KORVEX - PROJECT MANAGEMENT</div>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-section__inner">
          <h1 className="hero-title">
            <span>Discover real-world</span>
            <span>Engineering inspiration</span>
          </h1>

          <p className="hero-copy">
            A curated gallery of engineering excellence. Discover high-performance
            portfolios and the systems that power them.
          </p>

          <div className="hero-actions">
            <a className="pill-button pill-button--dark" href="/">
              Join for free
            </a>
            <a className="pill-button pill-button--light" href={toAppHref("/showcases")}>
              Explore showcases
            </a>
          </div>

          <div className="trust-strip">
            <p className="trust-strip__label">Trusted by modern engineering teams</p>
            <div className="trust-strip__logos">
              {trustLogos.map((logo) => (
                <img
                  key={logo.alt}
                  className="trust-strip__logo"
                  src={logo.src}
                  alt={logo.alt}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="projects-section" id="community" aria-labelledby="projects-heading">
        <div className="container projects-section__inner">
          <h2 className="sr-only" id="projects-heading">
            Featured projects
          </h2>

          <div className="project-filters" role="tablist" aria-label="Project filters">
            {homeFilterItems.map((item, index) => (
              <button
                key={item}
                className={`project-filters__pill ${index === 0 ? 'project-filters__pill--active' : ''}`}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {featuredProjects.map((project) => (
              <article key={project.title} className="project-card">
                <a className="project-card__link" href={toAppHref(`/projects/${project.slug}`)}>
                  <img
                    className="project-card__image"
                    src={project.image}
                    alt={project.imageAlt}
                    loading="lazy"
                  />

                  <div className="project-card__content">
                    <div className="project-card__top">
                      <h3 className="project-card__title">{project.title}</h3>
                      {project.tag ? (
                        <span className="project-card__badge">{project.tag}</span>
                      ) : null}
                    </div>
                    <p className="project-card__stack">{project.stack}</p>
                  </div>
                </a>
              </article>
            ))}
          </div>

          <div className="projects-section__footer">
            <button className="load-more-button" type="button">
              <span>Load more projects</span>
              <ChevronDownIcon />
            </button>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-section__inner">
          <h2 className="cta-section__title">Ready to ship?</h2>
          <p className="cta-section__copy">
            Join the elite community of builders defining the next generation of the
            web.
          </p>
          <a className="pill-button pill-button--dark cta-section__button" href={toAppHref("/showcases")}>
            Browse collections
          </a>
        </div>
      </section>
    </>
  );
}

function ShowcasePreview({ collection }) {
  if (collection.fallbackPreview === 'aura') {
    return (
      <div
        className="showcase-preview showcase-preview--aura"
        role="img"
        aria-label={collection.imageAlt}
      >
        <img
          className="showcase-preview__ghost"
          src={collection.image}
          alt=""
          aria-hidden="true"
        />
        <div className="showcase-preview__screen">
          <div className="showcase-preview__play">
            <div className="showcase-preview__play-circle" />
          </div>
          <div className="showcase-preview__slider">
            <span />
            <span />
            <span />
          </div>
          <div className="showcase-preview__controls">
            <span />
            <span className="showcase-preview__controls--active" />
            <span />
          </div>
        </div>
      </div>
    );
  }

  if (collection.fallbackPreview === 'flowstate') {
    return (
      <div
        className="showcase-preview showcase-preview--flowstate"
        role="img"
        aria-label={collection.imageAlt}
      >
        <img
          className="showcase-preview__ghost"
          src={collection.image}
          alt=""
          aria-hidden="true"
        />
        <div className="showcase-preview__panel">
          <span className="showcase-preview__label">Modern</span>
          <span className="showcase-preview__title">flowstate</span>
          <div className="showcase-preview__field" />
          <div className="showcase-preview__field showcase-preview__field--wide" />
          <div className="showcase-preview__button" />
        </div>
      </div>
    );
  }

  return (
    <img
      className="showcase-preview showcase-preview--image"
      src={collection.image}
      alt={collection.imageAlt}
      loading="lazy"
    />
  );
}

function ShowcasesPage() {
  const [activePlatform, setActivePlatform] = useState('mobile');
  const [activeSort, setActiveSort] = useState('featured');
  const visibleCollections = getVisibleShowcaseCollections(activePlatform, activeSort);

  return (
    <section className="showcases-page" aria-labelledby="showcases-heading">
      <div className="container container--showcases">
        <div className="showcases-page__hero">
          <h1 className="showcases-page__title" id="showcases-heading">
            Community collections
          </h1>
          <p className="showcases-page__copy">
            Explore collections from the Codefolio Community. Grab your chance to be
            featured, submit your collections.
          </p>
        </div>

        <div className="showcases-page__controls" aria-label="Collection type">
          <div className="showcase-toggle" aria-label="Collection platform">
            {showcasePlatformOptions.map((option) => (
              <button
                key={option.value}
                className={`showcase-toggle__button ${
                  activePlatform === option.value ? 'showcase-toggle__button--active' : ''
                }`}
                type="button"
                aria-pressed={activePlatform === option.value}
                onClick={() => setActivePlatform(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="showcase-tabs" aria-label="Collection sort">
          {showcaseSortOptions.map((option) => (
            <button
              key={option.value}
              className={`showcase-tabs__button ${
                activeSort === option.value ? 'showcase-tabs__button--active' : ''
              }`}
              type="button"
              aria-pressed={activeSort === option.value}
              onClick={() => setActiveSort(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="showcases-grid">
          {visibleCollections.map((collection) => (
            <article key={collection.title} className="showcase-card">
              <div className="showcase-card__media">
                <ShowcasePreview collection={collection} />
              </div>

              <div className="showcase-card__content">
                <div>
                  <h2 className="showcase-card__title">{collection.title}</h2>
                  <div className="showcase-card__author">
                    <span
                      aria-hidden="true"
                      className="showcase-card__avatar"
                      style={{ '--avatar-fill': collection.avatar }}
                    />
                    <span>{collection.author}</span>
                  </div>
                </div>

                <button
                  className="showcase-card__favorite"
                  type="button"
                  aria-label={`Save ${collection.title}`}
                >
                  <HeartIcon />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="showcases-page__footer">
          <button className="load-more-button load-more-button--soft" type="button">
            Load more
          </button>
        </div>
      </div>
    </section>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="project-detail__close-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 7 17 17" />
      <path d="M17 7 7 17" />
    </svg>
  );
}

function ProjectDetailPage({ project, onClose }) {
  const [activeGalleryPage, setActiveGalleryPage] = useState(0);
  const primaryMember = project.team[0] || null;
  const galleryImages = getProjectGalleryImages(project);
  const galleryPageSize = 2;
  const galleryPageCount = Math.ceil(galleryImages.length / galleryPageSize);
  const galleryStartIndex = activeGalleryPage * galleryPageSize;
  const visibleGalleryImages = galleryImages.slice(
    galleryStartIndex,
    galleryStartIndex + galleryPageSize
  );
  const hasGalleryControls = galleryPageCount > 1;
  const projectYear = project.cohort.match(/\d{4}/)?.[0] || project.cohort;

  useEffect(() => {
    setActiveGalleryPage(0);
  }, [project.slug]);

  function handlePreviousGalleryImage() {
    setActiveGalleryPage((currentPage) =>
      currentPage === 0 ? galleryPageCount - 1 : currentPage - 1
    );
  }

  function handleNextGalleryImage() {
    setActiveGalleryPage((currentPage) =>
      currentPage === galleryPageCount - 1 ? 0 : currentPage + 1
    );
  }

  return (
    <section className="project-detail-page" aria-labelledby="project-detail-heading">
      <div className="container container--project-detail">
        <header className="project-detail__hero">
          <div className="project-detail__hero-bar">
            <div className="project-detail__title-line">
              <h1 className="project-detail__title" id="project-detail-heading">
                {project.title}
              </h1>
            </div>

            <button
              className="project-detail__close"
              type="button"
              onClick={onClose}
              aria-label="Close project description"
            >
              <CloseIcon />
            </button>
          </div>

          {primaryMember ? (
            <div className="project-detail__author">
              <div className="project-detail__author-meta">
                <img
                  className="project-detail__author-avatar"
                  src={primaryMember.image}
                  alt={primaryMember.name}
                />
                <div className="project-detail__author-copy">
                  <p className="project-detail__author-line">
                    <span className="project-detail__author-name">{primaryMember.name}</span>
                    <span className="project-detail__author-role">{primaryMember.role}</span>
                  </p>
                </div>
              </div>

              <div className="project-detail__author-actions" aria-label="Project actions">
                <button className="project-detail__author-icon-button" type="button" aria-label="Save project">
                  <HeartIcon />
                </button>
                <button className="project-detail__author-icon-button" type="button" aria-label="Bookmark project">
                  <BookmarkIcon />
                </button>
                <button className="project-detail__author-contact" type="button">
                  Get in touch
                </button>
              </div>
            </div>
          ) : null}
          <img
            className="project-detail__hero-image"
            src={project.image}
            alt={project.imageAlt}
          />
        </header>

        <section className="project-detail__meta-grid" aria-label="Project details">
          <div className="project-detail__meta-block">
            <span className="project-detail__eyebrow">Tech Stack</span>
            <div className="project-detail__chips">
              {project.techStack.map((item) => (
                <span key={item} className="project-detail__chip">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="project-detail__meta-block project-detail__meta-block--align-end">
            <span className="project-detail__eyebrow">Links</span>
            <div className="project-detail__actions">
              <button className="project-detail__action project-detail__action--light" type="button">
                GitHub Repository
              </button>
              <button className="project-detail__action project-detail__action--dark" type="button">
                Live Demo
              </button>
            </div>
          </div>

          <div className="project-detail__meta-block project-detail__meta-block--year-status">
            <div>
              <span className="project-detail__eyebrow">Year</span>
              <strong className="project-detail__meta-value">{projectYear}</strong>
            </div>

            <div className="project-detail__meta-status">
              <span className="project-detail__eyebrow project-detail__eyebrow--right">Project Status</span>
              <span className="project-detail__status project-detail__status--detail">{project.status}</span>
            </div>
          </div>
        </section>

        <section className="project-detail__section project-detail__section--split">
          <div className="project-detail__section-heading">
            <h2 className="project-detail__section-title">The Problem</h2>
            <span className="project-detail__section-rule" aria-hidden="true" />
          </div>
          <div className="project-detail__section-body">
            {project.problem.map((paragraph) => (
              <p key={paragraph} className="project-detail__paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="project-detail__section project-detail__section--split">
          <div className="project-detail__section-heading">
            <h2 className="project-detail__section-title">The Solution</h2>
            <span className="project-detail__section-rule" aria-hidden="true" />
          </div>
          <div className="project-detail__section-body">
            {project.solution.map((paragraph) => (
              <p key={paragraph} className="project-detail__paragraph">
                {paragraph}
              </p>
            ))}
            <div className="project-detail__innovation-card">
              <h3 className="project-detail__innovation-title">Key Innovations</h3>
              <div className="project-detail__innovation-list">
                {project.innovations.map((innovation) => (
                  <div key={innovation} className="project-detail__innovation-item">
                    <CheckCircleIcon />
                    <p>{innovation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="project-detail__section" aria-labelledby="project-gallery-heading">
          <div className="project-detail__section-heading project-detail__section-heading--stacked">
            <h2 className="project-detail__section-title" id="project-gallery-heading">
              Gallery
            </h2>
          </div>
          <div className="project-detail__gallery">
            {hasGalleryControls ? (
              <button
                className="project-detail__gallery-nav project-detail__gallery-nav--left"
                type="button"
                onClick={handlePreviousGalleryImage}
                aria-label="Show previous gallery image"
              >
                <ChevronLeftIcon />
              </button>
            ) : null}

            <div className="project-detail__gallery-track">
              {visibleGalleryImages.map((imagePath, index) => (
                <img
                  key={`${imagePath}-${galleryStartIndex + index}`}
                  className="project-detail__gallery-image"
                  src={imagePath}
                  alt={`${project.title} gallery preview ${galleryStartIndex + index + 1}`}
                  loading="lazy"
                />
              ))}
            </div>

            {hasGalleryControls ? (
              <button
                className="project-detail__gallery-nav project-detail__gallery-nav--right"
                type="button"
                onClick={handleNextGalleryImage}
                aria-label="Show next gallery image"
              >
                <ChevronRightIcon />
              </button>
            ) : null}
          </div>
        </section>

        <section className="project-detail__section" aria-labelledby="project-team-heading">
          <div className="project-detail__section-heading project-detail__section-heading--stacked">
            <h2 className="project-detail__section-title" id="project-team-heading">
              Meet the Team
            </h2>
            <p className="project-detail__team-copy">
              The engineers and designers who brought {project.title} to life.
            </p>
          </div>

          <div className="project-detail__team-grid">
            {project.team.map((member) => (
              <article key={`${project.slug}-${member.name}`} className="project-detail__team-member">
                <img
                  className="project-detail__team-avatar"
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                />
                <h3 className="project-detail__team-name">{member.name}</h3>
                <p className="project-detail__team-role">{member.role}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function ContributorsPage() {
  const [activeContributorFilter, setActiveContributorFilter] = useState('all');
  const visibleContributors = getVisibleContributors(activeContributorFilter);

  return (
    <section className="contributors-page" aria-labelledby="contributors-heading">
      <div className="container container--contributors">
        <div className="contributors-page__hero">
          <h1 className="contributors-page__title" id="contributors-heading">
            <span>Meet the</span>
            <span>contributors</span>
          </h1>
          <p className="contributors-page__copy">
            The home of RCA&apos;s technical talent. Discover the engineers, designers,
            and visionaries building the future of our ecosystem.
          </p>

          <div className="contributor-filters" aria-label="Contributor specialties">
            {contributorFilterOptions.map((option) => (
              <button
                key={option.value}
                className={`contributor-filters__button ${
                  activeContributorFilter === option.value
                    ? 'contributor-filters__button--active'
                    : ''
                }`}
                type="button"
                aria-pressed={activeContributorFilter === option.value}
                onClick={() => setActiveContributorFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="contributors-grid">
          {visibleContributors.map((contributor) => (
            <article key={contributor.name} className="contributor-card">
              <img
                className="contributor-card__portrait"
                src={contributor.image}
                alt={contributor.name}
                loading="lazy"
              />
              <h2 className="contributor-card__name">{contributor.name}</h2>
              <p className="contributor-card__role">{contributor.role}</p>
              <div className="contributor-card__skills" aria-label={`${contributor.name} skills`}>
                {contributor.skills.map((skill) => (
                  <span key={skill} className="contributor-card__skill">
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function App() {
  const [pathname, setPathname] = useState(getCurrentPath);

  useEffect(() => {
    function syncPathname() {
      setPathname(getCurrentPath());
    }

    syncPathname();
    window.addEventListener('hashchange', syncPathname);
    window.addEventListener('popstate', syncPathname);

    return () => {
      window.removeEventListener('hashchange', syncPathname);
      window.removeEventListener('popstate', syncPathname);
    };
  }, []);

  const isDashboardPage = pathname === '/dashboard';
  const isLoginPage = pathname === '/login';
  const isShowcasesPage = pathname === '/showcases';
  const isDashboardShowcasesPage = pathname === '/dashboard/showcases';
  const isAnyShowcasesPage = isShowcasesPage || isDashboardShowcasesPage;
  const isContributorsPage = pathname === '/contributors';
  const isDashboardContributorsPage = pathname === '/dashboard/contributors';
  const isAnyContributorsPage = isContributorsPage || isDashboardContributorsPage;
  const isProfilePage = pathname === '/profile';
  const isProfileUploadPage = pathname === '/profile/upload';
  const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
  const activeProject = projectMatch ? getProjectRecord(projectMatch[1]) : null;
  const isProjectDetailPage = Boolean(activeProject);

  function handleCloseProjectDetail() {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.hash = '/';
  }

  if (isDashboardPage) {
    return (
      <div className="page-shell page-shell--dashboard">
        <DashboardPage projects={featuredProjects} toAppHref={toAppHref} />
        <Footer />
      </div>
    );
  }

  if (isLoginPage) {
    return (
      <div className="page-shell page-shell--login">
        <main>
          <LoginPage />
        </main>
      </div>
    );
  }

  if (isProfileUploadPage) {
    return (
      <div className="page-shell page-shell--upload">
        <main>
          <UploadShotPage toAppHref={toAppHref} />
        </main>
      </div>
    );
  }

  return (
    <div
      className={`page-shell ${isAnyShowcasesPage ? 'page-shell--showcases' : ''} ${
        isAnyContributorsPage ? 'page-shell--contributors' : ''
      } ${isProfilePage ? 'page-shell--profile' : ''} ${
        isProjectDetailPage ? 'page-shell--project-detail' : ''
      }`}
    >
      {!isProjectDetailPage &&
      (isDashboardShowcasesPage || isDashboardContributorsPage || isProfilePage) ? (
        <DashboardHeader
          toAppHref={toAppHref}
          activePath={
            isDashboardShowcasesPage
              ? '/dashboard/showcases'
              : isDashboardContributorsPage
                ? '/dashboard/contributors'
                : '/dashboard'
          }
        />
      ) : !isProjectDetailPage ? (
        <Header
          activePath={
            isShowcasesPage ? '/showcases' : isContributorsPage ? '/contributors' : '/'
          }
        />
      ) : null}

      <main>
        {isProjectDetailPage ? (
          <ProjectDetailPage project={activeProject} onClose={handleCloseProjectDetail} />
        ) : isProfilePage ? (
          <ProfilePage toAppHref={toAppHref} />
        ) : isAnyContributorsPage ? (
          <ContributorsPage />
        ) : isAnyShowcasesPage ? (
          <ShowcasesPage />
        ) : (
          <LandingPage />
        )}
      </main>

      {!isProfilePage ? <Footer /> : null}
    </div>
  );
}

export default App;
