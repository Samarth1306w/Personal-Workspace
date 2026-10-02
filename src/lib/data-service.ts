import fs from "fs";
import path from "path";
import { profileData, ProfileData } from "@/data/profile";
import { servicesData, ServiceOffering } from "@/data/services";
import { buildingWithStack, exploringStack, coreCapabilities, TechItem, CapabilityItem } from "@/data/capabilities";
import { projectsData, experimentsData, Project, LabExperiment } from "@/data/projects";
import { exploringData, ExplorationItem } from "@/data/exploring";
import { milestonesData, Milestone } from "@/data/milestones";
import { socialsData, SocialLink, CONTACT_CONFIG } from "@/data/socials";
import { assistantKnowledgeBase, KnowledgeQnA } from "@/data/assistantKnowledge";
import { createServerClient, createPublicClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type { KnowledgeQnA, ServiceOffering };

export type ProjectStatus =
  | "In Development"
  | "Shipped"
  | "Experimental"
  | "PUBLISHED"
  | "DRAFT"
  | "ARCHIVED";

export interface ExtendedProject
  extends Omit<Project, "status" | "category" | "metrics"> {
  id: string;
  status: ProjectStatus;
  category: Project["category"] | string;
  metrics?: {
    label: string;
    value: string;
    description?: string;
    type?: string;
    evidenceNotes?: string;
  }[];
}

export interface Inquiry {
  id: string;
  name: string;
  email?: string;
  contactMethod: string;
  serviceRequested: string;
  message: string;
  status: "NEW" | "CONTACTED" | "DISCUSSING" | "PROPOSAL" | "WON" | "LOST" | "ARCHIVED";
  isImportant: boolean;
  privateNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  path: string;
  section?: string;
  metadata?: Record<string, unknown>;
  sessionId: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  deviceType: "mobile" | "tablet" | "desktop" | "unknown";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  actorEmail: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface SiteSettings {
  siteTitle: string;
  metaDescription: string;
  availabilityStatus: string;
  allowContactForm: boolean;
  analyticsEnabled: boolean;
  cinematicIntroEnabled: boolean;
  soundEffectsEnabled: boolean;
}

interface LocalStoreSchema {
  profile: ProfileData;
  services: ServiceOffering[];
  capabilities: {
    buildingWith: TechItem[];
    exploringStack: TechItem[];
    coreCapabilities: CapabilityItem[];
  };
  projects: ExtendedProject[];
  experiments: LabExperiment[];
  exploring: ExplorationItem[];
  milestones: Milestone[];
  socials: SocialLink[];
  knowledge: KnowledgeQnA[];
  inquiries: Inquiry[];
  analytics: AnalyticsEvent[];
  auditLogs: AuditLog[];
  settings: SiteSettings;
}

const STORE_PATH = path.join(process.cwd(), "app-store.json");

function getInitialStore(): LocalStoreSchema {
  return {
    profile: profileData,
    services: servicesData,
    capabilities: {
      buildingWith: buildingWithStack,
      exploringStack: exploringStack,
      coreCapabilities: coreCapabilities,
    },
    projects: projectsData.map((p, i) => ({ ...p, id: `proj-${i + 1}` })),
    experiments: experimentsData,
    exploring: exploringData,
    milestones: milestonesData,
    socials: socialsData,
    knowledge: assistantKnowledgeBase,
    inquiries: [],
    analytics: [],
    auditLogs: [],
    settings: {
      siteTitle: "Sam Codes — AI Developer & Automation Builder",
      metaDescription:
        "Samarth Nimangre — student, AI developer and automation builder creating AI systems, workflows, web experiences and digital experiments.",
      availabilityStatus: "Available for custom builds",
      allowContactForm: true,
      analyticsEnabled: true,
      cinematicIntroEnabled: true,
      soundEffectsEnabled: true,
    },
  };
}

function readLocalStore(): LocalStoreSchema {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading local store, falling back to default:", err);
  }
  const initial = getInitialStore();
  writeLocalStore(initial);
  return initial;
}

function writeLocalStore(data: LocalStoreSchema): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to local store:", err);
  }
}

