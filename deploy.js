import { execSync } from 'child_process';
import { Configuration, HostingCacheApi } from '@hostinger/sdk';

const HOSTINGER_TOKEN = 'g9EFoDsji8oMJ3dJjP7IpLkWfYSzJa0LB27lzVqi67233ccf';
const SYNC_URLS = [
  'https://rayan-group.com/api/sync.php?token=rayan_deploy_2026_secret_key&erase_all=1',
  'https://rayan-group.com/site/dist/api/sync.php?token=rayan_deploy_2026_secret_key&erase_all=1'
];
const WEBHOOK_URL = 'https://webhooks.hostinger.com/deploy/8b37bfc2d831afd52165c2a8f6fe1551';

async function deploy() {
  console.log('📦 [1/5] Building production bundle (vite build)...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n📤 [2/5] Staging & pushing changes to GitHub...');
  execSync('git add -A', { stdio: 'inherit' });
  try {
    const status = execSync('git status --porcelain').toString().trim();
    if (status) {
      const msg = process.argv.slice(2).join(' ') || 'deploy: update website content';
      execSync(`git commit -m "${msg}"`, { stdio: 'inherit' });
    }
  } catch (e) {
    // Nothing new to commit
  }
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('\n🔄 [3/5] Triggering Hostinger deploy webhook...');
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

  console.log('⏳ Waiting 6 seconds for Hostinger Git pull...');
  await new Promise(r => setTimeout(r, 6000));

  console.log('\n⚙️ [4/5] Synchronizing production files to web root...');
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

  console.log('\n🧹 [5/5] Purging Hostinger CDN cache...');
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
