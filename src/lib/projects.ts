export interface ProjectStat {
  value: string;
  label: string;
}

export interface DetailPoint {
  label: string;
  text: string;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  type: string;
  role: string;
  tech: string[];
  description: string;
  overview: string;
  architecture: string;
  /** Optional bullet list shown under the architecture paragraph. */
  architecturePoints?: DetailPoint[];
  implementation: string;
  /** Optional bullet list shown under the engineering paragraph. */
  implementationPoints?: DetailPoint[];
  stats: ProjectStat[];
  accent: string;
  myRole: string[];
  images: string[];
  hoverImage: string;
  github: string;
  liveUrl: string;
}

// Duplicate an object to add more projects. `slug` becomes the URL: /projects/<slug>.
// TODO: Screenshots live in public/Projects/ — swap the placeholder images for real ones,
// and fill `github` / `liveUrl` (leave '' to hide the button).
const projects: Project[] = [
  {
    id: 1,
    slug: 'courtside',
    title: 'Courtside :Pickleball',
    type: 'Mobile App & Website',
    role: 'Full Stack Developer',
    tech: ['React', 'React Native', 'Node.js', 'WebSockets', 'Socket.IO', 'Expo', 'PostgreSQL', 'SQL'],
    description:
      'A real-time pickleball score updater with sub-second score sync across live court displays.',
    overview:
      'Courtside is a full-stack pickleball tournament and community management platform designed to simplify event creation, player management, tournament scheduling, and live match scoring.The platform includes a React-based web application and a React Native mobile application, enabling players, organizers, and managers to manage tournaments, track live scores, join events, and receive real-time notifications.It supports multiple tournament formats, including Round Robin, Group Stage + Playoff, and MLP-style team competitions.',
    architecture:
      'Courtside follows a client-server architecture with separate web and mobile applications communicating with a centralized backend through REST APIs and real-time WebSocket connections.',
    architecturePoints: [
      { label: 'Web Client', text: 'React-based interface for tournament creation, management, and live match tracking.' },
      { label: 'Mobile Client', text: 'React Native with Expo for cross-platform player and organizer experiences.' },
      { label: 'Backend', text: 'Node.js services handling business logic, authentication, tournament operations, and match management.' },
      { label: 'Database', text: 'PostgreSQL for persistent storage of users, events, teams, matches, and scores.' },
      { label: 'Real-Time Layer', text: 'Socket.IO for live score updates and synchronization across connected clients.' },
      { label: 'Notifications', text: 'Expo Push Notifications for event updates and player notifications.' },
    ],
    implementation:
      'The core challenge was sub-second score synchronisation: every point recorded on court has to reach all displays almost instantly, so updates are pushed over WebSockets instead of polled.',
    implementationPoints: [
      { label: 'Real-Time Synchronization', text: 'Implemented WebSocket-based updates to keep match scores and tournament states synchronized across web and mobile clients.' },
      { label: 'Tournament Engine', text: 'Developed tournament workflows supporting Round Robin, Group Stage + Playoff, and MLP team formats.' },
      { label: 'MLP Team Competitions', text: 'Implemented team-based match structures with doubles games, mixed doubles, tie-breakers, and team scoring.' },
      { label: 'Dynamic Court Assignment', text: 'Developed court allocation workflows based on match status, court availability, and tournament progression.' },
      { label: 'Cross-Platform Development', text: 'Built web and mobile experiences with shared backend services and consistent tournament workflows.' },
      { label: 'Push Notifications', text: 'Integrated Expo Notifications to deliver event-related updates to mobile users.' },
      { label: 'Guest & Player Management', text: 'Implemented player registration, phone-based lookup, event joining, and waitlist workflows.' },
    ],
    stats: [],
    accent: '#4F9A2D',
    myRole: [
      'Built the Node.js backend and the WebSocket layer for live match updates.',
      'Developed the React web portal and the React Native mobile app.',
      'Designed the SQL data model for matches, scores and match telemetry.',
    ],
    images: [
      '/Projects/courtside-screens.png',
      '/Projects/pickleball-web.mp4',
    ],
    hoverImage: '/Projects/courtside-screens.png',
    github: '',
    liveUrl: 'https://www.courtsideops.com/',
  },
  {
    id: 2,
    slug: 'tracing-gateway',
    title: 'Tracing Gateway',
    type: 'Distributed Tracing Gateway',
    role: 'Backend Developer',
    tech: ['C++', 'Go', 'Linux', 'gRPC', 'Protobuf', 'WebSockets', 'HTTP', 'GDB', 'Valgrind', 'tcpdump', 'Wireshark', 'CMake', 'Make', 'Docker'],
    description:
      'A C++ and Go tracing gateway that ingests, translates and routes telemetry across microservices over HTTP, WebSocket and gRPC.',
    overview:
      'A high-performance distributed tracing gateway built using C++, Go, and Linux to ingest, translate, and route telemetry across microservices. Supports HTTP, WebSocket, and gRPC communication with low-latency processing and end-to-end trace context propagation.',
    architecture:
      'Designed with a hybrid C++ and Go architecture. C++ handles performance-critical packet processing and memory management, while Go manages concurrent request routing, worker pools, and backend communication. Supports protocol translation, Protobuf serialization, and distributed trace propagation.',
    implementation:
      'The gateway is built for low latency and predictable memory use under load, with telemetry flowing across services without losing trace context.',
    implementationPoints: [
      { label: 'Multi-Protocol Communication', text: 'Multi-protocol communication using HTTP, WebSockets, and gRPC.' },
      { label: 'Low-Latency Processing', text: 'Low-latency processing with C++ and Go concurrency.' },
      { label: 'Protocol Translation', text: 'Protocol translation using Protocol Buffers.' },
      { label: 'Trace Propagation', text: 'Distributed trace context propagation across services.' },
      { label: 'Backpressure', text: 'Memory-efficient processing with bounded queues and backpressure.' },
      { label: 'Linux Diagnostics', text: 'Linux-based debugging, profiling, and network diagnostics.' },
    ],
    stats: [],
    accent: '#F2B632',
    myRole: [
      'Built the C++ packet processing path and the Go routing layer with worker pools.',
      'Implemented Protobuf-based protocol translation and trace context propagation across HTTP, WebSocket and gRPC.',
      'Added bounded queues with backpressure, and profiled and debugged the gateway on Linux with GDB, Valgrind, tcpdump and Wireshark.',
    ],
    images: [
      '/Projects/tracing-gateway.jpeg',
    ],
    hoverImage: '/Projects/tracing-gateway.jpeg',
    github: '',
    liveUrl: '',
  },
  {
    id: 3,
    slug: '5g-pcf-modules',
    title: '5G PCF Modules',
    type: 'Carrier-Grade Telecom Backend',
    role: 'Backend Developer',
    tech: [
      'Golang',
      'C++',
      '5G Core',
      '5G PCF',
      'Linux',
      'Docker',
      'Microservices',
      'Distributed Systems',
      'Concurrency',
      'Goroutines',
      'Worker Pools',
      'Telecom Networks',
    ],
    description:
      "Carrier-grade 5G Policy Control Function components in Go and C++, deployed in Singtel's production network.",
    overview:
      "Developed carrier-grade 5G Policy Control Function (PCF) components using Go and C++, implementing core policy control functionalities for 5G core networks. The solution was designed for high-throughput, low-latency telecom environments and deployed in Singtel's production network.",
    architecture:
      'Built a modular microservices-based architecture using Go and C++, running on Linux. Implemented service-to-service communication, concurrent request processing, and policy control workflows to support reliable interactions within the 5G core network.',
    implementation:
      'Carrier networks need high throughput and low latency at all times, so the work focused on concurrency, memory efficiency and production reliability.',
    implementationPoints: [
      { label: '5G PCF Functionality', text: 'Developed core 5G PCF functionalities for telecom networks.' },
      { label: 'High-Performance Microservices', text: 'Built high-performance Go and C++ microservices.' },
      { label: 'Concurrent Processing', text: 'Implemented concurrent processing using goroutines and worker pools.' },
      { label: 'Low-Latency Optimization', text: 'Optimized memory usage and low-latency request handling.' },
      { label: 'Linux Operations', text: 'Used Linux for development, debugging, and system-level operations.' },
      { label: 'Containerization', text: 'Used Docker for containerization and deployment workflows.' },
      { label: 'Production Deployment', text: "Contributed to software deployed in Singtel's production network." },
    ],
    stats: [],
    accent: '#C45D3E',
    myRole: [
      'Developed core 5G PCF policy control functionality in Go and C++.',
      'Built concurrent request processing with goroutines and worker pools, and optimized memory use and latency.',
      "Debugged and operated services on Linux and containerized them with Docker for deployment in Singtel's production network.",
    ],
    images: [],
    hoverImage: '',
    github: '',
    liveUrl: '',
  },
  {
    id: 4,
    slug: 'gitlab-cicd-cli',
    title: 'GitLab CI/CD Automation CLI',
    type: 'CI/CD Automation Tool',
    role: 'Backend Developer',
    tech: [
      'Go',
      'Linux',
      'RPM Packaging',
      'GitLab CI/CD',
      'CLI Development',
      'Build Automation',
      'Dependency Management',
      'Shell Scripting',
      'Git',
      'Automation',
    ],
    description:
      'A GitLab-integrated CLI tool that detects new library RPMs, updates dependent modules and triggers their RPM builds automatically.',
    overview:
      'Developed a CLI-based CI/CD automation tool integrated with GitLab to automate RPM dependency updates and package builds across large-scale software projects. When a new library RPM is released, the tool identifies dependent modules, updates their dependencies, and triggers automated RPM builds.',
    architecture:
      'Designed an automated dependency management workflow integrated with GitLab CI/CD. The tool detects new RPM releases, analyzes module dependencies, identifies affected components, updates dependency configurations, and orchestrates sequential package builds across dependent modules.',
    implementation:
      'Releasing a library used to mean updating and rebuilding every dependent module by hand. The tool turns that into one dependency-driven, automated workflow.',
    implementationPoints: [
      { label: 'CLI Tooling', text: 'Developed a CLI tool for automated RPM dependency management.' },
      { label: 'Dependency Detection', text: 'Implemented dependency detection across large-scale projects.' },
      { label: 'Automated Module Updates', text: 'Automated dependent module updates when new library RPMs are released.' },
      { label: 'GitLab CI/CD Integration', text: 'Integrated build automation with GitLab CI/CD pipelines.' },
      { label: 'RPM Build Automation', text: 'Automated RPM packaging and dependency-driven rebuild workflows.' },
      { label: 'Less Manual Work', text: 'Reduced manual intervention in multi-module release processes.' },
    ],
    stats: [],
    accent: '#4F9A2D',
    myRole: [
      'Designed and built the CLI tool in Go for automated RPM dependency management.',
      'Implemented detection of affected modules and automatic dependency updates when a new library RPM is released.',
      'Integrated sequential, dependency-driven RPM builds with GitLab CI/CD pipelines.',
    ],
    images: [],
    hoverImage: '',
    github: 'https://github.com/Aadiac/gitlab-ciautomation-tool',
    liveUrl: '',
  },
];

export function getAllProjects(): Project[] {
  return projects;
}
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
export function getAdjacentProjects(slug: string): { prev?: Project; next?: Project } {
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return {};
  return {
    prev: projects[(idx - 1 + projects.length) % projects.length],
    next: projects[(idx + 1) % projects.length],
  };
}
