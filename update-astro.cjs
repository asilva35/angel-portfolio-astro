const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run(cmd) {
    console.log(`Running: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
}

// 1. Copy files
run('cp -r /home/eloy/Repositories/angel-portfolio/components/* ./src/components/ 2>/dev/null || true');
run('cp -r /home/eloy/Repositories/angel-portfolio/public/assets ./public/');
run('cp -r /home/eloy/Repositories/angel-portfolio/app/experiments ./src/components/');
run('cp /home/eloy/Repositories/angel-portfolio/app/globals.css ./src/');
run('cp /home/eloy/Repositories/angel-portfolio/app/page.tsx ./src/components/AppPage.tsx');

// 2. Fix tsconfig.json for aliases
const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8'));
if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
tsconfig.compilerOptions.paths = { "@/*": ["./src/*"] };
fs.writeFileSync('./tsconfig.json', JSON.stringify(tsconfig, null, 2));

// 3. Process all .tsx files to handle next/link and next/font/google
function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            if (content.includes('next/font/google')) {
                content = content.replace(/import\s+\{[^}]+\}\s+from\s+['"]next\/font\/google['"];?/g, '');
                content = content.replace(/const\s+\w+\s*=\s*\w+\(\{[^}]+\}\);/g, '');
                // Replace usage like ${montserrat.className} with font-sans
                content = content.replace(/\$\{?[a-zA-Z0-9_]+\.className\}?/g, 'font-sans');
                changed = true;
            }
            if (content.includes('next/link')) {
                content = content.replace(/import\s+Link\s+from\s+['"]next\/link['"];?/g, '');
                content = content.replace(/<Link/g, '<a');
                content = content.replace(/<\/Link>/g, '</a>');
                changed = true;
            }
            if (content.includes('next/image')) {
                content = content.replace(/import\s+Image\s+from\s+['"]next\/image['"];?/g, '');
                content = content.replace(/<Image/g, '<img');
                changed = true;
            }
            if (changed) {
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}
processDir('./src/components');

// 4. Generate Astro pages for experiments
const experimentsDir = './src/components/experiments';
const astroPagesDir = './src/pages/experiments';
fs.mkdirSync(astroPagesDir, { recursive: true });

const exps = fs.readdirSync(experimentsDir);
for (const exp of exps) {
    const stat = fs.statSync(path.join(experimentsDir, exp));
    if (stat.isDirectory()) {
        const pagePath = path.join(experimentsDir, exp, 'page.tsx');
        if (fs.existsSync(pagePath)) {
            const astroContent = `---
import Layout from '../../layouts/Layout.astro';
import Experiment from '../../components/experiments/${exp}/page.tsx';
---
<Layout title="${exp}">
    <Experiment client:only="react" />
</Layout>
`;
            fs.writeFileSync(path.join(astroPagesDir, `${exp}.astro`), astroContent);
        }
    }
}

// Generate index for experiments
const experimentsIndexAstro = `---
import Layout from '../../layouts/Layout.astro';
import ExperimentsList from '../../components/experiments/page.tsx';
---
<Layout title="Experiments">
    <ExperimentsList client:only="react" />
</Layout>
`;
fs.writeFileSync(path.join(astroPagesDir, 'index.astro'), experimentsIndexAstro);

// 5. Build Layout.astro
fs.mkdirSync('./src/layouts', { recursive: true });
const layoutAstro = `---
import '../src/globals.css';
const { title } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
        <title>{title || 'Portfolio'}</title>
    </head>
    <body>
        <slot />
    </body>
</html>
`;
fs.writeFileSync('./src/layouts/Layout.astro', layoutAstro);

// 6. Update index.astro
const indexAstro = `---
import Layout from '../layouts/Layout.astro';
import AppPage from '../components/AppPage.tsx';
---
<Layout title="Home">
    <AppPage client:only="react" />
</Layout>
`;
fs.writeFileSync('./src/pages/index.astro', indexAstro);

console.log("Migration script complete");