// -----------------------------------------------------------------------------
// PROFILE API
// -----------------------------------------------------------------------------
export async function getProfile(): Promise<ProfileData> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data } = await supabase.from("profiles").select("*").eq("id", "samarth-profile").single();
    if (data) {
      return {
        brandName: "SAM CODES",
        fullName: data.full_name,
        preferredName: data.preferred_name,
        age: data.age,
        title: data.identity_headline,
        location: data.location,
        identityTags: ["Student & Builder", "AI Systems", "Business Automation", "Next.js & React"],
        heroHeadline: data.hero_title,
        heroSubheadline: data.hero_description,
        statementHeadline: "Why collaborate with Sam?",
        statementDescription: data.philosophy_statement,
        aboutStory: [data.bio],
        availabilityStatus: data.status,
        whyWorkWithMe: data.values || profileData.whyWorkWithMe,
      };
    }
  }
  const store = readLocalStore();
  return store.profile;
}

export async function updateProfile(updated: Partial<ProfileData>, actorEmail = "samarthknimangre@gmail.com"): Promise<ProfileData> {
  const store = readLocalStore();
  store.profile = { ...store.profile, ...updated };
  writeLocalStore(store);

  logAuditAction("UPDATE_PROFILE", "PROFILE", "samarth-profile", actorEmail, { updatedFields: Object.keys(updated) });

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("profiles").upsert({
      id: "samarth-profile",
      full_name: store.profile.fullName,
      preferred_name: store.profile.preferredName,
      age: store.profile.age,
      location: store.profile.location,
      identity_headline: store.profile.title,
      bio: store.profile.aboutStory.join("\n\n"),
      hero_title: store.profile.heroHeadline,
      hero_description: store.profile.heroSubheadline,
      philosophy_statement: store.profile.statementDescription,
      values: store.profile.whyWorkWithMe,
      status: store.profile.availabilityStatus,
      updated_at: new Date().toISOString(),
    });
  }

  return store.profile;
}

// -----------------------------------------------------------------------------
// SERVICES API
// -----------------------------------------------------------------------------
export async function getServices(): Promise<ServiceOffering[]> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data } = await supabase.from("services").select("*").order("order_index", { ascending: true });
    if (data && data.length > 0) {
      return data.map((d) => {
        const fallback = servicesData.find((s) => s.id === d.id);
        return {
          id: d.id,
          title: d.title,
          tagline: d.short_description,
          description: d.full_description,
          deliverables: Array.isArray(d.deliverables) ? d.deliverables : (fallback?.deliverables || []),
          pricing: (d.pricing as ServiceOffering["pricing"]) || fallback?.pricing || {
            inr: "₹1,000 – ₹25,000 INR",
            usd: "$15 – $300 USD",
            startingAt: "₹1,000",
            turnaround: "24–48 Hours",
            paymentModel: "Milestone-based",
          },
          idealFor: (d.ideal_for as string) || fallback?.idealFor || "",
        };
      });
    }
  }
  const store = readLocalStore();
  return store.services && store.services.length > 0 ? store.services : servicesData;
}

export async function saveService(service: ServiceOffering, actorEmail = "samarthknimangre@gmail.com"): Promise<ServiceOffering> {
  const store = readLocalStore();
  const existingIdx = store.services.findIndex((s) => s.id === service.id);
  if (existingIdx >= 0) {
    store.services[existingIdx] = service;
    logAuditAction("UPDATE_SERVICE", "SERVICE", service.id, actorEmail, { title: service.title });
  } else {
    store.services.push(service);
    logAuditAction("CREATE_SERVICE", "SERVICE", service.id, actorEmail, { title: service.title });
  }
  writeLocalStore(store);

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("services").upsert({
      id: service.id,
      title: service.title,
      short_description: service.tagline,
      full_description: service.description,
      deliverables: service.deliverables,
      status: "PUBLISHED",
      updated_at: new Date().toISOString(),
    });
  }

  return service;
}

export async function deleteService(id: string, actorEmail = "samarthknimangre@gmail.com"): Promise<void> {
  const store = readLocalStore();
  store.services = store.services.filter((s) => s.id !== id);
  writeLocalStore(store);

  logAuditAction("DELETE_SERVICE", "SERVICE", id, actorEmail, {});

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("services").delete().eq("id", id);
  }
}

