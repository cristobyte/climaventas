import { PrismaClient } from '@prisma/client';
import { Role, CustomerStage, CustomerSource, ProductCategory, SaleStatus, InteractionType, ReferralStatus, CommissionRuleType } from '../src/common/constants';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.referral.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.commissionRule.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.partnership.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('📦 Creating users...');

  const passwordHash = await bcrypt.hash('Demo2024!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@climatecnologia.cl',
      passwordHash,
      name: 'Administrador',
      phone: '+56912345678',
      role: Role.MANAGEMENT,
      commissionRate: 0,
      isActive: true,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analista@climatecnologia.cl',
      passwordHash,
      name: 'María Analista',
      phone: '+56987654321',
      role: Role.ANALYTICS,
      commissionRate: 0,
      isActive: true,
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      email: 'vendedor@climatecnologia.cl',
      passwordHash,
      name: 'Carlos Vendedor',
      phone: '+56911223344',
      role: Role.AGENT,
      commissionRate: 0.08,
      isActive: true,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: 'vendedor2@climatecnologia.cl',
      passwordHash,
      name: 'Ana Comercial',
      phone: '+56955667788',
      role: Role.AGENT,
      commissionRate: 0.07,
      isActive: true,
    },
  });

  console.log('📦 Creating products...');

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Split 9000 BTU Inverter',
        description: 'Aire acondicionado split inverter de 9000 BTU, ideal para espacios de hasta 15m²',
        brand: 'Samsung',
        model: 'AR09TXHQASINPE',
        price: 349990,
        commissionPercentage: 0.08,
        category: ProductCategory.SPLIT,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Split 12000 BTU Inverter',
        description: 'Aire acondicionado split inverter de 12000 BTU, ideal para espacios de hasta 20m²',
        brand: 'Samsung',
        model: 'AR12TXHQASINPE',
        price: 449990,
        commissionPercentage: 0.08,
        category: ProductCategory.SPLIT,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Split 18000 BTU Inverter',
        description: 'Aire acondicionado split inverter de 18000 BTU, ideal para espacios de hasta 30m²',
        brand: 'LG',
        model: 'S4-Q18KL3QA',
        price: 599990,
        commissionPercentage: 0.10,
        category: ProductCategory.SPLIT,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Split 24000 BTU Inverter',
        description: 'Aire acondicionado split inverter de 24000 BTU, ideal para espacios de hasta 40m²',
        brand: 'LG',
        model: 'S4-Q24K23QE',
        price: 749990,
        commissionPercentage: 0.10,
        category: ProductCategory.SPLIT,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Instalación Básica',
        description: 'Instalación estándar incluye hasta 3 metros de cañería y soporte',
        price: 89990,
        commissionPercentage: 0.05,
        category: ProductCategory.INSTALLATION,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Instalación Completa',
        description: 'Instalación premium incluye hasta 5 metros de cañería, canalización y soporte reforzado',
        price: 149990,
        commissionPercentage: 0.06,
        category: ProductCategory.INSTALLATION,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mantención Preventiva',
        description: 'Servicio de mantención preventiva completo: limpieza de filtros, revisión de gas y funcionamiento',
        price: 49990,
        commissionPercentage: 0.15,
        category: ProductCategory.MAINTENANCE,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Kit de Accesorios',
        description: 'Kit completo de accesorios: control remoto adicional, filtro HEPA y cubierta protectora',
        price: 29990,
        commissionPercentage: 0.12,
        category: ProductCategory.ACCESSORY,
        isActive: true,
      },
    }),
  ]);

  console.log('📦 Creating customers...');

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        phone: '+56912345001',
        address: 'Av. Providencia 1234, Depto 501',
        city: 'Santiago',
        region: 'Metropolitana',
        stage: CustomerStage.FIDELITY,
        source: CustomerSource.WEBSITE,
        assignedAgentId: agent1.id,
        notes: 'Cliente frecuente, prefiere contacto por WhatsApp',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        phone: '+56912345002',
        address: 'Los Leones 456',
        city: 'Santiago',
        region: 'Metropolitana',
        stage: CustomerStage.POST_PURCHASE,
        source: CustomerSource.REFERRAL,
        assignedAgentId: agent1.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Pedro Soto',
        email: 'pedro.soto@email.com',
        phone: '+56912345003',
        address: 'Av. Apoquindo 5678',
        city: 'Las Condes',
        region: 'Metropolitana',
        stage: CustomerStage.SALES,
        source: CustomerSource.DIRECT,
        assignedAgentId: agent2.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Ana Muñoz',
        email: 'ana.munoz@email.com',
        phone: '+56912345004',
        address: 'Av. Kennedy 9012',
        city: 'Vitacura',
        region: 'Metropolitana',
        stage: CustomerStage.PRE_SALES,
        source: CustomerSource.PARTNERSHIP,
        assignedAgentId: agent1.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Roberto Díaz',
        email: 'roberto.diaz@email.com',
        phone: '+56912345005',
        address: 'Av. Italia 3456',
        city: 'Ñuñoa',
        region: 'Metropolitana',
        stage: CustomerStage.PROSPECTING,
        source: CustomerSource.WEBSITE,
        assignedAgentId: agent2.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Carmen Silva',
        email: 'carmen.silva@email.com',
        phone: '+56912345006',
        address: 'Manuel Montt 789',
        city: 'Providencia',
        region: 'Metropolitana',
        stage: CustomerStage.SERVICE,
        source: CustomerSource.REFERRAL,
        assignedAgentId: agent1.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Francisco Torres',
        email: 'francisco.torres@email.com',
        phone: '+56912345007',
        address: 'Av. Vicuña Mackenna 1234',
        city: 'La Florida',
        region: 'Metropolitana',
        stage: CustomerStage.FIDELITY,
        source: CustomerSource.DIRECT,
        assignedAgentId: agent2.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Patricia Rojas',
        email: 'patricia.rojas@email.com',
        phone: '+56912345008',
        address: 'Av. Tobalaba 5678',
        city: 'La Reina',
        region: 'Metropolitana',
        stage: CustomerStage.POST_PURCHASE,
        source: CustomerSource.WEBSITE,
        assignedAgentId: agent1.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Miguel Hernández',
        email: 'miguel.hernandez@email.com',
        phone: '+56912345009',
        address: 'Av. Grecia 9012',
        city: 'Peñalolén',
        region: 'Metropolitana',
        stage: CustomerStage.SALES,
        source: CustomerSource.PARTNERSHIP,
        assignedAgentId: agent2.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Sofía Vargas',
        email: 'sofia.vargas@email.com',
        phone: '+56912345010',
        address: 'Av. Irarrázaval 3456',
        city: 'Ñuñoa',
        region: 'Metropolitana',
        stage: CustomerStage.PRE_SALES,
        source: CustomerSource.OTHER,
        assignedAgentId: agent1.id,
      },
    }),
  ]);

  console.log('📦 Creating partnerships...');

  const partnerships = await Promise.all([
    prisma.partnership.create({
      data: {
        name: 'Constructora ABC',
        contactName: 'Jorge Martínez',
        email: 'jorge@constructoraabc.cl',
        phone: '+56922334455',
        partnershipType: 'Constructora',
        commissionRate: 0.03,
        isActive: true,
      },
    }),
    prisma.partnership.create({
      data: {
        name: 'Inmobiliaria Los Andes',
        contactName: 'Laura Fernández',
        email: 'laura@inmoblosandes.cl',
        phone: '+56933445566',
        partnershipType: 'Inmobiliaria',
        commissionRate: 0.025,
        isActive: true,
      },
    }),
    prisma.partnership.create({
      data: {
        name: 'Arquitectos Asociados',
        contactName: 'Pablo Ruiz',
        email: 'pablo@arquiasociados.cl',
        phone: '+56944556677',
        partnershipType: 'Arquitectura',
        commissionRate: 0.02,
        isActive: true,
      },
    }),
  ]);

  console.log('📦 Creating sales...');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const sales = await Promise.all([
    // Completed sales
    prisma.sale.create({
      data: {
        customerId: customers[0].id,
        agentId: agent1.id,
        productId: products[1].id, // Split 12000 BTU
        quantity: 1,
        unitPrice: 449990,
        totalAmount: 449990,
        commissionAmount: 449990 * 0.08,
        status: SaleStatus.COMPLETED,
        paymentMethod: 'TRANSFERENCIA',
        notes: 'Cliente muy satisfecho',
        saleDate: sixtyDaysAgo,
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[0].id,
        agentId: agent1.id,
        productId: products[4].id, // Instalación Básica
        quantity: 1,
        unitPrice: 89990,
        totalAmount: 89990,
        commissionAmount: 89990 * 0.05,
        status: SaleStatus.COMPLETED,
        paymentMethod: 'TRANSFERENCIA',
        saleDate: sixtyDaysAgo,
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[1].id,
        agentId: agent1.id,
        productId: products[2].id, // Split 18000 BTU
        quantity: 1,
        unitPrice: 599990,
        totalAmount: 599990,
        commissionAmount: 599990 * 0.10,
        status: SaleStatus.COMPLETED,
        paymentMethod: 'TARJETA',
        saleDate: thirtyDaysAgo,
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[1].id,
        agentId: agent1.id,
        productId: products[5].id, // Instalación Completa
        quantity: 1,
        unitPrice: 149990,
        totalAmount: 149990,
        commissionAmount: 149990 * 0.06,
        status: SaleStatus.COMPLETED,
        paymentMethod: 'TARJETA',
        saleDate: thirtyDaysAgo,
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[6].id,
        agentId: agent2.id,
        productId: products[3].id, // Split 24000 BTU
        quantity: 2,
        unitPrice: 749990,
        totalAmount: 749990 * 2,
        commissionAmount: 749990 * 2 * 0.10,
        status: SaleStatus.COMPLETED,
        paymentMethod: 'CRÉDITO',
        notes: 'Compra para oficina',
        saleDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[7].id,
        agentId: agent1.id,
        productId: products[0].id, // Split 9000 BTU
        quantity: 1,
        unitPrice: 349990,
        totalAmount: 349990,
        commissionAmount: 349990 * 0.08,
        status: SaleStatus.COMPLETED,
        paymentMethod: 'EFECTIVO',
        saleDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    }),
    // Approved sales
    prisma.sale.create({
      data: {
        customerId: customers[2].id,
        agentId: agent2.id,
        productId: products[1].id,
        quantity: 1,
        unitPrice: 449990,
        totalAmount: 449990,
        commissionAmount: 449990 * 0.08,
        status: SaleStatus.APPROVED,
        paymentMethod: 'TRANSFERENCIA',
        saleDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[8].id,
        agentId: agent2.id,
        productId: products[2].id,
        quantity: 1,
        unitPrice: 599990,
        totalAmount: 599990,
        commissionAmount: 599990 * 0.10,
        status: SaleStatus.APPROVED,
        paymentMethod: 'TARJETA',
        saleDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    // Pending sales
    prisma.sale.create({
      data: {
        customerId: customers[3].id,
        agentId: agent1.id,
        productId: products[3].id,
        quantity: 1,
        unitPrice: 749990,
        totalAmount: 749990,
        commissionAmount: 749990 * 0.10,
        status: SaleStatus.PENDING,
        paymentMethod: 'CRÉDITO',
        notes: 'Pendiente aprobación de crédito',
        saleDate: new Date(),
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[9].id,
        agentId: agent1.id,
        productId: products[1].id,
        quantity: 2,
        unitPrice: 449990,
        totalAmount: 449990 * 2,
        commissionAmount: 449990 * 2 * 0.08,
        status: SaleStatus.PENDING,
        paymentMethod: 'TRANSFERENCIA',
        saleDate: new Date(),
      },
    }),
    // Maintenance sales
    prisma.sale.create({
      data: {
        customerId: customers[5].id,
        agentId: agent1.id,
        productId: products[6].id, // Mantención
        quantity: 1,
        unitPrice: 49990,
        totalAmount: 49990,
        commissionAmount: 49990 * 0.15,
        status: SaleStatus.COMPLETED,
        paymentMethod: 'EFECTIVO',
        saleDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[0].id,
        agentId: agent1.id,
        productId: products[6].id,
        quantity: 1,
        unitPrice: 49990,
        totalAmount: 49990,
        commissionAmount: 49990 * 0.15,
        status: SaleStatus.COMPLETED,
        paymentMethod: 'TRANSFERENCIA',
        saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    // Accessories
    prisma.sale.create({
      data: {
        customerId: customers[1].id,
        agentId: agent1.id,
        productId: products[7].id, // Kit Accesorios
        quantity: 1,
        unitPrice: 29990,
        totalAmount: 29990,
        commissionAmount: 29990 * 0.12,
        status: SaleStatus.COMPLETED,
        paymentMethod: 'EFECTIVO',
        saleDate: thirtyDaysAgo,
      },
    }),
    // Cancelled sale
    prisma.sale.create({
      data: {
        customerId: customers[4].id,
        agentId: agent2.id,
        productId: products[0].id,
        quantity: 1,
        unitPrice: 349990,
        totalAmount: 349990,
        commissionAmount: 349990 * 0.08,
        status: SaleStatus.CANCELLED,
        notes: 'Cliente cambió de opinión',
        saleDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log('📦 Creating interactions...');

  await Promise.all([
    prisma.interaction.create({
      data: {
        customerId: customers[0].id,
        userId: agent1.id,
        type: InteractionType.CALL,
        subject: 'Llamada de seguimiento post-venta',
        description: 'Cliente confirma que el equipo funciona perfectamente. Interesado en mantención anual.',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.interaction.create({
      data: {
        customerId: customers[1].id,
        userId: agent1.id,
        type: InteractionType.WHATSAPP,
        subject: 'Consulta sobre instalación',
        description: 'Cliente pregunta sobre fecha de instalación. Se confirma para el próximo lunes.',
        completedAt: thirtyDaysAgo,
      },
    }),
    prisma.interaction.create({
      data: {
        customerId: customers[2].id,
        userId: agent2.id,
        type: InteractionType.VISIT,
        subject: 'Visita técnica para evaluación',
        description: 'Se evaluó el espacio. Se recomienda equipo de 18000 BTU.',
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.interaction.create({
      data: {
        customerId: customers[3].id,
        userId: agent1.id,
        type: InteractionType.EMAIL,
        subject: 'Envío de cotización',
        description: 'Se envió cotización formal con opciones de financiamiento.',
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.interaction.create({
      data: {
        customerId: customers[4].id,
        userId: agent2.id,
        type: InteractionType.CALL,
        subject: 'Primer contacto',
        description: 'Cliente interesado en conocer opciones de aire acondicionado para su departamento.',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.interaction.create({
      data: {
        customerId: customers[5].id,
        userId: agent1.id,
        type: InteractionType.NOTE,
        subject: 'Recordatorio mantención',
        description: 'Contactar en 6 meses para próxima mantención preventiva.',
        scheduledAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.interaction.create({
      data: {
        customerId: customers[9].id,
        userId: agent1.id,
        type: InteractionType.WHATSAPP,
        subject: 'Seguimiento cotización',
        description: 'Cliente solicita más información sobre garantía extendida.',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log('📦 Creating referrals...');

  await Promise.all([
    prisma.referral.create({
      data: {
        referrerCustomerId: customers[0].id,
        referredCustomerId: customers[1].id,
        status: ReferralStatus.CONVERTED,
        bonusAmount: 30000,
      },
    }),
    prisma.referral.create({
      data: {
        partnershipId: partnerships[0].id,
        referredCustomerId: customers[3].id,
        status: ReferralStatus.PENDING,
        bonusAmount: 25000,
      },
    }),
    prisma.referral.create({
      data: {
        partnershipId: partnerships[1].id,
        referredCustomerId: customers[8].id,
        status: ReferralStatus.CONVERTED,
        bonusAmount: 20000,
      },
    }),
    prisma.referral.create({
      data: {
        referrerCustomerId: customers[6].id,
        referredCustomerId: customers[4].id,
        status: ReferralStatus.PENDING,
        bonusAmount: 30000,
      },
    }),
  ]);

  console.log('📦 Creating commission rules...');

  await Promise.all([
    // Product-specific commission
    prisma.commissionRule.create({
      data: {
        name: 'Comisión Premium Split 24000',
        description: 'Comisión especial para el modelo premium',
        ruleType: CommissionRuleType.PRODUCT,
        productId: products[3].id,
        commissionPercentage: 0.12,
        priority: 10,
        isActive: true,
      },
    }),
    // Volume bonus
    prisma.commissionRule.create({
      data: {
        name: 'Bono por volumen alto',
        description: 'Bono adicional para ventas mayores a $1.000.000',
        ruleType: CommissionRuleType.VOLUME,
        minSaleAmount: 1000000,
        fixedBonusAmount: 50000,
        priority: 5,
        isActive: true,
      },
    }),
    // Monthly target bonus
    prisma.commissionRule.create({
      data: {
        name: 'Bono meta mensual',
        description: 'Bono por alcanzar meta de 5 ventas en el mes',
        ruleType: CommissionRuleType.BONUS,
        minVolume: 5,
        fixedBonusAmount: 100000,
        conditionJson: JSON.stringify({ period: 'monthly', minSales: 5 }),
        priority: 20,
        isActive: true,
      },
    }),
    // Maintenance commission boost
    prisma.commissionRule.create({
      data: {
        name: 'Incentivo mantenciones',
        description: 'Comisión aumentada para servicios de mantención',
        ruleType: CommissionRuleType.PRODUCT,
        productId: products[6].id,
        commissionPercentage: 0.20,
        priority: 15,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📋 Demo Users:');
  console.log('   - admin@climatecnologia.cl (MANAGEMENT)');
  console.log('   - analista@climatecnologia.cl (ANALYTICS)');
  console.log('   - vendedor@climatecnologia.cl (AGENT)');
  console.log('   - vendedor2@climatecnologia.cl (AGENT)');
  console.log('   Password for all: Demo2024!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
