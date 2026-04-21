export type SkillCategory = 'frontend' | 'backend' | 'database' | 'infra' | 'digital-marketing'

export interface SkillGroup {
  categoryID: SkillCategory
  skills: string[]
}

export const skills: SkillGroup[] = [
  {
    categoryID: 'frontend',
    skills: [
      'HTML5', 'CSS3', 'JavaScript', 'TypeScript',
      'React', 'Next.js', 'Vue.js', 'Vite',
      'Tailwind CSS', 'Sass/SCSS', 'Styled Components', 'Bootstrap',
      'shadcn/ui', 'Zustand', 'Redux', 'Three.js',
    ]
  },
  {
    categoryID: 'backend',
    skills: [
      'Python', 'FastAPI', 'Flask', 'Django',
      'REST APIs', 'Swagger', 'JWT'
    ]
  },
  {
    categoryID: 'database',
    skills: [
      'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB',
      'DynamoDB', 'RDS', 'Object Storage',
    ]
  },
  {
    categoryID: 'infra',
    skills: [
      'Git', 'GitHub', 'GitHub Actions', 'Docker',
      'AWS', 'GCP', 'Digital Ocean', 'Cloudflare',
      'Cypress', 'Playwright',
      'Postman', 'Insomnia',
      'Figma', 'Canva',
    ]
  },
  {
    categoryID: 'digital-marketing',
    skills: [
      'Shopify', 'Cartpanda', 'Yampi', 'Hotmart', 'Samcart', 'Stripe',
      'WordPress', 'cPanel', 'Lovable',
      'Redtrack', 'Anytrack', 'UTMify', 'Inlead',
      'N8N', 'Typebot', 'Atomicat',
    ]
  },
]