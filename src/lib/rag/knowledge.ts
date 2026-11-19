import { profile, site } from '@/lib/site';

/**
 * The knowledge base for the Builder chat: public/resume.pdf split into one chunk per
 * role, project and skill group. Update this file whenever the resume changes.
 * The phone number is left out on purpose so the chat never hands it out.
 */

export type ChunkSection = 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'contact';

export interface KnowledgeChunk {
  id: string;
  section: ChunkSection;
  title: string;
  text: string;
}

const techYears = Object.entries(profile.techExperience)
  .filter(([, years]) => years.trim())
  .map(([name, years]) => `${name}: ${years}`)
  .join('; ');

export const KNOWLEDGE: KnowledgeChunk[] = [
  {
    id: 'summary',
    section: 'summary',
    title: `About ${site.name}, Backend Engineer`,
    text: 'Software Developer with 3 years of experience building high-performance backend systems and data pipelines using Go, C++, and SQL. Experienced in engineering reliable, high-throughput microservices for 5G and telecom architectures, with practical full-stack exposure to Node.js, React, and REST/gRPC APIs. A pragmatic engineer who routinely leverages modern AI workflows (Claude AI, LLM coding agents) to debug faster, write cleaner code, and accelerate shipping cycles.',
  },
  {
    id: 'contact',
    section: 'contact',
    title: 'Contact details and location',
    text: `Name: ${site.name}. Location: ${site.location} (${site.timeZoneLabel}). Email: ${site.email}. Visitors can also use the contact form at the bottom of this site.`,
  },
  {
    id: 'availability',
    section: 'contact',
    title: 'Availability, notice period and years of experience per technology',
    text: `Total professional experience: ${profile.totalExperience}. Notice period: ${profile.noticePeriod}. Years per technology: ${techYears}.`,
  },
  {
    id: 'experience-ys',
    section: 'experience',
    title: "Full Stack Developer at Y's Technologies, July 2026 - Present (current role)",
    text: 'Develop scalable backend microservices and RESTful APIs using Go and Node.js, focusing on concurrency, custom middleware, and low latency. Build high-throughput data pipelines using Go goroutines, channels, and context propagation to optimize response times. Engineer full-stack solutions, including a Pickleball management mobile app (React Native) and web portal with live match updates via WebSockets. Profile systems, diagnose bottlenecks, and resolve memory leaks using Go diagnostics and Linux utilities.',
  },
  {
    id: 'experience-6d',
    section: 'experience',
    title: 'Backend Developer at 6D Technologies, Dec 2023 - June 2026',
    text: 'Developed low-latency backend microservices and REST APIs in Go and C++ on Linux for 5G systems. Built core features for the 5G Policy Control Function (PCF), deployed for Singtel production. Optimized high-volume pipelines using C++ STL, Go concurrency, and PostgreSQL/MySQL query tuning. Resolved memory leaks and performance bottlenecks using GDB, Valgrind, and Linux profiling tools. Automated CI/CD pipelines, managed releases, and conducted peer code reviews using Git and GitLab.',
  },
  {
    id: 'project-courtside',
    section: 'projects',
    title: 'Project: Courtside, Pickle Ball Mobile App and Website',
    text: 'Developed Courtside, a real-time pickleball score updater utilizing Node.js, React, WebSockets, and SQL to deliver sub-second score synchronization and match telemetry across live court displays.',
  },
  {
    id: 'project-gateway',
    section: 'projects',
    title: 'Project: Distributed Tracing Gateway (Tracing gateway)',
    text: 'Built a high-performance distributed tracing gateway in C++ and Go on Linux that ingests, translates, and routes telemetry across microservices over HTTP, WebSocket, and gRPC. C++ handles performance-critical packet processing and memory management; Go handles concurrent request routing, worker pools, and backend communication. Features Protobuf protocol translation, end-to-end trace context propagation, bounded queues with backpressure, and Linux-based debugging, profiling, and network diagnostics.',
  },
  {
    id: 'project-pcf',
    section: 'projects',
    title: 'Project: 5G PCF Modules (Go, C++, Linux, Docker, 5G Core)',
    text: "Developed carrier-grade 5G Policy Control Function (PCF) components in Go and C++ for 5G core networks, deployed in Singtel's production network. Modular Go and C++ microservices on Linux with service-to-service communication, concurrent request processing using goroutines and worker pools, and policy control workflows. Optimized memory usage and low-latency request handling; used Linux for development, debugging, and system-level operations, and Docker for containerization and deployment.",
  },
  {
    id: 'project-gitlab-cli',
    section: 'projects',
    title: 'Project: GitLab CI/CD Automation CLI (Automated RPM Dependency & Build Orchestration)',
    text: 'Developed a Go CLI-based CI/CD automation tool integrated with GitLab that automates RPM dependency updates and package builds across large-scale software projects. When a new library RPM is released, the tool detects it, analyzes module dependencies, identifies affected modules, updates their dependency configurations, and orchestrates sequential RPM builds through GitLab CI/CD pipelines, reducing manual work in multi-module releases.',
  },
  {
    id: 'education',
    section: 'education',
    title: 'Education',
    text: 'B.Tech in Computer Science & Engineering, APJ Abdul Kalam Technological University, Sep 2019 - Sep 2023.',
  },
  {
    id: 'skills-languages',
    section: 'skills',
    title: 'Skills: Languages',
    text: 'Go (Golang), C++, C, SQL, Node.js, JavaScript, Python, React.',
  },
  {
    id: 'skills-backend',
    section: 'skills',
    title: 'Skills: Backend and Web',
    text: 'RESTful APIs, Microservices, React, JSON/HTTP, Webhooks.',
  },
  {
    id: 'skills-go',
    section: 'skills',
    title: 'Skills: Go Concurrency',
    text: 'Goroutines, Channels, sync.Mutex, sync.WaitGroup, Worker Pools, pprof.',
  },
  {
    id: 'skills-databases',
    section: 'skills',
    title: 'Skills: Databases',
    text: 'PostgreSQL, MySQL, Redis, Query Optimization, Indexing.',
  },
  {
    id: 'skills-devops',
    section: 'skills',
    title: 'Skills: Linux and DevOps',
    text: 'Linux (Bash), Docker, Git, GitLab CI/CD, GDB, Valgrind.',
  },
  {
    id: 'skills-testing-ai',
    section: 'skills',
    title: 'Skills: Testing and AI',
    text: 'Unit/Integration Testing (Testify), Claude AI, LLM Coding Tools.',
  },
];
