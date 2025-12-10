import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { candidates, passCandidates, passes, onboarding, candidateLinks } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import {
  generateEmailDraft,
  generateJobDescription,
  generateCandidateSummary,
  generateInterviewQuestions,
  scoreCandidate,
  generateSourcingCriteria,
  analyzeProfileStrengths,
} from "./contentGeneration";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all candidates
  app.get("/api/candidates", async (req, res) => {
    try {
      const allCandidates = await storage.getCandidates();
      res.json(allCandidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  });

  // Get single candidate
  app.get("/api/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const candidate = await storage.getCandidate(id);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      console.error("Error fetching candidate:", error);
      res.status(500).json({ error: "Failed to fetch candidate" });
    }
  });

  // Create candidate
  app.post("/api/candidates", async (req, res) => {
    try {
      const candidate = await storage.createCandidate(req.body);
      res.status(201).json(candidate);
    } catch (error) {
      console.error("Error creating candidate:", error);
      res.status(500).json({ error: "Failed to create candidate" });
    }
  });

  // Issue Candidate Pass - Creates a link for a candidate to view their application status
  app.post("/api/candidates/:id/issue-pass", async (req, res) => {
    try {
      const candidateId = parseInt(req.params.id);
      const candidate = await storage.getCandidate(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      // Check if candidate is already linked to a pass, if not create one
      const [existingPassCandidate] = await db.select()
        .from(passCandidates)
        .where(eq(passCandidates.candidateId, candidateId))
        .limit(1);

      let passCandidateId: number;

      if (existingPassCandidate) {
        passCandidateId = existingPassCandidate.id;
      } else {
        // Create a default pass for this candidate if none exists
        const [defaultPass] = await db.select().from(passes).limit(1);
        
        let passId: number;
        if (!defaultPass) {
          // Create a general recruitment pass
          const [newPass] = await db.insert(passes).values({
            passId: `PASS-${Date.now()}`,
            positionTitle: "General Application",
            department: "Human Resources",
            status: "active",
          }).returning();
          passId = newPass.id;
        } else {
          passId = defaultPass.id;
        }

        const newPassCandidate = await storage.createPassCandidate({
          passId,
          candidateId,
          status: "new",
        });
        passCandidateId = newPassCandidate.id;
      }

      // Create the candidate link
      const { token } = await storage.createCandidateLink(passCandidateId, "candidate_pass");

      res.json({ 
        success: true, 
        token,
        passUrl: `/candidate?token=${token}`,
        message: `Candidate pass issued for ${candidate.name}` 
      });
    } catch (error) {
      console.error("Error issuing candidate pass:", error);
      res.status(500).json({ error: "Failed to issue candidate pass" });
    }
  });

  // Issue Onboarding Pass - Creates an onboarding record and link for new hires
  app.post("/api/candidates/:id/issue-onboarding-pass", async (req, res) => {
    try {
      const candidateId = parseInt(req.params.id);
      const candidate = await storage.getCandidate(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      // Find or create the pass candidate record
      let [passCandidate] = await db.select()
        .from(passCandidates)
        .where(eq(passCandidates.candidateId, candidateId))
        .limit(1);

      if (!passCandidate) {
        // Create a pass_candidate record if none exists
        const [defaultPass] = await db.select().from(passes).limit(1);
        
        let passId: number;
        if (!defaultPass) {
          // Create a general recruitment pass
          const [newPass] = await db.insert(passes).values({
            passId: `PASS-${Date.now()}`,
            positionTitle: "General Application",
            department: "Human Resources",
            status: "active",
          }).returning();
          passId = newPass.id;
        } else {
          passId = defaultPass.id;
        }

        passCandidate = await storage.createPassCandidate({
          passId,
          candidateId,
          status: "offered",
        });
      }

      // Check if onboarding already exists
      let existingOnboarding = await storage.getOnboardingByPassCandidateId(passCandidate.id);
      
      if (!existingOnboarding) {
        // Create onboarding record
        existingOnboarding = await storage.createOnboarding({
          passCandidateId: passCandidate.id,
        });
      }

      // Create the onboarding link
      const { token } = await storage.createCandidateLink(passCandidate.id, "onboarding_pass");

      res.json({ 
        success: true, 
        token,
        passUrl: `/onboarding?token=${token}`,
        message: `Onboarding pass issued for ${candidate.name}` 
      });
    } catch (error) {
      console.error("Error issuing onboarding pass:", error);
      res.status(500).json({ error: "Failed to issue onboarding pass" });
    }
  });

  // Get candidate pass data by token
  app.get("/api/pass/candidate/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const link = await storage.getCandidateLinkByToken(token);
      
      if (!link) {
        return res.status(404).json({ error: "Invalid or expired pass link" });
      }

      const passCandidate = await storage.getPassCandidate(link.passCandidateId);
      if (!passCandidate) {
        return res.status(404).json({ error: "Application not found" });
      }

      const candidate = await storage.getCandidate(passCandidate.candidateId);
      
      // Get the pass details
      const [pass] = await db.select().from(passes).where(eq(passes.id, passCandidate.passId));

      res.json({
        candidate,
        passCandidate,
        pass,
        purpose: link.purpose,
      });
    } catch (error) {
      console.error("Error fetching pass data:", error);
      res.status(500).json({ error: "Failed to fetch pass data" });
    }
  });

  // Get onboarding pass data by token
  app.get("/api/pass/onboarding/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const link = await storage.getCandidateLinkByToken(token);
      
      if (!link) {
        return res.status(404).json({ error: "Invalid or expired pass link" });
      }

      const passCandidate = await storage.getPassCandidate(link.passCandidateId);
      if (!passCandidate) {
        return res.status(404).json({ error: "Application not found" });
      }

      const candidate = await storage.getCandidate(passCandidate.candidateId);
      const onboardingData = await storage.getOnboardingByPassCandidateId(link.passCandidateId);
      
      // Get the pass details
      const [pass] = await db.select().from(passes).where(eq(passes.id, passCandidate.passId));

      res.json({
        candidate,
        passCandidate,
        pass,
        onboarding: onboardingData,
        purpose: link.purpose,
      });
    } catch (error) {
      console.error("Error fetching onboarding pass data:", error);
      res.status(500).json({ error: "Failed to fetch onboarding pass data" });
    }
  });

  // Content generation endpoints (smart features - no AI branding exposed)

  // Generate email draft
  app.post("/api/generate/email", async (req, res) => {
    try {
      const { type, recipientName, positionTitle, details, interviewDate, interviewTime, interviewerName } = req.body;
      
      if (!type || !recipientName) {
        return res.status(400).json({ error: "type and recipientName are required" });
      }

      const emailContent = await generateEmailDraft({
        type,
        recipientName,
        positionTitle,
        details,
        interviewDate,
        interviewTime,
        interviewerName,
      });

      res.json({ content: emailContent });
    } catch (error) {
      console.error("Error generating email:", error);
      res.status(500).json({ error: "Failed to generate email content" });
    }
  });

  // Generate job description
  app.post("/api/generate/job-description", async (req, res) => {
    try {
      const { positionTitle, department, experienceMin, experienceMax, employmentType, responsibilities, requirements } = req.body;
      
      if (!positionTitle || !department) {
        return res.status(400).json({ error: "positionTitle and department are required" });
      }

      const jdContent = await generateJobDescription({
        positionTitle,
        department,
        experienceMin,
        experienceMax,
        employmentType,
        responsibilities,
        requirements,
      });

      res.json({ content: jdContent });
    } catch (error) {
      console.error("Error generating job description:", error);
      res.status(500).json({ error: "Failed to generate job description" });
    }
  });

  // Generate candidate summary
  app.post("/api/generate/candidate-summary", async (req, res) => {
    try {
      const { name, currentTitle, currentCompany, experienceYears, skills, education, cvText } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "name is required" });
      }

      const summary = await generateCandidateSummary({
        name,
        currentTitle,
        currentCompany,
        experienceYears,
        skills,
        education,
        cvText,
      });

      res.json(summary);
    } catch (error) {
      console.error("Error generating candidate summary:", error);
      res.status(500).json({ error: "Failed to generate candidate summary" });
    }
  });

  // Generate interview questions
  app.post("/api/generate/interview-questions", async (req, res) => {
    try {
      const { positionTitle, department, experienceLevel, focusAreas } = req.body;
      
      if (!positionTitle || !department) {
        return res.status(400).json({ error: "positionTitle and department are required" });
      }

      const questions = await generateInterviewQuestions({
        positionTitle,
        department,
        experienceLevel,
        focusAreas,
      });

      res.json({ questions });
    } catch (error) {
      console.error("Error generating interview questions:", error);
      res.status(500).json({ error: "Failed to generate interview questions" });
    }
  });

  // Score candidate against requirements
  app.post("/api/generate/score-candidate", async (req, res) => {
    try {
      const { positionTitle, requirements, candidateProfile } = req.body;
      
      if (!positionTitle || !requirements || !candidateProfile) {
        return res.status(400).json({ error: "positionTitle, requirements, and candidateProfile are required" });
      }

      const scoreResult = await scoreCandidate({
        positionTitle,
        requirements,
        candidateProfile,
      });

      res.json(scoreResult);
    } catch (error) {
      console.error("Error scoring candidate:", error);
      res.status(500).json({ error: "Failed to score candidate" });
    }
  });

  // Generate sourcing criteria for a position
  app.post("/api/generate/sourcing-criteria", async (req, res) => {
    try {
      const { positionTitle, department, jobDescription, experienceMin, experienceMax } = req.body;
      
      if (!positionTitle || !department) {
        return res.status(400).json({ error: "positionTitle and department are required" });
      }

      const criteria = await generateSourcingCriteria({
        positionTitle,
        department,
        jobDescription,
        experienceMin,
        experienceMax,
      });

      res.json(criteria);
    } catch (error) {
      console.error("Error generating sourcing criteria:", error);
      res.status(500).json({ error: "Failed to generate sourcing criteria" });
    }
  });

  // Analyze candidate profile strengths and red flags
  app.post("/api/generate/analyze-profile", async (req, res) => {
    try {
      const { positionTitle, profileUrl, candidateName, currentTitle, currentCompany, summary, experience, skills, education, location } = req.body;
      
      if (!positionTitle || !candidateName) {
        return res.status(400).json({ error: "positionTitle and candidateName are required" });
      }

      const analysis = await analyzeProfileStrengths({
        positionTitle,
        profileUrl,
        candidateName,
        currentTitle,
        currentCompany,
        summary,
        experience,
        skills,
        education,
        location,
      });

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing profile:", error);
      res.status(500).json({ error: "Failed to analyze profile" });
    }
  });

  return httpServer;
}