// -----------------------------------------------------------------------------
// CAPABILITIES API
// -----------------------------------------------------------------------------
export async function getCapabilities(): Promise<{
  buildingWith: TechItem[];
  exploringStack: TechItem[];
  coreCapabilities: CapabilityItem[];
}> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "capabilities").maybeSingle();
    if (data && data.value) {
      return data.value as {
        buildingWith: TechItem[];
        exploringStack: TechItem[];
        coreCapabilities: CapabilityItem[];
      };
    }
  }
  const store = readLocalStore();
  return store.capabilities;
}

export async function updateCapabilities(
  data: Partial<{
    buildingWith: TechItem[];
    exploringStack: TechItem[];
    coreCapabilities: CapabilityItem[];
  }>,
  actorEmail = "samarthknimangre@gmail.com"
): Promise<{
  buildingWith: TechItem[];
  exploringStack: TechItem[];
  coreCapabilities: CapabilityItem[];
}> {
  const store = readLocalStore();
  store.capabilities = { ...store.capabilities, ...data };
  writeLocalStore(store);

  logAuditAction("UPDATE_CAPABILITIES", "CAPABILITIES", "global", actorEmail, {
    keys: Object.keys(data),
  });

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("site_settings").upsert({
      key: "capabilities",
      value: store.capabilities,
      updated_at: new Date().toISOString(),
      is_public: true,
    });
  }

  return store.capabilities;
}

// -----------------------------------------------------------------------------
// PROJECTS API
// -----------------------------------------------------------------------------
export async function getProjects(includeDrafts = false): Promise<ExtendedProject[]> {
  const supabase = createPublicClient();
  if (supabase) {
    let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (!includeDrafts) {
      query = query.eq("status", "PUBLISHED");
    }
    const { data } = await query;
    if (data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        slug: d.slug,
        title: d.title,
        shortDescription: d.short_description,
        fullDescription: d.full_description,
        category: d.category,
        technologies: d.tech_stack || [],
        tools: d.tools || [],
        image: d.hero_image || "",
        status: d.status,
        featured: d.featured,
        date: d.publication_date || "",
        problem: d.problem_statement,
        approach: d.approach,
        architecture: d.architecture || [],
        result: d.results,
        lessons: d.lessons,
        metrics: d.metrics || [],
        liveUrl: d.live_url,
        githubUrl: d.github_url,
      }));
    }
  }
  const store = readLocalStore();
  if (includeDrafts) return store.projects;
  return store.projects.filter((p) => p.status === "PUBLISHED" || p.status === "Shipped");
}

export async function getProjectById(idOrSlug: string): Promise<ExtendedProject | undefined> {
  const supabase = createAdminClient();
  if (supabase) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        shortDescription: data.short_description,
        fullDescription: data.full_description,
        category: data.category,
        technologies: data.tech_stack || [],
        tools: data.tools || [],
        image: data.hero_image || "",
        status: data.status,
        featured: data.featured,
        date: data.publication_date || "",
        problem: data.problem_statement,
        approach: data.approach,
        architecture: data.architecture || [],
        result: data.results,
        lessons: data.lessons,
        metrics: data.metrics || [],
        liveUrl: data.live_url,
        githubUrl: data.github_url,
      };
    }
  }
  const store = readLocalStore();
  return store.projects.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

export async function saveProject(project: ExtendedProject, actorEmail = "samarthknimangre@gmail.com"): Promise<ExtendedProject> {
  const store = readLocalStore();
  const existingIdx = store.projects.findIndex((p) => p.id === project.id || p.slug === project.slug);

  if (existingIdx >= 0) {
    store.projects[existingIdx] = { ...store.projects[existingIdx], ...project };
    logAuditAction("UPDATE_PROJECT", "PROJECT", project.id, actorEmail, { title: project.title, status: project.status });
  } else {
    store.projects.unshift(project);
    logAuditAction("CREATE_PROJECT", "PROJECT", project.id, actorEmail, { title: project.title, status: project.status });
  }
  writeLocalStore(store);

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("projects").upsert({
      id: project.id,
      slug: project.slug,
      title: project.title,
      short_description: project.shortDescription,
      full_description: project.fullDescription,
      category: project.category,
      status: project.status,
      featured: project.featured,
      problem_statement: project.problem,
      approach: project.approach,
      architecture: project.architecture,
      tech_stack: project.technologies,
      tools: project.tools,
      results: project.result,
      lessons: project.lessons,
      metrics: project.metrics,
      hero_image: project.image,
      live_url: project.liveUrl,
      github_url: project.githubUrl,
      updated_at: new Date().toISOString(),
    });
  }

  return project;
}

