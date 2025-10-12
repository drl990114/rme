
// 批量发布 packages 下的包
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function publish() {
  const packagesDir = path.join(__dirname, "..", "packages");
  const packages = fs.readdirSync(packagesDir).filter((name) => {
    const pkgPath = path.join(packagesDir, name, "package.json");
    return fs.existsSync(pkgPath);
  });

  packages.forEach((pkg) => {
    const pkgData = require(path.join(packagesDir, pkg, "package.json"));
    if (!pkgData.name.startsWith('@rme-sdk')) {
      return;
    }
    pkgData.version = "1.1.0";
    fs.writeFileSync(
      path.join(packagesDir, pkg, "package.json"),
      JSON.stringify(pkgData, null, 2)
    );

    const pkgPath = path.join(packagesDir, pkg);
    console.log(`Publishing ${pkgData.name}...`);
    try {
      execSync("pnpm run build", { cwd: pkgPath, stdio: "inherit" });
      execSync("pnpm publish --no-git-checks", { cwd: pkgPath, stdio: "inherit" });
      console.log(`Published ${pkg} successfully.`);
    } catch (error) {
      console.error(`Failed to publish ${pkg}:`, error);
    }
  });
}

publish();
