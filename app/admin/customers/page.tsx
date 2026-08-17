import { prisma } from "@/lib/prisma";




export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { orders: true }
      }
    }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Customers</h1>
      </div>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Phone</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Orders Count</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Joined At</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, idx) => (
                <tr key={customer.id} style={{ borderTop: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'white' : '#fcfcfc' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 'bold' }}>{customer.name || 'N/A'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{customer.email}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{customer.phone || 'N/A'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {customer._count.orders}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{new Date(customer.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No registered customers found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
