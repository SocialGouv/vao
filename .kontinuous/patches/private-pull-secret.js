module.exports = (manifests)=>{
  manifests.forEach(manifest => {
    // Identify resources that can have containers
    if (['Deployment', 'StatefulSet', 'DaemonSet'].includes(manifest.kind)) {
      // Iterate through each container in the spec
      manifest.spec.template.spec.containers.forEach(container => {
        // Check if the container image starts with "harbor.fabrique"
        if (container.image.startsWith("harbor.fabrique.social.gouv.fr")) {
          // Ensure imagePullSecrets array exists
          if (!manifest.spec.template.spec.imagePullSecrets) {
            manifest.spec.template.spec.imagePullSecrets = [];
          }

          // Check if the secret is already added to avoid duplicates
          const secretExists = manifest.spec.template.spec.imagePullSecrets.some(secret => secret.name === "harbor-pull-secret");
          if (!secretExists) {
            // Add the harbor-pull-secret
            manifest.spec.template.spec.imagePullSecrets.push({name: "harbor-pull-secret"});
          }
        }
      });
    }
  });
}
