const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Super Admin
  const hashedAdminPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zomatech.com' },
    update: {},
    create: {
      email: 'admin@zomatech.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      password: hashedAdminPassword,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // 2. Create Categories
  const categoriesData = [
    { name: 'Laptops', slug: 'laptops', description: 'Gaming, business, and student laptops.' },
    { name: 'Monitors', slug: 'monitors', description: '4K, curved, and professional monitors.' },
    { name: 'PCs', slug: 'pcs', description: 'Gaming PCs, Office PCs, and Workstations.' },
    { name: 'POS Systems', slug: 'pos-systems', description: 'Complete cashier systems and machines.' },
    { name: 'Active Panels', slug: 'active-panels', description: 'Interactive smart displays for education and business.' },
    { name: 'Projectors', slug: 'projectors', description: 'Business and home projectors.' },
    { name: 'Accessories', slug: 'accessories', description: 'Keyboards, mice, headsets, and more.' }
  ];

  const categories = {};
  for (const c of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories[c.slug] = created;
  }
  console.log('Created categories.');

  // 3. Create Brands
  const brandsData = [
    { name: 'HP', slug: 'hp' },
    { name: 'Dell', slug: 'dell' },
    { name: 'Lenovo', slug: 'lenovo' },
    { name: 'Asus', slug: 'asus' },
    { name: 'Samsung', slug: 'samsung' },
    { name: 'LG', slug: 'lg' }
  ];

  const brands = {};
  for (const b of brandsData) {
    const created = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brands[b.slug] = created;
  }
  console.log('Created brands.');

  // 4. Create Products
  const productsData = [
    {
      name: 'HP EliteBook 840 G10',
      slug: 'hp-elitebook-840-g10',
      description: 'Professional business laptop with powerful performance and sleek design. Perfect for corporate use.',
      price: 45000,
      oldPrice: 48000,
      discount: 3000,
      sku: 'HP-EB-840-G10',
      isFeatured: true,
      isBestseller: true,
      categoryId: categories['laptops'].id,
      brandId: brands['hp'].id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPrimary: true, alt: 'HP EliteBook 840' }
        ]
      },
      specs: {
        create: [
          { name: 'CPU', value: 'Intel Core i7-1355U' },
          { name: 'RAM', value: '16GB DDR5' },
          { name: 'Storage', value: '512GB NVMe SSD' },
          { name: 'Display', value: '14" WUXGA (1920x1200)' }
        ]
      },
      inventory: {
        create: { stock: 15, lowStockAlert: 3 }
      }
    },
    {
      name: 'Dell UltraSharp 27 4K USB-C Hub Monitor - U2723QE',
      slug: 'dell-ultrasharp-27-4k-u2723qe',
      description: 'Be your most productive on a 27-inch 4K monitor with brilliant color and contrast that features IPS Black technology and a hub for connectivity.',
      price: 22000,
      oldPrice: null,
      sku: 'DELL-U2723QE',
      isFeatured: true,
      categoryId: categories['monitors'].id,
      brandId: brands['dell'].id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPrimary: true, alt: 'Dell UltraSharp 27 4K' }
        ]
      },
      specs: {
        create: [
          { name: 'Resolution', value: '4K UHD (3840 x 2160)' },
          { name: 'Panel Type', value: 'IPS Black' },
          { name: 'Refresh Rate', value: '60Hz' },
          { name: 'Ports', value: 'USB-C, HDMI, DisplayPort, RJ45' }
        ]
      },
      inventory: {
        create: { stock: 8, lowStockAlert: 2 }
      }
    },
    {
      name: 'Lenovo ThinkCentre M70q Gen 3 Tiny',
      slug: 'lenovo-thinkcentre-m70q-gen3',
      description: 'Enterprise-level performance, enterprise-level security. This 1L enterprise PC punches above its weight.',
      price: 18500,
      oldPrice: 19500,
      sku: 'LEN-M70Q-G3',
      isBestseller: true,
      categoryId: categories['pcs'].id,
      brandId: brands['lenovo'].id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPrimary: true, alt: 'Lenovo ThinkCentre M70q' }
        ]
      },
      specs: {
        create: [
          { name: 'CPU', value: 'Intel Core i5-12400T' },
          { name: 'RAM', value: '8GB DDR4' },
          { name: 'Storage', value: '256GB SSD' },
          { name: 'OS', value: 'Windows 11 Pro' }
        ]
      },
      inventory: {
        create: { stock: 25, lowStockAlert: 5 }
      }
    },
    {
      name: 'Zoma Complete POS System Pro',
      slug: 'zoma-complete-pos-system-pro',
      description: 'All-in-one cashier system including touchscreen terminal, receipt printer, cash drawer, and barcode scanner.',
      price: 15000,
      oldPrice: 16500,
      sku: 'ZOMA-POS-PRO',
      isFeatured: true,
      categoryId: categories['pos-systems'].id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPrimary: true, alt: 'POS System' }
        ]
      },
      specs: {
        create: [
          { name: 'Terminal', value: '15" Touchscreen J1900 4GB 64GB' },
          { name: 'Printer', value: '80mm Thermal Receipt Printer' },
          { name: 'Scanner', value: '2D USB Barcode Scanner' },
          { name: 'Drawer', value: 'Heavy Duty Metal Cash Drawer' }
        ]
      },
      inventory: {
        create: { stock: 10, lowStockAlert: 2 }
      }
    }
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log('Created products.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
