# NexCRM Frontend

Customer-facing CRM frontend for NexCRM multi-tenant SaaS platform.

## Features

- **Dynamic Tenant Detection**: Automatically detects tenant from URL param, localStorage, or subdomain
- **Full CRM Features**: Leads, Clients, Projects, Inquiries, Documents
- **Dark Mode**: Built-in theme switching
- **Role-based Access**: Admin, Manager, Sales Operator roles

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Tenant Detection

The frontend automatically detects the tenant from:

1. **URL Parameter**: `?tenant=acme`
2. **localStorage**: `nexcrm_tenant`
3. **Subdomain**: `acme.crm.nexspiresolutions.co.in`

Then API calls route to: `https://acme.crm-api.nexspiresolutions.co.in/api`.

## Environment Variables

Create a `.env` file:

```env
# Optional: Override API URL for development
VITE_API_URL=http://localhost:3001/api
```

## Deployment

### Cloudflare Pages (Recommended)

1. Push to GitHub
2. Connect to Cloudflare Pages
3. Build command: `npm run build`
4. Output directory: `dist`

### Manual

```bash
npm run build
# Upload dist/ folder to your hosting
```

## API Connection

In **development**, connects to `localhost:3001` by default.

In **production**, uses dynamic tenant-based API:
- User visits: `acme.nexcrm.in`
- API calls go to: `https://acme-api.nexcrm.in/api`

## License

MIT - NexSpire Solutions
