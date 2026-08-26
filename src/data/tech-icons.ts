/** Logos pour le nuage animé (IconCloud) — frameworks principaux uniquement */
export const techIconUrls = [
  "https://cdn.simpleicons.org/react/61DAFB",
  "https://cdn.simpleicons.org/angular/DD0031",
  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  "https://cdn.simpleicons.org/tailwindcss/06B6D4",
  "https://cdn.simpleicons.org/nestjs/E0234E",
  "https://cdn.simpleicons.org/laravel/FF2D20",
  "https://cdn.simpleicons.org/springboot/6DB33F",
  "https://cdn.simpleicons.org/docker/2496ED",
  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
  "https://cdn.simpleicons.org/git/F05032",
  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
]

/** Liste complète par catégorie pour la grille de compétences */
export interface TechItem {
  name: string
  icon: string
}

export interface TechCategory {
  /** Clé stable utilisée pour la traduction du label (voir messages/*.json → about.techCategories) */
  key: string
  label: string
  items: TechItem[]
}

export const techCategories: TechCategory[] = [
  {
    key: "languages",
    label: "Langages",
    items: [
      { name: "JavaScript", icon: "https://cdn.simpleicons.org/javascript/F7DF1E" },
      { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/3178C6" },
      { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
      { name: "PHP", icon: "https://cdn.simpleicons.org/php/777BB4" },
      { name: "Python", icon: "https://cdn.simpleicons.org/python/3776AB" },
      { name: "Go", icon: "https://cdn.simpleicons.org/go/00ADD8" },
      { name: "C", icon: "https://cdn.simpleicons.org/c/A8B9CC" },
      { name: "C++", icon: "https://cdn.simpleicons.org/cplusplus/00599C" },
    ],
  },
  {
    key: "frontend",
    label: "Frontend",
    items: [
      { name: "HTML", icon: "https://cdn.simpleicons.org/html5/E34F26" },
      { name: "CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
      { name: "React", icon: "https://cdn.simpleicons.org/react/61DAFB" },
      { name: "Angular", icon: "https://cdn.simpleicons.org/angular/DD0031" },
      { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
      { name: "Tailwind", icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4" },
    ],
  },
  {
    key: "backend",
    label: "Backend",
    items: [
      { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs/339933" },
      { name: "Nest.js", icon: "https://cdn.simpleicons.org/nestjs/E0234E" },
      { name: "Laravel", icon: "https://cdn.simpleicons.org/laravel/FF2D20" },
      { name: "Spring Boot", icon: "https://cdn.simpleicons.org/springboot/6DB33F" },
    ],
  },
  {
    key: "databases",
    label: "Bases de données",
    items: [
      { name: "PostgreSQL", icon: "https://cdn.simpleicons.org/postgresql/4169E1" },
      { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
      { name: "Oracle", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg" },
      { name: "SQL Server", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg" },
      { name: "SQLite", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" },
    ],
  },
  {
    key: "devopsTools",
    label: "DevOps & outils",
    items: [
      { name: "Docker", icon: "https://cdn.simpleicons.org/docker/2496ED" },
      { name: "Linux", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
      { name: "AWS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
      { name: "OVH", icon: "https://cdn.simpleicons.org/ovh/123F6D" },
      { name: "Hostinger", icon: "https://cdn.simpleicons.org/hostinger/6742F1" },
      { name: "LWS", icon: "https://lws.info/wp-content/uploads/2025/01/cropped-LWS-fr.png" },
      { name: "Git", icon: "https://cdn.simpleicons.org/git/F05032" },
      { name: "GitHub", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
      { name: "GitLab", icon: "https://cdn.simpleicons.org/gitlab/FC6D26" },
      { name: "Figma", icon: "https://cdn.simpleicons.org/figma/F24E1E" },
    ],
  },
]

export const projectStackIcons = {
  Angular: "https://cdn.simpleicons.org/angular/DD0031",
  Laravel: "https://cdn.simpleicons.org/laravel/FF2D20",
  MySQL: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  OVH: "https://cdn.simpleicons.org/ovh/123F6D",
  LWS: "https://lws.info/wp-content/uploads/2025/01/cropped-LWS-fr.png",
  Git: "https://cdn.simpleicons.org/git/F05032",
  GitHub: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  HTML: "https://cdn.simpleicons.org/html5/E34F26",
  CSS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  JavaScript: "https://cdn.simpleicons.org/javascript/F7DF1E",
  Python: "https://cdn.simpleicons.org/python/3776AB",
  Flask: "https://cdn.simpleicons.org/flask/000000",
  "Next.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  "Nest.js": "https://cdn.simpleicons.org/nestjs/E0234E",
  Django: "https://cdn.simpleicons.org/django/092E20",
  Docker: "https://cdn.simpleicons.org/docker/2496ED",
  Flutter: "https://cdn.simpleicons.org/flutter/02569B",
  "CI/CD": "https://cdn.simpleicons.org/githubactions/2088FF",
} as const
