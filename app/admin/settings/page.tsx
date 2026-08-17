export default function AdminSettingsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Store Settings</h1>
      </div>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>General Settings</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          This page is currently under construction. Future updates will allow you to control store-wide settings such as:
        </p>
        
        <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--foreground)' }}>
          <li><strong>Store Name & Contact Info:</strong> Update the email, phone numbers, and physical address shown in the footer.</li>
          <li><strong>Shipping Fees:</strong> Configure dynamic shipping rates based on governorates.</li>
          <li><strong>Payment Methods:</strong> Toggle cash on delivery, InstaPay, or Vodafone cash options.</li>
          <li><strong>Social Links:</strong> Update links to your Facebook, Instagram, and Twitter profiles.</li>
        </ul>

        <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border)', textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Settings Module Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
