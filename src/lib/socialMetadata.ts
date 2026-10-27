const PRODUCTION_IMAGE_URL = "https://spacepeople.elelier.com/social-space-people.jpg";

export function getSocialImageUrl(branch?: string, deploymentUrl?: string): string {
  if (branch && branch !== "main" && deploymentUrl) {
    try {
      const base = new URL(deploymentUrl);
      if (base.protocol === "https:") {
        return new URL("/social-space-people.jpg", base).toString();
      }
    } catch {
      // Unknown build environment: preserve the published canonical image URL.
    }
  }
  return PRODUCTION_IMAGE_URL;
}
