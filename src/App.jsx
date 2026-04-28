import { useEffect, useState } from 'react';
import { api } from './api';
import DashboardPage, { DashboardHeader } from './DashboardPage.jsx';
import ChatWithAiPage from './ChatWithAiPage.jsx';
import InfoPage from './InfoPage.jsx';
import LoginPage from './LoginPage.jsx';
import ProfilePage from './ProfilePage.jsx';
import PublicProfilePage from './PublicProfilePage.jsx';
import SettingsPage from './SettingsPage.jsx';
import SignupPage from './SignupPage.jsx';
import UploadShotPage from './UploadShotPage.jsx';
import AuthPage from './AuthPage.jsx';

function getCurrentPath() {
  if (typeof window === 'undefined') {
    return '/';
  }

  // Support both for backward compatibility during transition
  const hashPath = window.location.hash.startsWith('#/')
    ? window.location.hash.slice(1)
    : '';

  return (hashPath || window.location.pathname).replace(/\/+$/, '') || '/';
}

function toAppHref(path) {
  if (!path) return '/';
  // If it already has a hash, keep it (legacy)
  if (path.startsWith('/#')) return path;
  // Otherwise, return a clean path (no hash)
  return path.startsWith('/') ? path : `/${path}`;
}
const navigationItems = [
  { label: 'Explore', href: '/' },
  { label: 'Showcases', href: '/showcases' },
  { label: 'Contributors', href: '/contributors' },
];

const homeFilterItems = ['Popular', 'Recent', 'Followed'];
const footerItems = [
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Contact', href: '/contact' },
];

const trustLogos = [
  { src: '/withintech.png', alt: 'Withintech' },
  { src: '/academicbridge.png', alt: 'Academic Bridge' },
  { src: '/irembo.png', alt: 'Irembo' },
];

const legacyFeaturedProjects = [
  {
    title: 'Obsidian Core',
    stack: 'React ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Rust ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ WASM',
    image: '/1.png',
    imageAlt: 'Obsidian Core preview',
    tag: 'NEW',
  },
  {
    title: 'Lumina Dev',
    stack: 'Next.js ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ three.js',
    image: '/2.png',
    imageAlt: 'Lumina Dev preview',
  },
  {
    title: 'alow State',
    stack: 'Node ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ GraphÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© L',
    image: '/3.png',
    imageAlt: 'alow State preview',
  },
  {
    title: 'Synthetix',
    stack: 'Svelte ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Tailwind',
    image: '/4.png',
    imageAlt: 'Synthetix preview',
  },
  {
    title: 'Monolith Infrastructure',
    stack: 'Go ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Kubernetes ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Docker',
    image: '/5.png',
    imageAlt: 'Monolith Infrastructure preview',
    tag: 'FEATURED',
    wide: true,
  },
  {
    title: 'Vortex AI',
    stack: 'Python ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ PyTorch',
    image: '/6.png',
    imageAlt: 'Vortex AI preview',
  },
  {
    title: 'Sonic Labs',
    stack: 'Vue ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ WebAudio',
    image: '/7.png',
    imageAlt: 'Sonic Labs preview',
  },
  {
    title: 'Aether Stream',
    stack: 'D3.js ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ WebGL',
    image: '/8.png',
    imageAlt: 'Aether Stream preview',
  },
  {
    title: 'Minimal Script',
    stack: 'TypeScript ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Bun',
    image: '/9.png',
    imageAlt: 'Minimal Script preview',
  },
  {
    title: 'Metric Pro',
    stack: 'Grafana ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Prometheus',
    image: '/10.png',
    imageAlt: 'Metric Pro preview',
  },
  {
    title: 'Atomic UI',
    stack: 'React ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Storybook',
    image: '/11.png',
    imageAlt: 'Atomic UI preview',
  },
];

const projectTeamProfiles = {
  elena: {
    slug: 'elena-rostova',
    name: 'Elena Rostova',
    image: '/contributors/elena-rostova.jpg',
  },
  marcus: {
    slug: 'marcus-chen',
    name: 'Marcus Chen',
    image: '/contributors/marcus-chen.jpg',
  },
  sarah: {
    slug: 'sarah-jenkins',
    name: 'Sarah Jenkins',
    image: '/contributors/sarah-jenkins.jpg',
  },
  david: { slug: 'david-kim', name: 'David Kim', image: '/contributors/david-kim.jpg' },
  priya: { slug: 'priya-patel', name: 'Priya Patel', image: '/contributors/priya-patel.jpg' },
  james: {
    slug: 'james-wilson',
    name: 'James Wilson',
    image: '/contributors/james-wilson.jpg',
  },
  nina: {
    slug: 'nina-gonzalez',
    name: 'Nina Gonzalez',
    image: '/contributors/nina-gonzalez.jpg',
  },
  alex: { slug: 'alex-thorne', name: 'Alex Thorne', image: '/contributors/alex-thorne.jpg' },
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
  const images = [...new Set(initialImages)].filter(Boolean);
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
    slug: 'elena-rostova',
    name: 'Elena Rostova',
    role: 'Full-Stack Engineer',
    specialties: ['web'],
    skills: ['React', 'Node.js', 'AWS'],
    location: 'Kigali',
    headline: 'designs resilient product systems with polished, performance-first interfaces.',
    image: '/contributors/elena-rostova.jpg',
    contact: {
      github: 'https://github.com/elena-rostova',
      linkedin: 'https://www.linkedin.com/in/elena-rostova/',
      email: 'elena.rostova@codefolio.dev',
    },
  },
  {
    slug: 'marcus-chen',
    name: 'Marcus Chen',
    role: 'AI Researcher',
    specialties: ['ai'],
    skills: ['Python', 'PyTorch', 'C++'],
    location: 'Nairobi',
    headline: 'builds applied AI tooling that turns research workflows into usable products.',
    image: '/contributors/marcus-chen.jpg',
    contact: {
      github: 'https://github.com/marcus-chen',
      linkedin: 'https://www.linkedin.com/in/marcus-chen/',
      email: 'marcus.chen@codefolio.dev',
    },
  },
  {
    slug: 'sarah-jenkins',
    name: 'Sarah Jenkins',
    role: 'UI/UX Designer',
    specialties: ['web'],
    skills: ['Figma', 'Framer', 'CSS'],
    location: 'Kigali',
    headline: 'translates complex engineering work into crisp, human-centered product experiences.',
    image: '/contributors/sarah-jenkins.jpg',
    contact: {
      github: 'https://github.com/sarah-jenkins',
      linkedin: 'https://www.linkedin.com/in/sarah-jenkins/',
      email: 'sarah.jenkins@codefolio.dev',
    },
  },
  {
    slug: 'david-kim',
    name: 'David Kim',
    role: 'Mobile Architect',
    specialties: ['mobile'],
    skills: ['Swift', 'Kotlin', 'GraphQL'],
    location: 'Lagos',
    headline: 'ships cross-platform mobile systems with strong reliability and smooth data sync.',
    image: '/contributors/david-kim.jpg',
    contact: {
      github: 'https://github.com/david-kim',
      linkedin: 'https://www.linkedin.com/in/david-kim/',
      email: 'david.kim@codefolio.dev',
    },
  },
  {
    slug: 'priya-patel',
    name: 'Priya Patel',
    role: 'Data Engineer',
    specialties: ['ai'],
    skills: ['Spark', 'Kafka', 'SQL'],
    location: 'Bengaluru',
    headline: 'turns noisy pipelines into dependable data products and measurable insights.',
    image: '/contributors/priya-patel.jpg',
    contact: {
      github: 'https://github.com/priya-patel',
      linkedin: 'https://www.linkedin.com/in/priya-patel/',
      email: 'priya.patel@codefolio.dev',
    },
  },
  {
    slug: 'james-wilson',
    name: 'James Wilson',
    role: 'DevOps Lead',
    specialties: ['web', 'ai'],
    skills: ['Kubernetes', 'Terraform', 'CI/CD'],
    location: 'Cape Town',
    headline: 'keeps delivery fast and reliable with hardened cloud platforms and smart automation.',
    image: '/contributors/james-wilson.jpg',
    contact: {
      github: 'https://github.com/james-wilson',
      linkedin: 'https://www.linkedin.com/in/james-wilson/',
      email: 'james.wilson@codefolio.dev',
    },
  },
  {
    slug: 'nina-gonzalez',
    name: 'Nina Gonzalez',
    role: 'Frontend Specialist',
    specialties: ['web'],
    skills: ['Vue', 'Nuxt', 'Tailwind'],
    location: 'Kigali',
    headline: 'crafts ambitious frontend experiences with sharp interaction detail and strong performance.',
    image: '/contributors/nina-gonzalez.jpg',
    contact: {
      github: 'https://github.com/nina-gonzalez',
      linkedin: 'https://www.linkedin.com/in/nina-gonzalez/',
      email: 'nina.gonzalez@codefolio.dev',
    },
  },
  {
    slug: 'alex-thorne',
    name: 'Alex Thorne',
    role: 'Security Engineer',
    specialties: ['mobile', 'ai'],
    skills: ['Rust', 'Go', 'Cryptography'],
    location: 'Johannesburg',
    headline: 'focuses on secure-by-default platforms, identity flows, and systems hardening.',
    image: '/contributors/alex-thorne.jpg',
    contact: {
      github: 'https://github.com/alex-thorne',
      linkedin: 'https://www.linkedin.com/in/alex-thorne/',
      email: 'alex.thorne@codefolio.dev',
    },
  },
];

