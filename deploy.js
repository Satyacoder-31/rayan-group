import { execSync } from 'child_process';
import { Configuration, HostingCacheApi } from '@hostinger/sdk';
import fs from 'fs';
import path from 'path';

const HOSTINGER_TOKEN = 'g9EFoDsji8oMJ3dJjP7IpLkWfYSzJa0LB27lzVqi67233ccf';
const eraseAllFlag = process.argv.includes('--erase-all') ? '&erase_all=1' : '';
const SYNC_URLS = [
  `https://rayan-group.com/api/sync.php?token=rayan_deploy_2026_secret_key${eraseAllFlag}`,
  `https://rayan-group.com/site/dist/api/sync.php?token=rayan_deploy_2026_secret_key${eraseAllFlag}`
];
const WEBHOOK_URL = 'https://webhooks.hostinger.com/deploy/8b37bfc2d831afd52165c2a8f6fe1551';

async function deploy() {
  console.log('🔄 [0/6] Pulling live database from Hostinger & syncing cache version...');
  try {
    const dataSrc = path.resolve('data/finance-data.json');
    // 1. Pull authoritative live database from Hostinger MySQL so no user data is ever lost
    try {
      const liveRes = await fetch('https://rayan-group.com/api/finance.php');
      if (liveRes.ok) {
        const liveJson = await liveRes.json();
        if (liveJson.data && liveJson.data.invoices && liveJson.data.invoices.length > 0) {
          if (Array.isArray(liveJson.data.purchase_orders)) {
            liveJson.data.purchase_orders.forEach(po => {
              if (po && (!po.type || po.type === 'purchase_order')) {
                po.type = 'customer_po';
                po.po_type = 'customer_lpo';
                po.direction = 'inward';
                if (!po.customer_name && po.vendor_name) po.customer_name = po.vendor_name;
              }
            });
          }
          if (fs.existsSync(dataSrc)) {
            try {
              const localData = JSON.parse(fs.readFileSync(dataSrc, 'utf8'));
              const localVendorPos = (localData.purchase_orders || []).filter(p => p.type === 'vendor_po');
              localVendorPos.forEach(vpo => {
                if (!liveJson.data.purchase_orders.some(p => p.id === vpo.id || p.po_no === vpo.po_no)) {
                  liveJson.data.purchase_orders.push(vpo);
                }
              });
            } catch (e) {}
          }
          fs.writeFileSync(dataSrc, JSON.stringify(liveJson.data, null, 2), 'utf8');
          console.log(`✓ Preserved live database snapshot from production (${liveJson.data.invoices.length} invoices, ${liveJson.data.customer_receipts?.length || 0} receipts)`);
        }
      }
    } catch (pullErr) {
      console.warn('Could not pull live DB from server, using local snapshot:', pullErr.message);
    }

    if (fs.existsSync(dataSrc)) {
      const content = fs.readFileSync(dataSrc, 'utf8');
      const pubPath = path.resolve('public/data/finance-data.json');
      const distPath = path.resolve('dist/data/finance-data.json');
      fs.writeFileSync(pubPath, content, 'utf8');
      const distDir = path.dirname(distPath);
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(distPath, content, 'utf8');
    }

    // Auto-bump cache version
    const finJsPath = path.resolve('src/scripts/finance.js');
    if (fs.existsSync(finJsPath)) {
      let finCode = fs.readFileSync(finJsPath, 'utf8');
      const m = finCode.match(/CURRENT_DB_VERSION\s*=\s*['"]v2026_clean_v(\d+)['"]/);
      if (m) {
        const nextNum = parseInt(m[1], 10) + 1;
        const newVer = `v2026_clean_v${nextNum}`;
        finCode = finCode.replace(m[0], `CURRENT_DB_VERSION = '${newVer}'`);
        fs.writeFileSync(finJsPath, finCode, 'utf8');
        console.log(`Cache version auto-bumped to: ${newVer}`);
      }
    }
  } catch (e) {
    console.warn('Pre-build sync warning:', e.message);
  }

  console.log('\n📦 [1/6] Building production bundle (vite build)...');
  execSync('npm run build', { stdio: 'inherit' });

  // Ensure fresh dist copy after vite build
  try {
    const dataSrc = path.resolve('data/finance-data.json');
    const distPath = path.resolve('dist/data/finance-data.json');
    if (fs.existsSync(dataSrc)) {
      fs.copyFileSync(dataSrc, distPath);
    }
  } catch (e) {}

  console.log('\n📤 [2/6] Staging & pushing changes to GitHub...');
  execSync('git add -A', { stdio: 'inherit' });
  try {
    const status = execSync('git status --porcelain').toString().trim();
    if (status) {
      const msg = process.argv.slice(2).filter(a => !a.startsWith('--')).join(' ') || 'deploy: update website content & financials';
      execSync(`git commit -m "${msg}"`, { stdio: 'inherit' });
    }
  } catch (e) {
    // Nothing new to commit
  }
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('\n🔄 [3/6] Triggering Hostinger deploy webhook...');
  try {
    const payload = {
      ref: 'refs/heads/main',
      repository: {
        name: 'rayan-group',
        clone_url: 'https://github.com/Satyacoder-31/rayan-group.git'
      }
    };
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': 'push',
        'User-Agent': 'GitHub-Hookshot/123456'
      },
      body: JSON.stringify(payload)
    });
    console.log('Hostinger Webhook Status:', res.status);
  } catch (err) {
    console.warn('Webhook warning:', err.message);
  }

  console.log('⏳ Waiting 10 seconds for Hostinger Git pull...');
  await new Promise(r => setTimeout(r, 10000));

  console.log('\n⚙️ [4/6] Synchronizing production files to web root...');
  let synced = false;
  for (const url of SYNC_URLS) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        console.log(`Sync status (${url}):`, json.success ? 'SUCCESS ✅' : 'FAILED ❌');
        if (json.sync_results?.css_bundles) {
          console.log('Active CSS:', json.sync_results.css_bundles.join(', '));
          console.log('Active JS:', json.sync_results.js_bundles.join(', '));
        }
        synced = true;
        break;
      }
    } catch (err) {
      console.warn(`Sync attempt to ${url} failed:`, err.message);
    }
  }
  if (!synced) {
    console.error('All sync endpoints failed.');
  }

  console.log('\n🗄️ [5/6] Verifying database connectivity & integrity...');
  try {
    const healthRes = await fetch('https://rayan-group.com/api/finance.php');
    if (healthRes.ok) {
      const healthJson = await healthRes.json();
      console.log(`Database Health: ONLINE ✅ (storage: ${healthJson.storage}, invoices: ${healthJson.data?.invoices?.length || 0})`);
    } else {
      console.warn(`Database Health Check returned HTTP ${healthRes.status}`);
    }
  } catch (err) {
    console.warn('Database health check warning:', err.message);
  }

  console.log('\n🧹 [6/6] Purging Hostinger CDN cache...');
  try {
    const config = new Configuration({ accessToken: HOSTINGER_TOKEN });
    const cacheApi = new HostingCacheApi(config);
    await cacheApi.clearWebsiteCacheV1('u575992126', 'rayan-group.com');
    await cacheApi.clearWebsiteCacheV1('u575992126', 'rayan-properties.com');
    console.log('Cache Purged: SUCCESS ✅');
  } catch (err) {
    console.warn('Cache purge note:', err.message);
  }

  console.log('\n🎉 ALL DONE! Your website is updated and live at:');
  console.log('👉 https://rayan-group.com');
}

deploy().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
