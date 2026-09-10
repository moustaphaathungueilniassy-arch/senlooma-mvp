import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SENLOOMA database...');

  // Catégories d'animaux
  const categories = [
    { name: 'Bovins', slug: 'bovins', icon: '🐂', description: 'Vaches, taureaux, veaux, génisses' },
    { name: 'Ovins', slug: 'ovins', icon: '🐑', description: 'Moutons, béliers, brebis, agneaux' },
    { name: 'Caprins', slug: 'caprins', icon: '🐐', description: 'Chèvres, boucs, chevreaux' },
    { name: 'Volailles', slug: 'volailles', icon: '🐔', description: 'Poulets, dindes, canards, pintades' },
    { name: 'Équins', slug: 'equins', icon: '🐴', description: 'Chevaux, ânes, poneys' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  console.log(`✅ ${categories.length} catégories créées`);
  console.log('🌱 Seeding terminé !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