const defaultNotificationPreferences = {
  newProjectComments: true,
  mentionsInDiscussions: true,
  projectLikesAndBookmarks: false,
  cohortUpdates: true,
  newProjectsInYourStack: false,
};

const emptyGuestUser = {
  id: null,
  slug: null,
  username: null,
  accountEmail: null,
  name: null,
  role: null,
  location: null,
  headline: null,
  bio: null,
  image: null,
  avatar_url: null,
  skills: [],
  specialties: [],
  contact: {
    email: '',
    phone: '',
    website: '',
    github: '',
    linkedin: '',
  },
  education: [],
  notifications: defaultNotificationPreferences,
};


const currentUserProjectSeeds = [
  {
    slug: 'community-loop',
    title: 'Community Loop',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Socket.IO'],
    summary: 'A collaboration hub that helps RCA builders share progress, recruit teammates, and surface portfolio-ready work.',
    image: '/17.png',
    gallery: ['/17.png', '/14.png', '/18.png'],
    status: 'Live',
    year: '2026',
    event: 'RCA Product Studio',
    problem: [
      'Student builders needed a single place to showcase progress, discover teammates, and keep project momentum visible across cohorts.',
      'Existing communication channels were fragmented, so promising projects often disappeared before they could gather feedback or collaborators.',
    ],
    solution: [
      'Community Loop combines project publishing, contributor discovery, and lightweight discussion into one polished workspace for student teams.',
      'The experience keeps the portfolio layer visible while still feeling collaborative, making it easier to move from idea to shipped work.',
    ],
    innovations: [
      'Portfolio-first project discovery tuned for student work.',
      'Contributor matching powered by technical interests and availability.',
      'Feedback loops that connect critiques directly to project milestones.',
    ],
    team: [
      { slug: 'sarah-jenkins', role: 'Product Designer' },
      { slug: 'marcus-chen', role: 'AI Matching Engineer' },
    ],
    visibility: 'published',
    collections: ['Community Platforms', 'Portfolio Highlights'],
    tags: ['Community', 'Collaboration', 'Portfolio'],
    feedbackRequested: true,
    reviewAverage: 4.8,
    reviewCount: 28,
    repositoryUrl: 'https://github.com/codefolio/community-loop',
    liveDemoUrl: 'https://community-loop.codefolio.app',
    updatedAt: '2026-04-22',
  },
  {
    slug: 'studio-ops',
    title: 'Studio Ops',
    techStack: ['Vite', 'React', 'Express', 'SQLite'],
    summary: 'An operations dashboard for coordinating coursework deadlines, reviews, and technical project submissions.',
    image: '/18.png',
    gallery: ['/18.png', '/21.png', '/22.png'],
    status: 'Completed',
    year: '2025',
    event: 'Capstone Systems Lab',
    problem: [
      'Project coordination across review cycles often lived in scattered spreadsheets, messages, and disconnected reminder tools.',
      'That made it difficult to understand who was blocked, which milestones were at risk, and what needed attention next.',
    ],
    solution: [
      'Studio Ops centralizes project schedules, owner visibility, and review status tracking in a single calm workspace.',
      'The result is an operational surface that feels structured enough for mentors while still lightweight for student teams.',
    ],
    innovations: [
      'Unified milestone board for course and capstone deliverables.',
      'Review checkpoints that stay attached to each project record.',
      'Simple operational summaries for mentors and team leads.',
    ],
    team: [
      { slug: 'james-wilson', role: 'Platform Advisor' },
      { slug: 'priya-patel', role: 'Data Workflow Engineer' },
    ],
    visibility: 'published',
    collections: ['Systems Thinking'],
    tags: ['Operations', 'Education', 'Workflow'],
    feedbackRequested: false,
    reviewAverage: 4.6,
    reviewCount: 16,
    repositoryUrl: 'https://github.com/codefolio/studio-ops',
    liveDemoUrl: '',
    updatedAt: '2026-04-18',
  },
  {
    slug: 'mentor-grid',
    title: 'Mentor Grid',
    techStack: ['React', 'Supabase', 'Tailwind CSS'],
    summary: 'A mentor coordination prototype for pairing students with project reviewers and industry support.',
    image: '/19.png',
    gallery: ['/19.png', '/20.png'],
    status: 'In Review',
    year: '2026',
    event: 'Independent Exploration',
    problem: [
      'Students often struggled to find the right mentor quickly once a project moved beyond informal feedback.',
      'Without structured matching, review opportunities depended too heavily on timing and personal networks.',
    ],
    solution: [
      'Mentor Grid is exploring a more intentional routing model that pairs projects with mentors based on focus area, availability, and review history.',
    ],
    innovations: [
      'Mentor matching logic shaped around student project stages.',
      'Reusable review briefs that reduce mentor onboarding friction.',
    ],
    team: [{ slug: 'nina-gonzalez', role: 'Frontend Reviewer' }],
    visibility: 'draft',
    collections: ['Draft Concepts'],
    tags: ['Mentorship', 'Review', 'Prototype'],
    feedbackRequested: true,
    reviewAverage: 0,
    reviewCount: 0,
    repositoryUrl: 'https://github.com/codefolio/mentor-grid',
    liveDemoUrl: '',
    updatedAt: '2026-04-21',
  },
];

