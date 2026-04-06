import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create clinic
  const clinic = await prisma.clinic.upsert({
    where: { cnpj: '12.345.678/0001-99' },
    update: {},
    create: {
      name: 'Clínica VetFlow Demo',
      cnpj: '12.345.678/0001-99',
      phone: '(11) 99999-0000',
      email: 'contato@vetflow.com',
      address: 'Rua das Flores, 123 - São Paulo/SP',
    },
  });

  console.log(`Clinic created: ${clinic.name} (${clinic.id})`);

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email_clinicId: { email: 'admin@vetflow.com', clinicId: clinic.id } },
    update: {},
    create: {
      clinicId: clinic.id,
      name: 'Administrador',
      email: 'admin@vetflow.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin user created: ${admin.email}`);

  // Create vet user
  const vet = await prisma.user.upsert({
    where: { email_clinicId: { email: 'vet@vetflow.com', clinicId: clinic.id } },
    update: {},
    create: {
      clinicId: clinic.id,
      name: 'Dr. Carlos Silva',
      email: 'vet@vetflow.com',
      password: await bcrypt.hash('vet123', 10),
      role: UserRole.VET,
    },
  });

  console.log(`Vet user created: ${vet.email}`);

  // Create owner
  const owner = await prisma.owner.create({
    data: {
      clinicId: clinic.id,
      name: 'Maria Oliveira',
      email: 'maria@email.com',
      phone: '(11) 98888-1234',
      cpf: '123.456.789-00',
    },
  });

  console.log(`Owner created: ${owner.name}`);

  // Create pet
  const pet = await prisma.pet.create({
    data: {
      clinicId: clinic.id,
      ownerId: owner.id,
      name: 'Bolinha',
      species: 'Cão',
      breed: 'Labrador',
      birthDate: new Date('2020-03-15'),
      weight: 25.5,
    },
  });

  console.log(`Pet created: ${pet.name}`);

  // Create appointment
  await prisma.appointment.create({
    data: {
      clinicId: clinic.id,
      petId: pet.id,
      vetId: vet.id,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      reason: 'Consulta de rotina',
    },
  });

  console.log('Appointment created');

  // Create transaction
  await prisma.transaction.create({
    data: {
      clinicId: clinic.id,
      type: 'INCOME',
      amount: 150.0,
      description: 'Consulta veterinária - Bolinha',
      category: 'Consultas',
    },
  });

  console.log('Transaction created');
  console.log('\nSeed completed!');
  console.log('\nCredentials:');
  console.log('  Admin: admin@vetflow.com / admin123');
  console.log('  Vet:   vet@vetflow.com / vet123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
