import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Système sécurisé de stockage des emails
 * Chiffrement AES-256 pour la protection des données
 */

// Chemin vers le fichier de stockage (dans un dossier non accessible publiquement)
const STORAGE_DIR = path.join(process.cwd(), 'private_data');
const EMAILS_FILE = path.join(STORAGE_DIR, 'subscribers_encrypted.dat');
const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'default-encryption-key-change-me';

// Initialiser le dossier de stockage
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    await fs.chmod(STORAGE_DIR, 0o700); // Permissions restrictives
  } catch (error) {
    console.error('Erreur lors de la création du dossier de stockage:', error);
  }
}

// Chiffrement AES-256
function encrypt(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', 
    crypto.createHash('sha256').update(ENCRYPTION_KEY).digest(), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Déchiffrement AES-256
function decrypt(encryptedData: string): string {
  try {
    const [ivHex, encryptedText] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc',
      crypto.createHash('sha256').update(ENCRYPTION_KEY).digest(), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Erreur de déchiffrement:', error);
    return '';
  }
}

// Validation d'email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Sauvegarder un email
export async function saveEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validation
    if (!isValidEmail(email)) {
      return { success: false, error: 'Email invalide' };
    }

    // Normalisation
    const normalizedEmail = email.trim().toLowerCase();

    // Vérifier si l'email existe déjà
    const existingEmails = await getAllEmails();
    if (existingEmails.includes(normalizedEmail)) {
      return { success: false, error: 'Email déjà inscrit' };
    }

    // Chiffrement
    const encryptedEmail = encrypt(normalizedEmail);
    const timestamp = new Date().toISOString();
    const entry = `${encryptedEmail}|${timestamp}\n`;

    // Écriture sécurisée
    await ensureStorageDir();
    await fs.appendFile(EMAILS_FILE, entry, { mode: 0o600 });

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'email:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

// Récupérer tous les emails (déchiffrés)
export async function getAllEmails(): Promise<string[]> {
  try {
    await ensureStorageDir();
    if (!(await fs.stat(EMAILS_FILE)).size) {
      return [];
    }

    const fileContent = await fs.readFile(EMAILS_FILE, 'utf8');
    const lines = fileContent.trim().split('\n');

    return lines.map(line => {
      const [encryptedEmail] = line.split('|');
      return decrypt(encryptedEmail);
    }).filter(email => email !== '');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Erreur lors de la lecture des emails:', error);
    return [];
  }
}

// Compter le nombre d'abonnés
export async function getSubscriberCount(): Promise<number> {
  try {
    const emails = await getAllEmails();
    return emails.length;
  } catch {
    return 0;
  }
}

// Initialisation
ensureStorageDir();