function buildCurrentUserContributor(profile) {
  const slug = profile.slug || profile.username || (profile.name ? slugify(profile.name) : profile.id);
  return {
    slug,
    username: profile.username || slug,
    name: profile.name,
    role: profile.role,
    specialties: profile.specialties || [],
    skills: profile.skills || [],
    location: profile.location,
    headline: profile.headline || '',
    image: profile.image || '/me.png',
    contact: {
      github: profile.contact?.github || '',
      linkedin: profile.contact?.linkedin || '',
      email: profile.contact?.email || profile.accountEmail || '',
    },
  };
}

function buildContributorDirectory(currentUserProfile, allContributors = []) {
  // Only use contributors from backend, no fallback to dummy seed data
  const baseContributors = allContributors;
  
  // Build objects and ensure every one has a slug — preserve the UUID id as slug
  const directory = [
    buildCurrentUserContributor(currentUserProfile), 
    ...baseContributors.map(c => ({
      ...c,
      slug: c.slug || c.id || 'unknown'  // Keep UUID slug, don't re-slugify name
    }))
  ];
  
  // Filter out duplicates (by Slug or Email)
  const uniqueDirectory = directory.filter((c, index, self) => 
    index === self.findIndex((t) => 
      (t.slug && c.slug && t.slug === c.slug) || 
      (t.contact?.email && c.contact?.email && t.contact.email === c.contact.email)
    )
  );

  return uniqueDirectory.map((contributor) => ({
    ...contributor,
    username: contributor.username || contributor.slug,
  }));
}

