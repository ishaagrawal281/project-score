const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Seeding database...');

  // Create a default test user if it doesn't exist
  const email = 'testuser@docvault.local';
  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await prisma.user.create({
      data: {
        name: 'Test User',
        email,
        password: hashedPassword
      }
    });
    console.log(`Created default user: ${email}`);
  } else {
    console.log(`Default user ${email} already exists.`);
  }

  // Create default folder structure for this test user
  // Check if "My Documents" already exists for this user
  let rootFolder = await prisma.folder.findFirst({
    where: {
      userId: user.id,
      parentId: null,
      name: 'My Documents'
    }
  });

  if (!rootFolder) {
    rootFolder = await prisma.folder.create({
      data: {
        userId: user.id,
        parentId: null,
        name: 'My Documents'
      }
    });
    console.log('Created root folder "My Documents"');
  }

  const subfolderNames = ['Identity', 'Education', 'Finance', 'Employment', 'Medical', 'Others'];

  for (const name of subfolderNames) {
    const folderExists = await prisma.folder.findFirst({
      where: {
        userId: user.id,
        parentId: rootFolder.id,
        name: name
      }
    });

    if (!folderExists) {
      await prisma.folder.create({
        data: {
          userId: user.id,
          parentId: rootFolder.id,
          name: name
        }
      });
      console.log(`Created subfolder "${name}"`);
    }
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
