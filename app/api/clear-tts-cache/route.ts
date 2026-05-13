import { NextResponse } from 'next/server';

const CLEAR_CACHE_TOKEN = process.env.CLEAR_CACHE_TOKEN || 'dev-clear-cache';

export async function POST(req: Request) {
  const { token } = await req.json();
  
  if (token !== CLEAR_CACHE_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('tts-audio');
    
    // Lister toutes les clés
    const { blobs } = await store.list();
    console.log(`[CLEAR_CACHE] Clés à supprimer: ${blobs.length}`);
    
    // Supprimer chaque entrée
    for (const blob of blobs) {
      await store.delete(blob.key);
      console.log(`[CLEAR_CACHE] Supprimé: ${blob.key}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      deleted: blobs.length 
    });
  } catch (error) {
    console.error('[CLEAR_CACHE] Erreur:', error);
    return NextResponse.json({ 
      error: 'Failed to clear cache', 
      details: String(error) 
    }, { status: 500 });
  }
}

// Pour le dev local, on autorise aussi GET sans token
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 405 });
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('tts-audio');
    
    const { blobs } = await store.list();
    console.log(`[CLEAR_CACHE] Clés à supprimer: ${blobs.length}`);
    
    for (const blob of blobs) {
      await store.delete(blob.key);
      console.log(`[CLEAR_CACHE] Supprimé: ${blob.key}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      deleted: blobs.length 
    });
  } catch (error) {
    console.error('[CLEAR_CACHE] Erreur:', error);
    return NextResponse.json({ 
      error: 'Failed to clear cache', 
      details: String(error) 
    }, { status: 500 });
  }
}
