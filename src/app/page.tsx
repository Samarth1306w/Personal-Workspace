import React from "react";
import CinematicIntro from "@/components/CinematicIntro";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import LabSection from "@/components/LabSection";
import ProcessSection from "@/components/ProcessSection";
import AboutSection from "@/components/AboutSection";
import ExploringSection from "@/components/ExploringSection";
import MilestonesSection from "@/components/MilestonesSection";
import ServicesSection from "@/components/ServicesSection";
import ProjectCalculator from "@/components/ProjectCalculator";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import AskSamAssistant from "@/components/AskSamAssistant";
import EasterEggs from "@/components/EasterEggs";
import {
  getProfile,
  getProjects,
  getServices,
  getExploringTopics,
  getCapabilities,
  getSocialLinks,
  getAssistantKnowledge,
} from "@/lib/data-service";
import { profileData } from "@/data/profile";
import { projectsData, experimentsData, Project } from "@/data/projects";
import { servicesData } from "@/data/services";
import { exploringData } from "@/data/exploring";
import { buildingWithStack, exploringStack, coreCapabilities } from "@/data/capabilities";
import { socialsData } from "@/data/socials";
import { assistantKnowledgeBase } from "@/data/assistantKnowledge";

export const revalidate = 3600;

export default async function HomePage() {
  const [profile, projects, services, exploringTopics, capabilities, socials, knowledge] =
    await Promise.all([
      getProfile().catch(() => profileData),
      getProjects(false).catch(() => []),
      getServices().catch(() => servicesData),
      getExploringTopics().catch(() => exploringData),
      getCapabilities().catch(() => ({
        buildingWith: buildingWithStack,
        exploringStack,
        coreCapabilities,
      })),
      getSocialLinks().catch(() => socialsData),
      getAssistantKnowledge().catch(() => assistantKnowledgeBase),
    ]);

  return (
    <>
      {/* Opening sequence for first-time session arrivals */}
      <CinematicIntro />

      {/* Floating navigation header */}
      <Navbar />

      {/* Core Portfolio Page Flow */}
      <main className="flex-1 flex flex-col">
        <Hero profile={profile} />
        <Statement profile={profile} />
        <CapabilitiesSection
          capabilities={capabilities.coreCapabilities}
          buildingWith={capabilities.buildingWith}
          exploring={capabilities.exploringStack}
        />
        <LabSection
          projects={projects.length > 0 ? (projects as unknown as Project[]) : projectsData}
          experiments={experimentsData}
        />
        <ProcessSection />
        <AboutSection profile={profile} />
        <ExploringSection exploringTopics={exploringTopics} />
        <MilestonesSection />
        <ServicesSection services={services} />
        <ProjectCalculator />
        <ContactSection socials={socials} />
      </main>

      {/* Footer credits and links */}
      <Footer />

      {/* Floating Interactive Assistant */}
      <AskSamAssistant knowledge={knowledge} />

      {/* Developer Telemetry HUD */}
      <EasterEggs />
    </>
  );
}
