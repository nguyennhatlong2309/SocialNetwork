const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/admin/AdminSettingsPage.css',
  'src/pages/admin/AdminDashboardPage.css',
  'src/pages/admin/AdminModerationPage.css',
  'src/pages/admin/AdminUserManagementPage.css',
  'src/components/layout/AdminLayout.css',
  'src/pages/user/SettingsPage.css',
];

filesToUpdate.forEach(filePath => {
  const absolutePath = path.resolve(__dirname, filePath);
  if (fs.existsSync(absolutePath)) {
    let content = fs.readFileSync(absolutePath, 'utf8');
    const newContent = content.replace(/font-size:\s*(\d+(\.\d+)?)px/g, 'font-size: calc($1px * var(--font-scale, 1))');
    
    if (content !== newContent) {
      fs.writeFileSync(absolutePath, newContent, 'utf8');
      console.log(`Updated ${filePath}`);
    } else {
      console.log(`No changes needed in ${filePath}`);
    }
  } else {
    console.error(`File not found: ${absolutePath}`);
  }
});