export async function deleteProject(id: string, actorEmail = "samarthknimangre@gmail.com"): Promise<void> {
  const store = readLocalStore();
  store.projects = store.projects.filter((p) => p.id !== id);
  writeLocalStore(store);

  logAuditAction("DELETE_PROJECT", "PROJECT", id, actorEmail, {});

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("projects").delete().eq("id", id);
  }
}

// -----------------------------------------------------------------------------
// INQUIRIES & LEADS API
// -----------------------------------------------------------------------------
export async function getInquiries(): Promise<Inquiry[]> {
  const supabase = createAdminClient();
  if (supabase) {
    const { data } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        contactMethod: d.contact_method || d.channel || "Email",
        serviceRequested: d.service_requested,
        message: d.message,
        status: d.status,
        isImportant: d.is_important || false,
        privateNotes: d.private_notes,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    }
  }
  const store = readLocalStore();
  return store.inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createInquiry(data: {
  name: string;
  email?: string;
  contactMethod: string;
  serviceRequested: string;
  message: string;
}): Promise<Inquiry> {
  const store = readLocalStore();
  const newInquiry: Inquiry = {
    id: `inq-${Date.now()}`,
    name: data.name,
    email: data.email,
    contactMethod: data.contactMethod,
    serviceRequested: data.serviceRequested,
    message: data.message,
    status: "NEW",
    isImportant: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.inquiries.unshift(newInquiry);
  writeLocalStore(store);

  logAuditAction("NEW_INQUIRY", "INQUIRY", newInquiry.id, "system", { name: newInquiry.name, service: newInquiry.serviceRequested });

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("inquiries").insert({
      id: newInquiry.id,
      name: newInquiry.name,
      email: newInquiry.email,
      contact_method: newInquiry.contactMethod,
      service_requested: newInquiry.serviceRequested,
      message: newInquiry.message,
      status: "NEW",
      is_important: false,
    });
  }

  return newInquiry;
}

