import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = (formData.get('image') || formData.get('audio') || formData.get('file')) as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'
    ];
    // Relaxed check to allow various browser audio recordings
    if (!file.type.startsWith('image/') && !file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) { // Increased to 10MB to accommodate audio
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Si Cloudinary n'est pas configuré, sauvegarder localement
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      if (process.env.VERCEL === '1') {
        return NextResponse.json({ error: 'Vous devez configurer Cloudinary pour l\'hébergement Vercel' }, { status: 500 });
      }
      const fs = require('fs');
      const path = require('path');
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const ext = file.name.split('.').pop() || 'bin';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
      
      return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 200 });
    }

    // Sinon, utiliser Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'sama-daraal',
          resource_type: 'auto' 
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: (uploadResponse as any).secure_url }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur lors du téléchargement:', error);
    return NextResponse.json({ error: 'Erreur lors du téléchargement', details: error.message }, { status: 500 });
  }
}
