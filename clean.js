
const { execSync } = require("child_process");
function clean() {
  console.log("Clean up");

  // clean node_modules
  execSync("rm -rf node_modules", { stdio: "inherit" });
  execSync("rm -rf packages/*/node_modules", { stdio: "inherit" });
  execSync("rm -rf rme/node_modules", { stdio: "inherit" });

  // clean dist
  execSync("rm -rf packages/*/dist", { stdio: "inherit" });
  execSync("rm -rf packages/*/dist-types", { stdio: "inherit" });
  execSync("rm -rf rme/dist", { stdio: "inherit" });

  console.log("Clean done")
}

clean()