export async function updateInquiryStatus(
  id: string,
  status: Inquiry["status"],
  notes?: string,
  actorEmail = "samarthknimangre@gmail.com"
): Promise<Inquiry | undefined> {
  const store = readLocalStore();
  const inquiry = store.inquiries.find((i) => i.id === id);
  if (!inquiry) return undefined;

  inquiry.status = status;
  if (notes !== undefined) inquiry.privateNotes = notes;
  inquiry.updatedAt = new Date().toISOString();

  writeLocalStore(store);
  logAuditAction("UPDATE_INQUIRY_STATUS", "INQUIRY", id, actorEmail, { status, hasNotes: !!notes });

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("inquiries").update({
      status,
      private_notes: inquiry.privateNotes,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
  }

  return inquiry;
}

export async function deleteInquiry(id: string, actorEmail = "samarthknimangre@gmail.com"): Promise<boolean> {
  let deletedFromSupabase = false;
  const supabase = createAdminClient();
  if (supabase) {
    const { error, count } = await supabase.from("inquiries").delete({ count: "exact" }).eq("id", id);
    if (!error && (count === null || count > 0)) {
      deletedFromSupabase = true;
    }
  }

  const store = readLocalStore();
  const idx = store.inquiries.findIndex((i) => i.id === id);
  if (idx >= 0) {
    store.inquiries.splice(idx, 1);
    writeLocalStore(store);
  }

  if (deletedFromSupabase || idx >= 0) {
    logAuditAction("DELETE_INQUIRY", "INQUIRY", id, actorEmail, {});
    return true;
  }

  return false;
}

// -----------------------------------------------------------------------------
// ANALYTICS API
// -----------------------------------------------------------------------------
export async function logAnalyticsEvent(event: Omit<AnalyticsEvent, "id" | "createdAt">): Promise<void> {
  const store = readLocalStore();
  if (!store.settings.analyticsEnabled) return;

  const newEvent: AnalyticsEvent = {
    ...event,
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  store.analytics.push(newEvent);
  // Cap at 1,000 local events to avoid unbounded file size
  if (store.analytics.length > 1000) {
    store.analytics = store.analytics.slice(-1000);
  }
  writeLocalStore(store);

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("analytics_events").insert({
      id: newEvent.id,
      event_name: newEvent.eventName,
      path: newEvent.path,
      section: newEvent.section,
      metadata: newEvent.metadata || {},
      session_id: newEvent.sessionId,
      referrer: newEvent.referrer,
      utm_source: newEvent.utmSource,
      utm_medium: newEvent.utmMedium,
      utm_campaign: newEvent.utmCampaign,
      device_type: newEvent.deviceType,
    });
  }
}

export async function getAnalyticsSummary(rangeDays = 7): Promise<{
  totalVisitors: number;
  totalPageViews: number;
  totalSessions: number;
  totalInquiries: number;
  topSources: { source: string; count: number }[];
  devices: { device: string; count: number }[];
  timeline: { date: string; views: number; visitors: number }[];
}> {
  let filteredEvents: AnalyticsEvent[] = [];
  const supabase = createAdminClient();
  const cutoffIso = new Date(Date.now() - rangeDays * 86400000).toISOString();

  if (supabase) {
    const { data } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", cutoffIso)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      filteredEvents = data.map((d) => ({
        id: d.id,
        eventName: d.event_name,
        path: d.path,
        section: d.section,
        metadata: d.metadata,
        sessionId: d.session_id,
        referrer: d.referrer,
        utmSource: d.utm_source,
        utmMedium: d.utm_medium,
        utmCampaign: d.utm_campaign,
        deviceType: d.device_type,
        createdAt: d.created_at,
      }));
    }
  }

  if (filteredEvents.length === 0) {
    const store = readLocalStore();
    const cutoff = Date.now() - rangeDays * 86400000;
    filteredEvents = store.analytics.filter((e) => new Date(e.createdAt).getTime() >= cutoff);
  }

  const uniqueSessions = new Set(filteredEvents.map((e) => e.sessionId)).size;
  const pageViews = filteredEvents.filter((e) => e.eventName === "page_view").length;

  const sourcesMap: Record<string, number> = {};
  const devicesMap: Record<string, number> = {};
  const timelineMap: Record<string, { views: number; sessions: Set<string> }> = {};

  filteredEvents.forEach((e) => {
    // Source
    const source = e.utmSource || (e.referrer ? new URL(e.referrer, "https://sam-codes.vercel.app").hostname : "Direct");
    sourcesMap[source] = (sourcesMap[source] || 0) + 1;

    // Device
    devicesMap[e.deviceType] = (devicesMap[e.deviceType] || 0) + 1;

    // Timeline
    const dateKey = e.createdAt.split("T")[0];
    if (!timelineMap[dateKey]) timelineMap[dateKey] = { views: 0, sessions: new Set() };
    if (e.eventName === "page_view") timelineMap[dateKey].views++;
    timelineMap[dateKey].sessions.add(e.sessionId);
  });

  const timeline = Object.keys(timelineMap)
    .sort()
    .map((date) => ({
      date,
      views: timelineMap[date].views,
      visitors: timelineMap[date].sessions.size,
    }));

  const topSources = Object.entries(sourcesMap)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  const devices = Object.entries(devicesMap).map(([device, count]) => ({ device, count }));

  const allInquiries = await getInquiries();
  const inquiriesCount = allInquiries.filter(
    (i) => new Date(i.createdAt).getTime() >= Date.now() - rangeDays * 86400000
  ).length;

  return {
    totalVisitors: uniqueSessions,
    totalPageViews: pageViews,
    totalSessions: uniqueSessions,
    totalInquiries: inquiriesCount,
    topSources,
    devices,
    timeline,
  };
}

