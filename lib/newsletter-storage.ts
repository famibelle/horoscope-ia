/**
 * Module de stockage des newsletters générées
 * Stocke les newsletters dans des fichiers JSON pour persistance
 */

import fs from 'fs/promises';
import path from 'path';

// Interface pour une newsletter stockée
interface StoredNewsletter {
  id: string;
  date: string;
  subject: string;
  preview: string;
  htmlContent: string;
  text: string;
  sign?: string;
  subscriberEmail?: string;
}

// Chemin du dossier de stockage
const STORAGE_DIR = path.join(process.cwd(), 'private_data', 'newsletters');

/**
 * Initialise le dossier de stockage
 */
async function initializeStorage(): Promise<void> {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Génère un ID unique pour une newsletter
 */
function generateId(): string {
  return `newsletter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Chemin d'un fichier de newsletter
 */
function getNewsletterPath(id: string): string {
  return path.join(STORAGE_DIR, `${id}.json`);
}

/**
 * Liste tous les IDs de newsletters stockées
 */
async function listNewsletterIds(): Promise<string[]> {
  await initializeStorage();
  
  try {
    const files = await fs.readdir(STORAGE_DIR);
    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''));
  } catch {
    return [];
  }
}

/**
 * Récupère une newsletter par son ID
 */
export async function getNewsletter(id: string): Promise<StoredNewsletter | null> {
  await initializeStorage();
  
  try {
    const filePath = getNewsletterPath(id);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as StoredNewsletter;
  } catch {
    return null;
  }
}

/**
 * Récupère toutes les newsletters stockées
 */
export async function getAllNewsletters(): Promise<StoredNewsletter[]> {
  const ids = await listNewsletterIds();
  
  const newsletters: StoredNewsletter[] = [];
  
  for (const id of ids) {
    const newsletter = await getNewsletter(id);
    if (newsletter) {
      newsletters.push(newsletter);
    }
  }
  
  // Trier par date (plus récentes en premier)
  return newsletters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Sauvegarde une newsletter
 */
export async function saveNewsletter(newsletter: Omit<StoredNewsletter, 'id' | 'date'>): Promise<StoredNewsletter> {
  await initializeStorage();
  
  const storedNewsletter: StoredNewsletter = {
    ...newsletter,
    id: generateId(),
    date: new Date().toISOString(),
  };
  
  const filePath = getNewsletterPath(storedNewsletter.id);
  await fs.writeFile(filePath, JSON.stringify(storedNewsletter, null, 2), 'utf-8');
  
  return storedNewsletter;
}

/**
 * Supprime une newsletter
 */
export async function deleteNewsletter(id: string): Promise<boolean> {
  try {
    const filePath = getNewsletterPath(id);
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Met à jour une newsletter existante
 */
export async function updateNewsletter(id: string, updates: Partial<StoredNewsletter>): Promise<StoredNewsletter | null> {
  const existing = await getNewsletter(id);
  
  if (!existing) {
    return null;
  }
  
  const updated = {
    ...existing,
    ...updates,
  };
  
  const filePath = getNewsletterPath(id);
  await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  
  return updated;
}

/**
 * Supprime toutes les newsletters
 */
export async function clearAllNewsletters(): Promise<void> {
  const ids = await listNewsletterIds();
  
  for (const id of ids) {
    await deleteNewsletter(id);
  }
}

/**
 * Récupère les newsletters par date (pour l'archivage quotidien)
 */
export async function getNewslettersByDate(date: Date): Promise<StoredNewsletter[]> {
  const allNewsletters = await getAllNewsletters();
  
  const targetDate = date.toISOString().split('T')[0];
  
  return allNewsletters.filter((newsletter) => {
    const newsletterDate = new Date(newsletter.date).toISOString().split('T')[0];
    return newsletterDate === targetDate;
  });
}

/**
 * Récupère la newsletter du jour (si elle existe)
 */
export async function getTodaysNewsletter(): Promise<StoredNewsletter | null> {
  const allNewsletters = await getAllNewsletters();
  const today = new Date().toISOString().split('T')[0];
  
  return allNewsletters.find((newsletter) => {
    const newsletterDate = new Date(newsletter.date).toISOString().split('T')[0];
    return newsletterDate === today;
  }) ?? null;
}

/**
 * Compte le nombre total de newsletters
 */
export async function countNewsletters(): Promise<number> {
  return (await listNewsletterIds()).length;
}

export type { StoredNewsletter };
