import type { MetadataRoute } from "next";
import { config } from "@/data/config";
import projects from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/projects", "/about", "/contact", ...projects.map((p) => `/projects/${p.id}`)];
  return routes.map((path) => ({ url: `${config.site}${path}`, lastModified: new Date() }));
}
