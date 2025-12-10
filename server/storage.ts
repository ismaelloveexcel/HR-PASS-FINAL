import { 
  type User, type InsertUser,
  type Candidate, type InsertCandidate,
  type Pass, type InsertPass,
  type PassCandidate, type InsertPassCandidate,
  type Onboarding, type InsertOnboarding,
  users, candidates, passes, passCandidates, candidateLinks, onboarding
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  
  getPassCandidates(passId: number): Promise<PassCandidate[]>;
  getPassCandidate(id: number): Promise<PassCandidate | undefined>;
  createPassCandidate(passCandidate: InsertPassCandidate): Promise<PassCandidate>;
  updatePassCandidateStatus(id: number, status: string): Promise<PassCandidate | undefined>;
  
  createCandidateLink(passCandidateId: number, purpose: string): Promise<{ token: string }>;
  getCandidateLinkByToken(token: string): Promise<{ passCandidateId: number; purpose: string } | undefined>;
  
  getOnboardingByPassCandidateId(passCandidateId: number): Promise<Onboarding | undefined>;
  createOnboarding(data: InsertOnboarding): Promise<Onboarding>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCandidates(): Promise<Candidate[]> {
    return db.select().from(candidates);
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate;
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [newCandidate] = await db.insert(candidates).values(candidate).returning();
    return newCandidate;
  }

  async updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [updated] = await db.update(candidates).set(candidate).where(eq(candidates.id, id)).returning();
    return updated;
  }

  async getPassCandidates(passId: number): Promise<PassCandidate[]> {
    return db.select().from(passCandidates).where(eq(passCandidates.passId, passId));
  }

  async getPassCandidate(id: number): Promise<PassCandidate | undefined> {
    const [pc] = await db.select().from(passCandidates).where(eq(passCandidates.id, id));
    return pc;
  }

  async createPassCandidate(passCandidate: InsertPassCandidate): Promise<PassCandidate> {
    const [newPc] = await db.insert(passCandidates).values(passCandidate).returning();
    return newPc;
  }

  async updatePassCandidateStatus(id: number, status: string): Promise<PassCandidate | undefined> {
    const [updated] = await db.update(passCandidates).set({ status }).where(eq(passCandidates.id, id)).returning();
    return updated;
  }

  async createCandidateLink(passCandidateId: number, purpose: string): Promise<{ token: string }> {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    await db.insert(candidateLinks).values({
      passCandidateId,
      token,
      purpose,
      expiresAt,
    });
    
    return { token };
  }

  async getCandidateLinkByToken(token: string): Promise<{ passCandidateId: number; purpose: string } | undefined> {
    const [link] = await db.select().from(candidateLinks).where(eq(candidateLinks.token, token));
    if (!link) return undefined;
    return { passCandidateId: link.passCandidateId, purpose: link.purpose || '' };
  }

  async getOnboardingByPassCandidateId(passCandidateId: number): Promise<Onboarding | undefined> {
    const [result] = await db.select().from(onboarding).where(eq(onboarding.passCandidateId, passCandidateId));
    return result;
  }

  async createOnboarding(data: InsertOnboarding): Promise<Onboarding> {
    const [newOnboarding] = await db.insert(onboarding).values(data).returning();
    return newOnboarding;
  }
}

export const storage = new DatabaseStorage();
