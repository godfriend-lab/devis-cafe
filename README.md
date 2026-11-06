# Devis Café

Le créateur de devis professionnel simple et complet pour freelances et PME.

## Présentation

Devis Café permet de créer, gérer et envoyer des devis professionnels en quelques minutes. L'application offre une interface moderne et intuitive avec des fonctionnalités avancées d'export et de personnalisation.

## Fonctionnalités

- 36 modèles de devis (classiques et premium)
- Personnalisation complète (couleurs, logo, signature, cachet)
- Export multi-format : PDF, Word, Excel, Image, EPUB
- Support multi-devises (FCFA, EUR, USD et 30+ autres)
- Interface multi-langues (Français, Anglais)
- Sécurité renforcée avec isolation multi-tenant et RLS
- Responsive design (mobile, tablette, desktop)

## Stack Technique

**Frontend**
- React 18 avec TypeScript
- Vite pour le build et le développement
- Tailwind CSS v4 pour le styling
- React Router v6 pour la navigation
- Lucide React pour les icônes

**Backend**
- Supabase (PostgreSQL)
- Authentication Supabase
- Row Level Security (RLS)
- Storage pour les fichiers

**Déploiement**
- Vercel pour l'hébergement et le CI/CD

## Installation

### Prérequis

- Node.js version 18 ou supérieure
- npm ou yarn
- Un compte Supabase

### Étapes d'installation

1. Cloner le dépôt
```bash
git clone https://github.com/godfriend-lab/devis-cafe.git
cd devis-cafe