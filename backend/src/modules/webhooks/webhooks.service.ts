import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

const KIWIFI_INSTANCE = 'DISPARO KIWIFI';

const PRODUTO_FILES: Record<string, { url: string; fileName: string }> = {
  'comunidade lendas_oficial': {
    url: 'https://pub-2eb686b0bfc74adba14e08dd65cfc78c.r2.dev/kiwifi/contrato-comunidade-lendas.docx',
    fileName: 'Contrato Comunidade Lendas.docx',
  },
  'escola de vendas juridicas': {
    url: '', // a completar
    fileName: 'Contrato Escola de Vendas Jurídicas.docx',
  },
  'mentoria coletiva': {
    url: '', // a completar
    fileName: 'Contrato Mentoria Coletiva.docx',
  },
};

function normStr(s: string): string {
  return s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/_/g, ' ');
}

function findProdutoFile(produto: string) {
  const norm = normStr(produto);
  for (const [key, val] of Object.entries(PRODUTO_FILES)) {
    if (normStr(key) === norm) return val;
  }
  for (const [key, val] of Object.entries(PRODUTO_FILES)) {
    if (norm.includes(normStr(key)) || normStr(key).includes(norm)) return val;
  }
  return null;
}

async function sendKiwifiContract(name: string, phone: string, produto: string) {
  const waUrl = process.env.WHATSAPP_API_URL || 'http://localhost:8080';
  const waKey = process.env.WHATSAPP_API_KEY || '';
  const rawPhone = phone.replace(/\D/g, '');
  const number = `55${rawPhone.replace(/^55/, '')}`;

  const produtoInfo = findProdutoFile(produto);
  if (!produtoInfo || !produtoInfo.url) {
    console.warn(`[Kiwifi] arquivo não configurado para produto: "${produto}"`);
    return;
  }

  const mensagem = `🎉 Parabéns, *${name}*!\n\nÉ com muito orgulho que damos as boas-vindas a você como parte do *${produto}*!\n\nVocê acaba de tomar uma das decisões mais importantes da sua carreira jurídica. A partir de agora, você terá acesso a conteúdos, estratégias e uma comunidade que vai acelerar seus resultados de verdade.\n\nPara finalizar sua entrada, segue abaixo o contrato para leitura e assinatura. Assim que concluir, você já estará oficialmente dentro! 🚀\n\nQualquer dúvida, estamos aqui.`;

  try {
    // 1. Mensagem de boas-vindas
    const textRes = await fetch(`${waUrl}/message/sendText/${encodeURIComponent(KIWIFI_INSTANCE)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: waKey },
      body: JSON.stringify({ number, text: mensagem }),
      signal: AbortSignal.timeout(10000),
    });
    if (!textRes.ok) console.error('[Kiwifi] sendText failed:', await textRes.text().catch(() => ''));
    else console.log(`[Kiwifi] ✅ Mensagem enviada para ${number}`);

    // 2. Aguardar 2s e enviar contrato
    await new Promise(r => setTimeout(r, 2000));

    const mediaRes = await fetch(`${waUrl}/message/sendMedia/${encodeURIComponent(KIWIFI_INSTANCE)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: waKey },
      body: JSON.stringify({
        number,
        mediatype: 'document',
        media: produtoInfo.url,
        fileName: produtoInfo.fileName,
        caption: produtoInfo.fileName,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!mediaRes.ok) console.error('[Kiwifi] sendMedia failed:', await mediaRes.text().catch(() => ''));
    else console.log(`[Kiwifi] ✅ Contrato enviado para ${number} | produto: ${produto}`);
  } catch (err: any) {
    console.error('[Kiwifi] erro:', err?.message ?? err);
  }
}

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async receiveLinkedIn(tenantSlug: string, payload: any) {
    console.log('=== WEBHOOK PAYLOAD ===', JSON.stringify(payload, null, 2));
    const p: any = Object.fromEntries(Object.entries(payload).map(([k, v]) => [k.toLowerCase(), v]));

    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) return { error: 'Tenant não encontrado' };

    const pipeline = await this.prisma.pipeline.findFirst({
      where: { tenantId: tenant.id, isDefault: true },
      include: { stages: { orderBy: { order: 'asc' } } },
    });

    const phone = p.phone || p.telefone || p.tel || payload['li:phone'] || '';
    const email = p.email || payload['li:email'] || '';
    const name = p.name || p.nome || payload['li:firstName'] + ' ' + payload['li:lastName'] || 'Lead LinkedIn';
    const produto = p.produto || p.product || '';

    const existing = await this.prisma.lead.findFirst({ where: { tenantId: tenant.id, phone } });
    if (existing) {
      // Atualiza campos que chegaram vazios no primeiro webhook
      const updates: any = {};
      const fieldMap: Record<string, string> = {
        pharmacyName:           p.farmacia || p.pharmacyname || '',
        bankWorked:             p.banco || p.bankworked || p.bankWorked || '',
        timeSinceDismissal:     p.tempodesligamento || p.timesincedismissal || '',
        jobTitle:               p.cargo || p.jobtitle || '',
        niche:                  p.niche || '',
        linkedinUrl:            p.linkedinurl || p.linkedin || '',
        email:                  email,
        name:                   name.trim(),
        melhorFormaContato:     p.melhorformacontato || '',
        melhorPeriodoContato:   p.melhorperiodocontato || '',
        aindaTrabalha:          p.aindatrabalha || '',
        profissaoMaisTempo:     p.profissaomaistempo || '',
        estado:                 p.estado || '',
        cidade:                 p.cidade || '',
        situacaoAtual:          p.situacaoatual || '',
        produto:                p.produto || p.product || '',
        orderId:                p.orderid || p.order_id || '',
        acaoAdvogado:           p.acaoadvogado || p.acao_advogado || '',
        tempoArea:              p.tempoarea || p.tempo_area || '',
        faseProcesso:           p.faseatual || p.faseprocesso || p['em qual fase esta o processo'] || p['em qual fase está o processo?'] || '',
        oquePossui:             p.oquepossui || p['o que voce possui'] || p['o que você possui?'] || p.possui || '',
        prazoAndamento:         p.prazoandamento || p['existe prazo em andamento'] || p['tem prazo'] || p.prazo || '',
        oabObjective:           p.oabobjective || p['oabobjective.'] || p.objetivo_oab || '',
        oabNumber:              p.oabnumber || p.numero_oab || p['você possui oab? (se sim mande o número)'] || '',
        oabNotification:        p.oabnotification || p.notificacao_oab || '',
        oabSuspension:          p.oabsuspension || p.suspensao_oab || '',
        faturamento:            p.faturamento || '',
        marketing:              p.marketing || '',
        tipoFraude:             p.tipofraude || p.tipo_fraude || p.tipoFraude || '',
        quandoPercebeuGolpe:    p.quandoPercebeuGolpe || p.quando_percebeu_golpe || p.quandopercebeu || '',
        valorAproximado:        p.valoraproximado || p.valor_aproximado || p.valorAproximado || p.valor || '',
        comoImovelAdquirido:    p.comoimoveladquirido || p['como o imóvel foi adquirido?'] || p['como o imovel foi adquirido?'] || '',
        qualProblemaImovel:     p.qualproblemaimovel || p['qual problema você está enfrentando?'] || p['qual problema voce esta enfrentando?'] || '',
        quandoPercebeuProblema: p.quandopercebeuproblema || p['quando você percebeu o problema?'] || p['quando voce percebeu o problema?'] || '',
        ondeComprouVeiculo:     p.ondecomrouveiculo || p.ondecomprouveiculo || p['onde você comprou o veículo?'] || p['onde voce comprou o veiculo?'] || '',
        situacaoVeiculo:        p.situacaoveiculo || p['qual situação aconteceu com o veículo?'] || p['qual situacao aconteceu com o veiculo?'] || '',
        tempoComprouVeiculo:    p.tempocomprouveiculo || p['há quanto tempo você comprou o veículo?'] || p['ha quanto tempo voce comprou o veiculo?'] || '',
        tentouResolverLoja:     p.tentouresolverloja || p['você já tentou resolver o problema com a loja ou revendedora?'] || p['voce ja tentou resolver o problema com a loja ou revendedora?'] || '',
        rotaVoo:                p.rotavoo || p['origem / destino'] || p['origem/destino'] || p['origem destino'] || '',
        principalProblema:      p.principalproblema || p['qual foi o principal problema?'] || p['qual foi o principal problema'] || '',
        consequenciaProblema:   p.consequenciaproblema || p['qual foi a principal consequência?'] || p['qual foi a principal consequencia?'] || p['qual foi a principal consequencia'] || '',
        quemDesenvolver:          p.quemdesenvolver || p.quem_desenvolver || '',
        desafioComercial:         p.desafiocomercial || p.desafio_comercial || '',
        disponibilidadeAlphaville: p.disponibilidadealphaville || p.disponibilidade_alphaville || '',
      };
      for (const [field, value] of Object.entries(fieldMap)) {
        if (value && !(existing as any)[field]) updates[field] = value;
      }
      if (Object.keys(updates).length > 0) {
        await this.prisma.lead.update({ where: { id: existing.id }, data: updates });
        console.log(`[Webhook] Lead duplicado atualizado: ${existing.id}`, Object.keys(updates));
      }
      return { duplicate: true, leadId: existing.id };
    }

    const lead = await this.prisma.lead.create({
      data: {
        tenantId: tenant.id,
        pipelineId: pipeline.id,
        stageId: pipeline.stages[0].id,
        name: name.trim(),
        email,
        phone,
        bankWorked: p.banco || p.bankworked || p.bankWorked || '',
        timeSinceDismissal: p.tempodesligamento || p.timesincedismissal || '',
        pharmacyName: p.farmacia || p.pharmacyname || '',
        jobTitle: p.cargo || p.jobtitle || '',
        market: p.mercado || p.market || '',
        airlineName: p.aerea || p.companhiaaerea || p.airlinename || '',
        linkedinUrl: p.linkedinurl || p.linkedin || '',
        niche: p.niche || '',
        servidorPublico: p.servidorpublico || '',
        consignadoAtivo: p.consignadoativo || '',
        situacaoEmprestimo: p.situacaoemprestimo || '',
        aindaTrabalha: p.aindatrabalha || '',
        profissaoMaisTempo: p.profissaomaistempo || '',
        estado: p.estado || '',
        situacaoAtual: p.situacaoatual || '',
        empresa: p.empresa || p.company || '',
        tempoAcidente: p.tempoacidente || '',
        tipoAcidente: p.tipoacidente || '',
        melhorFormaContato: p.melhorformacontato || '',
        melhorPeriodoContato: p.melhorperiodocontato || '',
        empresaSabiaGravidez: p.empresasabiagravidade || '',
        dataDemissao: p.datademissao || '',
        situacaoCaso: p.situacao || p.situacaocaso || '',
        quandoProblema: p.quandoproblema || '',
        situacaoAtualEmpresa: p.situacaoatualempresa || '',
        afastamentoInss: p.afastamentoinss || p['houve afastamento pelo inss?'] || p['houve afastamento pelo inss'] || '',
        catEmitida: p.catemitida || '',
        limitacaoSequela: p.limitacaosequela || '',
        cidade: p.cidade || '',
        urgencia: p.urgencia || '',
        prontoContratar: p.prontocontratar || p.pronto || '',
        possuiDocumento: p.possuidocumento || p.possuiDocumento || p['você possui documentos relacionados à situação?'] || p['você possui documento ou prova relacionada à situação?'] || '',
        orderId: p.orderid || p.order_id || '',
        produto,
        acaoAdvogado: p.acaoadvogado || p.acao_advogado || '',
        tempoArea: p.tempoarea || p.tempo_area || '',
        quantasPessoas: p.quantaspessoas || p.quantas_pessoas || '',
        situacaoDemissao: p.situacaodemissao || p['em qual situação aconteceu a sua demissão?'] || '',
        empresaConhecimento: p.empresaconhecimento || p['a empresa tinha conhecimento do seu tratamento ou afastamento?'] || '',
        tempoRetornoDemissao: p.temporetornodemissao || p['quanto tempo depois do retorno ao trabalho aconteceu a demissão?'] || '',
        operacao: p.operacao || p['qual operação você pretende realizar?'] || p['qual operacao voce pretende realizar?'] || '',
        estagioOperacao: p.estagiooperacao || p['em que estágio está a operação?'] || p['em que estagio esta a operacao?'] || '',
        possuiAtualmente: p.possuiatualmente || p['o que sua empresa já possui?'] || p['o que sua empresa ja possui?'] || '',
        paisOrigemDestino: p.paisorigemdestino || p['país de origem ou destino'] || p['pais de origem ou destino'] || '',
        especieNomeCientifico: p.especienomecientifico || p['espécie / nome científico, se souber'] || p['especie / nome cientifico, se souber'] || '',
        faseProcesso: p.faseatual || p.faseprocesso || p['em qual fase esta o processo'] || p['em qual fase está o processo?'] || '',
        oquePossui: p.oquepossui || p['o que voce possui'] || p['o que você possui?'] || p.possui || '',
        prazoAndamento: p.prazoandamento || p['existe prazo em andamento'] || p['tem prazo'] || p.prazo || '',
        oabObjective: p.oabobjective || p['oabobjective.'] || p.objetivo_oab || '',
        oabNumber: p.oabnumber || p.numero_oab || p['você possui oab? (se sim mande o número)'] || '',
        oabNotification: p.oabnotification || p.notificacao_oab || '',
        oabSuspension: p.oabsuspension || p.suspensao_oab || '',
        faturamento: p.faturamento || '',
        marketing: p.marketing || '',
        tipoFraude: p.tipofraude || p.tipo_fraude || p.tipoFraude || '',
        quandoPercebeuGolpe: p.quandopercebeu || p.quando_percebeu_golpe || p.quandoPercebeuGolpe || '',
        valorAproximado: p.valoraproximado || p.valor_aproximado || p.valorAproximado || p.valor || '',
        comoImovelAdquirido: p.comoimoveladquirido || p['como o imóvel foi adquirido?'] || p['como o imovel foi adquirido?'] || '',
        qualProblemaImovel: p.qualproblemaimovel || p['qual problema você está enfrentando?'] || p['qual problema voce esta enfrentando?'] || '',
        quandoPercebeuProblema: p.quandopercebeuproblema || p['quando você percebeu o problema?'] || p['quando voce percebeu o problema?'] || '',
        ondeComprouVeiculo: p.ondecomprouveiculo || p['onde você comprou o veículo?'] || p['onde voce comprou o veiculo?'] || '',
        situacaoVeiculo: p.situacaoveiculo || p['qual situação aconteceu com o veículo?'] || p['qual situacao aconteceu com o veiculo?'] || '',
        tempoComprouVeiculo: p.tempocomprouveiculo || p['há quanto tempo você comprou o veículo?'] || p['ha quanto tempo voce comprou o veiculo?'] || '',
        tentouResolverLoja: p.tentouresolverloja || p['você já tentou resolver o problema com a loja ou revendedora?'] || p['voce ja tentou resolver o problema com a loja ou revendedora?'] || '',
        rotaVoo: p.rotavoo || p['origem / destino'] || p['origem/destino'] || p['origem destino'] || '',
        principalProblema: p.principalproblema || p['qual foi o principal problema?'] || p['qual foi o principal problema'] || '',
        consequenciaProblema: p.consequenciaproblema || p['qual foi a principal consequência?'] || p['qual foi a principal consequencia?'] || p['qual foi a principal consequencia'] || '',
        quemDesenvolver: p.quemdesenvolver || p.quem_desenvolver || '',
        desafioComercial: p.desafiocomercial || p.desafio_comercial || '',
        disponibilidadeAlphaville: p.disponibilidadealphaville || p.disponibilidade_alphaville || '',
        notes: p.notes || p.mensagem || p.sobre || p.descricao || p.caso || '',
        source: p.source || 'linkedin',
        adName: p.adname || p.anuncio || '',
        formName: p.formname || p.formulario || '',
        lgpdConsent: true,
      },
    });

    await this.prisma.leadEvent.create({
      data: { leadId: lead.id, type: 'CREATED', description: 'Lead recebido via webhook LinkedIn/Pluga' },
    });

    // Envio de contrato para Kiwifi Lendas
    if (tenantSlug === 'kiwifi-lendas' && phone && produto) {
      sendKiwifiContract(name.trim(), phone, produto).catch(e =>
        console.error('[Kiwifi] sendKiwifiContract error:', e?.message ?? e)
      );
    }

    // Sync Paz Mendes Fraudes/Golpes → Google Sheets via Make
    if (tenantSlug === 'paz-mendes' && lead.tipoFraude) {
      const sheetWebhook = process.env.PAZ_MENDES_FRAUDE_SHEET_WEBHOOK;
      if (sheetWebhook) {
        fetch(sheetWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:                lead.name,
            email:               lead.email,
            phone:               lead.phone,
            tipoFraude:          lead.tipoFraude,
            quandoPercebeuGolpe: lead.quandoPercebeuGolpe,
            valorAproximado:     lead.valorAproximado,
            oquePossui:          lead.oquePossui,
            possuiDocumento:     lead.possuiDocumento,
            banco:               lead.bankWorked,
            estado:              lead.estado,
            cidade:              lead.cidade,
            source:              lead.source,
            notes:               lead.notes,
          }),
          signal: AbortSignal.timeout(10000),
        }).catch(e => console.error('[PazMendes-Fraude] Sheet webhook error:', e?.message ?? e));
      }
    }

    // Sync Paz Mendes Cia Aérea → Google Sheets via Make
    if (tenantSlug === 'paz-mendes' && lead.airlineName) {
      const sheetWebhook = process.env.PAZ_MENDES_AEREA_SHEET_WEBHOOK;
      if (sheetWebhook) {
        fetch(sheetWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:                 lead.name,
            email:                lead.email,
            phone:                lead.phone,
            airlineName:          lead.airlineName,
            rotaVoo:              lead.rotaVoo,
            principalProblema:    lead.principalProblema,
            consequenciaProblema: lead.consequenciaProblema,
            quandoProblema:       lead.quandoProblema,
            oquePossui:           lead.oquePossui,
            source:               lead.source,
            notes:                lead.notes,
          }),
          signal: AbortSignal.timeout(10000),
        }).catch(e => console.error('[PazMendes-Aerea] Sheet webhook error:', e?.message ?? e));
      }
    }

    // Sync Paz Mendes LP Criminal → Google Sheets via Make
    if (tenantSlug === 'paz-mendes' && p.source?.toUpperCase() === 'LP CRIMINAL') {
      const sheetWebhook = process.env.PAZ_MENDES_CRIMINAL_SHEET_WEBHOOK;
      if (sheetWebhook) {
        fetch(sheetWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:               lead.name,
            source:             lead.source,
            empresa:            lead.empresa,
            jobTitle:           lead.jobTitle,
            timeSinceDismissal: lead.timeSinceDismissal,
            email:              lead.email,
            estado:             lead.estado,
            cidade:             lead.cidade,
            phone:              lead.phone,
            dataDemissao:       lead.dataDemissao,
            notes:              lead.notes,
            urgencia:           lead.urgencia,
            situacaoCaso:       lead.situacaoCaso,
            faseProcesso:       lead.faseProcesso,
            oquePossui:         lead.oquePossui,
            prazoAndamento:     lead.prazoAndamento,
            linkedinUrl:        lead.linkedinUrl,
          }),
          signal: AbortSignal.timeout(10000),
        }).catch(e => console.error('[PazMendes] Sheet webhook error:', e?.message ?? e));
      }
    }

    return { success: true, leadId: lead.id };
  }
}
