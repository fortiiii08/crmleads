"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'escritorio-demo' },
        update: {},
        create: {
            name: 'Escritório Jurídico Demo',
            slug: 'escritorio-demo',
        },
    });
    const adminHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: 'admin@crm.com' } },
        update: {},
        create: {
            tenantId: tenant.id,
            name: 'Administrador',
            email: 'admin@crm.com',
            passwordHash: adminHash,
            role: client_1.UserRole.ADMIN,
        },
    });
    const agentHash = await bcrypt.hash('agent123', 10);
    const agent = await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: 'agente@crm.com' } },
        update: {},
        create: {
            tenantId: tenant.id,
            name: 'Ana Silva',
            email: 'agente@crm.com',
            passwordHash: agentHash,
            role: client_1.UserRole.AGENT,
        },
    });
    const pipeline = await prisma.pipeline.upsert({
        where: { id: 'pipeline-trabalhista-demo' },
        update: {},
        create: {
            id: 'pipeline-trabalhista-demo',
            tenantId: tenant.id,
            name: 'Trabalhista Bancário',
            area: 'Trabalhista',
            isDefault: true,
        },
    });
    const stagesData = [
        { name: 'Novo Lead', color: '#6366f1', order: 1 },
        { name: 'Não Contatado', color: '#f59e0b', order: 2 },
        { name: 'Tentativa de Contato', color: '#f97316', order: 3 },
        { name: 'Contato Realizado', color: '#3b82f6', order: 4 },
        { name: 'Lead Qualificado', color: '#8b5cf6', order: 5 },
        { name: 'Agendamento Realizado', color: '#06b6d4', order: 6 },
        { name: 'Atendimento Realizado', color: '#10b981', order: 7 },
        { name: 'Proposta Enviada', color: '#f59e0b', order: 8 },
        { name: 'Cliente Fechado', color: '#22c55e', order: 9, isWon: true },
        { name: 'Lead Perdido', color: '#ef4444', order: 10, isLost: true },
    ];
    const stages = [];
    for (const s of stagesData) {
        const stage = await prisma.stage.upsert({
            where: { id: `stage-${pipeline.id}-${s.order}` },
            update: {},
            create: {
                id: `stage-${pipeline.id}-${s.order}`,
                pipelineId: pipeline.id,
                name: s.name,
                color: s.color,
                order: s.order,
                isWon: s.isWon || false,
                isLost: s.isLost || false,
            },
        });
        stages.push(stage);
    }
    const campaign = await prisma.campaign.upsert({
        where: { id: 'campaign-demo-1' },
        update: {},
        create: {
            id: 'campaign-demo-1',
            tenantId: tenant.id,
            name: 'Campanha Bancário Jan/2026',
            source: 'linkedin',
            budget: 2000,
        },
    });
    const scriptsData = [
        {
            title: 'Primeiro Contato - WhatsApp',
            category: client_1.ScriptCategory.FIRST_CONTACT,
            content: `Olá, {{nome}}! 👋

Meu nome é {{atendente}}, sou do escritório {{escritorio}}.

Vi que você demonstrou interesse em nossos serviços jurídicos através do LinkedIn.

Você trabalhou no setor bancário e foi desligado? Podemos analisar se você tem direito a indenizações trabalhistas.

Posso conversar com você agora? 😊`,
            variables: ['nome', 'atendente', 'escritorio'],
        },
        {
            title: 'Qualificação Jurídica',
            category: client_1.ScriptCategory.QUALIFICATION,
            content: `Olá {{nome}}, tudo bem?

Para entendermos melhor o seu caso, preciso de algumas informações:

1. Em qual banco você trabalhou?
2. Há quanto tempo foi desligado?
3. Você tem a carteira de trabalho disponível?
4. Foi desligado sem justa causa?

Com essas informações, conseguiremos avaliar melhor os seus direitos. 📋`,
            variables: ['nome'],
        },
        {
            title: 'Follow-up - Sem Resposta',
            category: client_1.ScriptCategory.FOLLOW_UP,
            content: `Oi {{nome}}! 

Tentei entrar em contato anteriormente, mas não consegui falar com você.

Estou à disposição para conversar sobre os seus direitos trabalhistas. Nossa consulta é gratuita e sem compromisso.

Quando seria um bom momento para conversarmos? ⏰`,
            variables: ['nome'],
        },
        {
            title: 'Agendamento de Consulta',
            category: client_1.ScriptCategory.SCHEDULING,
            content: `Olá {{nome}}!

Ótimo! Vamos agendar a sua consulta jurídica.

Temos disponibilidade nos seguintes horários:
📅 {{data1}} às {{hora1}}
📅 {{data2}} às {{hora2}}

A consulta é realizada por videochamada e dura aproximadamente 30 minutos.

Qual horário fica melhor para você?`,
            variables: ['nome', 'data1', 'hora1', 'data2', 'hora2'],
        },
        {
            title: 'Reativação de Lead',
            category: client_1.ScriptCategory.REACTIVATION,
            content: `Olá {{nome}}, como você está?

Passamos para verificar se ainda há interesse em analisar o seu caso trabalhista.

Os prazos para reivindicação de direitos têm limite de tempo, por isso é importante não adiar.

Posso agendar uma consulta gratuita para esta semana? 🏛️`,
            variables: ['nome'],
        },
    ];
    for (const script of scriptsData) {
        await prisma.script.create({
            data: {
                tenantId: tenant.id,
                title: script.title,
                category: script.category,
                content: script.content,
                area: 'Trabalhista',
                variables: script.variables,
            },
        });
    }
    const demoLeads = [
        { name: 'Carlos Mendes', phone: '11999001001', email: 'carlos@email.com', bankWorked: 'Banco do Brasil', timeSinceDismissal: '8 meses', stageIdx: 0 },
        { name: 'Maria Santos', phone: '11999001002', email: 'maria@email.com', bankWorked: 'Bradesco', timeSinceDismissal: '1 ano', stageIdx: 1 },
        { name: 'João Ferreira', phone: '11999001003', email: 'joao@email.com', bankWorked: 'Itaú', timeSinceDismissal: '6 meses', stageIdx: 2 },
        { name: 'Ana Costa', phone: '11999001004', email: 'ana@email.com', bankWorked: 'Santander', timeSinceDismissal: '2 anos', stageIdx: 3 },
        { name: 'Roberto Lima', phone: '11999001005', email: 'roberto@email.com', bankWorked: 'Caixa', timeSinceDismissal: '3 meses', stageIdx: 4 },
        { name: 'Patricia Oliveira', phone: '11999001006', email: 'patricia@email.com', bankWorked: 'HSBC', timeSinceDismissal: '1 ano 3 meses', stageIdx: 5 },
        { name: 'Fernando Silva', phone: '11999001007', email: 'fernando@email.com', bankWorked: 'Banco do Brasil', timeSinceDismissal: '9 meses', stageIdx: 6 },
        { name: 'Luciana Rocha', phone: '11999001008', email: 'luciana@email.com', bankWorked: 'Bradesco', timeSinceDismissal: '4 meses', stageIdx: 7 },
        { name: 'Marcos Alves', phone: '11999001009', email: 'marcos@email.com', bankWorked: 'Itaú', timeSinceDismissal: '2 anos', stageIdx: 8 },
        { name: 'Claudia Nunes', phone: '11999001010', email: 'claudia@email.com', bankWorked: 'Santander', timeSinceDismissal: '5 meses', stageIdx: 9 },
    ];
    for (const lead of demoLeads) {
        const created = await prisma.lead.create({
            data: {
                tenantId: tenant.id,
                pipelineId: pipeline.id,
                stageId: stages[lead.stageIdx].id,
                assignedToId: agent.id,
                campaignId: campaign.id,
                name: lead.name,
                phone: lead.phone,
                email: lead.email,
                bankWorked: lead.bankWorked,
                timeSinceDismissal: lead.timeSinceDismissal,
                source: 'linkedin',
                adName: 'Direitos Bancários 2026',
                formName: 'Form Trabalhista',
                lgpdConsent: true,
            },
        });
        await prisma.leadEvent.create({
            data: {
                leadId: created.id,
                userId: admin.id,
                type: 'CREATED',
                description: 'Lead criado via LinkedIn Lead Gen Form',
            },
        });
    }
    console.log('Seed concluído com sucesso!');
    console.log('Admin: admin@crm.com / admin123');
    console.log('Agente: agente@crm.com / agent123');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map