function buildProjectStack(techStack) {
  return (techStack || []).join(' - ');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ensureUniqueProjectSlug(projectList, title) {
  const baseSlug = slugify(title) || 'untitled-project';

  if (!projectList.some((project) => project.slug === baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;

  while (projectList.some((project) => project.slug === `${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function splitProjectCopy(value, fallbackCopy) {
  const paragraphs = value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.length ? paragraphs : [fallbackCopy];
}

function createTeamMemberFromContributor(contributor, role) {
  return {
    slug: contributor.slug,
    name: contributor.name,
    image: contributor.image,
    role,
  };
}

function normalizeProjectRecord(project, index = 0) {
  return {
    ...project,
    stack: project.stack || buildProjectStack(project.techStack || []),
    visibility: project.visibility || 'published',
    ownerSlug: project.ownerSlug || project.team?.[0]?.slug || '',
    repositoryUrl:
      project.repositoryUrl || project.githubUrl || `https://github.com/codefolio/${project.slug}`,
    liveDemoUrl:
      project.liveDemoUrl || (project.status === 'Live' ? `https://${project.slug}.codefolio.app` : ''),
    feedbackRequested: project.feedbackRequested ?? project.status === 'In Review',
    collections:
      project.collections ||
      [project.tag === 'FEATURED' ? 'Featured Work' : 'Studio Projects'],
    tags: project.tags || project.techStack?.slice(0, 3) || [],
    keyFeatures: project.keyFeatures || [],
    reviewAverage:
      Number.isFinite(project.reviewAverage)
        ? project.reviewAverage
        : Number((4.2 + (index % 5) * 0.15).toFixed(1)),
    reviewCount: Number.isFinite(project.reviewCount) ? project.reviewCount : 12 + index * 4,
    updatedAt: project.updatedAt || `2026-04-${String(21 - (index % 9)).padStart(2, '0')}`,
  };
}

function createSeedProjectRecord(seedProject, ownerContributor) {
  const resolvedTeam = seedProject.team
    .map((member) => {
      const contributor = contributors.find((candidate) => candidate.slug === member.slug);

      return contributor ? createTeamMemberFromContributor(contributor, member.role) : null;
    })
    .filter(Boolean);

  return normalizeProjectRecord({
    slug: seedProject.slug,
    title: seedProject.title,
    stack: buildProjectStack(seedProject.techStack),
    techStack: seedProject.techStack,
    summary: seedProject.summary,
    image: seedProject.image,
    imageAlt: `${seedProject.title} preview`,
    gallery: seedProject.gallery,
    status: seedProject.status,
    cohort: seedProject.year,
    course: seedProject.event,
    problem: seedProject.problem,
    solution: seedProject.solution,
    innovations: seedProject.innovations,
    team: [
      createTeamMemberFromContributor(ownerContributor, ownerContributor.role),
      ...resolvedTeam,
    ],
    visibility: seedProject.visibility,
    ownerSlug: ownerContributor.slug,
    collections: seedProject.collections,
    tags: seedProject.tags,
    feedbackRequested: seedProject.feedbackRequested,
    reviewAverage: seedProject.reviewAverage,
    reviewCount: seedProject.reviewCount,
    repositoryUrl: seedProject.repositoryUrl,
    liveDemoUrl: seedProject.liveDemoUrl,
    updatedAt: seedProject.updatedAt,
  });
}

const initialProjectRecords = projectRecords.map((project, index) =>
  normalizeProjectRecord(project, index)
);

function getVisibleShowcaseCollections(activePlatform, activeSort, collections = []) {
  const filteredCollections = collections.filter(
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

function getVisibleContributors(activeContributorFilter, contributorDirectory) {
  if (activeContributorFilter === 'all') {
    return contributorDirectory;
  }

  return contributorDirectory.filter((contributor) =>
    contributor.specialties.includes(activeContributorFilter)
  );
}

function getContributorProfilePath(contributorSlug) {
  return `/contributors/${contributorSlug}`;
}

function getContributorRecord(contributorDirectory, contributorSlug) {
  return contributorDirectory.find((contributor) => contributor.slug === contributorSlug) || null;
}

function getContributorProjects(projectList, contributorSlug) {
  return projectList.filter((project) =>
    project.team.some((member) => member.slug === contributorSlug)
  );
}

function getProjectRecord(projectList, projectSlug) {
  return projectList.find((project) => project.slug === projectSlug) || null;
}

function createFeaturedProjects(projectList) {
  return projectList
    .filter((project) => project.visibility !== 'draft')
    .map(({ slug, title, stack, image, imageAlt, tag, wide }) => ({
      slug,
      title,
      stack,
      image,
      imageAlt,
      tag,
      wide,
    }));
}

function syncProjectsWithContributor(projectList, contributor) {
  return projectList.map((project) => ({
    ...project,
    team: project.team.map((member) =>
      member.slug === contributor.slug
        ? {
            ...member,
            name: contributor.name,
            image: contributor.image,
          }
        : member
    ),
  }));
}

function createProjectFromSubmission({
  submission,
  visibility,
  projectList,
  ownerContributor,
  contributorDirectory,
}) {
  const { files, formData } = submission;
  const gallery =
    files.length > 0 ? files.map((file) => URL.createObjectURL(file)) : [];
  const title = formData.title || (visibility === 'draft' ? 'Untitled Draft' : 'Untitled Project');
  const slug = ensureUniqueProjectSlug(projectList, title);
  const seenMembers = new Set();
  const team = [
    createTeamMemberFromContributor(ownerContributor, ownerContributor.role),
    ...formData.teamMembers
      .map((member) => {
        const resolvedContributor =
          (member.slug &&
            contributorDirectory.find((contributor) => contributor.slug === member.slug)) ||
          contributorDirectory.find(
            (contributor) => contributor.name.toLowerCase() === member.name.toLowerCase()
          ) ||
          null;
        const name = member.name || resolvedContributor?.name || '';

        if (!name) {
          return null;
        }

        const key = resolvedContributor?.slug || name.toLowerCase();

        if (seenMembers.has(key)) {
          return null;
        }

        seenMembers.add(key);

        return {
          slug: resolvedContributor?.slug || member.slug || '',
          name,
          image: member.avatar || resolvedContributor?.image || '/me.png',
          role: member.role || resolvedContributor?.role || 'Contributor',
        };
      })
      .filter(Boolean),
  ].filter((member, index, members) =>
    members.findIndex((candidate) =>
      candidate.slug ? candidate.slug === member.slug : candidate.name === member.name
    ) === index
  );

  return normalizeProjectRecord({
    slug,
    title,
    stack: buildProjectStack(formData.techStack.length ? formData.techStack : ['Concept']),
    techStack: formData.techStack.length ? formData.techStack : ['Concept'],
    summary: formData.summary || 'Project summary coming soon.',
    image: gallery[0],
    imageAlt: `${title} preview`,
    gallery,
    status: formData.status || 'In Review',
    cohort: formData.year || String(new Date().getFullYear()),
    course: formData.event || 'Independent Project',
    problem: splitProjectCopy(
      formData.problemText,
      'Problem statement will be added once the project brief is finalized.'
    ),
    solution: splitProjectCopy(
      formData.solutionText,
      'Solution details will be added once the implementation is ready to share.'
    ),
    innovations: formData.innovations.length
      ? formData.innovations
      : ['Innovation details coming soon.'],
    keyFeatures: formData.keyFeatures || [],
    team,
    visibility,
    ownerSlug: ownerContributor.slug,
    repositoryUrl: formData.repositoryUrl,
    liveDemoUrl: formData.liveDemoUrl,
    feedbackRequested: formData.feedbackRequested,
    collections: formData.collections,
    tags: formData.tags,
    reviewAverage: 0,
    reviewCount: 0,
    updatedAt: new Date().toISOString().slice(0, 10),
  });
}

function SystemBanner({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="system-banner">
      <div className="container system-banner__inner">
        <p className="system-banner__message">{message}</p>
        <button className="system-banner__close" onClick={onClose} aria-label="Close banner">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
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

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="dashboard-icon dashboard-icon--search"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="5.4" />
      <path d="m15.1 15.1 4.3 4.3" />
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

function Header({ activePath, isSearchActive, searchTerm, onSearchChange, onSearchSubmit }) {
  return (
    <header className={`site-header ${isSearchActive ? 'site-header--scrolled' : ''}`}>
      <div className="container site-header__inner">
        <div className="site-header__left">
          <a className="brand" href="/" aria-label="Codefolio home">
            <CodeMark />
            <span>Codefolio</span>
          </a>
        </div>

        <nav className="site-nav" aria-label="Primary">
          {isSearchActive ? (
            <form className="site-header__search" onSubmit={onSearchSubmit}>
              <input
                className="site-header__search-input"
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={onSearchChange}
                autoFocus
              />
              <button className="site-header__search-submit" type="submit" aria-label="Submit search">
                <SearchIcon />
              </button>
            </form>
          ) : (
            navigationItems.map((item) => (
              <a
                key={item.label}
                className={`site-nav__link ${activePath === item.href ? 'site-nav__link--active' : ''}`}
                href={toAppHref(item.href)}
              >
                {item.label}
              </a>
            ))
          )}
        </nav>

        <div className="site-actions">
          <a className="site-actions__login" href={toAppHref("/login")}>
            Login
          </a>
          <a className="pill-button pill-button--dark pill-button--small" href={toAppHref("/signup")}>
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
          <a className="brand brand--footer" href={toAppHref('/')}>
            <CodeMark />
            <span>Codefolio</span>
          </a>

          <nav className="site-footer__nav" aria-label="Footer">
            {footerItems.map((item) => (
              <a key={item.label} className="site-footer__link" href={toAppHref(item.href)}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="site-footer__bottom">© 2026 Codefolio</div>
      </div>
    </footer>
  );
}

function LandingPage({ projects, toAppHref }) {
  const [activeFilter, setActiveFilter] = useState('All projects');

  const filteredProjects = activeFilter === 'All projects'
    ? projects
    : projects.filter(p => 
        p.techStack?.some(s => s.toLowerCase().includes(activeFilter.toLowerCase())) ||
        p.tags?.some(t => t.toLowerCase().includes(activeFilter.toLowerCase())) ||
        (p.collections && p.collections.some(c => c.toLowerCase().includes(activeFilter.toLowerCase())))
      );
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
            <a className="pill-button pill-button--dark" href={toAppHref('/signup')}>
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
            {homeFilterItems.map((item) => (
              <button
                key={item}
                className={`project-filters__pill ${activeFilter === item ? 'project-filters__pill--active' : ''}`}
                type="button"
                onClick={() => setActiveFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <article key={project.title} className="project-card">
                  <a 
                    className="project-card__link" 
                    href={toAppHref(`/${project.ownerUsername || 'projects'}/${project.slug}`)}
                  >
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
              ))
            ) : (
              <div className="no-projects-message" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#666' }}>
                <p>No projects yet in this category.</p>
              </div>
            )}
          </div>

          {filteredProjects.length > 8 && (
            <div className="projects-section__footer">
              <button className="load-more-button" type="button">
                <span>Load more</span>
                <ChevronDownIcon />
              </button>
            </div>
          )}
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

function ShowcasesPage({ searchTerm = '', collections = [] }) {
  const [activePlatform, setActivePlatform] = useState('mobile');
  const [activeSort, setActiveSort] = useState('featured');
  const visibleCollections = getVisibleShowcaseCollections(activePlatform, activeSort, collections).filter(c => 
    !searchTerm || 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.author && c.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

function ProjectDetailPage({ project, onClose, toAppHref, findContributorBySlug }) {
  const [activeGalleryPage, setActiveGalleryPage] = useState(0);
  
  if (!project) {
    return (
      <section className="project-detail-page">
        <div className="container container--project-detail">
          <header className="project-detail__hero">
            <div className="project-detail__hero-bar">
              <h1 className="project-detail__title">Loading Project...</h1>
              <button className="project-detail__close" type="button" onClick={onClose}><CloseIcon /></button>
            </div>
          </header>
          <div className="page-loading-skeleton" style={{ marginTop: '40px' }}>
            <div style={{ height: '400px', background: '#f9f9f9', borderRadius: '12px' }}></div>
          </div>
        </div>
      </section>
    );
  }

  const primaryMember = project.team?.[0] || null;
  const primaryContributor = primaryMember?.slug ? findContributorBySlug(primaryMember.slug) : null;
  const primaryContributorProfileHref = primaryMember?.slug
    ? toAppHref(getContributorProfilePath(primaryMember.slug))
    : null;
  const primaryContributorContactHref = primaryContributor?.contact?.email
    ? `mailto:${primaryContributor.contact.email}`
    : primaryContributorProfileHref;
  const galleryImages = getProjectGalleryImages(project);
  const galleryPageSize = 2;
  const galleryPageCount = Math.ceil(galleryImages.length / galleryPageSize);
  const galleryStartIndex = activeGalleryPage * galleryPageSize;
  const visibleGalleryImages = galleryImages.slice(
    galleryStartIndex,
    galleryStartIndex + galleryPageSize
  );
  const hasGalleryControls = galleryPageCount > 1;
  const projectYear = project.cohort ? (project.cohort.match(/\d{4}/)?.[0] || project.cohort) : '';

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
              {primaryContributorProfileHref ? (
                <a
                  className="project-detail__author-meta project-detail__author-meta--link"
                  href={primaryContributorProfileHref}
                  aria-label={`View ${primaryMember.name}'s public profile`}
                >
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
                </a>
              ) : (
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
              )}

              <div className="project-detail__author-actions" aria-label="Project actions">
                <button
                  className="project-detail__author-icon-button"
                  type="button"
                  aria-label="Save project"
                >
                  <HeartIcon />
                </button>
                <button
                  className="project-detail__author-icon-button"
                  type="button"
                  aria-label="Bookmark project"
                >
                  <BookmarkIcon />
                </button>
                {primaryContributorContactHref ? (
                  <a className="project-detail__author-contact" href={primaryContributorContactHref}>
                    Get in touch
                  </a>
                ) : (
                  <button className="project-detail__author-contact" type="button">
                    Get in touch
                  </button>
                )}
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
              {project.repositoryUrl ? (
                <a
                  className="project-detail__action project-detail__action--light"
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub Repository
                </a>
              ) : (
                <button className="project-detail__action project-detail__action--light" type="button">
                  GitHub Repository
                </button>
              )}
              {project.liveDemoUrl ? (
                <a
                  className="project-detail__action project-detail__action--dark"
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Live Demo
                </a>
              ) : (
                <button className="project-detail__action project-detail__action--dark" type="button">
                  Live Demo
                </button>
              )}
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

            {project.keyFeatures && project.keyFeatures.length > 0 && (
              <div className="project-detail__innovation-card" style={{ marginTop: '24px' }}>
                <h3 className="project-detail__innovation-title">Key Features</h3>
                <div className="project-detail__innovation-list">
                  {project.keyFeatures.map((feature) => (
                    <div key={feature} className="project-detail__innovation-item">
                      <CheckCircleIcon />
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            {project.team.filter((m, i, s) => s.findIndex(t => t.slug === m.slug || t.name === m.name) === i).map((member) => {
              const memberProfileHref = member.slug
                ? toAppHref(getContributorProfilePath(member.slug))
                : null;

              if (memberProfileHref) {
                return (
                  <a
                    key={`${project.slug}-${member.name}`}
                    className="project-detail__team-member project-detail__team-member--link"
                    href={memberProfileHref}
                    aria-label={`View ${member.name}'s public profile`}
                  >
                    <img
                      className="project-detail__team-avatar"
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                    />
                    <h3 className="project-detail__team-name">{member.name}</h3>
                    <p className="project-detail__team-role">{member.role}</p>
                  </a>
                );
              }

              return (
                <article
                  key={`${project.slug}-${member.name}`}
                  className="project-detail__team-member"
                >
                  <img
                    className="project-detail__team-avatar"
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                  />
                  <h3 className="project-detail__team-name">{member.name}</h3>
                  <p className="project-detail__team-role">{member.role}</p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}

function ContributorsPage({ toAppHref, contributors }) {
  const [activeContributorFilter, setActiveContributorFilter] = useState('all');
  const visibleContributors = getVisibleContributors(activeContributorFilter, contributors);

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
            <a
              key={contributor.slug}
              className="contributor-card"
              href={toAppHref(getContributorProfilePath(contributor.slug))}
              aria-label={`View ${contributor.name}'s public profile`}
            >
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
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function App() {
  const [pathname, setPathname] = useState(getCurrentPath);
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('codefolio_user');
      const token = localStorage.getItem('codefolio_token');
      if (savedUser && token) {
        return JSON.parse(savedUser);
      }
    }
    return emptyGuestUser;
  });

  const [projects, setProjects] = useState([]);
  const [allContributors, setAllContributors] = useState([]);
  const [allShowcases, setAllShowcases] = useState([]);
  const [activeProfileTab, setActiveProfileTab] = useState('work');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const showNotification = (message, duration = 5000) => {
    setNotification(message);
    if (duration) {
      setTimeout(() => setNotification(null), duration);
    }
  };

  useEffect(() => {
    function syncPathname() {
      const newPath = getCurrentPath();
      console.log('Path synced to:', newPath);
      setPathname(newPath);
      setIsSearchActive(false);
      setSearchTerm('');
    }

    const handleScroll = () => {
      if (window.scrollY > 80) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    syncPathname();
    window.addEventListener('hashchange', syncPathname);
    window.addEventListener('popstate', syncPathname);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('hashchange', syncPathname);
      window.removeEventListener('popstate', syncPathname);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Handle Google Auth Callback
    if (pathname.startsWith('/auth-callback')) {
      const params = new URLSearchParams(window.location.hash.split('?')[1]);
      const token = params.get('token');
      const userJson = params.get('user');

      if (token && userJson) {
        try {
          const user = JSON.parse(decodeURIComponent(userJson));
          const mappedUser = {
            ...user,
            accountEmail: user.email,
            image: user.avatar_url
          };
          
          localStorage.setItem('codefolio_token', token);
          localStorage.setItem('codefolio_user', JSON.stringify(mappedUser));
          setCurrentUser(mappedUser);
          
          showNotification('Successfully signed in with Google');
          window.location.hash = '#/dashboard';
        } catch (error) {
          console.error('Error parsing auth callback data:', error);
          showNotification('Authentication failed');
          window.location.hash = '#/login';
        }
      }
    }
  }, [pathname]);

  useEffect(() => {
    // Show a welcome notification if it's the first visit
    if (pathname === '/' && !sessionStorage.getItem('welcome-shown')) {
      showNotification('Welcome to Codefolio! Discover and showcase engineering projects.');
      sessionStorage.setItem('welcome-shown', 'true');
    }

    // Initial fetch for public projects and contributors
    const fetchPublicData = async () => {
      try {
        const [dbProjects, dbContributors] = await Promise.all([
          api.getProjects(),
          api.getContributors()
        ]);

        if (dbProjects) {
          // Helper: convert any DB value to an array
          const toArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            try { const parsed = JSON.parse(val); if (Array.isArray(parsed)) return parsed; } catch {}
            return val.split('\n').map(s => s.trim()).filter(Boolean);
          };

          setProjects(dbProjects.map(p => ({
            ...p,
            ownerSlug: p.author_id,
            ownerUsername: p.users?.username,
            techStack: toArray(p.tech_stack),
            image: p.image_url,
            gallery: toArray(p.gallery),
            cohort: p.year,
            course: p.event,
            problem: toArray(p.problem_statements),
            solution: toArray(p.solution_statements),
            innovations: toArray(p.innovations),
            keyFeatures: toArray(p.key_features),
            repositoryUrl: p.repository_url,
            liveDemoUrl: p.live_demo_url,
            team: (() => {
              // Use saved teamMembers if available, otherwise fall back to author
              const saved = toArray(p.team_members);
              if (saved.length > 0) return saved;
              return [{ slug: p.author_id, name: p.users?.name || 'Unknown', image: p.users?.avatar_url, role: 'Lead' }];
            })()
          })));
        }

        if (dbContributors) {
          setAllContributors(dbContributors.map(c => ({
            ...c,
            slug: c.id,
            image: c.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'U')}&background=random&color=fff&rounded=true`,
            role: c.role || 'Contributor',
            location: c.location || '',
            skills: Array.isArray(c.skills) ? c.skills : (c.skills ? [c.skills] : []),
            specialties: Array.isArray(c.specialties) ? c.specialties : (c.specialties ? [c.specialties] : []),
            contact: {
              email: c.contact_email || c.email,
              github: c.github_url,
              linkedin: c.linkedin_url,
              website: c.website_url,
            }
          })));
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchPublicData();


    // User session data refresh (legacy)
    if (currentUser && currentUser.id && currentUser.id !== emptyGuestUser.id) {
       // Profile and projects are now largely managed via API
    }


  }, [pathname, currentUser?.id]);

  const contributorDirectory = buildContributorDirectory(currentUser, allContributors);
  const filteredProjects = isSearchActive
    ? projects.filter((p) => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.stack.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : projects;
  const publishedProjects = filteredProjects.filter((project) => project.visibility !== 'draft');

  const filteredContributors = isSearchActive
    ? contributorDirectory.filter((c) => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : contributorDirectory;

  const featuredProjectCards = createFeaturedProjects(publishedProjects);
  const currentUserProjects = projects.filter((project) => 
    project.author_id === currentUser.id || project.ownerSlug === currentUser.id || project.ownerSlug === currentUser.slug
  );

  function findContributorBySlug(contributorSlug) {
    return getContributorRecord(contributorDirectory, contributorSlug);
  }

  function navigateTo(path) {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', toAppHref(path));
      // Manually trigger a popstate event since pushState doesn't do it
      window.dispatchEvent(new PopStateEvent('popstate'));
      // Always scroll to top on navigation
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  async function handleSaveGeneral(nextGeneralSettings) {
    try {
      const updatedUser = await api.updateGeneral(nextGeneralSettings);

      if (updatedUser.error) {
        showNotification('Error updating settings: ' + updatedUser.error);
      } else {
        showNotification('Settings updated successfully');
        const nextProfile = {
          ...currentUser,
          username: updatedUser.username,
        };
        setCurrentUser(nextProfile);
        localStorage.setItem('codefolio_user', JSON.stringify(nextProfile));
      }
    } catch (err) {
      showNotification('Failed to update settings: ' + err.message);
    }
  }


  async function handleSaveProfile(nextProfileData) {
    try {
      let avatarUrl = nextProfileData.image;

      if (nextProfileData.avatarFile) {
        showNotification('Uploading profile picture...');
        const uploadRes = await api.uploadFile(nextProfileData.avatarFile);
        if (uploadRes.url) {
          avatarUrl = uploadRes.url;
        }
      }

      const updatedUser = await api.updateProfile({
        ...nextProfileData,
        avatar_url: avatarUrl,
        contact_email: nextProfileData.contact.email,
        phone_number: nextProfileData.contact.phone,
        website_url: nextProfileData.contact.website,
        github_url: nextProfileData.contact.github,
        linkedin_url: nextProfileData.contact.linkedin,
      });

      if (updatedUser.error) {
        showNotification('Error updating profile: ' + updatedUser.error);
      } else {
        showNotification('Profile updated successfully');
        const nextProfile = {
          ...currentUser,
          ...nextProfileData,
          ...updatedUser,
          image: avatarUrl,
        };

        setCurrentUser(nextProfile);
        localStorage.setItem('codefolio_user', JSON.stringify(nextProfile));
      }
    } catch (err) {
      showNotification('Failed to save profile: ' + err.message);
    }
  }


  function handleSaveSecurity(nextSecuritySettings) {
    showNotification('Security settings saved locally (Simulation)');
  }

  function handleSaveNotifications(nextNotifications) {
    showNotification('Notification settings saved locally (Simulation)');
  }




  async function handleSaveDraft(submission) {
    try {
      setIsSavingDraft(true);
      const { files } = submission;
      let imageUrls = [];
      
      if (files && files.length > 0) {
        showNotification('Uploading images...');
        const uploadRes = await api.uploadMultiple(files);
        imageUrls = uploadRes.urls || [];
      }

      const projectData = {
        ...submission,
        image_url: imageUrls[0] || submission.image,
        gallery: imageUrls.length > 0 ? imageUrls : submission.gallery,
        tech_stack: submission.techStack,
        visibility: 'draft',
      };

      const result = await api.saveProject(projectData);

      if (result.error) {
        showNotification('Error saving draft: ' + result.error);
      } else {
        showNotification('Draft saved successfully');
        setProjects((currentProjects) => [result, ...currentProjects]);
        setActiveProfileTab('drafts');
        navigateTo('/profile');
      }
    } catch (err) {
      showNotification('Failed to save draft: ' + err.message);
    } finally {
      setIsSavingDraft(false);
    }
  }


  async function handlePublishProject(submission) {
    try {
      setIsPublishing(true);
      const { files } = submission;
      let imageUrls = [];
      
      if (files && files.length > 0) {
        showNotification('Uploading images...');
        const uploadRes = await api.uploadMultiple(files);
        imageUrls = uploadRes.urls || [];
      }

      const projectData = {
        ...submission,
        image_url: imageUrls[0] || submission.image,
        gallery: imageUrls.length > 0 ? imageUrls : submission.gallery,
        tech_stack: submission.techStack,
        visibility: 'published',
      };

      const result = await api.saveProject(projectData);

      if (result.error) {
        showNotification('Error publishing project: ' + result.error);
      } else {
        showNotification('Project published successfully');
        setProjects((currentProjects) => [result, ...currentProjects]);
        setActiveProfileTab('work');
        navigateTo('/profile');
      }
    } catch (err) {
      showNotification('Failed to publish project: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  }


  async function handleDeleteProject(projectSlug) {
    try {
      const result = await api.deleteProject(projectSlug);
      if (result.error) {
        showNotification('Error deleting project: ' + result.error);
      } else {
        showNotification('Project deleted successfully');
        setProjects(current => current.filter(p => p.slug !== projectSlug));
      }
    } catch (err) {
      showNotification('Failed to delete project: ' + err.message);
    }
  }


  function handleEditProject(projectSlug) {
    navigateTo(`/profile/edit/${projectSlug}`);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearchActive(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleClearSearch() {
    setIsSearchActive(false);
    setSearchTerm('');
  }

  const isDashboardPage = pathname === '/dashboard';
  const isDashboardChatPage = pathname.includes('/chat') || window.location.hash.includes('/chat');
  const isLoginPage = pathname === '/login';
  const isLogoutPage = pathname === '/logout';
  const isSignupPage = pathname === '/signup';
  const isTermsPage = pathname === '/terms';
  const isPrivacyPage = pathname === '/privacy';
  const isContactPage = pathname === '/contact';
  const isShowcasesPage = pathname === '/showcases';
  const isDashboardShowcasesPage = pathname === '/dashboard/showcases';
  const isAnyShowcasesPage = isShowcasesPage || isDashboardShowcasesPage;
  
  const isContributorsPage = pathname === '/contributors';
  const isDashboardContributorsPage = pathname === '/dashboard/contributors';

  // GitHub-style profiles: /contributors/:slug
  const isPublicProfilePath = pathname.match(/^\/contributors\/([^/]+)$/);
  const activeContributor = isPublicProfilePath
    ? findContributorBySlug(isPublicProfilePath[1])
    : null;
  const activeContributorProjects = activeContributor
    ? getContributorProjects(publishedProjects, activeContributor.slug)
    : [];
  const isContributorProfilePage = Boolean(activeContributor);
  const isAnyContributorsPage =
    isContributorsPage || isDashboardContributorsPage || isContributorProfilePage;
  const isProfilePage = pathname === '/profile';
  const profileSettingsMatch = pathname.match(/^\/profile\/settings(?:\/([^/]+))?$/);
  const profileSettingsSection = profileSettingsMatch?.[1] || 'general';
  const isProfileSettingsPage = Boolean(profileSettingsMatch);
  const isProfileUploadEntryPage = pathname === '/profile/upload';
  const isProfileUploadDetailsPage = pathname === '/profile/upload/details';
  const isProfileUploadPage = isProfileUploadEntryPage || isProfileUploadDetailsPage;
  
  const editProjectMatch = pathname.match(/^\/profile\/edit\/([^/]+)$/);
  const editProjectSlug = editProjectMatch ? editProjectMatch[1] : null;
  const isProfileEditPage = Boolean(editProjectSlug);
  const editProjectData = isProfileEditPage ? currentUserProjects.find(p => p.slug === editProjectSlug) : null;
  
  const isProfileAreaPage = isProfilePage || isProfileSettingsPage || isProfileEditPage;
  
  // Support both /projects/:slug and /:username/:slug
  const projectMatch = pathname.match(/^\/projects\/([^/]+)$/) || 
                       pathname.match(/^\/(?!profile|dashboard|contributors|showcases|terms|privacy|contact)([^/]+)\/([^/]+)$/);
  
  const activeProject = projectMatch 
    ? getProjectRecord(projects, projectMatch[2] || projectMatch[1]) 
    : null;
  
  const isProjectDetailPage = Boolean(activeProject);
  const isProjectRoute = Boolean(projectMatch);

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

  if (isLogoutPage) {
    localStorage.removeItem('codefolio_token');
    localStorage.removeItem('codefolio_user');
    window.location.hash = '/';
    return null;
  }


  const isAuthenticated = Boolean(
    localStorage.getItem('codefolio_token') && 
    (currentUser?.id || localStorage.getItem('codefolio_user'))
  );

  const isPrivatePage =
    isDashboardPage ||
    isDashboardChatPage ||
    isProfilePage ||
    isProfileSettingsPage ||
    isProfileUploadPage ||
    isDashboardShowcasesPage ||
    isDashboardContributorsPage;

  if (isPrivatePage && !isAuthenticated) {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
    return null;
  }

  if (isDashboardPage) {
    return (
      <div className="page-shell page-shell--dashboard">
        <DashboardPage projects={featuredProjectCards} toAppHref={toAppHref} profile={currentUser} />
        <Footer />
      </div>
    );
  }

  if (isDashboardChatPage) {
    return (
      <div className="page-shell page-shell--dashboard">
        <main>
          <ChatWithAiPage
            toAppHref={toAppHref}
            profile={currentUser}
            projects={publishedProjects}
          />
        </main>
      </div>
    );
  }

  if (isLoginPage || isSignupPage) {
    return (
      <div className="page-shell page-shell--login">
        <main>
          <AuthPage 
            title={isLoginPage ? 'Welcome back' : 'Create account'} 
            showNotification={showNotification}
            onAuthSuccess={(user) => {
              console.log('Auth success callback triggered for:', user.email);
              try {
                setCurrentUser(user);
                localStorage.setItem('codefolio_user', JSON.stringify(user));
                console.log('User state and localStorage updated');
              } catch (e) {
                console.error('Error in onAuthSuccess:', e);
              }
            }}
          />
        </main>
      </div>
    );
  }

  if (isProfileUploadPage || isProfileEditPage) {
    return (
      <div className="page-shell page-shell--upload">
        <main>
          <UploadShotPage
            mode={(isProfileUploadDetailsPage || isProfileEditPage) ? 'details' : 'upload'}
            initialData={isProfileEditPage ? editProjectData : null}
            toAppHref={toAppHref}
            contributorDirectory={contributorDirectory}
            onSaveDraft={handleSaveDraft}
            onPublishProject={handlePublishProject}
          />
        </main>
      </div>
    );
  }

  return (
    <div
      className={`page-shell ${isAnyShowcasesPage ? 'page-shell--showcases' : ''} ${
        isAnyContributorsPage ? 'page-shell--contributors' : ''
      } ${isProfileAreaPage ? 'page-shell--profile' : ''} ${
        isContributorProfilePage ? 'page-shell--public-profile' : ''
      } ${
        isProjectDetailPage ? 'page-shell--project-detail' : ''
      }`}
    >
      <SystemBanner message={notification} onClose={() => setNotification(null)} />

      {!isProjectDetailPage &&
      (isDashboardShowcasesPage ||
        isDashboardContributorsPage ||
        isProfileAreaPage ||
        isContributorProfilePage) ? (
        <DashboardHeader
          toAppHref={toAppHref}
          profile={currentUser}
          activePath={
            isDashboardShowcasesPage
              ? '/dashboard/showcases'
              : isDashboardContributorsPage
                ? '/dashboard/contributors'
                : '/dashboard'
          }
          isSearchActive={hasScrolled}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onSearchSubmit={handleSearchSubmit}
        />
      ) : !isProjectDetailPage ? (
        <Header
          activePath={
            isShowcasesPage ? '/showcases' : isContributorsPage ? '/contributors' : '/'
          }
          isSearchActive={hasScrolled}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onSearchSubmit={handleSearchSubmit}
        />
      ) : null}

      <main>
        {isSearchActive && !isProjectDetailPage ? (
          <section className="dashboard-search-results">
            <div className="container">
              <h1 className="dashboard-search-results__title">{searchTerm}</h1>
              <p className="dashboard-search-results__subtitle">
                {isAnyContributorsPage
                  ? `Discover RCA's technical talent matching ${searchTerm}.`
                  : `Explore real-world engineering project collections for ${searchTerm}.`}
              </p>
            </div>
          </section>
        ) : null}

        {isProjectRoute ? (
          <ProjectDetailPage
            project={activeProject}
            onClose={handleCloseProjectDetail}
            toAppHref={toAppHref}
            findContributorBySlug={findContributorBySlug}
          />
        ) : isProfileSettingsPage ? (
          <SettingsPage
            toAppHref={toAppHref}
            section={profileSettingsSection}
            profile={currentUser}
            onSaveGeneral={handleSaveGeneral}
            onSaveProfile={handleSaveProfile}
            onSaveSecurity={handleSaveSecurity}
            onSaveNotifications={handleSaveNotifications}
          />
        ) : isProfilePage ? (
          <ProfilePage
            toAppHref={toAppHref}
            profile={currentUser}
            projects={currentUserProjects}
            activeTab={activeProfileTab}
            onTabChange={setActiveProfileTab}
            onDeleteProject={handleDeleteProject}
            onEditProject={handleEditProject}
          />
        ) : isContributorProfilePage ? (
          <PublicProfilePage
            contributor={activeContributor}
            projects={activeContributorProjects}
            toAppHref={toAppHref}
          />
        ) : isAnyContributorsPage ? (
          <ContributorsPage toAppHref={toAppHref} contributors={filteredContributors} />
        ) : isAnyShowcasesPage ? (
          <ShowcasesPage searchTerm={searchTerm} collections={allShowcases} />
        ) : isTermsPage ? (
          <InfoPage
            eyebrow="Legal"
            title="Terms of Use"
            paragraphs={[
              'Codefolio is intended for showcasing work, discovering contributors, and sharing technical projects responsibly.',
              'By using the platform, you confirm that the work you publish is yours to share and that external links, screenshots, and contributor information are accurate to the best of your knowledge.',
              'Project content, portfolio information, and collaboration details should be kept professional, lawful, and respectful of other contributors.',
            ]}
            actions={[{ label: 'Create account', href: toAppHref('/signup') }]}
          />
        ) : isPrivacyPage ? (
          <InfoPage
            eyebrow="Privacy"
            title="Privacy Policy"
            paragraphs={[
              'Codefolio stores account, profile, and project information so contributors can manage their portfolios and collaborate around technical work.',
              'Public profile details such as your name, location, published projects, and any contact methods you choose to display may be visible to other users.',
              'Private settings like your account email, draft projects, and unpublished work should remain restricted to your account and authorized platform services.',
            ]}
            actions={[{ label: 'Contact us', href: toAppHref('/contact'), variant: 'secondary' }]}
          />
        ) : isContactPage ? (
          <InfoPage
            eyebrow="Support"
            title="Contact"
            paragraphs={[
              'Questions about Codefolio, project publishing, or contributor profiles can be sent to the platform team.',
              'Use the contact channel below for support requests, policy questions, or account issues while the backend services are being finalized.',
            ]}
            actions={[{ label: 'support@codefolio.dev', href: 'mailto:support@codefolio.dev' }]}
          />
        ) : (
          <LandingPage projects={featuredProjectCards} toAppHref={toAppHref} />
        )}
      </main>

      {!isProfileAreaPage && !isDashboardChatPage && !window.location.hash.includes('chat') ? <Footer /> : null}
    </div>
  );
}

export default App;




