"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding Xamle Civic database...');
    await prisma.$transaction([
        prisma.auditLog.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.subscription.deleteMany(),
        prisma.vote.deleteMany(),
        prisma.comment.deleteMany(),
        prisma.contribution.deleteMany(),
        prisma.source.deleteMany(),
        prisma.statusHistory.deleteMany(),
        prisma.indicator.deleteMany(),
        prisma.policyVersion.deleteMany(),
        prisma.policy.deleteMany(),
        prisma.ministry.deleteMany(),
        prisma.user.deleteMany(),
    ]);
    const passwordHash = await bcrypt.hash('Admin@1234', 12);
    const superAdmin = await prisma.user.create({
        data: {
            email: 'admin@xamle.sn',
            name: 'Super Administrateur',
            passwordHash,
            role: client_1.UserRole.SUPER_ADMIN,
            level: client_1.UserLevel.AMBASSADOR,
            isVerified: true,
            isActive: true,
            consentGiven: true,
            consentAt: new Date(),
        },
    });
    const moderator = await prisma.user.create({
        data: {
            email: 'moderateur@xamle.sn',
            name: 'Modérateur Xamle',
            passwordHash,
            role: client_1.UserRole.MODERATOR,
            level: client_1.UserLevel.EXPERT,
            isVerified: true,
            isActive: true,
            consentGiven: true,
            consentAt: new Date(),
        },
    });
    const citizen1 = await prisma.user.create({
        data: {
            email: 'citoyen@example.sn',
            name: 'Mamadou Diallo',
            phone: '+221771234567',
            passwordHash,
            role: client_1.UserRole.CONTRIBUTOR,
            level: client_1.UserLevel.CONTRIBUTOR,
            isVerified: true,
            isActive: true,
            consentGiven: true,
            consentAt: new Date(),
            bio: 'Citoyen engagé, observateur des politiques publiques au Sénégal',
        },
    });
    const editor = await prisma.user.create({
        data: {
            email: 'editeur@xamle.sn',
            name: 'Fatou Ndiaye',
            passwordHash,
            role: client_1.UserRole.EDITOR,
            level: client_1.UserLevel.EXPERT,
            isVerified: true,
            isActive: true,
            consentGiven: true,
            consentAt: new Date(),
        },
    });
    console.log('✅ Users created');
    const ministries = await Promise.all([
        prisma.ministry.create({
            data: {
                name: 'Ministère de la Santé et de l\'Action Sociale',
                slug: 'sante-action-sociale',
                description: 'Responsable de la politique nationale de santé et de protection sociale.',
                website: 'https://sante.gouv.sn',
            },
        }),
        prisma.ministry.create({
            data: {
                name: 'Ministère de l\'Éducation Nationale',
                slug: 'education-nationale',
                description: 'En charge du système éducatif sénégalais de la maternelle au lycée.',
                website: 'https://education.gouv.sn',
            },
        }),
        prisma.ministry.create({
            data: {
                name: 'Ministère des Infrastructures et des Transports Terrestres',
                slug: 'infrastructures-transports',
                description: 'Responsable du développement des infrastructures routières et des transports.',
                website: 'https://infrastructure.gouv.sn',
            },
        }),
        prisma.ministry.create({
            data: {
                name: 'Ministère de l\'Agriculture et de l\'Équipement Rural',
                slug: 'agriculture-equipement-rural',
                description: 'En charge du développement agricole et de la sécurité alimentaire.',
                website: 'https://agriculture.gouv.sn',
            },
        }),
        prisma.ministry.create({
            data: {
                name: 'Ministère de la Transition Numérique et des Télécommunications',
                slug: 'numerique-telecommunications',
                description: 'Responsable de la transformation numérique du Sénégal.',
                website: 'https://numerique.gouv.sn',
            },
        }),
    ]);
    const [minSante, minEdu, minInfra, minAgri, minNum] = ministries;
    console.log('✅ Ministries created');
    const policies = await Promise.all([
        prisma.policy.create({
            data: {
                title: 'Programme Couverture Maladie Universelle (CMU)',
                slug: 'couverture-maladie-universelle',
                description: 'Extension de la couverture maladie à toute la population sénégalaise avec un objectif de 75% de couverture d\'ici 2026. Le programme prévoit l\'enrôlement prioritaire des personnes vulnérables et des ménages ruraux à travers 46 plans pour l\'Émergence du Sénégal.',
                ministryId: minSante.id,
                theme: client_1.PolicyTheme.HEALTH,
                status: client_1.PolicyStatus.IN_PROGRESS,
                workflowStatus: client_1.WorkflowStatus.PUBLISHED,
                budget: 85000000000,
                budgetSpent: 42000000000,
                startDate: new Date('2023-01-01'),
                endDate: new Date('2026-12-31'),
                region: null,
                targetKpis: [
                    { name: 'Taux de couverture', target: 75, current: 48, unit: '%' },
                    { name: 'Personnes enrôlées', target: 10000000, current: 4800000, unit: 'personnes' },
                    { name: 'Structures sanitaires couvertes', target: 1500, current: 890, unit: 'structures' },
                ],
                publishedAt: new Date(),
                createdBy: editor.id,
            },
        }),
        prisma.policy.create({
            data: {
                title: 'Plan d\'Urgence pour la Santé (PUES) — Hôpitaux régionaux',
                slug: 'plan-urgence-hopitaux-regionaux',
                description: 'Construction et équipement de 14 nouveaux hôpitaux régionaux pour améliorer l\'accès aux soins de santé dans toutes les régions du Sénégal.',
                ministryId: minSante.id,
                theme: client_1.PolicyTheme.HEALTH,
                status: client_1.PolicyStatus.DELAYED,
                workflowStatus: client_1.WorkflowStatus.PUBLISHED,
                budget: 120000000000,
                budgetSpent: 28000000000,
                startDate: new Date('2022-06-01'),
                endDate: new Date('2025-12-31'),
                region: null,
                targetKpis: [
                    { name: 'Hôpitaux construits', target: 14, current: 3, unit: 'hôpitaux' },
                    { name: 'Lits disponibles', target: 4200, current: 900, unit: 'lits' },
                ],
                publishedAt: new Date(),
                createdBy: editor.id,
            },
        }),
        prisma.policy.create({
            data: {
                title: 'Programme d\'Universalisation de l\'Enseignement Moyen (PUEM)',
                slug: 'universalisation-enseignement-moyen',
                description: 'Garantir l\'accès universel à l\'enseignement moyen pour tous les enfants en âge scolaire, avec construction de 500 collèges de proximité et formation de 15 000 enseignants.',
                ministryId: minEdu.id,
                theme: client_1.PolicyTheme.EDUCATION,
                status: client_1.PolicyStatus.IN_PROGRESS,
                workflowStatus: client_1.WorkflowStatus.PUBLISHED,
                budget: 200000000000,
                budgetSpent: 89000000000,
                startDate: new Date('2022-09-01'),
                endDate: new Date('2027-08-31'),
                region: null,
                targetKpis: [
                    { name: 'Taux de transition primaire-moyen', target: 90, current: 68, unit: '%' },
                    { name: 'Collèges construits', target: 500, current: 187, unit: 'établissements' },
                    { name: 'Enseignants formés', target: 15000, current: 6200, unit: 'enseignants' },
                ],
                publishedAt: new Date(),
                createdBy: editor.id,
            },
        }),
        prisma.policy.create({
            data: {
                title: 'Digitalisation de l\'Éducation — Tablettes numériques',
                slug: 'digitalisation-education-tablettes',
                description: 'Distribution de tablettes numériques pré-chargées avec du contenu éducatif à 500 000 élèves du cycle moyen dans les régions défavorisées.',
                ministryId: minEdu.id,
                theme: client_1.PolicyTheme.EDUCATION,
                status: client_1.PolicyStatus.COMPLETED,
                workflowStatus: client_1.WorkflowStatus.PUBLISHED,
                budget: 45000000000,
                budgetSpent: 44200000000,
                startDate: new Date('2023-01-01'),
                endDate: new Date('2024-12-31'),
                region: null,
                targetKpis: [
                    { name: 'Tablettes distribuées', target: 500000, current: 500000, unit: 'tablettes' },
                    { name: 'Écoles connectées', target: 2000, current: 1985, unit: 'écoles' },
                ],
                publishedAt: new Date(),
                createdBy: editor.id,
            },
        }),
        prisma.policy.create({
            data: {
                title: 'Programme d\'Accélération des Routes Nationales — Phase 2',
                slug: 'acceleration-routes-nationales-phase-2',
                description: 'Construction et réhabilitation de 2 500 km de routes nationales bitumées pour désenclaver les zones rurales et améliorer la connectivité inter-régionale.',
                ministryId: minInfra.id,
                theme: client_1.PolicyTheme.INFRASTRUCTURE,
                status: client_1.PolicyStatus.IN_PROGRESS,
                workflowStatus: client_1.WorkflowStatus.PUBLISHED,
                budget: 750000000000,
                budgetSpent: 320000000000,
                startDate: new Date('2021-01-01'),
                endDate: new Date('2026-12-31'),
                region: null,
                targetKpis: [
                    { name: 'Routes bitumées', target: 2500, current: 1100, unit: 'km' },
                    { name: 'Ponts construits', target: 45, current: 18, unit: 'ponts' },
                    { name: 'Villages désenclavés', target: 350, current: 142, unit: 'villages' },
                ],
                publishedAt: new Date(),
                createdBy: editor.id,
            },
        }),
        prisma.policy.create({
            data: {
                title: 'Bus Rapid Transit (BRT) — Grand Dakar',
                slug: 'bus-rapid-transit-dakar',
                description: 'Mise en place d\'un réseau de bus à haut niveau de service sur l\'axe Dakar-Guédiawaye-Pikine pour réduire la congestion et améliorer la mobilité urbaine.',
                ministryId: minInfra.id,
                theme: client_1.PolicyTheme.INFRASTRUCTURE,
                status: client_1.PolicyStatus.COMPLETED,
                workflowStatus: client_1.WorkflowStatus.PUBLISHED,
                budget: 120000000000,
                budgetSpent: 118500000000,
                startDate: new Date('2020-01-01'),
                endDate: new Date('2024-04-30'),
                region: client_1.SenegalRegion.DAKAR,
                targetKpis: [
                    { name: 'Km de voies dédiées', target: 18.5, current: 18.5, unit: 'km' },
                    { name: 'Passagers/jour', target: 300000, current: 285000, unit: 'passagers' },
                ],
                publishedAt: new Date(),
                createdBy: editor.id,
            },
        }),
        prisma.policy.create({
            data: {
                title: 'Programme National d\'Autosuffisance en Riz (PNAR)',
                slug: 'autosuffisance-riz',
                description: 'Atteindre l\'autosuffisance en riz d\'ici 2025 en développant la riziculture dans la vallée du fleuve Sénégal et en Casamance.',
                ministryId: minAgri.id,
                theme: client_1.PolicyTheme.AGRICULTURE,
                status: client_1.PolicyStatus.DELAYED,
                workflowStatus: client_1.WorkflowStatus.PUBLISHED,
                budget: 350000000000,
                budgetSpent: 145000000000,
                startDate: new Date('2020-01-01'),
                endDate: new Date('2025-12-31'),
                region: null,
                targetKpis: [
                    { name: 'Production de riz', target: 1600000, current: 820000, unit: 'tonnes' },
                    { name: 'Superficie irriguée', target: 100000, current: 48000, unit: 'ha' },
                    { name: 'Taux d\'autosuffisance', target: 100, current: 51, unit: '%' },
                ],
                publishedAt: new Date(),
                createdBy: editor.id,
            },
        }),
        prisma.policy.create({
            data: {
                title: 'Domaines Agricoles Communautaires (DAC)',
                slug: 'domaines-agricoles-communautaires',
                description: 'Création de 100 domaines agricoles communautaires pour les jeunes ruraux, avec formation, financement et accès aux marchés.',
                ministryId: minAgri.id,
                theme: client_1.PolicyTheme.AGRICULTURE,
                status: client_1.PolicyStatus.IN_PROGRESS,
                workflowStatus: client_1.WorkflowStatus.PUBLISHED,
                budget: 95000000000,
                budgetSpent: 41000000000,
                startDate: new Date('2022-01-01'),
                endDate: new Date('2026-12-31'),
                region: null,
                targetKpis: [
                    { name: 'DAC opérationnels', target: 100, current: 43, unit: 'domaines' },
                    { name: 'Jeunes installés', target: 25000, current: 9800, unit: 'jeunes' },
                ],
                publishedAt: new Date(),
                createdBy: editor.id,
            },
        }),
        prisma.policy.create({
            data: {
                title: 'Sénégal Numérique 2025 — Connectivité haut débit',
                slug: 'senegal-numerique-2025-haut-debit',
                description: 'Déploiement de la fibre optique dans 10 000 km de réseau national et connexion internet haut débit dans 80% des ménages d\'ici 2025.',
                ministryId: minNum.id,
                theme: client_1.PolicyTheme.DIGITAL,
                status: client_1.PolicyStatus.IN_PROGRESS,
                workflowStatus: client_1.WorkflowStatus.PUBLISHED,
                budget: 250000000000,
                budgetSpent: 98000000000,
                startDate: new Date('2021-01-01'),
                endDate: new Date('2025-12-31'),
                region: null,
                targetKpis: [
                    { name: 'Réseau fibre déployé', target: 10000, current: 4200, unit: 'km' },
                    { name: 'Ménages connectés', target: 80, current: 38, unit: '%' },
                    { name: 'Points d\'accès publics', target: 1000, current: 412, unit: 'points' },
                ],
                publishedAt: new Date(),
                createdBy: editor.id,
            },
        }),
        prisma.policy.create({
            data: {
                title: 'Identité Numérique Nationale (INN)',
                slug: 'identite-numerique-nationale',
                description: 'Mise en place d\'un système national d\'identité numérique pour sécuriser les transactions électroniques et faciliter l\'accès aux services de l\'État en ligne.',
                ministryId: minNum.id,
                theme: client_1.PolicyTheme.DIGITAL,
                status: client_1.PolicyStatus.IN_PROGRESS,
                workflowStatus: client_1.WorkflowStatus.PUBLISHED,
                budget: 30000000000,
                budgetSpent: 14000000000,
                startDate: new Date('2023-06-01'),
                endDate: new Date('2026-06-30'),
                region: null,
                targetKpis: [
                    { name: 'Citoyens enrôlés', target: 8000000, current: 2800000, unit: 'personnes' },
                    { name: 'Services dématérialisés', target: 150, current: 67, unit: 'services' },
                ],
                publishedAt: new Date(),
                createdBy: editor.id,
            },
        }),
    ]);
    console.log(`✅ ${policies.length} policies created`);
    for (const policy of policies) {
        await prisma.statusHistory.create({
            data: {
                policyId: policy.id,
                fromStatus: null,
                toStatus: client_1.PolicyStatus.NOT_STARTED,
                changedBy: superAdmin.id,
                reason: 'Création initiale de la politique publique',
            },
        });
        if (policy.status !== client_1.PolicyStatus.NOT_STARTED) {
            await prisma.statusHistory.create({
                data: {
                    policyId: policy.id,
                    fromStatus: client_1.PolicyStatus.NOT_STARTED,
                    toStatus: policy.status,
                    changedBy: editor.id,
                    reason: 'Mise à jour du statut après évaluation trimestrielle',
                },
            });
        }
    }
    console.log('✅ Status histories created');
    await prisma.source.createMany({
        data: [
            {
                policyId: policies[0].id,
                url: 'https://www.sante.gouv.sn/cmu',
                title: 'Rapport officiel CMU 2023 — Ministère de la Santé',
                type: client_1.SourceType.OFFICIAL,
                addedBy: editor.id,
            },
            {
                policyId: policies[0].id,
                url: 'https://www.dgppe.gouv.sn/rapports/cmu-2024',
                title: 'Suivi DGPPE — Couverture Maladie Universelle',
                type: client_1.SourceType.OFFICIAL,
                addedBy: editor.id,
            },
            {
                policyId: policies[2].id,
                url: 'https://www.education.gouv.sn/puem-rapport',
                title: 'Rapport PUEM — Ministère de l\'Éducation Nationale',
                type: client_1.SourceType.OFFICIAL,
                addedBy: editor.id,
            },
            {
                policyId: policies[4].id,
                url: 'https://www.ageroute.sn/projets/routes-nationales',
                title: 'AGEROUTE — Programme Routes Nationales Phase 2',
                type: client_1.SourceType.OFFICIAL,
                addedBy: editor.id,
            },
        ],
    });
    console.log('✅ Sources created');
    await prisma.indicator.createMany({
        data: [
            {
                policyId: policies[0].id,
                name: 'Taux mortalité infantile',
                unit: '‰',
                targetValue: 25,
                currentValue: 38,
                measuredAt: new Date('2024-06-01'),
            },
            {
                policyId: policies[2].id,
                name: 'Taux brut de scolarisation',
                unit: '%',
                targetValue: 95,
                currentValue: 82,
                measuredAt: new Date('2024-09-01'),
            },
            {
                policyId: policies[8].id,
                name: 'Coût moyen Internet mobile (Go)',
                unit: 'XOF',
                targetValue: 500,
                currentValue: 850,
                measuredAt: new Date('2024-10-01'),
            },
        ],
    });
    console.log('✅ Indicators created');
    const contributions = await Promise.all([
        prisma.contribution.create({
            data: {
                userId: citizen1.id,
                policyId: policies[0].id,
                type: 'TESTIMONY',
                content: 'Dans ma commune de Gossas (Fatick), la CMU a bien été mise en place mais les agents de santé manquent de formation sur les procédures d\'enrôlement. De nombreux ménages éligibles ne sont pas encore couverts faute d\'information.',
                location: 'Gossas, Fatick',
                region: client_1.SenegalRegion.FATICK,
                status: 'APPROVED',
                reliability: 4,
                moderatorId: moderator.id,
                reviewedAt: new Date(),
            },
        }),
        prisma.contribution.create({
            data: {
                userId: citizen1.id,
                policyId: policies[1].id,
                type: 'TESTIMONY',
                content: 'Les travaux de l\'hôpital régional de Kolda sont à l\'arrêt depuis 3 mois. Le site est abandonné et aucune information n\'est disponible sur la reprise des travaux.',
                location: 'Kolda',
                region: client_1.SenegalRegion.KOLDA,
                status: 'APPROVED',
                reliability: 5,
                moderatorId: moderator.id,
                reviewedAt: new Date(),
            },
        }),
        prisma.contribution.create({
            data: {
                userId: citizen1.id,
                policyId: policies[6].id,
                type: 'TESTIMONY',
                content: 'Dans la région de Podor, les semences certifiées promis dans le cadre du PNAR n\'ont pas été distribuées cette saison. Les paysans ont dû utiliser leurs propres semences non sélectionnées.',
                location: 'Podor, Saint-Louis',
                region: client_1.SenegalRegion.SAINT_LOUIS,
                status: 'PENDING',
                reliability: 0,
            },
        }),
    ]);
    console.log('✅ Contributions created');
    const comment1 = await prisma.comment.create({
        data: {
            userId: citizen1.id,
            policyId: policies[0].id,
            body: 'La CMU est une bonne initiative mais l\'accès reste difficile dans les zones rurales. Les distances pour se rendre dans les structures sanitaires agréées restent un obstacle majeur.',
        },
    });
    await prisma.comment.create({
        data: {
            userId: moderator.id,
            policyId: policies[0].id,
            parentId: comment1.id,
            body: 'Merci pour votre témoignage. Ces retours terrain sont précieux pour le suivi de la politique. Nous avons transmis cette information à l\'équipe éditoriale.',
        },
    });
    console.log('✅ Comments created');
    await prisma.subscription.createMany({
        data: [
            {
                userId: citizen1.id,
                policyId: policies[0].id,
                channels: ['EMAIL', 'IN_APP'],
            },
            {
                userId: citizen1.id,
                policyId: policies[6].id,
                channels: ['IN_APP'],
            },
        ],
    });
    console.log('✅ Subscriptions created');
    await prisma.auditLog.createMany({
        data: [
            {
                actorId: superAdmin.id,
                action: 'CREATE',
                entity: 'Policy',
                entityId: policies[0].id,
                payload: { title: policies[0].title },
                ipAddress: '127.0.0.1',
            },
            {
                actorId: moderator.id,
                action: 'APPROVE_CONTRIBUTION',
                entity: 'Contribution',
                entityId: contributions[0].id,
                payload: { note: 'Témoignage crédible, vérifié' },
                ipAddress: '127.0.0.1',
            },
        ],
    });
    console.log('✅ Audit logs created');
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Demo accounts:');
    console.log('  Super Admin: admin@xamle.sn / Admin@1234');
    console.log('  Modérateur:  moderateur@xamle.sn / Admin@1234');
    console.log('  Éditeur:     editeur@xamle.sn / Admin@1234');
    console.log('  Citoyen:     citoyen@example.sn / Admin@1234');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map