// -----------------------------------------------------------------------------
// SOCIALS API
// -----------------------------------------------------------------------------
export async function getSocialLinks(): Promise<SocialLink[]> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data } = await supabase.from("social_links").select("*").eq("is_visible", true).order("priority", { ascending: true });
    if (data && data.length > 0) {
      return data.map((d) => ({
        platform: d.platform,
        url: d.url,
        handleOrLabel: d.username,
        ariaLabel: `Message Sam on ${d.platform}`,
        iconName: (d.platform as SocialLink["iconName"]) || "Mail",
        directActionLabel: d.platform === "Email" ? "Email Sam" : `DM on ${d.platform}`,
        priorityBadge: d.priority === 1 ? "Top Preference" : undefined,
        description: d.description,
      }));
    }
  }
  const store = readLocalStore();
  return store.socials;
}

export async function saveSocialLink(social: SocialLink, actorEmail = "samarthknimangre@gmail.com"): Promise<SocialLink> {
  const store = readLocalStore();
  const idx = store.socials.findIndex((s) => s.platform.toLowerCase() === social.platform.toLowerCase());
  if (idx >= 0) {
    store.socials[idx] = social;
  } else {
    store.socials.push(social);
  }
  writeLocalStore(store);

  logAuditAction("UPDATE_SOCIAL", "SOCIAL", social.platform, actorEmail, { url: social.url, handle: social.handleOrLabel });

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("social_links").upsert({
      id: social.platform.toLowerCase(),
      platform: social.platform,
      display_name: social.platform,
      username: social.handleOrLabel,
      url: social.url,
      description: social.description || "",
      priority: idx >= 0 ? idx + 1 : store.socials.length,
      is_visible: true,
      updated_at: new Date().toISOString(),
    });
  }

  return social;
}

// -----------------------------------------------------------------------------
// EXPLORING TOPICS API
// -----------------------------------------------------------------------------
export async function getExploringTopics(): Promise<ExplorationItem[]> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data } = await supabase.from("exploring_topics").select("*").eq("is_visible", true).order("order_index", { ascending: true });
    if (data && data.length > 0) {
      return data.map((d) => ({
        name: d.name,
        category: d.category as ExplorationItem["category"],
        status: d.status as ExplorationItem["status"],
        focus: d.focus,
      }));
    }
  }
  const store = readLocalStore();
  return store.exploring;
}

export async function saveExploringTopic(topic: ExplorationItem, actorEmail = "samarthknimangre@gmail.com"): Promise<ExplorationItem> {
  const store = readLocalStore();
  const idx = store.exploring.findIndex((e) => e.name.toLowerCase() === topic.name.toLowerCase());
  if (idx >= 0) {
    store.exploring[idx] = topic;
  } else {
    store.exploring.push(topic);
  }
  writeLocalStore(store);
  logAuditAction("SAVE_EXPLORING_TOPIC", "EXPLORING", topic.name, actorEmail, { status: topic.status });

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("exploring_topics").upsert({
      id: `exp-${topic.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: topic.name,
      category: topic.category,
      status: topic.status,
      focus: topic.focus,
      order_index: idx >= 0 ? idx + 1 : store.exploring.length,
      is_visible: true,
      updated_at: new Date().toISOString(),
    });
  }

  return topic;
}

export async function deleteExploringTopic(name: string, actorEmail = "samarthknimangre@gmail.com"): Promise<void> {
  const store = readLocalStore();
  store.exploring = store.exploring.filter((e) => e.name.toLowerCase() !== name.toLowerCase());
  writeLocalStore(store);
  logAuditAction("DELETE_EXPLORING_TOPIC", "EXPLORING", name, actorEmail, {});

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("exploring_topics").delete().ilike("name", name);
  }
}

// -----------------------------------------------------------------------------
// KNOWLEDGE BASE API (ASK SAM)
// -----------------------------------------------------------------------------
export async function getAssistantKnowledge(): Promise<KnowledgeQnA[]> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data } = await supabase.from("assistant_knowledge").select("*").eq("status", "PUBLISHED").order("order_index", { ascending: true });
    if (data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        question: d.question,
        keywords: Array.isArray(d.keywords) ? d.keywords : [],
        answer: d.answer,
      }));
    }
  }
  const store = readLocalStore();
  return store.knowledge;
}

export async function saveAssistantKnowledge(item: KnowledgeQnA, actorEmail = "samarthknimangre@gmail.com"): Promise<KnowledgeQnA> {
  const store = readLocalStore();
  const idx = store.knowledge.findIndex((k) => k.id === item.id);
  if (idx >= 0) {
    store.knowledge[idx] = item;
  } else {
    store.knowledge.push(item);
  }
  writeLocalStore(store);
  logAuditAction("SAVE_KNOWLEDGE", "KNOWLEDGE", item.id, actorEmail, { question: item.question });

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("assistant_knowledge").upsert({
      id: item.id,
      question: item.question,
      keywords: item.keywords,
      answer: item.answer,
      category: "GENERAL",
      order_index: idx >= 0 ? idx + 1 : store.knowledge.length,
      status: "PUBLISHED",
      updated_at: new Date().toISOString(),
    });
  }

  return item;
}

export async function deleteAssistantKnowledge(id: string, actorEmail = "samarthknimangre@gmail.com"): Promise<void> {
  const store = readLocalStore();
  store.knowledge = store.knowledge.filter((k) => k.id !== id);
  writeLocalStore(store);
  logAuditAction("DELETE_KNOWLEDGE", "KNOWLEDGE", id, actorEmail, {});

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("assistant_knowledge").delete().eq("id", id);
  }
}

// -----------------------------------------------------------------------------
// SITE SETTINGS API
// -----------------------------------------------------------------------------
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "global_settings").maybeSingle();
    if (data && data.value) {
      return data.value as SiteSettings;
    }
  }
  const store = readLocalStore();
  return store.settings;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>, actorEmail = "samarthknimangre@gmail.com"): Promise<SiteSettings> {
  const store = readLocalStore();
  store.settings = { ...store.settings, ...settings };
  writeLocalStore(store);
  logAuditAction("UPDATE_SETTINGS", "SETTINGS", "global", actorEmail, { keys: Object.keys(settings) });

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("site_settings").upsert({
      key: "global_settings",
      value: store.settings,
      updated_at: new Date().toISOString(),
      is_public: true,
    });
  }

  return store.settings;
}

// -----------------------------------------------------------------------------
// AUDIT & SYSTEM HEALTH
// -----------------------------------------------------------------------------
export function logAuditAction(
  action: string,
  entityType: string,
  entityId: string,
  actorEmail: string,
  details: Record<string, unknown>
): void {
  try {
    const store = readLocalStore();
    const logEntry: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      action,
      entityType,
      entityId,
      actorEmail,
      details,
      createdAt: new Date().toISOString(),
    };
    store.auditLogs.unshift(logEntry);
    if (store.auditLogs.length > 200) {
      store.auditLogs = store.auditLogs.slice(0, 200);
    }
    writeLocalStore(store);
  } catch (err) {
    console.error("Failed to log audit action:", err);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const store = readLocalStore();
  return store.auditLogs;
}

export async function getSystemHealth(): Promise<{
  database: "Healthy" | "Degraded" | "Not configured";
  auth: "Healthy" | "Degraded" | "Active (Cookie Session)";
  storage: "Healthy" | "Not configured";
  analytics: "Healthy" | "Disabled";
  askSam: "Healthy" | "Offline";
  version: string;
  uptime: string;
}> {
  const store = readLocalStore();
  const supabase = await createServerClient();

  let dbStatus: "Healthy" | "Degraded" | "Not configured" = "Not configured";
  let authStatus: "Healthy" | "Degraded" | "Active (Cookie Session)" = "Active (Cookie Session)";

  if (supabase) {
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      dbStatus = error ? "Degraded" : "Healthy";
      authStatus = "Healthy";
    } catch {
      dbStatus = "Degraded";
    }
  }

  return {
    database: dbStatus,
    auth: authStatus,
    storage: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Healthy" : "Not configured",
    analytics: store.settings.analyticsEnabled ? "Healthy" : "Disabled",
    askSam: store.knowledge.length > 0 ? "Healthy" : "Offline",
    version: "1.2.0-cmd",
    uptime: process.env.NODE_ENV === "production" ? "Live" : "Development",
  };
}
